# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionInterfacePriv.qc Copyright 2024 - 2026 Qore Technologies, s.r.o.

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

#! Private namespace for the TypeScriptActionInterface module
namespace TypeScriptActionInterfacePriv {
#! Internal interface class
class TypeScriptActionInterfacePriv {
    private {
        #! Master pool for registering dynamic apps
        static JavaScriptProgramPool master;

        #! Static storage for JavaScriptProgramPool objects for app / actions, to ensure they do not go out of scope
        static hash<string, JavaScriptProgramPool> pstore = {};

        #! True when static JavaScript action initialization has already run
        static bool initialized;

        #! The module's logger, taken by trusted code: the host's global logger, or the module's own console logger
        /** DataProvider gives sandboxed callers no global logger (qoretechnologies/qore#6746); see getLogger()
        */
        static *LoggerInterface logger;

        #! Default code in each JavaScriptProgram object, after the script's file name and directory
        /** @see getDefaultCode()
        */
        const DefaultCode = "var exports = {};
// Returns a Promise that resolves immediately with the state of 'promise'
function promiseState(promise) {
  const pendingState = { status: 'pending' };
  return Promise.race([promise, pendingState]).then(
    (value) =>
      value === pendingState ? value : { status: 'fulfilled', value },
    (reason) => ({ status: 'rejected', reason }),
  );
}
// calls an async function with a timeout
/* @param promise any value; a function will be called, and then any promise will be called with a timeout
   @param delay a timeout in milliseconds
*/
async function runWithTimeout(promise, delay) {
  if (typeof promise === 'function') {
    promise = promise();
  }
  if (!(promise instanceof Promise)) {
    return promise;
  }

  // inspects the state of the promise and returns immediately
  // without this call, there is an 8-second delay when 'promise' rejects
  await promiseState(promise);

  // timeout variable to cancel the timeout in case the async function is faster
  let timeout;
  // get a promise to a cancelable timeout
  let top = new Promise((_, reject) => (timeout = setTimeout(() => reject(new Error('Request timed out after ' +
    delay + ' ms (the call time limit)')), delay)));
  // run the promise and cancel the timeout
  return Promise.race([
    promise,
    top
  ]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}
// updates an environment variable
function setenv(vr, value) {
  process.env[vr] = value;
}
";
    }

    #! Returns the time limit set in seconds in the given environment variable, or the default
    /** An invalid value is reported on stderr and the default is used, so that the module can still be loaded
    */
    static date getEnvTimeout(string var, date default_limit) {
        *string secs = getenv(var);
        if (!secs.val()) {
            return default_limit;
        }
        if (secs !~ /^[0-9]+$/ || secs.toInt() < 1) {
            stderr.printf("TypeScriptActionInterface: ignoring %s=%y: expecting a positive number of seconds; "
                "using the default (%y)\n", var, secs, default_limit);
            return default_limit;
        }
        return seconds(secs.toInt());
    }

    #! Returns the module's logger
    /** Trusted code gets the process's global logger, which the host may set after the module's initialization, and
        keeps it for sandboxed callers, which DataProvider gives none (qoretechnologies/qore#6746); a sandboxed caller
        gets the logger that trusted code took last.
    */
    static *LoggerInterface getLogger() {
        if (!SandboxManager::isSandboxed()) {
            if (*LoggerInterface global_logger = DataProvider::getGlobalLogger()) {
                logger = global_logger;
                return global_logger;
            }
        }
        return logger;
    }

    static init() {
        if (initialized) {
            return;
        }
        initialized = True;

        # the module's logger is taken here, at the module's initialization: a sandboxed caller gets no global
        # logger from DataProvider and cannot set one (qoretechnologies/qore#6746), so the logger is never looked
        # up for the first time while serving sandboxed code
        bool sandboxed = SandboxManager::isSandboxed();
        *LoggerInterface global_logger = sandboxed ? NOTHING : DataProvider::getGlobalLogger();
        if (global_logger) {
            logger = global_logger;
        } else {
            LoggerLevel ll;
            if (getenv("QORE_TYPESCRIPT_ACTION_VERBOSE")) {
                #ll = LoggerLevel::LevelInfo;
                ll = LoggerLevel::LevelDebug;
            } else {
                ll = LoggerLevel::LevelWarn;
            }
            Logger console("console", ll);
            console.addAppender(new StdoutAppender());
            logger = console;
            # only trusted code sets the process's global logger
            if (!sandboxed) {
                DataProvider::setGlobalLogger(console);
            }
        }

        {
            # make sure that any calls to create data providers do not result in static initialization
            DataProvider::deferStaticInitialization();
            on_exit DataProvider::restoreStaticInitialization();

            string cwd = getcwd();

            # initialize master TypeScript action script first; the process environment is read rather than ENV,
            # which holds the environment of the process when it started, so that a process can decide not to load
            # the app catalogue after it has started (ex: a data provider index worker indexing other providers)
            if ((*string script_path = getenv("QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT")).val()) {
                # app definitions in the catalogue refer to their resources with paths relative to the catalogue
                # directory (ex: "schemas/asana.swagger.json"), so apps registered from the catalogue must resolve
                # such paths relative to that directory and not to the current working directory of this process,
                # which is arbitrary (ex: "qctl update-index" run from any directory)
                TsaiProcessState::Internal.setAppBaseDir(dirname(script_path));
                on_exit TsaiProcessState::Internal.setAppBaseDir();

                *JavaScriptProgramPool master = createPool(script_path, cwd,
                    \TypeScriptActionInterfacePriv::registerApp());
                if (!master) {
                    return;
                }
                TypeScriptActionInterfacePriv::master = master;

                # Register the module's apps pending from the data index for lazy,
                # on-demand loading (see design/lazy-app-loading.md).  If the index is
                # not yet available (e.g. while `qctl update-index` builds it), no apps
                # are registered here and the DPO_DisableOnDemandInitialization path
                # below performs a full load instead.
                string apps_dir = dirname(script_path) + DirSep + "apps";
                if (is_dir(apps_dir)) {
                    # `qctl update-index` turns off on-demand init to enumerate every
                    # provider; in that mode load all apps so they (incl. any new ones)
                    # are indexed and the dir map is (re)written.  Otherwise register
                    # apps pending from the data index; if that yields nothing (no index
                    # or dir map yet) fall back to a full load.
                    if ((DataProvider::getOptions() & DPO_DisableOnDemandInitialization)
                        || !TsaiProcessState::Internal.registerPendingAppsFromIndex(apps_dir)) {
                        TypeScriptActionInterfacePriv::loadAllAppsFromDir(apps_dir);
                    }
                }
            }

            *string scripts = getenv("QORE_TYPESCRIPT_ACTION_SCRIPTS");
            if (scripts.val()) {
                map createPool($1, cwd, \TypeScriptActionInterfacePriv::registerApp()), scripts.split(":");
            }
        }

        if ((*string scripts = getenv("QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS")).val()) {
            # initialize all apps in advance when running tests
            DataProvider::addOptions(DPO_DisableOnDemandInitialization);
            DataProvider::checkStaticInit();

            IgnoreDuplicateAppHelper idah();

            string cwd = getcwd();
            map createPool($1, cwd, \TypeScriptActionInterfacePriv::runTests()), scripts.split(":");
        }

        int opts = DataProvider::getOptions();
        if (opts & DPO_DisableOnDemandInitialization) {
            TsaiProcessState::Internal.initAllApps(opts & DPO_EnableOnDemandActions ? False : True);
        }
    }

    #! Returns the default code for the programs of the given action script
    /** @param path the path of the script, the value of \c __filename
        @param dir the directory of the script, the value of \c __dirname

        @return the code that precedes the script's source in each of its programs

        The values are part of the code, so every program of the pool has its own script's values even when
        programs of other scripts are created at the same time in other threads
    */
    static string getDefaultCode(string path, string dir) {
        return sprintf("const __filename = %s;\nconst __dirname = %s;\n", make_json(path), make_json(dir))
            + DefaultCode;
    }

    #! Returns the master pool, if any
    static *JavaScriptProgramPool getMaster() {
        return master;
    }

    #! Creates a pool and returns the pool if created
    static *JavaScriptProgramPool createPool(string path, string cwd, code init) {
        try {
            string dir = dirname(path);
            if (dir.val()) {
                chdir(dir);
            }
            on_exit if (dir.val()) {
                chdir(cwd);
            }
            JavaScriptProgramPool pool(getDefaultCode(path, dir) + File::readTextFile(basename(path)), path, init);
            pstore{TsaiProcessState::Internal.poolUniqueHash(pool)} = pool;
            TsaiProcessState::Internal.clearDiscoverySourceFailure(path);
            return pool;
        } catch (hash<ExceptionInfo> ex) {
            TsaiProcessState::Internal.reportDiscoverySourceFailure(path, ex);
            TSAI::error("Error loading TypeScript action script %y: %s", path, get_exception_string(ex));
        }
    }

    #! Load a single app's implementation on demand via the master catalogue
    /** The master catalogue (now lightweight — it does not eagerly import all apps)
        loads only the requested app's JS from its directory and registers it.
    */
    static *string loadAppFromPath(string app_path) {
        if (!master) {
            throw "APP-REGISTRATION-ERROR", sprintf("Cannot load pending app from %y: no master "
                "catalogue is loaded", app_path);
        }
        JavaScriptObject global = TsaiProcessState::Internal.poolGetProgram(master).getGlobal();
        # the JS catalogue returns the loaded app's name
        return global.exports.actionsCatalogue.loadAppFromPath(TsaiProcessState::Api, app_path);
    }

    #! Eagerly load and register every curated app under the given directory
    /** Fallback used when the data index / app-dir map is not available (e.g. while
        <tt>qctl update-index</tt> builds the index): the apps cannot be registered pending,
        so load them all so they can be enumerated/indexed.  Each curated app (see
        the catalogue's \c getNewAppDirs()) is loaded through the master catalogue
        (\c require() in the master program, not a separate pool) and registered with
        \c registerApp(); any pending action initialization is completed later by
        @ref TypeScriptActionInterface::TypeScriptActionInterface::initAllApps()
        "initAllApps()" when \c DPO_DisableOnDemandInitialization is set.  As a side
        effect a changed directory <-> app-name map is written next to the app directory
        so that subsequent runtime starts can register apps pending from the index
        without loading them (the app directory name is not derivable from the app
        name).
    */
    static loadAllAppsFromDir(string apps_dir) {
        if (!master) {
            throw "APP-REGISTRATION-ERROR", "Cannot load apps: no master catalogue is loaded";
        }
        # load only the catalogue's curated NEW_APPS directories, not every
        # subdirectory under apps/ (which can include unrelated or work-in-progress
        # apps that are deliberately excluded from the catalogue)
        JavaScriptObject global = TsaiProcessState::Internal.poolGetProgram(master).getGlobal();
        *list<auto> dirs = global.exports.actionsCatalogue.getNewAppDirs();
        hash<string, string> dirmap;
        foreach string dname in (dirs) {
            string app_path = apps_dir + DirSep + dname;
            try {
                *string name = loadAppFromPath(app_path);
                if (name.val()) {
                    dirmap{dname} = name;
                    # restricted programs for tenants load the app from its directory, as for an app registered
                    # from the index (TenantActionRunner, qoretechnologies/qore#6845)
                    TsaiProcessState::app_load_paths{name} = app_path;
                }
            } catch (hash<ExceptionInfo> ex) {
                TSAI::error("Failed to load app from %y: %s: %s", app_path, ex.err, ex.desc);
            }
        }
        if (dirmap) {
            string map_file = dirname(apps_dir) + DirSep + TypeScriptActionInterface::AppDirMapFile;
            try {
                string map_data = make_yaml(dirmap);
                # Packages can ship this generated map in a read-only catalogue directory.
                # Preserve identical maps instead of opening an installed resource for writing.
                if (is_readable(map_file) && File::readTextFile(map_file) == map_data) {
                    return;
                }
                File f();
                f.open2(map_file, O_CREAT | O_WRONLY | O_TRUNC, 0644);
                f.write(map_data);
            } catch (hash<ExceptionInfo> ex) {
                TSAI::error("Failed to write app-dir map %y: %s: %s", map_file, ex.err, ex.desc);
            }
        }
    }

     #! Register a dynamic JavaScript file
    static *list<string> processDynamicJavaScriptAppFile(string base_dir, data fdata, *bool replace) {
        if (!master) {
            throw "APP-REGISTRATION-ERROR", "Cannot register dynamic app, as there is no master app in place";
        }
        on_error rethrow "APP-REGISTRATION-ERROR";

        string uuid = UUID::get();
        string dir = sprintf("%s/%s", base_dir, uuid);
        # make the folder if necessary
        mkdir_ex(dir, 0755, True);
        string path = sprintf("%s/index.js", dir);
        {
            File f();
            f.open2(path, O_CREAT | O_WRONLY | O_TRUNC, 0644);
            f.write(fdata);
        }
        *list<string> rv;
        *string new_dir;
        {
            on_error remove_path(dir);

            DynamicAppContextHelper dach(base_dir, replace);
            JavaScriptObject global = TsaiProcessState::Internal.poolGetProgram(master).getGlobal();
            #global.setenv("CUSTOM_APPS_DIR", base_dir);
            # call the master app's dynamic registration method
            global.exports.actionsCatalogue.registerCustomApp(
                TsaiProcessState::Api, dir
            );
            rv = DynamicAppContextHelper::getApps();
            if (rv.size() > 1) {
                throw "REGISTER-APP-ERROR", sprintf("More than one dynamic app included in file: %y", rv);
            }
            if (rv) {
                # the app's directory is named after the app; getDynamicAppDir() refuses a name that is not a single
                # path component, before the name is used in any filesystem operation
                new_dir = getDynamicAppDir(base_dir, rv[0]);
            }
        }

        if (new_dir) {
            # rename directory
            if (hstat(new_dir)) {
                remove_path(new_dir);
            }
            move_path(dir, new_dir);
        }
        return rv;
    }

    #! Returns the directory of a dynamic app below the given custom apps directory
    /** @throw APP-ERROR the app name is not a single path component (see
        TypeScriptActionInterface::checkDynamicAppName())
    */
    static string getDynamicAppDir(string dir, string name) {
        TypeScriptActionInterface::checkDynamicAppName(name);
        return sprintf("%s/%s", dir, name);
    }

    #! Returns the first available JavaScriptProgramPool from the program store
    static *JavaScriptProgramPool getFirstPool() {
        foreach hash<auto> i in (pstore.pairIterator()) {
            return i.value;
        }
    }

    static private registerApp(JavaScriptProgram pgm) {
        JavaScriptObject global = pgm.getGlobal();
        if (!global.exports.actionsCatalogue) {
            throw "JAVASCRIPT-INIT-ERROR", sprintf("No 'actionsCatalogue' property exists on "
                "'exports'; known properties: %y", global.exports.getPropertyList());
        }
        global.exports.actionsCatalogue.registerAppActions(
            TsaiProcessState::Api
        );
    }

    static private runTests(JavaScriptProgram pgm) {
        auto v = pgm.getGlobal().exports.qtester.run(
            TsaiProcessState::TestApi
        );
        auto rv;
        if (v instanceof JavaScriptPromise) {
            v.then(sub (auto val) {
                rv.result = val;
            }, sub (auto e) {
                rv.error = e;
            });
            v.wait();
        } else {
            rv = v;
        }
    }
}
#! The process-wide state of the module that its own code uses for every caller
/** The class is not public: code that imports the module cannot name it, so sandboxed code can neither read nor
    change the state, which holds the host's configuration and the calls of the apps that trusted code registered
    (qoretechnologies/qore#6749).  The public API of
    @ref TypeScriptActionInterface::TypeScriptActionInterface "TypeScriptActionInterface" that gives the state out
    refuses code that is sandboxed or acts for sandboxed code; the module's own code, which serves sandboxed callers
    too, uses this class.
*/
class TsaiProcessState {
    public {
        #! The interface that the JavaScript app catalogues register their apps with
        /** @see TypeScriptActionInterface::getInterface()
        */
        /** Its calls are the unchecked implementations of the module (see setInternal()): a catalogue's
            registrations are made by trusted code, also when an app is loaded on demand for any caller
        */
        static hash<string, code> Api;

        #! The interface given to the restricted programs of tenants (TenantActionRunner::buildProgram())
        /** Its calls register only while the program is built, in pool clone mode, where they capture the program's
            own functions and change no process-wide state; a call made outside clone mode, by catalogue code that
            kept the interface, is refused (qoretechnologies/qore#7185)
        */
        static hash<string, code> CloneApi;

        #! The unchecked implementations of the module's checked public methods, for the module's own code
        /** Set by the classes that declare them, with call references to their \c private:internal methods, when
            the module is loaded (see setInternal()); the public methods refuse code that is sandboxed or acts for
            sandboxed code (qoretechnologies/qore#6749)
        */
        static hash<string, code> Internal;

        #! The interface that the JavaScript app tests use
        /** @see TypeScriptActionInterface::getTestInterface()
        */
        static hash<string, code> TestApi = {
            "createConnection": \TypeScriptActionInterface::TypeScriptActionInterface::createConnection(),
            "execAppAction": \TypeScriptActionInterface::TypeScriptActionInterface::execAppAction(),
        };

        #! Set if server mode is active
        static JavaScriptThreadProcessPool server;

        #! On-demand server flag
        static bool on_demand;

        #! In-process pool for concurrent access without IPC overhead
        static JavaScriptInProcessPool in_process_server;

        #! In-process on-demand flag
        static bool in_process_on_demand;

        #! Optional pool for on-demand in-process server creation
        static *JavaScriptProgramPool in_process_on_demand_pool;

        #! Optional maximum pool size for on-demand in-process server creation
        static *int in_process_max_size;

        #! Server lock
        static Mutex sm();

        #! Global async call map: call key -> call
        static hash<string, hash<AsyncCallInfo>> acmap = {};

        #! The functions of the calls in @ref acmap as the apps gave them: call key -> function
        /** The calls in @ref acmap and in the providers have guarded functions (see guardCall()); this map tells a
            reused function from a new one
        */
        static hash<string, code> acmap_raw = {};

        #! Maps from app names to connection post-auth functions
        static hash<string, hash<AsyncCallInfo>> app_post_auth_map = {};

        #! Maps from app names to connection post-auth-code functions
        static hash<string, hash<AsyncCallInfo>> app_post_auth_code_map = {};

        #! Maps from app names to connection update info
        static hash<string, hash<auto>> app_conn_update_map = {};

        #! the directory of each app's implementation, recorded when the app is registered from the index;
        #! restricted programs for tenants load an app from it (TenantActionRunner, qoretechnologies/qore#6845)
        static hash<string, string> app_load_paths;

        #! the pool of the catalogue that registered each app (the master catalogue or a script of
        #! QORE_TYPESCRIPT_ACTION_SCRIPTS); restricted programs for tenants load the app from its catalogue
        static hash<string, JavaScriptProgramPool> app_pools;
    }

