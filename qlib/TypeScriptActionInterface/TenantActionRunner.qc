# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TenantActionRunner.qc Copyright (C) 2026 Qore Technologies s.r.o.

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
*/

#! Main module namespace
public namespace TypeScriptActionInterface {
#! The context of a call of a TypeScript action for a tenant (qoretechnologies/qore#6845)
/** Only plain data: the caller's own resolved connection options, never a Program, a connection or a provider object
*/
public hashdecl TsTenantContext {
    #! the tenant: the isolation key of the call (for Qorus, the isolation domain of the tenant group); required
    /** Programs, caches and limits are never shared between different tenants
    */
    string tenant;

    #! the name of the tenant's connection, for errors and audit only
    *string connection;

    #! the connection's resolved options, credentials included, after the caller's own access checks
    *hash<auto> conn_opts;

    #! the action's options
    *hash<auto> opts;

    #! the app's dynamic path, if any
    *string dynamic_path;

    #! the time limit of the call; capped by the runner's maximum (see TenantActionRunner::setTenantLimits())
    *timeout timeout;
}

#! The limits of the calls of tenants (see TenantActionRunner::setTenantLimits())
public hashdecl TsTenantLimits {
    #! the maximum number of calls that a tenant can run at a time
    int max_concurrent = 4;

    #! the heap cap of a tenant's program, in bytes
    int heap_limit = 256 * 1024 * 1024;

    #! the maximum number of programs that a tenant keeps for an app
    int max_programs = 2;

    #! the maximum time limit of a call
    timeout max_timeout = 30m;

    #! the maximum number of records that a record action reads or writes in a call
    int max_records = 10000;

    #! the maximum number of event sources that a tenant runs at a time
    int max_event_sources = 4;

    #! the maximum number of events that an event source queues until they are polled
    /** On overflow the source is stopped and the next poll raises \c TS-TENANT-LIMIT: events are never dropped
    */
    int max_queued_events = 1000;
}

#! Runs the TypeScript actions of the module's apps for callers that a sandbox governs (qoretechnologies/qore#6845)
/** A tenant's call runs the module's own trusted code (the app's implementation) with only the tenant's data:
    - the app runs in a restricted program of the tenant's own (see @ref v8restricted), which the module builds and
      seals in a trusted build, before the program runs anything for a tenant: no data of the tenant reaches the load
      of the app, and the program reaches no file, process or raw socket once it is sealed
    - programs are kept per tenant and app, and never shared between tenants: no global, cache or module state of one
      tenant's calls is visible to another tenant's
    - the arguments are copied into the program, and the result is copied out: no object, closure or call reference
      crosses
    - the program reaches the network only through the host bridge, which makes each request with the module's HTTP
      client under the calling code's own sandbox (captured when the call enters), so that the sandbox's network
      policy applies to every address that a request connects to, after resolution and for each redirect; a hook of
      the host (setEgressPolicy()) can only refuse more, and a meter of the host (setEgressMeter()) gets the bytes of
      each request
    - a call has a time limit, a heap cap and a limit of concurrent calls per tenant (setTenantLimits())

    The errors are defined: \c TS-TENANT-ERROR (an invalid context, or an unknown app or action),
    \c TS-TENANT-TIMEOUT (the call's time limit; the program is discarded), \c TS-TENANT-EGRESS-DENIED (a request
    refused by the sandbox or by the host's hook), \c TS-TENANT-LIMIT (the concurrency or memory limit),
    \c TS-TENANT-APP-UNSUPPORTED (the app needs a builtin of Node.js that tenants do not get; the args are a hash with
    \c app and \c builtin), \c TS-TENANT-HOOK-MISSING (a tenant's call that the host has not given the hooks for: the
    args are a hash with \c hook) and \c TS-TENANT-ACTION-ERROR (an error of the action); their args are plain data and never
    contain credentials or request headers.

    @since TypeScriptActionInterface 2.2
*/
public class TenantActionRunner {
    public {
        #! the error codes of the runner
        const ErrorContext = "TS-TENANT-ERROR";
        const ErrorTimeout = "TS-TENANT-TIMEOUT";
        const ErrorEgress = "TS-TENANT-EGRESS-DENIED";
        const ErrorLimit = "TS-TENANT-LIMIT";
        const ErrorUnsupported = "TS-TENANT-APP-UNSUPPORTED";
        const ErrorAction = "TS-TENANT-ACTION-ERROR";
        const ErrorHookMissing = "TS-TENANT-HOOK-MISSING";

        #! The name the host gives its hooks for this module under (DataProvider::setModuleHostHooks())
        const HostHooksModule = "TypeScriptActionInterface";

        #! The host hooks that are code, by key, with their setters (DataProvider::setModuleHostHooks())
        const CodeHostHooks = (
            "tenant_context_resolver", "connection_update_handler", "egress_policy", "egress_meter",
            "trusted_call_sandbox",
        );

        #! the maximum number of redirects that the bridge follows for a request
        const MaxRedirects = 10;

        #! the maximum size of a response body that the bridge gives to a program
        const MaxResponseBytes = 64 * 1024 * 1024;
    }

    private:internal {
        #! builds a tenant's program for an app as trusted code; created when the module is initialized
        static code build;

        #! runs a call in a tenant's program as trusted code; created when the module is initialized
        static code exec_call;

        #! starts a tenant's event source as trusted code; created when the module is initialized
        static code events_call;

        #! stops a tenant's event source as trusted code (its program is terminated, its thread can be cancelled);
        #! created when the module is initialized
        static code stop_call;



        #! the event sources, by subscription ID
        static hash<string, TenantEventSource> sources = {};

        #! guards the state below
        static Mutex lock();

        #! the idle programs: tenant -> app -> list of programs
        static hash<string, hash<string, list<hash<auto>>>> idle;

        #! the number of programs per tenant and app (idle or in use)
        static hash<string, hash<string, int>> count;

        #! the number of running calls per tenant
        static hash<string, int> running;

        #! the apps that tenants cannot run: app -> the builtin that they need
        static hash<string, string> unsupported;

        #! the actions that tenants cannot run, found by probeApps(): app -> action -> {builtin, package}
        static hash<string, hash<string, hash<auto>>> unsupported_actions;

        #! the host's egress hook and meter; set once by trusted code
        static *code egress_policy;
        static *code egress_meter;
        #! the host's sandbox for the tenant calls of trusted code; set once by trusted code
        static *code trusted_call_sandbox;

        #! the host's resolver of a connection's tenant context (setTenantContextResolver())
        static *code context_resolver;

        #! the host's handler of the connection updates of tenants' calls (setConnectionUpdateHandler())
        static *code update_handler;

        #! the limits
        static hash<TsTenantLimits> limits = <TsTenantLimits>{};

        #! the catalogue script that tenants' programs run, if not QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT
        static *string catalogue_script;

        #! the directories whose files tenants' programs may load, if not the catalogue's directory
        static *list<string> catalogue_roots;

        #! the pool that registered the catalogue's apps, if not the module's master pool
        static *JavaScriptProgramPool catalogue_pool;

        #! the directories of the apps of the catalogue's distribution: app name -> directory
        static hash<string, string> app_dirs;
    }

    #! Initializes the runner; called when the module is initialized, as trusted code
    static init() {
        build = SandboxManager::createTrustedBuildCall(\TenantActionRunner::buildProgram());
        # a call runs as trusted code too: the program is the module's, and the caller's sandbox governs only the
        # requests that the program makes through the bridge (captured when the call enters)
        exec_call = SandboxManager::createTrustedBuildCall(\TenantActionRunner::execCall());
        # an event source's thread is started as trusted code too, so that it inherits no sandbox of the caller
        events_call = SandboxManager::createTrustedBuildCall(\TenantActionRunner::startEventThread());
        stop_call = SandboxManager::createTrustedBuildCall(\TenantActionRunner::stopSource());
        # every event source stops before the library waits for the threads of the process when it ends: an event
        # function runs until it is stopped, and its thread would keep the process from ending
        register_exit_hook(\TenantActionRunner::exitHook());

        # the app directories of the catalogue's distribution, read once, as trusted code
        if ((*string script = getenv("QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT")).val()) {
            TenantActionRunner::readAppDirs(script);
        }
    }

    #! Applies the hooks the host set before the module was loaded (qoretechnologies/qore#6845)
    /** Called first by the module's initialization, before it registers anything: a host that loads the module
        lazily, in whichever thread first asks for an app, cannot set them after loading it, and a hook that is
        misspelled or not callable fails the module's initialization before any of its factories or apps exist, and
        before any hook is set.

        @note hooks that the host sets after the module was loaded are not read: the host sets them before anything
        loads the module (or calls the setters after loading it)
        @note for the module's initialization only: called again, the hooks set already are refused

        @throw TS-TENANT-ERROR an unknown key, or a value of the wrong type
    */
    static applyHostHooks() [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("applyHostHooks");
        *hash<auto> hooks = DataProvider::getModuleHostHooks(HostHooksModule);
        TenantActionRunner::setHostHooks(TenantActionRunner::checkHostHooks(hooks));
    }

    #! Validates the whole hash of host hooks before any is set
    /** @return the hooks, with \c tenant_limits converted to its hashdecl
    */
    private:internal static *hash<auto> checkHostHooks(*hash<auto> hooks) {
        foreach hash<auto> i in (hooks.pairIterator()) {
            if (i.key == "tenant_limits") {
                if (i.value.typeCode() != NT_HASH) {
                    throw ErrorContext, sprintf("host hook %y given for module %y must be a hash; got %y",
                        i.key, HostHooksModule, i.value.type());
                }
                # its keys and values too: a misspelled limit is refused before any hook is set
                try {
                    hooks.tenant_limits = cast<hash<TsTenantLimits>>(i.value);
                } catch (hash<ExceptionInfo> ex) {
                    throw ErrorContext, sprintf("host hook %y given for module %y is not valid: %s: %s", i.key,
                        HostHooksModule, ex.err, ex.desc);
                }
                continue;
            }
            if (!inlist(i.key, CodeHostHooks)) {
                throw ErrorContext, sprintf("unknown host hook %y given for module %y; known: %y", i.key,
                    HostHooksModule, CodeHostHooks + ("tenant_limits",));
            }
            if (!i.value.callp()) {
                throw ErrorContext, sprintf("host hook %y given for module %y must be callable code; got %y",
                    i.key, HostHooksModule, i.value.type());
            }
        }
        return hooks;
    }

