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
                    JavaScriptProgramPool pool("var exports = {};\n" + File::readTextFile(basename(path)), path,
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
                    JavaScriptProgramPool pool("var exports = {};\n" + File::readTextFile(basename(path)), path,
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
}
}