    #! Adds unchecked implementations to @ref Internal; called by the classes that declare them
    /** @return True, for the static member that the caller initializes with the call
    */
    static bool setInternal(hash<string, code> h) {
        Internal += h;
        if (Internal.registerApp && !Api) {
            Api = {
                "getCatalogueProtocolVersion":
                    \TypeScriptActionInterface::TypeScriptActionInterface::getCatalogueProtocolVersion(),
                "registerDiscoveryInventory": Internal.registerDiscoveryInventory,
                "registerApp": Internal.registerApp,
                "registerExistingApp": Internal.registerExistingApp,
                "registerAction": Internal.registerAction,
            };
            CloneApi = map {$1.key: $1.key == "getCatalogueProtocolVersion"
                ? $1.value
                : TsaiProcessState::cloneOnly($1.key, $1.value)}, Api.pairIterator();
        }
        return True;
    }

    #! The single guard of the host-scoped entry points of the module (qoretechnologies/qore#7185)
    /** Every public method that reads the host's configuration, paths or objects or that changes process-wide state
        (the registries, servers, pools, proxies, caches, time limits, base directories, discovery state, webhook
        APIs, the logger and the initialization of the module) calls it first, before it uses its arguments.  It fails
        closed: code that is sandboxed or acts for sandboxed code is refused, also when its sandbox cannot be
        resolved; the initialization of the module itself is not refused.

        @param what what the caller tried to do, for the exception; it names no host path, app or object

        @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code
    */
    static checkHostScope(string what) {
        SandboxManager::checkProcessWideRegistration(what);
    }