    #! Sets the host's hooks given in the DataProvider registry (DataProvider::setModuleHostHooks())
    /** The keys are those of the setters: \c tenant_context_resolver (setTenantContextResolver()),
        \c connection_update_handler (setConnectionUpdateHandler()), \c egress_policy (setEgressPolicy()),
        \c egress_meter (setEgressMeter()), \c tenant_limits (setTenantLimits()) and
        \c trusted_call_sandbox (setTrustedCallSandbox()); each one given is set as its setter sets it: the code hooks
        once, while \c tenant_limits, as setTenantLimits() does, can be replaced later by trusted code.  checkHostHooks()
        validated the hash before.
    */
    private:internal static setHostHooks(*hash<auto> hooks) {
        foreach hash<auto> i in (hooks.pairIterator()) {
            switch (i.key) {
                case "tenant_context_resolver": TenantActionRunner::setTenantContextResolver(i.value); break;
                case "connection_update_handler": TenantActionRunner::setConnectionUpdateHandler(i.value); break;
                case "egress_policy": TenantActionRunner::setEgressPolicy(i.value); break;
                case "egress_meter": TenantActionRunner::setEgressMeter(i.value); break;
                case "tenant_limits": TenantActionRunner::setTenantLimits(i.value); break;
                case "trusted_call_sandbox": TenantActionRunner::setTrustedCallSandbox(i.value); break;
            }
        }
    }

    #! Sets the catalogue script that tenants' programs run, for a host that does not use
    #! QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT (and for tests)
    /** The script's \c actionsCatalogue either loads an app from its directory (\c loadAppFromPath(), as the
        module's catalogue does), or registers all of its apps (\c registerAppActions())

        @param script the catalogue script
        @param roots the directories whose files the programs may load; if not given, the parent of the script's
        directory (the catalogue's distribution and its node_modules)
        @param pool the pool that registered the catalogue's apps; if not given, the module's master pool

        @throw TS-TENANT-ERROR the calling code is sandboxed
    */
    static setCatalogue(string script, *list<string> roots, *JavaScriptProgramPool pool) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("setCatalogue");
        AutoLock al(lock);
        catalogue_script = script;
        catalogue_roots = roots;
        catalogue_pool = pool;
        TenantActionRunner::readAppDirs(script);
    }

    #! Reads the app directories of a catalogue's distribution (ts-app-dirs.yaml next to its script)
    private:internal static readAppDirs(string script) {
        string map_file = dirname(script) + DirSep + "ts-app-dirs.yaml";
        if (!is_readable(map_file)) {
            return;
        }
        *hash<auto> dirmap = parse_yaml(ReadOnlyFile::readTextFile(map_file));
        string apps_dir = dirname(script) + DirSep + "apps";
        foreach hash<auto> i in (dirmap.pairIterator()) {
            if (i.value.typeCode() == NT_STRING) {
                app_dirs{i.value} = apps_dir + DirSep + i.key;
            }
        }
    }

    #! Returns the directory of an app, if the catalogue loads apps from directories
    private:internal static *string getAppDir(string app) {
        return TypeScriptActionInterface::getAppLoadPath(app) ?? app_dirs{app};
    }

