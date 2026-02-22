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