    #! Returns True if the module may change its process-wide state for the current code
    /** For trusted code, and for the module's own registration of the apps of its catalogues, also when an app is
        initialized on demand for a sandboxed caller (see CatalogueRegistrationHelper); code that serves a sandboxed
        caller otherwise keeps what it creates in the caller's own objects
    */
    static bool canChangeProcessState() {
        return CatalogueRegistrationHelper::get() || SandboxManager::isProcessWideRegistrationAllowed();
    }

    #! Returns a call of the interface of tenants' programs that is refused outside pool clone mode
    static code cloneOnly(string name, code c) {
        return auto sub (...) {
            if (!_pool_clone_mode) {
                throw "TS-TENANT-ERROR", sprintf("%s(): the interface of a tenant's program registers only while "
                    "the program is built", name);
            }
            return call_function_args(c, argv);
        };
    }

    #! Returns the type for the calling code: a deep copy for code that is sandboxed or acts for sandboxed code
    /** The types of the process-wide providers are shared by every caller; a sandboxed caller that changes the type
        it gets (ex: \c addField()) changes only its own copy (qoretechnologies/qore#7185)
    */
    static *AbstractDataProviderType typeForCaller(*AbstractDataProviderType t) {
        if (!t || SandboxManager::isProcessWideRegistrationAllowed()) {
            return t;
        }
        hash<string, AbstractDataProviderType> done = {};
        return TsaiProcessState::copyType(t, \done);
    }