    #! Sets the host's egress hook: it can only refuse more than the caller's sandbox does
    /** The hook is called as <tt>check(string tenant, *string connection, hash<UrlInfo> url, list<string> ips)</tt>
        before each request (and each redirect), once the sandbox would allow it; if it returns @ref False, the
        request is refused with \c TS-TENANT-EGRESS-DENIED.  It is code of the host, never of a tenant.

        @throw TS-TENANT-ERROR the hook is set already, or the calling code is sandboxed
    */
    static setEgressPolicy(code check) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("setEgressPolicy");
        AutoLock al(lock);
        if (egress_policy) {
            throw ErrorContext, "the egress policy is set already";
        }
        egress_policy = check;
    }

    #! Sets the host's sandbox for the tenant calls that trusted code makes
    /** A host makes calls for a tenant's connection from its own trusted threads (dispatchTrusted()); the requests
        of such a call are made under the sandbox that the host gives here, as a sandboxed caller's are made under its
        own.  The hook is called as <tt>run(hash<TsTenantContext> ctx, code call)</tt> on the calling thread, and calls
        \a call under the host's sandbox for the tenant, returning what it returns.  Without it, a tenant's call of
        trusted code is refused (\c TS-TENANT-HOOK-MISSING): it never makes requests that no sandbox governs.

        @throw TS-TENANT-ERROR the hook is set already, or the calling code is sandboxed
    */
    static setTrustedCallSandbox(code run) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("setTrustedCallSandbox");
        AutoLock al(lock);
        if (trusted_call_sandbox) {
            throw ErrorContext, "the sandbox for the tenant calls of trusted code is set already";
        }
        trusted_call_sandbox = run;
    }

    #! Sets the host's egress meter
    /** The meter is called as <tt>meter(string tenant, *string connection, int bytes_out, int bytes_in)</tt> after each
        request that the bridge made for a tenant, on the calling thread; never from JavaScript.

        @throw TS-TENANT-ERROR the meter is set already, or the calling code is sandboxed
    */
    static setEgressMeter(code meter) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("setEgressMeter");
        AutoLock al(lock);
        if (egress_meter) {
            throw ErrorContext, "the egress meter is set already";
        }
        egress_meter = meter;
    }

    #! Sets the host's resolver of the tenant context of a connection
    /** Every call of the module into an app's code for sandboxed code (a data provider of a connection, its options,
        types and allowed values, and its connection's OAuth hooks) is made by the runner, in the tenant's own
        program, with the context that the resolver returns for the connection; the module decides itself whether the
        calling code is sandboxed.  The resolver is called as <tt>resolve(AbstractConnection conn)</tt> and returns a
        @ref TypeScriptActionInterface::TsTenantContext "TsTenantContext" hash, or @ref nothing, in which case the call
        is refused, as it is when no resolver is set: the call never runs outside the runner.

        The resolver is also asked for every call of trusted code that has a connection: a host makes calls for a
        tenant's connection from its own threads (a REST handler, a flow or test engine), which no sandbox governs.  A
        context means that the connection is a tenant's, and the call is made by the runner in the tenant's program as
        well; for @ref nothing the call is trusted and runs in the full runtime.  The resolver therefore decides from
        the connection itself (who owns it), never from the calling thread; a tenant's event actions are refused on
        trusted threads too.

        @throw TS-TENANT-ERROR the resolver is set already, or the calling code is sandboxed
    */
    static setTenantContextResolver(code resolver) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("setTenantContextResolver");
        AutoLock al(lock);
        if (context_resolver) {
            throw ErrorContext, "the tenant context resolver is set already";
        }
        context_resolver = resolver;
    }

    #! Sets the host's handler of the connection updates of tenants' calls
    /** When the response of an app's call for sandboxed code has the key \c connection_update (token fields that
        the app refreshed), the module calls the handler on the calling thread as
        <tt>handler(AbstractConnection conn, hash<auto> update)</tt> with the plain update, and removes the key from
        the response; if no handler is set, the call fails with \c TS-TENANT-ERROR: an update is never dropped.

        @throw TS-TENANT-ERROR the handler is set already, or the calling code is sandboxed
    */
    static setConnectionUpdateHandler(code handler) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("setConnectionUpdateHandler");
        AutoLock al(lock);
        if (update_handler) {
            throw ErrorContext, "the connection update handler is set already";
        }
        update_handler = handler;
    }

    #! Makes a call of the module into an app's code for sandboxed code: the module's single entry for it
    /** Called by TypeScriptActionDataProviderBase::execAsyncValueArgs() for every call when the calling code is
        sandboxed; the call is made by the runner in the tenant's own program, with the tenant context that the host's
        resolver returns for the connection of the call, or refused (\c TS-TENANT-ERROR)

        @param src the object that makes the call: a data provider or a connection of the module, or its REST client
        @param api the call
        @param args the arguments of the call
    */
    static auto dispatch(*object src, hash<AsyncCallInfo> api, *softlist<auto> args) [dom=PROCESS_CONTROL] {
        # the records function that a search returned: the runner's own closure over the records it read
        if (api.type == "get_records") {
            return call_function_args(api.async_call, args);
        }
        if (api.unlimited) {
            throw ErrorContext, sprintf("%s: events are not available to sandboxed code", api.label);
        }
        *AbstractConnection conn = TenantActionRunner::getCallConnection(src);
        if (!conn) {
            throw ErrorContext, sprintf("%s: the call of sandboxed code has no connection", api.label);
        }
        *code resolver;
        {
            AutoLock al(lock);
            resolver = context_resolver;
        }
        if (!resolver) {
            throw ErrorContext, sprintf("%s: no tenant context resolver is set for calls of sandboxed code",
                api.label);
        }
        *hash<auto> ctx = call_function(resolver, conn);
        if (!ctx) {
            throw ErrorContext, sprintf("%s: connection %y has no tenant context", api.label, conn.name);
        }
        return TenantActionRunner::runTenantCall(conn, ctx, api, args);
    }

    #! Makes a call of trusted code for a tenant's connection in the tenant's own program, if the host says so
    /** Called by TypeScriptActionDataProviderBase::execAsyncValueArgs() for every call of trusted code: a host can
        make calls for a tenant's connection from its own trusted threads (a REST handler, a test engine, a flow
        engine), which no sandbox governs.  The host's resolver decides from the connection alone: a tenant context
        means the connection is a tenant's, and the call is made by the runner in the tenant's own program, whatever
        the calling thread, with its requests under the host's sandbox for it (setTrustedCallSandbox()); without a
        connection, or for a connection that the resolver gives no context, the call is trusted and made as before.

        The call fails closed: a connection that its host marked as a sandboxed caller's (\c internal_info.sandboxed)
        never runs trusted.  Its call is refused (\c TS-TENANT-HOOK-MISSING) when no resolver is set, as when the
        host has not given its hooks to a module loaded after its startup; it is refused (\c TS-TENANT-ERROR) when the
        resolver gives it no context.  A tenant's call is refused (\c TS-TENANT-HOOK-MISSING) when the host has given
        no sandbox for the tenant calls of trusted code.

        @param src the object that makes the call: a data provider or a connection of the module, or its REST client
        @param api the call
        @param args the arguments of the call
        @param tenant set to @ref True if the call was a tenant's and made here

        @return the return value of the call, if \a tenant is set
    */
    static auto dispatchTrusted(*object src, hash<AsyncCallInfo> api, *softlist<auto> args, reference<bool> tenant)
            [dom=PROCESS_CONTROL] {
        # for trusted code only: it runs the call under the host's sandbox for the connection's tenant, with no
        # caller's isolation domain to check, so sandboxed code is refused (qoretechnologies/qore#7227)
        TenantActionRunner::checkTrusted("dispatchTrusted");
        tenant = False;
        # the records function that a search returned is called as it is: the runner's closure if the search was a
        # tenant's
        if (api.type == "get_records") {
            return;
        }
        *AbstractConnection conn = TenantActionRunner::getCallConnection(src);
        if (!conn) {
            return;
        }
        # a connection that its host marked as a sandboxed caller's: never run as trusted code
        bool marked = conn.internal_info.sandboxed.toBool();
        *code resolver;
        {
            AutoLock al(lock);
            resolver = context_resolver;
        }
        if (!resolver) {
            if (marked) {
                tenant = True;
                throw ErrorHookMissing, sprintf("%s: connection %y belongs to a sandboxed caller, but the host has set "
                    "no tenant context resolver (TenantActionRunner::setTenantContextResolver()); the call is refused",
                    api.label, conn.name), {"hook": "tenant_context_resolver"};
            }
            return;
        }
        *hash<auto> ctx = call_function(resolver, conn);
        if (!ctx) {
            if (marked) {
                tenant = True;
                throw ErrorContext, sprintf("%s: connection %y belongs to a sandboxed caller, but the host's resolver "
                    "gives it no tenant context; the call is refused", api.label, conn.name);
            }
            return;
        }
        tenant = True;
        if (api.unlimited) {
            throw ErrorContext, sprintf("%s: events are not available for a tenant's connection %y", api.label,
                conn.name);
        }
        hash<TsTenantContext> tctx = cast<hash<TsTenantContext>>(ctx);
        TenantActionRunner::checkContext(tctx);
        # the requests of the call are made under the host's sandbox for the tenant
        *code host_sandbox;
        {
            AutoLock al(lock);
            host_sandbox = trusted_call_sandbox;
        }
        if (!host_sandbox) {
            throw ErrorHookMissing, sprintf("%s: connection %y is a tenant's, but the host has set no sandbox for the "
                "tenant calls of trusted code (TenantActionRunner::setTrustedCallSandbox()); the call is refused",
                api.label, conn.name), {"hook": "trusted_call_sandbox"};
        }
        V8::SandboxCapture capture = call_function(host_sandbox, tctx,
            V8::SandboxCapture sub () { return new V8::SandboxCapture(); });
        if (!capture.isSandboxed()) {
            throw ErrorContext, sprintf("%s: the host's sandbox for the tenant calls of trusted code governs "
                "nothing", api.label);
        }
        return TenantActionRunner::runTenantCall(conn, tctx, api, args, capture);
    }

    #! Makes the call of a tenant in the tenant's own program
    private:internal static auto runTenantCall(AbstractConnection conn, hash<auto> ctx, hash<AsyncCallInfo> api,
            *softlist<auto> args, *V8::SandboxCapture capture) {
        hash<TsTenantContext> tctx = cast<hash<TsTenantContext>>(ctx);
        TenantActionRunner::checkContext(tctx);
        bool search = api.type == "search_records";
        auto rv = TenantActionRunner::run(tctx, api.app, {
            "key": api.key,
            "args": args,
            "drain": search,
        }, capture);
        if (search) {
            # the records were read in the call; the bulk interface reads them from this closure
            list<auto> blocks = rv ?? ();
            return auto sub (auto cctx, auto block_size) {
                return shift blocks;
            };
        }
        if (rv.typeCode() == NT_HASH && rv.hasKey("connection_update")) {
            TenantActionRunner::applyConnectionUpdate(conn, remove rv.connection_update);
        }
        return rv;
    }

    #! Refuses sandboxed code: the module's pools and proxies run an app's code in the full runtime
    /** Sandboxed code reaches an app's code only through dispatch(); the pools and proxies refuse it, also when it
        uses them directly
    */
    static refuseSandboxed(string what) {
        if (SandboxManager::isSandboxed()) {
            throw ErrorContext, sprintf("%s cannot be used by sandboxed code; its calls are made by the tenant "
                "runner", what);
        }
    }

    #! Returns the connection of a call
    private:internal static *AbstractConnection getCallConnection(*object src) {
        if (src instanceof AbstractConnection) {
            return src;
        }
        if (src instanceof TypeScriptActionDataProviderBase) {
            return cast<TypeScriptActionDataProviderBase>(src).getConnection() ?? _thread_conn;
        }
        if (src instanceof TypeScriptAppRestClient) {
            return cast<TypeScriptAppRestClient>(src).getAppConnection();
        }
        return _thread_conn;
    }

    #! Gives a connection update to the host's handler, or refuses it if no handler is set
    private:internal static applyConnectionUpdate(AbstractConnection conn, auto update) {
        *code handler;
        {
            AutoLock al(lock);
            handler = update_handler;
        }
        if (!handler) {
            throw ErrorContext, sprintf("the call returned a connection update for connection %y, but no connection "
                "update handler is set", conn.name);
        }
        if (update.typeCode() == NT_HASH && update) {
            call_function(handler, conn, update);
        }
    }

    #! Returns the limits of the tenants' calls
    /** @throw TS-TENANT-ERROR the calling code is sandboxed
    */
    static hash<TsTenantLimits> getTenantLimits() [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("getTenantLimits");
        AutoLock al(lock);
        return limits;
    }

    #! Sets the limits of the tenants' calls
    /** Unlike the hooks, the limits can be set again by trusted code: the last limits set apply

        @throw TS-TENANT-ERROR the calling code is sandboxed
    */
    static setTenantLimits(hash<TsTenantLimits> new_limits) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("setTenantLimits");
        AutoLock al(lock);
        limits = new_limits;
    }

    #! Returns the catalog information of an action, with \c tenant_available telling whether tenants can run it
    /** @param ctx the context of the call
        @param app the app
        @param action the action

        @return the information of the action, as plain data

        @throw TS-TENANT-ERROR the context is invalid, or the app or the action is unknown
    */
    static hash<auto> getActionInfo(hash<TsTenantContext> ctx, string app, string action) {
        TenantActionRunner::checkContext(ctx);
        # a sandboxed caller asks only for its own tenant (qoretechnologies/qore#7227)
        TenantActionRunner::checkCallerDomain(new V8::SandboxCapture(), ctx);
        hash<auto> info = TenantActionRunner::getAction(app, action);
        AutoLock al(lock);
        if (*string builtin = unsupported{info.app}) {
            return info + {"tenant_available": False, "tenant_unsupported_builtin": builtin};
        }
        if (*hash<auto> h = unsupported_actions{info.app}{info.action}) {
            return info + {"tenant_available": False, "tenant_unsupported_builtin": h.builtin,
                "tenant_unsupported_package": h.package};
        }
        return info + {"tenant_available": True};
    }

    #! Runs an API or record action for a tenant and returns its response as plain data
    /** @param ctx the context of the call
        @param app the app
        @param action the action
        @param request the request of the action; for a record action, a hash with:
        - \c table: the table (required)
        - \c where: the search criteria (\c search, \c search-single, \c update and \c delete)
        - \c set: the fields to set (\c update; required)
        - \c records: a record or a list of records (\c create and \c upsert; required)
        - \c options: the options of the operation
        @param request_options the request options of an API action

        @return the response, as plain data; a hash response of an API action can have the key \c connection_update
        with token fields that the action refreshed, which the caller applies to its connection itself; for a record
        action: the list of records found (\c search), the record found or nothing (\c search-single), the records
        created (\c create), the result of each record (\c upsert), or the number of records changed (\c update and
        \c delete); a record action reads or writes at most the tenant's limit of records (\c TS-TENANT-LIMIT with
        <tt>limit: "records"</tt>)

        @throw TS-TENANT-ERROR the context is invalid, or the app or the action is unknown
        @throw TS-TENANT-TIMEOUT the call's time limit expired
        @throw TS-TENANT-EGRESS-DENIED a request of the action was refused
        @throw TS-TENANT-LIMIT the tenant's concurrency or memory limit was exceeded
        @throw TS-TENANT-APP-UNSUPPORTED the app needs a builtin of Node.js that tenants do not get
        @throw TS-TENANT-ACTION-ERROR the action failed
    */
    static auto exec(hash<TsTenantContext> ctx, string app, string action, auto request, *hash<auto> request_options) {
        TenantActionRunner::checkContext(ctx);
        hash<auto> info = TenantActionRunner::getAction(app, action);
        TenantActionRunner::checkActionSupported(info);
        switch (info.action_code) {
            case DPAT_API:
                return TenantActionRunner::run(ctx, info.app, {
                    "key": sprintf("app-%s-%s-api_function", info.app, info.action),
                    "args": (request, request_options, TenantActionRunner::getDataContext(ctx)),
                });
            case DPAT_FIND:
            case DPAT_FIND_SINGLE:
            case DPAT_CREATE:
            case DPAT_UPDATE:
            case DPAT_UPSERT:
            case DPAT_DELETE:
                return TenantActionRunner::run(ctx, info.app, {
                    "record": TenantActionRunner::getRecordRequest(info.action_code, request),
                });
        }
        throw ErrorContext, sprintf("action %y of app %y is not an API or record action", action, app);
    }

    #! Refuses an action that probeApps() found to need a builtin that tenants do not get
    private:internal static checkActionSupported(hash<auto> info) {
        AutoLock al(lock);
        if (*hash<auto> h = unsupported_actions{info.app}{info.action}) {
            throw ErrorUnsupported, sprintf("action %y of app %y cannot run for tenants: it needs %y (package %y)",
                info.action, info.app, h.builtin, h.package),
                {"app": info.app, "action": info.action, "builtin": h.builtin, "package": h.package};
        }
    }

    #! Validates the request of a record action; returns it as the plain data of the call
    private:internal static hash<auto> getRecordRequest(int code, auto request) {
        if (request.typeCode() != NT_HASH || request.table.typeCode() != NT_STRING || !request.table.val()) {
            throw ErrorContext, "the request of a record action is a hash with the table (\"table\")";
        }
        hash<auto> rv = {
            "code": code,
            "table": request.table,
            "options": request.options,
        };
        foreach string k in ("where", "set", "records", "options") {
            if (exists request{k} && request{k}.typeCode() != NT_HASH && (k != "records"
                || request{k}.typeCode() != NT_LIST)) {
                throw ErrorContext, sprintf("the request's %y of a record action must be a hash", k);
            }
        }
        switch (code) {
            case DPAT_FIND:
            case DPAT_FIND_SINGLE:
            case DPAT_DELETE:
                rv.where = request.where;
                break;
            case DPAT_UPDATE:
                if (!request.set) {
                    throw ErrorContext, "the request of an update gives the fields to set (\"set\")";
                }
                rv.set = request.set;
                rv.where = request.where;
                break;
            case DPAT_CREATE:
            case DPAT_UPSERT:
                if (!request.records) {
                    throw ErrorContext, "the request gives the records (\"records\": a hash or a list of hashes)";
                }
                rv.records = request.records.typeCode() == NT_HASH ? (request.records,) : request.records;
                foreach auto r in (rv.records) {
                    if (r.typeCode() != NT_HASH) {
                        throw ErrorContext, "each record is a hash";
                    }
                }
                break;
        }
        return rv;
    }

    #! Starts an event source of a tenant: the app's event function, which runs until it is stopped
    /** The function runs in a restricted program of the tenant's own, held for the subscription, on a thread of the
        runner, with no time limit and with the tenant's heap cap; its requests go through the bridge under the
        calling code's sandbox, captured here.  Its events are queued until they are polled with pollEvents().

        CPU: each program has its own isolate, and the function runs on its own thread; an event source counts
        toward the tenant's limit of concurrent calls (\c max_concurrent) while it runs, so that a tenant's spinning
        functions occupy at most that many threads, and a tenant's functions never hold an isolate of another
        tenant's programs.

        @param ctx the context of the subscription; the subscription belongs to its tenant
        @param app the app
        @param action the event action
        @param options the options of the event function
        @param checkpoint the state that the host stored last, which the function's \c checkpoint.get() returns

        @return the subscription ID

        @throw TS-TENANT-ERROR the context is invalid, the action is unknown or not an event action of a function
        (webhook events are not available to tenants)
        @throw TS-TENANT-LIMIT the tenant runs its limit of event sources or of concurrent calls
        @throw TS-TENANT-APP-UNSUPPORTED the app needs a builtin of Node.js that tenants do not get
    */
    static string startEvents(hash<TsTenantContext> ctx, string app, string action, *hash<auto> options,
            auto checkpoint) {
        TenantActionRunner::checkContext(ctx);
        hash<auto> info = TenantActionRunner::getAction(app, action);
        TenantActionRunner::checkActionSupported(info);
        if (info.action_code != DPAT_EVENT) {
            throw ErrorContext, sprintf("action %y of app %y is not an event action", action, app);
        }
        V8::SandboxCapture capture();
        TenantActionRunner::checkCallerDomain(capture, ctx);
        string key = sprintf("app-%s-%s-event_function", info.app, info.action);
        hash<TsTenantLimits> lim;
        {
            AutoLock al(lock);
            if (*string builtin = unsupported{info.app}) {
                throw ErrorUnsupported, sprintf("app %y cannot run for tenants: it needs %y", info.app, builtin),
                    {"app": info.app, "builtin": builtin};
            }
            lim = limits;
            int n = (select sources.iterator(), $1.tenant == ctx.tenant).size();
            if (n >= lim.max_event_sources) {
                throw ErrorLimit, sprintf("the tenant runs %d event sources already, its limit", n),
                    {"limit": "event_sources", "max": lim.max_event_sources};
            }
            if (running{ctx.tenant} >= lim.max_concurrent) {
                throw ErrorLimit, sprintf("the tenant runs %d calls already, its limit", running{ctx.tenant}),
                    {"limit": "concurrency", "max": lim.max_concurrent};
            }
            ++running{ctx.tenant};
        }
        bool started;
        on_exit if (!started) {
            TenantActionRunner::releaseConcurrencyIntern(ctx.tenant);
        }
        hash<auto> pgm = TenantActionRunner::getProgram(ctx.tenant, info.app);
        on_exit if (!started) {
            TenantActionRunner::releaseProgram(ctx.tenant, info.app, pgm, True);
        }
        if (!pgm.call_map{key}) {
            throw ErrorContext, sprintf("action %y of app %y has no event function (webhook events are not "
                "available to tenants)", action, app);
        }
        hash<AsyncCallInfo> api = TypeScriptActionInterface::getCall(key);
        api.async_call = pgm.call_map{key};
        api.label = sprintf("tenant events: %s", key);
        string id = UUID::get();
        hash<DataContextInfo> dctx = TenantActionRunner::getDataContext(ctx);
        dctx.opts = options;
        # the source is created in the trusted call: an object that is created while sandboxed code is on the stack
        # carries its sandbox, and every method of the object would run under it
        TenantEventSource src = call_function(events_call, ctx.tenant, info.app, pgm, lim.max_queued_events,
            lim.heap_limit, checkpoint, api, dctx, {
                "tenant": ctx.tenant,
                "connection": ctx.connection,
                "capture": capture,
            });
        {
            AutoLock al(lock);
            sources{id} = src;
        }
        started = True;
        return id;
    }

    #! Returns the events of a subscription that are queued, oldest first
    /** @param ctx the context of the call; the subscription must belong to its tenant
        @param id the subscription ID
        @param max the maximum number of events to return
        @param wait how long to wait for an event when none is queued (none: no wait)

        @return a hash with \c events (a list of plain-data events), \c running (if the function still runs) and
        \c checkpoint, if the function set a state since the previous poll

        @throw TS-TENANT-ERROR the context is invalid, or the subscription is unknown for the tenant
        @throw TS-TENANT-LIMIT the source queued its limit of events and was stopped (once, after its events)
        @throw TS-TENANT-ACTION-ERROR, TS-TENANT-EGRESS-DENIED, TS-TENANT-APP-UNSUPPORTED the function failed (once,
        after its events)
    */
    static hash<auto> pollEvents(hash<TsTenantContext> ctx, string id, int max = 100, *timeout wait) {
        TenantActionRunner::checkContext(ctx);
        # a source's ID is no authorization: a sandboxed caller polls only its own tenant's sources
        # (qoretechnologies/qore#7227)
        TenantActionRunner::checkCallerDomain(new V8::SandboxCapture(), ctx);
        return TenantActionRunner::getSource(ctx, id).poll(max, wait);
    }

    #! Stops a subscription: ends the event function, waits for it, and frees its program
    /** The function is ended whether or not it cooperates: its program is terminated, and its thread is cancelled
        if it waits in a request of the bridge

        @throw TS-TENANT-ERROR the context is invalid, or the subscription is unknown for the tenant
    */
    static stopEvents(hash<TsTenantContext> ctx, string id) {
        TenantActionRunner::checkContext(ctx);
        # a source's ID is no authorization: a sandboxed caller stops only its own tenant's sources
        # (qoretechnologies/qore#7227)
        TenantActionRunner::checkCallerDomain(new V8::SandboxCapture(), ctx);
        TenantEventSource src = TenantActionRunner::getSource(ctx, id);
        {
            AutoLock al(lock);
            remove sources{id};
        }
        call_function(stop_call, src);
    }

    #! Stops an event source; runs as trusted code (see init())
    private:internal static stopSource(TenantEventSource src) {
        src.stop();
    }

    #! The exit hook of the runner: stops every event source (see init())
    private:internal static exitHook() {
        TenantActionRunner::shutdown();
    }

    #! Stops every event source and frees its program; called when the module is unloaded
    static shutdown() [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("shutdown");
        hash<string, TenantEventSource> all;
        {
            AutoLock al(lock);
            all = remove sources;
            sources = {};
        }
        map $1.stop(), all.iterator();
    }


    #! Returns the subscription of a tenant, or raises TS-TENANT-ERROR as for an unknown ID
    private:internal static TenantEventSource getSource(hash<TsTenantContext> ctx, string id) {
        AutoLock al(lock);
        *TenantEventSource src = sources{id};
        if (!src || src.tenant != ctx.tenant) {
            throw ErrorContext, sprintf("unknown subscription %y", id);
        }
        return src;
    }

    #! Releases a call of a tenant's concurrency limit; for the module's event sources (trusted code only)
    /** @throw TS-TENANT-ERROR the calling code is sandboxed: only the runner releases a tenant's calls
        (qoretechnologies/qore#7227)
    */
    static releaseConcurrency(string tenant) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("releaseConcurrency");
        TenantActionRunner::releaseConcurrencyIntern(tenant);
    }

    #! Releases a call of a tenant's concurrency limit; never below none
    private:internal static releaseConcurrencyIntern(string tenant) {
        AutoLock al(lock);
        if (!running{tenant}) {
            return;
        }
        if (!--running{tenant}) {
            remove running{tenant};
        }
    }

    #! Releases the program of an event source; it is discarded; for the module's event sources (trusted code only)
    /** @throw TS-TENANT-ERROR the calling code is sandboxed (qoretechnologies/qore#7227)
    */
    static releaseEventProgram(string tenant, string app, hash<auto> pgm) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("releaseEventProgram");
        TenantActionRunner::releaseProgram(tenant, app, pgm, True);
    }

    #! Creates an event source and starts its thread; runs as trusted code (see init())
    private:internal static TenantEventSource startEventThread(string tenant, string app, hash<auto> pgm,
            int max_queued, int heap_limit, auto checkpoint, hash<AsyncCallInfo> api, hash<DataContextInfo> dctx,
            hash<auto> call) {
        TenantEventSource src(tenant, app, pgm, max_queued, heap_limit, TenantActionRunner::plainData(checkpoint));
        src.start(api, dctx, call);
        return src;
    }


    #! Checks the isolation domain of a sandboxed caller (qoretechnologies/qore#6536)
    private:internal static checkCallerDomain(V8::SandboxCapture capture, hash<TsTenantContext> ctx) {
        # the tenant of a sandboxed caller is its sandbox's isolation domain: a caller with no domain, or with the
        # domain of another tenant, is refused
        if (capture.isSandboxed() && V8::SandboxCapture::hasIsolationDomains()) {
            *string domain = capture.getIsolationDomain();
            if (!domain) {
                throw ErrorContext, "the sandbox of the calling code has no isolation domain";
            }
            if (domain != ctx.tenant) {
                throw ErrorContext, "the tenant of the call is not the isolation domain of the calling code's "
                    "sandbox";
            }
        }
    }

    #! Maps an exception of an event function to the defined error, as an exception hash
    static hash<ExceptionInfo> mapError(string app, hash<ExceptionInfo> ex) [dom=PROCESS_CONTROL] {
        try {
            TenantActionRunner::rethrowMapped(app, ex);
        } catch (hash<ExceptionInfo> mapped) {
            return mapped;
        }
        return ex;
    }

    #! Probes which apps tenants can run; for the host, when its catalogue is built
    /** Each app is loaded in a restricted program, in a trusted build, as for a tenant's first call: an app that
        needs a builtin of Node.js that tenants do not get while it loads is marked unavailable for tenants
        (getActionInfo() reports it; its calls are refused with \c TS-TENANT-APP-UNSUPPORTED), so that the host
        knows it up front; the app's sources are also scanned for the builtins that a restricted program refuses
        once it is sealed, which a call of the app can need

        @param apps the apps to probe; if not given, every app of the catalogues

        The app's sources and the packages that they depend on are scanned too (see scanBuiltins()): a builtin that
        a function requires (lazily) is refused when the function runs, after the seal, so the app is marked
        unavailable when its shared code requires one, and otherwise each action whose own code does is marked
        unavailable (getActionInfo() reports it, and its calls are refused with \c TS-TENANT-APP-UNSUPPORTED); a
        builtin that a source requires at its top is required before the seal, and is only reported.  The runtime
        refusal of a builtin stays the backstop.

        @return a hash by app: \c available (if tenants can run the app), \c builtin and \c package (the builtin
        that the load or the shared code needs, and the package that requires it, if refused), \c error (another
        error of the load, if any), \c unavailable_actions (the actions that tenants cannot run: action ->
        \c builtin and \c package), \c runtime_builtins (the refused builtins that the app or its packages
        require, anywhere) and \c builtin_sources (the findings: \c shared and \c actions, each a list of
        \c package, \c builtin and \c lazy)

        @throw TS-TENANT-ERROR the calling code is sandboxed
    */
    static hash<string, hash<auto>> probeApps(*softlist<string> apps) [dom=PROCESS_CONTROL] {
        TenantActionRunner::checkTrusted("probeApps");
        hash<string, hash<auto>> rv = {};
        V8::JavaScriptProgram scanner(replace(ScannerSource, "%REFUSED%", make_json(RefusedBuiltins)),
            "qore-tenant-scan.js");
        foreach string app in (apps ?? TypeScriptActionInterface::getCatalogueAppNames()) {
            # mixed value types: not inferred from a literal
            hash<auto> r = {};
            r.available = True;
            try {
                hash<auto> pgm = call_function(build, app);
                JavaScriptProgramPool::unmapProgram(pgm.id);
            } catch (hash<ExceptionInfo> ex) {
                hash<ExceptionInfo> mapped = TenantActionRunner::mapError(app, ex);
                r.available = False;
                if (mapped.err == ErrorUnsupported) {
                    r.builtin = mapped.arg.builtin;
                } else {
                    r.error = sprintf("%s: %s", mapped.err, mapped.desc);
                }
            }
            hash<auto> scan = TenantActionRunner::scanBuiltins(scanner, app);
            list<hash<auto>> all = scan.shared;
            map all += $1, scan.actions.iterator();
            if (all) {
                r.runtime_builtins = sort(keys (map {$1.builtin: True}, all));
                r.builtin_sources = scan;
            }
            # a builtin that a function requires lazily is refused when the function runs: the app is unavailable if
            # its shared code requires one, else each action whose own code does (qoretechnologies/qore#6932);
            # requires at the top of a source run before the seal, and are reported only
            *hash<auto> shared_lazy = (sort((select scan.shared, $1.lazy), int sub (hash<auto> a, hash<auto> b) {
                return a.builtin <=> b.builtin;
            }))[0];
            if (r.available && shared_lazy) {
                r.available = False;
                r.builtin = shared_lazy.builtin;
                r.package = shared_lazy.package;
                AutoLock al(lock);
                unsupported{app} = shared_lazy.builtin;
            } else if (r.available) {
                foreach hash<auto> i in (scan.actions.pairIterator()) {
                    *hash<auto> lazy = (sort((select i.value, $1.lazy), int sub (hash<auto> a, hash<auto> b) {
                        return a.builtin <=> b.builtin;
                    }))[0];
                    if (!lazy) {
                        continue;
                    }
                    r.unavailable_actions{i.key} = {"builtin": lazy.builtin, "package": lazy.package};
                    AutoLock al(lock);
                    unsupported_actions{app}{i.key} = {"builtin": lazy.builtin, "package": lazy.package};
                }
            }
            rv{app} = r;
        }
        return rv;
    }

    #! the builtins of Node.js that a sealed restricted program refuses
    const RefusedBuiltins = ("fs", "fs/promises", "child_process", "net", "tls", "dns", "dns/promises", "dgram",
        "cluster", "worker_threads", "vm", "v8", "inspector", "repl", "readline", "module", "wasi", "trace_events",
        "sqlite");

    #! Scans an app and the packages that it depends on for the builtins that a sealed restricted program refuses
    /** The app's sources and, transitively, the packages that they require from node_modules directories (as Node.js
        resolves them) are scanned for the builtins of Node.js that a sealed restricted program refuses, with whether
        each is required in a function (\c lazy: when the function runs, after the seal) or at the top of a source
        (when it loads, before the seal) (qoretechnologies/qore#6932).  The app's shared code (its entry, without its
        action and trigger files) and each action (the closure of its file) are scanned apart, so that a finding can
        be attributed to the actions that reach it.  The scanner runs in a program of the full runtime, with the
        probe's trust.

        @return a hash: \c shared (the findings of the shared code) and \c actions (the findings by action); a
        finding is a hash: \c package (empty for the app's own sources), \c builtin and \c lazy
    */
    private:internal static hash<auto> scanBuiltins(V8::JavaScriptProgram scanner, string app) {
        *hash<auto> src = TenantActionRunner::getSource(app);
        hash<auto> rv = {"shared": (), "actions": {}};
        if (!src) {
            return rv;
        }
        string entry;
        string root;
        if (src.master) {
            *string dir = TenantActionRunner::getAppDir(app);
            if (!dir) {
                return rv;
            }
            entry = dir;
            # the catalogue's distribution: its node_modules are resolved up to its directory
            root = dirname(dirname(src.script));
        } else {
            entry = src.script;
            root = "/";
        }
        hash<auto> h = parse_json(scanner.getGlobal().getProperty("qoreTenantScan").callAsFunctionArgs(NOTHING,
            (entry, root)));
        code to_finding = hash<auto> sub (list<auto> f) {
            return {"package": f[0], "builtin": f[1], "lazy": f[2]};
        };
        rv.shared = map to_finding($1), h.shared;
        rv.actions = map {$1.key: (map to_finding($1), $1.value)}, (h.actions ?? {}).pairIterator();
        return rv;
    }

    #! the scanner of probeApps(): JavaScript of the full runtime that reads the sources (see scanBuiltins())
    const ScannerSource = '(function () {
