# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionInterfacePriv.qc Copyright 2024 Qore Technologies, s.r.o.

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
        #! Static storage for JavaScriptProgramPool objects for app / actions, to ensure they do not go out of scope
        static hash<string, JavaScriptProgramPool> pstore;

        #! Default code in each JavaScriptProgram object
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
  let top = new Promise((_, reject) => (timeout = setTimeout(() => reject(new Error('Request timed out')), delay)));
  // run the promise and cancel the timeout
  return Promise.race([
    promise,
    top
  ]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}\n";
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

        *string scripts = ENV.QORE_TYPESCRIPT_ACTION_SCRIPTS;
        if (scripts.val()) {
            # make sure that any calls to create data providers do not result in static initialization
            DataProvider::deferStaticInitialization();
            on_exit DataProvider::restoreStaticInitialization();

            string cwd = getcwd();
            foreach string path in (scripts.split(":")) {
                try {
                    string dir = dirname(path);
                    if (dir.val()) {
                        chdir(dir);
                    }
                    on_exit if (dir.val()) {
                        chdir(cwd);
                    }
                    JavaScriptProgramPool pool(DefaultCode + File::readTextFile(basename(path)), path,
                        sub (JavaScriptProgram pgm) {
                            pgm.getGlobal().exports.actionsCatalogue.registerAppActions(
                                TypeScriptActionInterface::Api
                            );
                        },
                    );
                    pstore{pool.uniqueHash()} = pool;
                } catch (hash<ExceptionInfo> ex) {
                    TSAI::error("Error loading TypeScript action script %y: %s", path, get_exception_string(ex));
                }
            }
        }

        scripts = ENV.QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS;
        if (scripts.val()) {
            # initialize all apps in advance when running tests
            DataProvider::addOptions(DPO_DisableOnDemandInitialization);
            DataProvider::checkStaticInit();

            IgnoreDuplicateAppHelper idah();

            string cwd = getcwd();
            foreach string path in (scripts.split(":")) {
                try {
                    string dir = dirname(path);
                    if (dir.val()) {
                        chdir(dir);
                    }
                    on_exit if (dir.val()) {
                        chdir(cwd);
                    }
                    JavaScriptProgramPool pool(DefaultCode + File::readTextFile(basename(path)), path,
                        sub (JavaScriptProgram pgm) {
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
                        },
                    );
                    pstore{pool.uniqueHash()} = pool;
                } catch (hash<ExceptionInfo> ex) {
                    TSAI::error("Error loading TypeScript action test script %y: %s", path,
                        get_exception_string(ex));
                }
            }
        }
    }

    static *list<string> processJavaScriptAppFile(string path, *bool replace) {
        on_error rethrow "APP-REGISTRATION-ERROR", sprintf("%s: %s (source: %y)", $1.err, $1.desc, path);
        DynamicAppContextHelper dach(path, replace);
        JavaScriptProgramPool pool(DefaultCode + File::readTextFile(path), path,
            sub (JavaScriptProgram pgm) {
                pgm.getGlobal().exports.actionsCatalogue.registerAppActions(
                    TypeScriptActionInterface::Api
                );
            },
        );
        pstore{pool.uniqueHash()} = pool;
        return DynamicAppContextHelper::getApps();
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
            "replace": replace,
            "dynamic": True,
        };
    }

    destructor() {
        _app_ctx = old;
    }

    static *hash<auto> get() {
        return _app_ctx.info;
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
}