    #! Returns the fields for the calling code: deep copies for code that is sandboxed or acts for sandboxed code
    static *hash<string, AbstractDataField> fieldsForCaller(*hash<string, AbstractDataField> fields) {
        if (!fields || SandboxManager::isProcessWideRegistrationAllowed()) {
            return fields;
        }
        hash<string, AbstractDataProviderType> done = {};
        return map {$1.key: TsaiProcessState::copyField($1.value, \done)}, fields.pairIterator();
    }

    #! Returns action options for the calling code: with deep copies of their types for sandboxed code
    static *hash<string, hash<ActionOptionInfo>> optionsForCaller(*hash<string, hash<ActionOptionInfo>> opts) {
        if (!opts || SandboxManager::isProcessWideRegistrationAllowed()) {
            return opts;
        }
        hash<string, AbstractDataProviderType> done = {};
        foreach string k in (keys opts) {
            if (opts{k}.type) {
                opts{k}.type = TsaiProcessState::copyType(opts{k}.type, \done);
            }
        }
        return opts;
    }

    #! Returns message (event) infos for the calling code: with deep copies of their types for sandboxed code
    static hash<DataProviderMessageInfo> messageForCaller(hash<DataProviderMessageInfo> info) {
        if (!info.type || SandboxManager::isProcessWideRegistrationAllowed()) {
            return info;
        }
        hash<string, AbstractDataProviderType> done = {};
        info.type = TsaiProcessState::copyType(info.type, \done);
        return info;
    }