const fs = require("fs");
const path = require("path");
const REFUSED = new Set(%REFUSED%);
const OTHER = new Set(["assert", "assert/strict", "buffer", "events", "stream", "stream/promises", "stream/web",
    "string_decoder", "url", "util", "util/types", "querystring", "punycode", "zlib", "crypto", "path", "path/posix",
    "timers", "timers/promises", "perf_hooks", "async_hooks", "diagnostics_channel", "http", "https", "http2", "os",
    "process", "tty"]);
const REQ = /require\(\s*["\x27](?:node:)?([^"\x27]+)["\x27]\s*\)/y;
// the require() calls of a source, with whether each is in a function (lazy: run after the seal) or at the top
function scan(text, out) {
    let depth = 0;
    for (let i = 0, n = text.length; i < n; ++i) {
        const c = text.charCodeAt(i);
        if (c === 34 || c === 39 || c === 96) {
            for (++i; i < n && text.charCodeAt(i) !== c; ++i) {
                if (text.charCodeAt(i) === 92) {
                    ++i;
                }
            }
        } else if (c === 47 && text.charCodeAt(i + 1) === 47) {
            const e = text.indexOf("\n", i);
            i = e < 0 ? n : e;
        } else if (c === 47 && text.charCodeAt(i + 1) === 42) {
            const e = text.indexOf("*/", i + 2);
            i = e < 0 ? n : e + 1;
        } else if (c === 123) {
            ++depth;
        } else if (c === 125) {
            if (depth) {
                --depth;
            }
        } else if (c === 114 && text.startsWith("require(", i)) {
            REQ.lastIndex = i;
            const m = REQ.exec(text);
            if (m) {
                out.push([m[1], depth > 0]);
            }
        }
    }
}
function resolve(pkg, start, root) {
    for (let d = start; ; d = path.dirname(d)) {
        const c = path.join(d, "node_modules", pkg);
        try {
            if (fs.statSync(c).isDirectory()) {
                return c;
            }
        } catch (e) {
        }
        if (d === root || d === path.dirname(d)) {
            return null;
        }
    }
}
function resolveFile(base) {
    for (const c of [base, base + ".js", base + ".cjs", path.join(base, "index.js")]) {
        try {
            if (fs.statSync(c).isFile()) {
                return c;
            }
        } catch (e) {
        }
    }
    return null;
}
// the file of the entry of a package, or of a subpath of it
function packageFile(dir, sub) {
    if (sub) {
        return resolveFile(path.join(dir, sub));
    }
    let main = "index.js";
    try {
        const pj = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
        if (typeof pj.main === "string" && pj.main) {
            main = pj.main;
        }
    } catch (e) {
    }
    return resolveFile(path.join(dir, main)) || resolveFile(path.join(dir, "index"));
}
// the modules that a file requires and the refused builtins that it requires: {deps: [file], refused: [[name, lazy]]}
function fileInfo(f, root, memo) {
    let info = memo.get(f);
    if (info) {
        return info;
    }
    info = {deps: [], refused: [], pkg: ""};
    memo.set(f, info);
    const nm = f.lastIndexOf(path.sep + "node_modules" + path.sep);
    if (nm >= 0) {
        const rest = f.slice(nm + 14).split(path.sep);
        info.pkg = rest[0].startsWith("@") ? rest[0] + "/" + rest[1] : rest[0];
    }
    let text;
    try {
        text = fs.readFileSync(f, "utf8");
    } catch (e) {
        return info;
    }
    info.text = text;
    const reqs = [];
    scan(text, reqs);
    for (const [name, lazy] of reqs) {
        if (REFUSED.has(name)) {
            info.refused.push([name, lazy]);
        } else if (name.startsWith(".") || name.startsWith("/")) {
            const r = resolveFile(path.resolve(path.dirname(f), name));
            if (r) {
                info.deps.push(r);
            }
        } else if (!OTHER.has(name)) {
            const parts = name.split("/");
            const n = name.startsWith("@") ? 2 : 1;
            const dir = resolve(parts.slice(0, n).join("/"), path.dirname(f), root);
            const r = dir && packageFile(dir, parts.slice(n).join("/"));
            if (r) {
                info.deps.push(r);
            }
        }
    }
    return info;
}
const ACTION_FILE = /\.(action|trigger)\.c?js$/;
// the refused builtins in the modules that a module reaches: [package, builtin, lazy]; action files are not followed
// when skip_actions is set, and are collected in actions instead
function closure(start, root, memo, skip_actions, actions) {
    const found = new Map();
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length) {
        const info = fileInfo(queue.pop(), root, memo);
        for (const [name, lazy] of info.refused) {
            const key = info.pkg + "\u0000" + name;
            const old = found.get(key);
            found.set(key, [info.pkg, name, (old && old[2]) || lazy]);
        }
        for (const d of info.deps) {
            if (seen.has(d)) {
                continue;
            }
            seen.add(d);
            if (skip_actions && ACTION_FILE.test(d) && d.indexOf(path.sep + "node_modules" + path.sep) < 0) {
                actions.push(d);
                continue;
            }
            queue.push(d);
        }
    }
    return Array.from(found.values());
}
// the findings of an app: those of its shared code (its entry, without its actions), and those of each action
globalThis.qoreTenantScan = function (entry, root) {
    const memo = new Map();
    const action_files = [];
    let start = entry;
    try {
        if (fs.statSync(entry).isDirectory()) {
            start = path.join(entry, "index.js");
        }
    } catch (e) {
        return JSON.stringify({shared: [], actions: {}});
    }
    const shared = closure(start, root, memo, true, action_files);
    const actions = {};
    for (const af of action_files) {
        const info = fileInfo(af, root, memo);
        const m = /\bconst action\s*=\s*["\x27]([^"\x27]+)["\x27]/.exec(info.text || "");
        const name = m ? m[1] : path.basename(af).replace(ACTION_FILE, "");
        actions[name] = closure(af, root, memo, false, null);
    }
    return JSON.stringify({shared: shared, actions: actions});
};
})();
';

    #! Raises TS-TENANT-ERROR if the calling code is sandboxed
    private:internal static checkTrusted(string what) {
        if (SandboxManager::isSandboxed()) {
            throw ErrorContext, sprintf("%s() cannot be called by sandboxed code", what);
        }
    }

    #! Validates the context
    private:internal static checkContext(hash<TsTenantContext> ctx) {
        if (!ctx.tenant.val()) {
            throw ErrorContext, "the context has no tenant";
        }
    }

    #! Returns the catalog information of an action as plain data, or raises TS-TENANT-ERROR
    private:internal static hash<auto> getAction(string app, string action) {
        *hash<auto> info;
        try {
            info = DataProviderActionCatalog::getAppActionEx(app, action);
        } catch (hash<ExceptionInfo> ex) {
            throw ErrorContext, sprintf("unknown app %y or action %y", app, action);
        }
        if (!info || !TenantActionRunner::getSource(info.app)) {
            throw ErrorContext, sprintf("app %y is not a TypeScript app that tenants can run", app);
        }
        # plain data only
        return (map {$1.key: $1.value}, info.pairIterator(),
            $1.value.typeCode() != NT_OBJECT && $1.value.typeCode() != NT_CLOSURE && $1.value.typeCode() != NT_CALLREF)
            ?? {};
    }

    #! Returns the data context that the action gets: the tenant's own connection options and options
    private:internal static hash<DataContextInfo> getDataContext(hash<TsTenantContext> ctx) {
        return <DataContextInfo>{
            "conn_name": ctx.connection,
            "conn_opts": ctx.conn_opts,
            "opts": ctx.opts,
            "dynamic_path": ctx.dynamic_path,
        };
    }

    #! Runs a call of a tenant's program for an app
    private:internal static auto run(hash<TsTenantContext> ctx, string app, hash<auto> work,
            *V8::SandboxCapture call_capture) {
        # the sandbox that governs the requests that the program makes for the call: the calling code's own, or, for
        # a call of trusted code for a tenant's connection, the one dispatchTrusted() took (the host chose the tenant
        # from the connection, so there is no caller's domain to check)
        V8::SandboxCapture capture;
        if (call_capture) {
            capture = call_capture;
        } else {
            capture = new V8::SandboxCapture();
            TenantActionRunner::checkCallerDomain(capture, ctx);
        }
        hash<TsTenantLimits> lim;
        {
            AutoLock al(lock);
            if (*string builtin = unsupported{app}) {
                throw ErrorUnsupported, sprintf("app %y cannot run for tenants: it needs %y", app, builtin),
                    {"app": app, "builtin": builtin};
            }
            lim = limits;
            if (running{ctx.tenant} >= lim.max_concurrent) {
                throw ErrorLimit, sprintf("the tenant runs %d calls already, its limit", running{ctx.tenant}),
                    {"limit": "concurrency", "max": lim.max_concurrent};
            }
            ++running{ctx.tenant};
        }
        on_exit {
            AutoLock al(lock);
            if (!--running{ctx.tenant}) {
                remove running{ctx.tenant};
            }
        }

        hash<auto> pgm = TenantActionRunner::getProgram(ctx.tenant, app);
        bool discard = False;
        on_exit TenantActionRunner::releaseProgram(ctx.tenant, app, pgm, discard);

        # the time limit in milliseconds: the caller's, else the action's, capped by the maximum
        int to_ms;
        if (work.key) {
            *code call = pgm.call_map{work.key};
            if (!call) {
                throw ErrorContext, sprintf("app %y has no such action function (%y)", app, work.key);
            }
            hash<AsyncCallInfo> api = TypeScriptActionInterface::getCall(work.key);
            api.async_call = call;
            api.label = sprintf("tenant call: %s", work.key);
            to_ms = ctx.timeout ?? (api.to ? api.to.durationMilliseconds() : lim.max_timeout);
            if (to_ms > lim.max_timeout) {
                to_ms = lim.max_timeout;
            }
            api.to = milliseconds(to_ms);
            work = {
                "api": api,
                "args": work.args,
                "drain": work.drain,
                "max_records": lim.max_records,
            };
        } else {
            to_ms = ctx.timeout ?? lim.max_timeout;
            if (to_ms > lim.max_timeout) {
                to_ms = lim.max_timeout;
            }
            # a new hash: the caller's literal can have a typed value type
            work = {
                "record": work.record,
                "app": app,
                "pool": TenantActionRunner::getSource(app).pool,
                "calls": pgm.call_map,
                "dctx": TenantActionRunner::getDataContext(ctx),
                "max_records": lim.max_records,
            };
        }

        # the state of the call that the bridge uses on this thread
        _tenant_call = {
            "tenant": ctx.tenant,
            "connection": ctx.connection,
            "capture": capture,
        };
        on_exit remove _tenant_call;
        hash<auto> rv = call_function(exec_call, pgm.pgm, work, to_ms, lim.heap_limit);
        if (rv.terminated) {
            discard = True;
            if (rv.over_heap) {
                throw ErrorLimit, "the call exceeded the tenant's memory limit", {"limit": "memory",
                    "max": lim.heap_limit};
            }
            throw ErrorTimeout, sprintf("the call exceeded its time limit of %dms", to_ms), {"timeout_ms": to_ms};
        }
        if (rv.error) {
            if (rv.error.err == ErrorLimit) {
                throw rv.error.err, rv.error.desc, rv.error.arg;
            }
            TenantActionRunner::rethrowMapped(app, rv.error);
        }
        return rv.result;
    }

    #! Runs a call in a tenant's program, with the time limit and the heap cap; runs as trusted code (see init())
    /** The watchdog thread is started here, so that it inherits no sandbox of the caller; the result is plain data
    */
    private:internal static hash<auto> execCall(V8::JavaScriptProgram js, hash<auto> work, int to_ms,
            int heap_limit) {
        Counter done(1);
        date deadline = now_us() + milliseconds(to_ms);
        background sub () {
            while (done.waitForZero(100ms)) {
                if (now_us() > deadline) {
                    js.terminate();
                    break;
                }
                js.requestHeapCheck(heap_limit);
            }
        }();
        on_exit done.dec();
        try {
            auto rv = work.record
                ? TenantActionRunner::execRecord(work)
                : TypeScriptActionDataProviderBase::execAsyncValueDirect(NOTHING, work.api, work.args);
            if (work.drain) {
                rv = TenantActionRunner::drainRecords(work, rv);
            }
            return {"result": TenantActionRunner::plainData(rv)};
        } catch (hash<ExceptionInfo> ex) {
            if (js.isTerminated()) {
                return {"terminated": True, "over_heap": js.isOverHeap()};
            }
            return {"error": ex};
        }
    }

    #! Runs a record action with the provider code; every call of the app is made in the tenant's own program
    private:internal static auto execRecord(hash<auto> work) {
        # the app's record functions as the catalogue registered them; no call of the app is made here
        TypeScriptActionInterface::initApp(work.app);
        hash<AppInfo> appinfo = TypeScriptActionInterface::getInitializedRecordBasedAppInfo(work.app);
        hash<auto> req = work.record;
        int max = work.max_records;

        _ts_tenant_calls = work.calls;
        on_exit remove _ts_tenant_calls;

        hash<string, hash<string, hash<auto>>> ofmap;
        hash<DataProviderInfo> info = TypeScriptActionRecordBasedDataProvider::getDataProviderInfo(appinfo, \ofmap);
        TenantRecordProvider prov(req.table, info, new ActionFunctionContext(work.app, "tables", work.pool), work.dctx);
        switch (req.code) {
            case DPAT_FIND: {
                list<hash<auto>> rv = ();
                AbstractDataProviderRecordIterator i = prov.tenantSearch(req.where, req.options);
                while (i.next()) {
                    if (rv.size() == max) {
                        throw ErrorLimit, sprintf("the search returns more than %d records", max),
                            {"limit": "records", "max": max};
                    }
                    rv += i.getValue();
                }
                return rv;
            }
            case DPAT_FIND_SINGLE: {
                AbstractDataProviderRecordIterator i = prov.tenantSearch(req.where, req.options);
                return i.next() ? i.getValue() : NOTHING;
            }
            case DPAT_CREATE: {
                TenantActionRunner::checkRecordCount(req.records, max);
                return map prov.createRecord($1, req.options), req.records;
            }
            case DPAT_UPSERT: {
                TenantActionRunner::checkRecordCount(req.records, max);
                return map prov.upsertRecord($1, req.options), req.records;
            }
            case DPAT_UPDATE:
                return prov.updateRecords(req.set, req.where, req.options);
            case DPAT_DELETE:
                return prov.deleteRecords(req.where, req.options);
        }
    }

    #! Reads the records of a search function's result in the call: the function of the tenant's program never leaves
    private:internal static list<auto> drainRecords(hash<auto> work, auto get_records) {
        list<auto> blocks = ();
        if (!get_records.callp()) {
            return blocks;
        }
        hash<AsyncCallInfo> api = cast<hash<AsyncCallInfo>>(work.api);
        api.type = "get_records";
        api.label += " (records)";
        api.async_call = get_records;
        int count = 0;
        while (True) {
            auto block = TypeScriptActionDataProviderBase::execAsyncValueDirect(NOTHING, api, (work.args[0], 1000));
            if (block.typeCode() != NT_HASH || !block.firstValue().lsize()) {
                break;
            }
            count += block.firstValue().lsize();
            if (count > work.max_records) {
                throw ErrorLimit, sprintf("the search returns more than %d records", work.max_records),
                    {"limit": "records", "max": work.max_records};
            }
            blocks += block;
        }
        return blocks;
    }

    private:internal static checkRecordCount(list<auto> records, int max) {
        if (records.size() > max) {
            throw ErrorLimit, sprintf("the request has %d records; the limit is %d", records.size(), max),
                {"limit": "records", "max": max};
        }
    }

    #! Raises the defined error for an exception of a call: plain-data args, no credentials or headers
    private:internal static rethrowMapped(string app, hash<ExceptionInfo> ex) {
        string desc = ex.desc ?? "";
        if (ex.err == ErrorEgress || desc =~ /NETWORK-ACCESS-DENIED|TS-TENANT-EGRESS-DENIED/) {
            throw ErrorEgress, "a request of the action was refused by the network policy";
        }
        if (*string builtin = (desc =~ x/QORE_TENANT_DENIED_BUILTIN: (.*) is not available/)[0]) {
            {
                AutoLock al(lock);
                unsupported{app} = builtin;
            }
            throw ErrorUnsupported, sprintf("app %y cannot run for tenants: it needs %y", app, builtin),
                {"app": app, "builtin": builtin};
        }
        if (ex.err =~ /^TS-TENANT-/) {
            throw ex.err, ex.desc, TenantActionRunner::plainData(ex.arg);
        }
        # the message of the action only: no stack with host paths, no request data; the dispatch wraps the error of
        # the action, whose message follows the last "Error: " of the first line
        string line = (desc =~ x/^([^\n]*)/)[0] ?? "";
        int i = line.rfind("Error: ");
        throw ErrorAction, (i >= 0 ? line.substr(i + 7) : line) ?: "the action failed";
    }

    #! Returns a copy of a value with plain data only
    #! Returns a value as plain data: no object, closure or call reference (a pure conversion)
    static auto plainData(auto v) {
        switch (v.typeCode()) {
            case NT_HASH: return map {$1.key: TenantActionRunner::plainData($1.value)}, v.pairIterator();
            case NT_LIST: return map TenantActionRunner::plainData($1), v;
            case NT_OBJECT:
                if (v instanceof V8::JavaScriptObject) {
                    return TenantActionRunner::plainData(v.toData());
                }
                return NOTHING;
            case NT_CLOSURE:
            case NT_CALLREF:
                return NOTHING;
        }
        return v;
    }

    #! Returns an idle program of the tenant for the app, building one if there is none
    private:internal static hash<auto> getProgram(string tenant, string app) {
        hash<TsTenantLimits> lim;
        {
            AutoLock al(lock);
            if (*list<hash<auto>> l = idle{tenant}{app}) {
                hash<auto> pgm = shift idle{tenant}{app};
                return pgm;
            }
            lim = limits;
            if (count{tenant}{app} >= lim.max_programs) {
                throw ErrorLimit, sprintf("the tenant uses %d programs for app %y already, its limit",
                    count{tenant}{app}, app), {"limit": "programs", "max": lim.max_programs};
            }
            ++count{tenant}{app};
        }
        try {
            # built as trusted code, with no data of the tenant: the app's name is checked against the index
            return call_function(build, app);
        } catch (hash<ExceptionInfo> ex) {
            {
                AutoLock al(lock);
                --count{tenant}{app};
            }
            TenantActionRunner::rethrowMapped(app, ex);
        }
    }

    #! Returns a program to the tenant's idle programs, or discards it
    private:internal static releaseProgram(string tenant, string app, hash<auto> pgm, bool discard) {
        AutoLock al(lock);
        if (discard) {
            --count{tenant}{app};
            JavaScriptProgramPool::unmapProgram(pgm.id);
            return;
        }
        idle{tenant}{app} += pgm;
    }

    #! Returns the catalogue of an app: its pool, its script and the directories that its programs may load from
    /** The catalogue given with setCatalogue(), else the catalogue that registered the app: the master catalogue
        (\c QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT) or a script of \c QORE_TYPESCRIPT_ACTION_SCRIPTS
    */
    private:internal static *hash<auto> getSource(string app) {
        *JavaScriptProgramPool pool = TypeScriptActionInterface::getAppPool(app);
        if (catalogue_pool && (!pool || pool == catalogue_pool)) {
            return {
                "pool": catalogue_pool,
                "script": catalogue_script,
                "roots": catalogue_roots ?? (dirname(dirname(catalogue_script)),),
                "master": False,
            };
        }
        *JavaScriptProgramPool master = TypeScriptActionInterfacePriv::getMaster();
        # an app registered from the index has no pool until it is loaded: it is the master catalogue's
        if (!pool && master && TypeScriptActionInterface::getAppLoadPath(app)) {
            pool = master;
        }
        if (!pool) {
            return;
        }
        string script = pool.getScriptPath();
        string dir = dirname(script);
        if (pool == master) {
            # the catalogue's directory: its distribution and its node_modules
            return {"pool": pool, "script": script, "roots": (dirname(dir),), "master": True};
        }
        # a script app: its directory, and the node_modules directories above it (see getScriptRoots())
        return {"pool": pool, "script": script, "master": False};
    }

    #! Returns the directories that the programs of a script app may load: its directory, and the node_modules
    #! directories above it, as Node.js resolves them; reads the file system, so it runs in the trusted build only
    private:internal static list<string> getScriptRoots(string dir) {
        list<string> roots = (dir,);
        for (string d = dirname(dir); ; d = dirname(d)) {
            if (is_dir(d + DirSep + "node_modules")) {
                roots += d + DirSep + "node_modules";
            }
            if (d == dirname(d)) {
                break;
            }
        }
        return roots;
    }

    #! Builds and seals a restricted program for an app; runs as trusted code (see init())
    private:internal static hash<auto> buildProgram(string app) {
        *hash<auto> src = TenantActionRunner::getSource(app);
        if (!src) {
            throw ErrorContext, sprintf("no TypeScript catalogue registered app %y", app);
        }
        string script = src.script;
        JavaScriptProgramPool pool = src.pool;
        *string load_path = src.master ? TenantActionRunner::getAppDir(app) : NOTHING;
        string dir = dirname(script);
        string source = TypeScriptActionInterfacePriv::getDefaultCode(script, dir)
            + ReadOnlyFile::readTextFile(script);
        V8::JavaScriptProgram pgm(source, script, {
            "restricted": True,
            "roots": src.roots ?? TenantActionRunner::getScriptRoots(dir),
            "bridge": \TenantActionRunner::bridge(),
        });
        # the apps that the program registers are mapped to the pool that registered the catalogue
        pool.mapProgram(pgm);
        string id = pgm.uniqueHash();
        on_error JavaScriptProgramPool::unmapProgram(id);
        hash<string, code> calls;
        {
            # the app's action functions are captured in the program's own map; no global state is changed
            PoolCloneModeHelper clone_helper();
            JavaScriptObject catalogue = pgm.getGlobal().exports.actionsCatalogue;
            # the catalogue's methods can be on its prototype: they are called, not looked up in its own properties
            if (load_path) {
                catalogue.loadAppFromPath(TypeScriptActionInterface::Api, load_path);
            } else {
                catalogue.registerAppActions(TypeScriptActionInterface::Api);
            }
            calls = PoolCloneModeHelper::getClosures() ?? {};
        }
        pgm.seal();
        return {
            "pgm": pgm,
            "id": id,
            "call_map": calls,
        };
    }

    #! The host bridge of the restricted programs: makes a request for the program (JSON in and out)
    /** On a tenant's call, the request is made under the calling code's sandbox; while a program is built (a trusted
        build, with no tenant), as trusted code
    */
    static private:internal string bridge(string json) {
        hash<auto> req = parse_json(json);
        *hash<auto> call = _tenant_call;
        if (call && call.capture.isSandboxed()) {
            return call.capture.call(\TenantActionRunner::doRequest(), req, call);
        }
        return TenantActionRunner::doRequest(req, call);
    }

    #! Makes a request of the bridge, following redirects itself so that each hop is checked
    static private:internal string doRequest(hash<auto> req, *hash<auto> call) {
        string url = req.url;
        string method = req.method ?? "GET";
        *binary body = req.body_b64 ? parse_base64_string(req.body_b64) : NOTHING;
        hash<auto> headers = req.headers ?? {};
        int bytes_out = body ? body.size() : 0;
        int bytes_in;
        on_exit if (call && egress_meter) {
            call_function(egress_meter, call.tenant, call.connection, bytes_out, bytes_in);
        }
        for (int hop = 0; hop <= MaxRedirects; ++hop) {
            hash<UrlInfo> ui = parse_url(url);
            if (call && egress_policy) {
                list<string> ips = TenantActionRunner::resolve(ui.host);
                if (!call_function(egress_policy, call.tenant, call.connection, ui, ips)) {
                    throw ErrorEgress, "the host's egress policy refused the request";
                }
            }
            HTTPClient hc({
                "url": url,
                "redirect_passthru": True,
                "timeout": req.timeout_ms ?? 60000,
                "connect_timeout": 30000,
            });
            hash<auto> info;
            hash<auto> resp;
            # an event source's request can be cancelled by its stop (see TenantEventSource::stop())
            *TenantEventSource src = call.src;
            if (src && !src.enterRequest()) {
                throw ErrorContext, "the event source was stopped";
            }
            try {
                resp = hc.send(body, method, ui.path ?? "/", headers, False, \info);
                if (src) {
                    src.leaveRequest();
                }
            } catch (hash<ExceptionInfo> ex) {
                if (src) {
                    # the stop's cancellation request is cleared at once, before any other wait of the thread
                    if (ex.err == "THREAD-CANCELLED") {
                        clear_thread_cancel();
                    }
                    src.leaveRequest();
                    if (ex.err == "THREAD-CANCELLED") {
                        throw ErrorContext, "the event source was stopped";
                    }
                }
                if (ex.err == "NETWORK-ACCESS-DENIED") {
                    throw ErrorEgress, "the sandbox's network policy refused the request";
                }
                if (ex.err == "HTTP-CLIENT-RECEIVE-ERROR" && ex.arg.status_code) {
                    resp = ex.arg;
                } else {
                    rethrow;
                }
            }
            int status = resp.status_code ?? 0;
            if (status >= 300 && status < 400 && resp.location && req.redirect != "manual") {
                url = normalize_url(url, resp.location);
                if (status == 303 || ((status == 301 || status == 302) && method == "POST")) {
                    method = "GET";
                    body = NOTHING;
                }
                continue;
            }
            *data out = resp.body;
            binary b = out.typeCode() == NT_STRING ? binary(out) : (out ?? binary());
            if (b.size() > MaxResponseBytes) {
                throw ErrorLimit, "the response exceeds the size limit", {"limit": "response", "max":
                    MaxResponseBytes};
            }
            bytes_in += b.size();
            return make_json({
                "status": status,
                "status_text": resp.status_message ?? "",
                "headers": (map {$1.key: $1.value}, resp.pairIterator(), $1.key != "body"
                    && $1.key != "status_code" && $1.key != "status_message"),
                "body_b64": make_base64_string(b),
                "url": url,
            });
        }
        throw ErrorEgress, "too many redirects";
    }

    #! Returns the addresses of a host
    static private:internal list<string> resolve(string host) {
        if (host =~ /^[0-9.]+$/ || host =~ /:/) {
            return (host,);
        }
        return map $1.address, getaddrinfo(host) ?? ();
    }
}

