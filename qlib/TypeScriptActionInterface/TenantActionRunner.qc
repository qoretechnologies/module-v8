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
    \c app and \c builtin) and \c TS-TENANT-ACTION-ERROR (an error of the action); their args are plain data and never
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

        #! the host's egress hook and meter; set once by trusted code
        static *code egress_policy;
        static *code egress_meter;

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
        # the app directories of the catalogue's distribution, read once, as trusted code
        if ((*string script = getenv("QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT")).val()) {
            TenantActionRunner::readAppDirs(script);
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

    #! Sets the limits of the tenants' calls
    /** @throw TS-TENANT-ERROR the calling code is sandboxed
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
        hash<auto> info = TenantActionRunner::getAction(app, action);
        AutoLock al(lock);
        if (*string builtin = unsupported{app}) {
            return info + {"tenant_available": False, "tenant_unsupported_builtin": builtin};
        }
        return info + {"tenant_available": True};
    }

    #! Runs an API action for a tenant and returns its response as plain data
    /** @param ctx the context of the call
        @param app the app
        @param action the action
        @param request the request of the action
        @param request_options the request options

        @return the response, as plain data; a hash response can have the key \c connection_update with token fields
        that the action refreshed, which the caller applies to its connection itself

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
        string key = sprintf("app-%s-%s-api_function", info.app, info.action);
        return TenantActionRunner::run(ctx, info.app, key, (request, request_options,
            TenantActionRunner::getDataContext(ctx)));
    }

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
        if (!info || (!catalogue_script && !TenantActionRunner::getAppDir(info.app))) {
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
    private:internal static auto run(hash<TsTenantContext> ctx, string app, string key, list<auto> args) {
        # the calling code's sandbox, which governs the requests that the program makes for it
        V8::SandboxCapture capture();
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

        *code call = pgm.call_map{key};
        if (!call) {
            throw ErrorContext, sprintf("app %y has no such action function (%y)", app, key);
        }
        hash<AsyncCallInfo> api = TypeScriptActionInterface::getCall(key);
        api.async_call = call;
        api.label = sprintf("tenant call: %s", key);
        # the time limit in milliseconds: the caller's, else the action's, capped by the maximum
        int to_ms = ctx.timeout ?? (api.to ? api.to.durationMilliseconds() : lim.max_timeout);
        if (to_ms > lim.max_timeout) {
            to_ms = lim.max_timeout;
        }
        api.to = milliseconds(to_ms);

        # the state of the call that the bridge uses on this thread
        _tenant_call = {
            "tenant": ctx.tenant,
            "connection": ctx.connection,
            "capture": capture,
        };
        on_exit remove _tenant_call;
        hash<auto> rv = call_function(exec_call, pgm.pgm, api, args, to_ms, lim.heap_limit);
        if (rv.terminated) {
            discard = True;
            if (rv.over_heap) {
                throw ErrorLimit, "the call exceeded the tenant's memory limit", {"limit": "memory",
                    "max": lim.heap_limit};
            }
            throw ErrorTimeout, sprintf("the call exceeded its time limit of %dms", to_ms), {"timeout_ms": to_ms};
        }
        if (rv.error) {
            TenantActionRunner::rethrowMapped(app, rv.error);
        }
        return rv.result;
    }

    #! Runs a call in a tenant's program, with the time limit and the heap cap; runs as trusted code (see init())
    /** The watchdog thread is started here, so that it inherits no sandbox of the caller; the result is plain data
    */
    private:internal static hash<auto> execCall(V8::JavaScriptProgram js, hash<AsyncCallInfo> api, list<auto> args,
            int to_ms, int heap_limit) {
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
            auto rv = TypeScriptActionDataProviderBase::execAsyncValueDirect(NOTHING, api, args);
            return {"result": TenantActionRunner::plainData(rv)};
        } catch (hash<ExceptionInfo> ex) {
            if (js.isTerminated()) {
                return {"terminated": True, "over_heap": js.isOverHeap()};
            }
            return {"error": ex};
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
    static private:internal auto plainData(auto v) {
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

    #! Builds and seals a restricted program for an app; runs as trusted code (see init())
    private:internal static hash<auto> buildProgram(string app) {
        *string script = catalogue_script ?? getenv("QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT");
        if (!script.val()) {
            throw ErrorContext, "no TypeScript catalogue is configured";
        }
        *string load_path = TenantActionRunner::getAppDir(app);
        string dir = dirname(script);
        string source = TypeScriptActionInterfacePriv::getDefaultCode(script, dir)
            + ReadOnlyFile::readTextFile(script);
        V8::JavaScriptProgram pgm(source, script, {
            "restricted": True,
            # the catalogue's directory: its distribution and its node_modules
            "roots": catalogue_roots ?? (dirname(dir),),
            "bridge": \TenantActionRunner::bridge(),
        });
        *JavaScriptProgramPool pool = catalogue_pool ?? TypeScriptActionInterfacePriv::getMaster();
        if (!pool) {
            throw ErrorContext, "no TypeScript catalogue is loaded";
        }
        # the apps that the program registers are mapped to the pool that registered the catalogue
        pool.mapProgram(pgm);
        string id = pgm.uniqueHash();
        on_error JavaScriptProgramPool::unmapProgram(id);
        hash<string, code> calls;
        {
            # the app's action functions are captured in the program's own map; no global state is changed
            PoolCloneModeHelper clone_helper();
            JavaScriptObject catalogue = pgm.getGlobal().exports.actionsCatalogue;
            if (load_path && catalogue.getPropertyList().contains("loadAppFromPath")) {
                catalogue.loadAppFromPath(TypeScriptActionInterface::Api, load_path);
            } else if (catalogue.getPropertyList().contains("registerAppActions")) {
                catalogue.registerAppActions(TypeScriptActionInterface::Api);
            } else {
                throw ErrorContext, sprintf("the catalogue cannot load app %y", app);
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
            try {
                resp = hc.send(body, method, ui.path ?? "/", headers, False, \info);
            } catch (hash<ExceptionInfo> ex) {
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