    #! Returns the calls of a provider's copy for a sandboxed caller: without post-processing references
    /** The post-processing of a call is applied by the module's own code where the call is made; the reference is a
        call of the module's internal code (qoretechnologies/qore#7185)
    */
    static *hash<string, hash<AsyncCallInfo>> callsForCaller(*hash<string, hash<AsyncCallInfo>> calls) {
        foreach string k in (keys calls) {
            calls{k}.post_processing = NOTHING;
            calls{k}.pool = NOTHING;
        }
        return calls;
    }

    #! Returns a deep copy of a type: its fields, their types, and the element and other field types
    /** @param t the type to copy
        @param done the copies made so far, by the unique hash of the type copied, so that a type that refers to
        itself is copied once
    */
    static AbstractDataProviderType copyType(AbstractDataProviderType t,
            reference<hash<string, AbstractDataProviderType>> done) {
        string uh = t.uniqueHash();
        if (*AbstractDataProviderType rv = done{uh}) {
            return rv;
        }
        AbstractDataProviderType rv = t.copy();
        done{uh} = rv;
        if (rv instanceof HashDataType) {
            HashDataType ht = cast<HashDataType>(rv);
            if (*hash<string, AbstractDataField> fields = ht.getFields()) {
                ht.setFields(map {$1.key: TsaiProcessState::copyField($1.value, \done)}, fields.pairIterator());
            }
            if (*AbstractDataProviderType ot = ht.getDefaultOtherFieldType()) {
                ht.setDefaultOtherFieldType(TsaiProcessState::copyType(ot, \done));
            }
        } else if (rv instanceof ListDataType) {
            ListDataType lt = cast<ListDataType>(rv);
            if (*AbstractDataProviderType et = lt.getElementType()) {
                lt.updateElementType(TsaiProcessState::copyType(et, \done), True);
            }
        }
        return rv;
    }