#! An event source of a tenant (module-internal): the app's event function, run on a thread of the runner
class TenantEventSource {
    public {
        string tenant;
        string app;
    }

    private:internal {
        hash<auto> pgm;
        int max_queued;
        int heap_limit;
        auto checkpoint;
        bool checkpoint_new = False;
        Mutex m();
        Condition cond();
        list<hash<auto>> events = ();
        bool running = False;
        bool stop_flag = False;
        bool in_request = False;
        *hash<ExceptionInfo> error;
        Counter done();
        int tid;
    }

    constructor(string tenant, string app, hash<auto> pgm, int max_queued, int heap_limit, auto checkpoint) {
        self.tenant = tenant;
        self.app = app;
        self.pgm = pgm;
        self.max_queued = max_queued;
        self.heap_limit = heap_limit;
        self.checkpoint = checkpoint;
    }

    #! Starts the function's thread and its heap watchdog; called as trusted code
    start(hash<AsyncCallInfo> api, hash<DataContextInfo> dctx, hash<auto> call) {
        running = True;
        done.inc();
        V8::JavaScriptProgram js = pgm.pgm;
        Counter started(1);
        tid = background run(api, dctx, call, started);
        started.waitForZero();
        # the heap cap: there is no time limit
        background sub () {
            while (done.waitForZero(100ms)) {
                js.requestHeapCheck(heap_limit);
                if (js.isOverHeap()) {
                    m.lock();
                    on_exit m.unlock();
                    if (!error) {
                        error = TenantEventSource::heapError(app, tenant, heap_limit, js.getOverHeapSize());
                    }
                    break;
                }
            }
        }();
    }

