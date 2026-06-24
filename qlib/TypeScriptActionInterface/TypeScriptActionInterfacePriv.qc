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
        static hash<string, JavaScriptProgramPool> pstore;

        #! True when static JavaScript action initialization has already run
        static bool initialized;

        #! Default code in each JavaScriptProgram object
        const DefaultCode = "const __filename = process.env._qore_v8_filename;
const __dirname = process.env._qore_v8_dirname;
var exports = {};
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
  let top = new Promise((_, reject) => (timeout = setTimeout(() => reject(new Error('Request timed out')), delay)));
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

    static init() {
        if (initialized) {
            return;
        }
        initialized = True;

        if (!DataProvider::getGlobalLogger()) {
            LoggerLevel ll;
            if (ENV.QORE_TYPESCRIPT_ACTION_VERBOSE) {
                #ll = LoggerLevel::LevelInfo;
                ll = LoggerLevel::LevelDebug;
            } else {
                ll = LoggerLevel::LevelWarn;
            }
            Logger logger("console", ll);
            logger.addAppender(new StdoutAppender());
            DataProvider::setGlobalLogger(logger);
        }

        {
            # make sure that any calls to create data providers do not result in static initialization
            DataProvider::deferStaticInitialization();
            on_exit DataProvider::restoreStaticInitialization();

            string cwd = getcwd();

            # initialize master TypeScript action script first
            if ((*string script_path = ENV.QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT).val()
                && (*JavaScriptProgramPool master = createPool(script_path, cwd,
                    \TypeScriptActionInterfacePriv::registerApp()))) {
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
                        || !TypeScriptActionInterface::registerPendingAppsFromIndex(apps_dir)) {
                        TypeScriptActionInterfacePriv::loadAllAppsFromDir(apps_dir);
                    }
                }
            }

            *string scripts = ENV.QORE_TYPESCRIPT_ACTION_SCRIPTS;
            if (scripts.val()) {
                map createPool($1, cwd, \TypeScriptActionInterfacePriv::registerApp()), scripts.split(":");
            }
        }

        if ((*string scripts = ENV.QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS).val()) {
            # initialize all apps in advance when running tests
            DataProvider::addOptions(DPO_DisableOnDemandInitialization);
            DataProvider::checkStaticInit();

            IgnoreDuplicateAppHelper idah();

            string cwd = getcwd();
            map createPool($1, cwd, \TypeScriptActionInterfacePriv::runTests()), scripts.split(":");
        }

        int opts = DataProvider::getOptions();
        if (opts & DPO_DisableOnDemandInitialization) {
            TypeScriptActionInterface::initAllApps(opts & DPO_EnableOnDemandActions ? False : True);
        }
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
            setenv("_qore_v8_filename", path);
            setenv("_qore_v8_dirname", dir);
            JavaScriptProgramPool pool(DefaultCode + File::readTextFile(basename(path)), path, init);
            pstore{pool.uniqueHash()} = pool;
            return pool;
        } catch (hash<ExceptionInfo> ex) {
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
        JavaScriptObject global = master.getProgram().getGlobal();
        # the JS catalogue returns the loaded app's name
        return global.exports.actionsCatalogue.loadAppFromPath(TypeScriptActionInterface::Api, app_path);
    }

    #! Eagerly load and register every curated app under the given directory
    /** Fallback used when the data index / app-dir map is not available (e.g. while
        `qctl update-index` builds the index): the apps cannot be registered pending,
        so load them all so they can be enumerated/indexed.  Each curated app (see
        the catalogue's \c getNewAppDirs()) is loaded through the master catalogue
        (\c require() in the master program, not a separate pool) and registered with
        \c registerApp(); any pending action initialization is completed later by
        @ref TypeScriptActionInterface::TypeScriptActionInterface::initAllApps()
        "initAllApps()" when \c DPO_DisableOnDemandInitialization is set.  As a side
        effect the directory <-> app-name map is (re)written next to the app directory
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
        JavaScriptObject global = master.getProgram().getGlobal();
        *list<auto> dirs = global.exports.actionsCatalogue.getNewAppDirs();
        hash<string, string> dirmap;
        foreach string dname in (dirs) {
            string app_path = apps_dir + DirSep + dname;
            try {
                *string name = loadAppFromPath(app_path);
                if (name.val()) {
                    dirmap{dname} = name;
                }
            } catch (hash<ExceptionInfo> ex) {
                TSAI::error("Failed to load app from %y: %s: %s", app_path, ex.err, ex.desc);
            }
        }
        if (dirmap) {
            string map_file = dirname(apps_dir) + DirSep + TypeScriptActionInterface::AppDirMapFile;
            try {
                File f();
                f.open2(map_file, O_CREAT | O_WRONLY | O_TRUNC, 0644);
                f.write(make_yaml(dirmap));
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
        {
            on_error remove_path(dir);

            DynamicAppContextHelper dach(base_dir, replace);
            JavaScriptObject global = master.getProgram().getGlobal();
            #global.setenv("CUSTOM_APPS_DIR", base_dir);
            # call the master app's dynamic registration method
            global.exports.actionsCatalogue.registerCustomApp(
                TypeScriptActionInterface::Api, dir
            );
            rv = DynamicAppContextHelper::getApps();
            if (rv.size() > 1) {
                throw "REGISTER-APP-ERROR", sprintf("More than one dynamic app included in file: %y", rv);
            }
        }

        if (rv) {
            # rename directory
            string new_dir = getDynamicAppDir(base_dir, rv[0]);
            if (hstat(new_dir)) {
                remove_path(new_dir);
            }
            move_path(dir, new_dir);
        }
        return rv;
    }

    static string getDynamicAppDir(string dir, string name) {
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
            TypeScriptActionInterface::Api
        );
    }

    static private runTests(JavaScriptProgram pgm) {
        auto v = pgm.getGlobal().exports.qtester.run(
            TypeScriptActionInterface::TestApi
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