    #! Returns a copy of a field with a deep copy of its type
    /** The declared type of a TypeScript field is copied: its dynamic type is resolved when the copy's type is read,
        with the call context of the caller
    */
    static AbstractDataField copyField(AbstractDataField f, reference<hash<string, AbstractDataProviderType>> done) {
        AbstractDataField rv = f.copy();
        if (rv instanceof QoreDataField) {
            AbstractDataProviderType ft = (rv instanceof TypeScriptDataField)
                ? cast<TypeScriptDataField>(rv).getDeclaredType()
                : rv.getType();
            cast<QoreDataField>(rv).updateFieldType(TsaiProcessState::copyType(ft, \done));
        }
        return rv;
    }

    #! Starts the process server if it has not been started and it starts on demand
    static bool checkServer() {
        if (server) {
            return True;
        }
        if (!on_demand) {
            return False;
        }

        # lock and check everything again in case of contention
        sm.lock();
        on_exit sm.unlock();
        if (server) {
            return True;
        }
        if (on_demand) {
            TsaiProcessState::startServerIntern();
            return True;
        }

        return False;
    }

    #! Starts the process server; must be called with the server lock held
    static startServerIntern() {
        server = new JavaScriptThreadProcessPool();
        # the handlers are the module's own, so that they also run when no trusted code is on the stack
        set_signal_handler(SIGTERM, \TsaiProcessState::shutdownServer());
        set_signal_handler(SIGINT, \TsaiProcessState::shutdownServer());
        set_signal_handler(SIGHUP, \TsaiProcessState::shutdownServer());
        set_signal_handler(SIGUSR2, \TsaiProcessState::shutdownServer());

        DataProvider::registerShutdownHandler(server.uniqueHash(), \TsaiProcessState::shutdownServer());
    }

    #! Shuts the process server down if it's running
    static shutdownServer(*int signal) {
        sm.lock();
        on_exit sm.unlock();

        *JavaScriptThreadProcessPool srv = remove server;
        if (!srv) {
            return;
        }

        DataProvider::deregisterShutdownHandler(srv.uniqueHash());
        delete srv;
    }

    #! Returns the in-process pool if active, starting it on demand if configured
    /** Uses double-checked locking: first checks without the mutex for the fast path,
        then acquires the mutex and checks again to avoid races during lazy creation.
    */
    static *JavaScriptInProcessPool checkInProcessServer() {
        if (in_process_server) {
            return in_process_server;
        }
        if (!in_process_on_demand) {
            return;
        }

        # lock and check everything again in case of contention
        sm.lock();
        on_exit sm.unlock();
        if (in_process_server) {
            return in_process_server;
        }
        if (in_process_on_demand) {
            TsaiProcessState::startInProcessServerIntern();
            return in_process_server;
        }
    }