    private:internal run(hash<AsyncCallInfo> api, hash<DataContextInfo> dctx, hash<auto> call, Counter started) {
        _tenant_call = call;
        on_exit cleanup();
        started.dec();
        try {
            runFunction(api, dctx, call);
        } catch (hash<ExceptionInfo> ex) {
            V8::JavaScriptProgram js = pgm.pgm;
            m.lock();
            on_exit m.unlock();
            # a stop or an overflow ends the function itself: only another error is reported; a heap check that
            # terminated the program is reported as the memory limit, whether or not the watchdog saw it first
            if (!stop_flag && !error) {
                error = js.isOverHeap()
                    ? TenantEventSource::heapError(app, tenant, heap_limit, js.getOverHeapSize())
                    : TenantActionRunner::mapError(app, ex);
            }
        }
    }

    #! The cleanup of the function's thread
    /** A stop cancels the thread only while it waits in a request of the bridge, which clears the request itself
        (see enterRequest()), so no cancellation request is pending here
    */
    private:internal cleanup() {
        # a stop waits for done: it is released whatever the releases raise
        on_exit done.dec();
        on_exit TenantActionRunner::releaseEventProgram(tenant, app, pgm);
        on_exit TenantActionRunner::releaseConcurrency(tenant);
        remove _tenant_call;
        m.lock();
        running = False;
        cond.broadcast();
        m.unlock();
    }

    #! Called by the bridge before a request of the function: returns False if the source is stopped
    bool enterRequest() {
        m.lock();
        on_exit m.unlock();
        if (stop_flag) {
            return False;
        }
        in_request = True;
        return True;
    }

    #! Called by the bridge after a request of the function
    leaveRequest() {
        m.lock();
        on_exit m.unlock();
        in_request = False;
    }

    #! Runs the event function; called in the thread's trusted call
    runFunction(hash<AsyncCallInfo> api, hash<DataContextInfo> dctx, hash<auto> call) {
        _tenant_call = call;
        _tenant_call.src = self;
        on_exit remove _tenant_call;
        {
            TypeScriptActionDataProviderBase::execAsyncValueDirect(NOTHING, api, (dctx,
                sub (auto o) {
                    emit(o);
                },
                bool sub () {
                    return stop_flag;
                },
                {
                    "get": auto sub () {
                        return checkpoint;
                    },
                    "set": sub (auto state) {
                        if (state instanceof JavaScriptObject) {
                            state = cast<JavaScriptObject>(state).toData();
                        }
                        m.lock();
                        on_exit m.unlock();
                        checkpoint = TenantActionRunner::plainData(state);
                        checkpoint_new = True;
                        cond.broadcast();
                    },
                },
            ));
        }
    }