    #! Starts the in-process server using registered program pools; must be called with the server lock held
    static startInProcessServerIntern() {
        # use the on-demand pool if set, otherwise find the first registered pool
        *JavaScriptProgramPool pool = in_process_on_demand_pool ?? TypeScriptActionInterfacePriv::getFirstPool();
        if (!pool) {
            throw "IN-PROCESS-SERVER-ERROR", "Cannot start in-process server: no JavaScriptProgramPool available";
        }

        in_process_server = new JavaScriptInProcessPool(pool, in_process_max_size);
        DataProvider::registerShutdownHandler(in_process_server.uniqueHash(),
            \TsaiProcessState::shutdownInProcessServer());
    }

    #! Shuts the in-process server down if it's running
    /** Calls shutdown() on the pool (which wakes waiting threads and sets the shutdown flag)
        rather than deleting the pool immediately, since concurrent threads may still be
        executing against the pool.
    */
    static shutdownInProcessServer(*int signal) {
        sm.lock();
        on_exit sm.unlock();

        *JavaScriptInProcessPool ip = remove in_process_server;
        if (!ip) {
            return;
        }

        DataProvider::deregisterShutdownHandler(ip.uniqueHash());
        ip.shutdown();
    }

    #! Returns the connection post-auth function of an app, if any
    static *hash<AsyncCallInfo> getPostAuthCall(string app) {
        return app_post_auth_map{app.lwr()};
    }

    #! Returns the connection post-auth-code function of an app, if any
    static *hash<AsyncCallInfo> getPostAuthCodeCall(string app) {
        return app_post_auth_code_map{app.lwr()};
    }

    #! Returns the connection update options of an app, if any
    static *hash<auto> getConnectionUpdateOptions(string app) {
        return app_conn_update_map{app.lwr()};
    }

    #! Returns the names of the apps that a catalogue registered, or that are registered from the index
    static list<string> getCatalogueAppNames() {
        return sort(keys (app_pools + app_load_paths)) ?? ();
    }

    #! Registers a call in the call map; the module's own code uses it as it registers apps and actions
    static string registerAsyncCall(*bool ignore_dup, reference<hash<AsyncCallInfo>> call, ...) {
        return TsaiProcessState::registerAsyncCallArgs(ignore_dup, \call, argv);
    }

    #! Registers a call in the call map; the module's own code uses it as it registers apps and actions
    static string registerAsyncCall(reference<hash<AsyncCallInfo>> call, ...) {
        return TsaiProcessState::registerAsyncCallArgs(False, \call, argv);
    }

    #! Registers a call in the call map; the module's own code uses it as it registers apps and actions
    /** @param ignore_dup if True, an \c ASYNC-CALL-ERROR raised while registering the call is ignored
        @param call the call; its \c key is set to the key of the call
        @param args the elements of the key of the call

        @return the key of the call
    */
    static string registerAsyncCallArgs(*bool ignore_dup, reference<hash<AsyncCallInfo>> call, list<auto> args) {
        string key;
        try {
            key = (foldl $1 + "-" + $2, args) + sprintf("-%s", call.type);
            # in pool clone mode, capture closures without modifying global state
            if (_pool_clone_mode) {
                call.key = key;
                _pool_clone_closures{key} = call.async_call;
                return key;
            }
            # code that serves a sandboxed caller, outside the module's registration of its catalogues' apps (as for
            # a dynamic option or type that a tenant's call returned, or a type that a tenant builds with its own
            # copy of a provider), keeps the call in the caller's own provider: the process-wide call map is changed
            # only by trusted code (qoretechnologies/qore#7185)
            if (!TsaiProcessState::canChangeProcessState()) {
                call.key = key;
                call.async_call = TsaiProcessState::guardCall(call.async_call);
                return key;
            }
            if (acmap{key} && ((acmap{key} - ("key", "async_call")) == (call - ("key", "async_call")))
                && (acmap_raw{key} == call.async_call || acmap{key}.async_call == call.async_call)) {
                # function is being reused
                call.key = key;
                call.async_call = acmap{key}.async_call;
                return key;
            }
            # function is being replaced
            call.key = key;
            acmap_raw{key} = call.async_call;
            call.async_call = TsaiProcessState::guardCall(call.async_call);
            acmap{key} = call;
        } catch (hash<ExceptionInfo> ex) {
            if (!ignore_dup || (ex.err != "ASYNC-CALL-ERROR")) {
                rethrow;
            }
        }
        return key;
    }