    #! Returns the error of an event function that exceeded the tenant's memory limit, and logs it
    static hash<ExceptionInfo> heapError(string app, string tenant, int heap_limit, int used) {
        TSAI::error("tenant %y: the event function of app %y used %d bytes of heap after a collection, over the cap "
            "of %d bytes; it is stopped", tenant, app, used, heap_limit);
        return <ExceptionInfo>{"err": TenantActionRunner::ErrorLimit,
            "desc": "the event function exceeded the tenant's memory limit",
            "arg": {"limit": "memory", "max": heap_limit}};
    }

    #! Queues an event; on overflow, stops the source and records the error
    private:internal emit(auto o) {
        if (o instanceof JavaScriptObject) {
            o = cast<JavaScriptObject>(o).toData();
        }
        m.lock();
        on_exit m.unlock();
        if (stop_flag) {
            return;
        }
        if (o.typeCode() != NT_HASH) {
            throw "INVALID-EVENT-DATA", sprintf("an event must be an object; got %y", o.fullType());
        }
        if (events.size() >= max_queued) {
            error = <ExceptionInfo>{"err": TenantActionRunner::ErrorLimit,
                "desc": sprintf("the event source queued %d events, its limit, and was stopped", max_queued),
                "arg": {"limit": "events", "max": max_queued}};
            stop_flag = True;
            V8::JavaScriptProgram js = pgm.pgm;
            js.terminate();
            cond.broadcast();
            return;
        }
        events += TenantActionRunner::plainData(o);
        cond.broadcast();
    }

    hash<auto> poll(int max, *timeout wait) {
        m.lock();
        on_exit m.unlock();
        if (!events && !checkpoint_new && !error && running && wait) {
            cond.wait(m, wait);
        }
        list<hash<auto>> rv = extract events, 0, max;
        # the error comes after the source's events: only when none is queued
        if (!rv && !events && error) {
            hash<ExceptionInfo> ex = remove error;
            throw ex.err, ex.desc, ex.arg;
        }
        hash<auto> h = {
            "events": rv,
            "running": running,
        };
        if (checkpoint_new) {
            h.checkpoint = checkpoint;
            checkpoint_new = False;
        }
        return h;
    }

    #! Ends the function whether or not it cooperates, and waits for its thread
    /** A function that runs JavaScript is terminated; one that waits in a request of the bridge is cancelled, once,
        under the lock that the request leaves under, so that the cancellation reaches only the request
    */
    stop() {
        {
            m.lock();
            on_exit m.unlock();
            if (!stop_flag) {
                stop_flag = True;
                V8::JavaScriptProgram js = pgm.pgm;
                js.terminate();
                if (in_request && tid) {
                    cancel_thread(tid, "the tenant's event source was stopped");
                }
            }
            cond.broadcast();
        }
        done.waitForZero();
    }
}

#! The record provider of a tenant's record action (module-internal): the tenant's own context, the direct path only
class TenantRecordProvider inherits TypeScriptActionRecordBasedDataProvider {
    private:internal {
        hash<DataContextInfo> dctx;
    }

    constructor(string table, hash<DataProviderInfo> info, ActionFunctionContext fctx, hash<DataContextInfo> dctx)
            : TypeScriptActionRecordBasedDataProvider(table, info, NOTHING, fctx) {
        self.dctx = dctx;
    }

    #! The tenant's own connection options and options, never a connection of the host
    *hash<DataContextInfo> getCallContextInfo(*hash<auto> action_opts) {
        hash<DataContextInfo> rv = dctx;
        rv.opts = dctx.opts + action_opts;
        return rv;
    }

    #! Searches with the app's search function in the tenant's program; no pool or server is used
    AbstractDataProviderRecordIterator tenantSearch(*hash<auto> where_cond, *hash<auto> search_options) {
        if (!search_records) {
            throw "INVALID-OPERATION", sprintf("Data provider %y does not support searching", getName());
        }
        search_options.table = name;
        hash<DataContextInfo> cctx = getCallContextInfo({"table": name});
        *hash<DataProviderExpression> exp = cast<*hash<DataProviderExpression>>(getSearchExpression(where_cond,
            search_options));
        *code get_records = getAsyncValue(search_records, cctx, info.expressions ? convertExpression(exp) : NOTHING,
            info.expressions ? search_options : NOTHING);
        return new TypeScriptBulkRecordInterface(1000, self, get_records, cctx, info.expressions ? NOTHING : exp,
            search_options).getRecordIterator();
    }
}
}

#! the state of a tenant's call on this thread, for the bridge
thread_local *hash<auto> _tenant_call;

#! returns the absolute URL of a redirect
string sub normalize_url(string base, string location) {
    if (location =~ /^[a-z]+:\/\//i) {
        return location;
    }
    hash<UrlInfo> ui = parse_url(base);
    string origin = sprintf("%s://%s%s", ui.protocol ?? "https", ui.host, ui.port ? ":" + ui.port : "");
    return location =~ /^\// ? origin + location : origin + "/" + location;
}