    #! Returns the function of an app's call as the module keeps it: it refuses code that is sandboxed
    /** The function of a call runs the app's code in the process-wide program of its catalogue; the module makes the
        calls of sandboxed code in the tenant's own program (TenantActionRunner), never with this function, so a
        function that sandboxed code gets hold of, from a call hash of a provider for example, cannot run the app's code
        for it (qoretechnologies/qore#6749)
    */
    static code guardCall(code c) {
        return auto sub (...) {
            TenantActionRunner::refuseSandboxed("the function of an app's call");
            return call_function_args(c, argv);
        };
    }

    #! Returns a registered call; the module's own code uses it to make the call, also for sandboxed callers
    /** @throw ASYNC-CALL-ERROR no call with the given key is registered
    */
    static hash<AsyncCallInfo> getCall(string key) {
        *hash<AsyncCallInfo> rv = acmap{key};
        if (!rv) {
            # the keys of the call map are shown only to trusted code (qoretechnologies/qore#6749)
            if (!SandboxManager::isProcessWideRegistrationAllowed()) {
                throw "ASYNC-CALL-ERROR", sprintf("Unknown call %y", key);
            }
            throw "ASYNC-CALL-ERROR", sprintf("Unknown call %y; known calls: %y", key, keys acmap);
        }
        return rv;
    }
}
}

namespace Priv {
thread_local *bool _app_ignore_dup;
class IgnoreDuplicateAppHelper {
    private {
        *bool b;
    }

    constructor() {
        b = _app_ignore_dup;
    }

    destructor() {
        _app_ignore_dup = b;
    }

    static *bool get() {
        return _app_ignore_dup;
    }
}
thread_local *bool _app_completing_pending;
#! Set while loading the implementation of an app that was registered pending from the index
/** When set, registerApp() completes the existing pending entry (fills in the app's
    closures/pool) instead of throwing "already registered" or re-registering the
    pending connection scheme + catalogue entry, which already point at the correct
    initApp() closure.  See design/lazy-app-loading.md.
*/
class CompletingPendingAppHelper {
    private {
        *bool b;
    }

    constructor() {
        b = _app_completing_pending;
        _app_completing_pending = True;
    }

    destructor() {
        _app_completing_pending = b;
    }

    static *bool get() {
        return _app_completing_pending;
    }
}
thread_local *hash<auto> _app_ctx;
class DynamicAppContextHelper {
    private {
        *hash<auto> old;
    }

    constructor(string path, *bool replace) {
        old = _app_ctx;
        _app_ctx.info = {
            "info": {
                "path": path,
            },
            "dynamic": True,
        };
        if (replace) {
            _app_ctx.replace = True;
        }
    }

    destructor() {
        _app_ctx = old;
    }

    static *hash<auto> get(string name) {
        if (*hash<auto> rv = _app_ctx.info) {
            # returns the "path" value to be stored against the app in dynamic registration, must be equal to
            # the one calculated after app registration
            rv.info.path = TypeScriptActionInterfacePriv::getDynamicAppDir(rv.info.path, name);
            return rv;
        }
    }

    static *list<string> getApps() {
        return keys _app_ctx.apps;
    }

    static addApp(string name) {
        _app_ctx.apps{name} = True;
    }

    static *bool replacing() {
        return _app_ctx.replace;
    }
}

#! Thread-local flag for pool clone mode
thread_local *bool _pool_clone_mode;

#! Thread-local flag: the module registers the apps of its catalogues (see CatalogueRegistrationHelper)
thread_local *bool _tsai_catalogue_registration;

#! Marks the module's registration of the apps of its catalogues in the current thread
/** An app is initialized on demand for the first caller that uses it, also for a sandboxed caller; its registration
    is made by the module's own code with the catalogue's code, and changes the process-wide registries for every
    caller (TsaiProcessState::canChangeProcessState()).  The class is not public: code that imports the module cannot
    create it (qoretechnologies/qore#7185).
*/
class CatalogueRegistrationHelper {
    private {
        *bool old;
    }

    constructor() {
        old = _tsai_catalogue_registration;
        _tsai_catalogue_registration = True;
    }

    destructor() {
        _tsai_catalogue_registration = old;
    }

    static *bool get() {
        return _tsai_catalogue_registration;
    }
}
#! Thread-local storage for closures captured during pool clone mode
thread_local *hash<string, code> _pool_clone_closures;

#! Helper class for managing pool clone mode
/** When active, registerAsyncCall() and registerAsyncCallArgs() will capture closures to the thread-local
    _pool_clone_closures hash instead of modifying global state (acmap).
*/
class PoolCloneModeHelper {
    private {
        *bool old;
    }

    constructor() {
        old = _pool_clone_mode;
        _pool_clone_mode = True;
        _pool_clone_closures = {};
    }

    destructor() {
        _pool_clone_mode = old;
        remove _pool_clone_closures;
    }

    #! Returns the closures captured during clone mode
    static *hash<string, code> getClosures() {
        return _pool_clone_closures;
    }
}
}
