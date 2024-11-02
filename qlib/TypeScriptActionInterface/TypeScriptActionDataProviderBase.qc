# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionDataProviderBase.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
#! Data provider data context info
public hashdecl DataContextInfo {
    #! Connection name
    *string conn_name;

    #! Connection option info
    *hash<auto> conn_opts;

    #! Action options with known values
    *hash<auto> opts;

    #! User-defined information
    *hash<auto> info;
}

public class TypeScriptActionDataProviderBase inherits AbstractDataProvider {
    private {
        #! The name of the data provider
        string name;

        #! The connection for the action
        AbstractConnection conn;
    }

    #! Creates the object from the arguments
    constructor(string name) {
        self.name = name;
    }

    #! Sets the connection
    setConnection(AbstractConnection conn) {
        self.conn = conn;
    }

    #! Returns the logger interface for logging
    *LoggerInterface getLogger() {
        return logger;
    }

    #! Returns the data provider name
    string getName() {
        return name;
    }

    auto getAsyncValue(hash<AsyncCallInfo> api, ...) {
        return getAsyncValueArgs(self, api, argv);
    }

    static auto getAsyncValueArgs(LoggerInterface logger, hash<AsyncCallInfo> api, *softlist<auto> args) {
        on_error rethrow $1.err, sprintf("%s (context: %s)", $1.desc, api.label);

        JavaScriptProgram pgm = api.pool.get();
        on_exit {
            api.pool.release(pgm);
            #logger.info("TypeScriptActionApiDataProvider::getAsyncValue() released pgm %y", pgm.uniqueHash());
        }
        #logger.info("TypeScriptActionApiDataProvider::getAsyncValue() acquired pgm %y", pgm.uniqueHash());

        auto v;
        try {
            v = call_function_args(api.async_call, args);
        } catch (hash<ExceptionInfo> ex) {
            logger.error("JAVASCRIPT-ASYNC-ERROR", "Error making async JavaScript request %y: %s", api.label,
                get_exception_string(ex));
            rethrow;
        }
        auto rv;
        auto err;
        string errloc;
        if (v instanceof JavaScriptPromise) {
            try {
                v = v.then(sub (auto val) {
                    rv = val;
                }, sub (auto e) {
                    errloc = sprintf("reject");
                    err = e;
                }).doCatch(sub (auto e) {
                    errloc = "catch";
                    err = e;
                });
                v.wait();
            } catch (hash<ExceptionInfo> ex) {
                logger.error("JAVASCRIPT-ASYNC-ERROR", "Error waiting for async JavaScript request %y: %s", api.label,
                    get_exception_string(ex));
                rethrow;
            }
        } else {
            rv = v;
        }

        string errstr;
        if (rv instanceof JavaScriptObject) {
            rv = rv.toData();
        } else if (rv.typeCode() == NT_LIST && (rv[0] instanceof JavaScriptObject)) {
            rv = map $1.toData(), rv;
        } else if (err instanceof JavaScriptObject) {
            errstr = err.toString();
            err = err.toData();
        } else if (err.typeCode() == NT_LIST && (err[0] instanceof JavaScriptObject)) {
            err = map $1.toData(), err;
        }

        if (exists err) {
            # strip non-serializable data from err
            err = TypeScriptActionEventDataProviderBase::stripNonSerializableData(err);

            if (err._err{"message", "name", "code"}.size() == 3) {
                string desc = sprintf("Error in async request: %s: %s: ", err._err.name, err._err."code");
                if (err._err.response{"status", "statusText"}.size() == 2) {
                    desc += sprintf("%s %s: ", err._err.response.status, err._err.response.statusText);
                }
                if (err._err.response."data".error_summary.val()) {
                    desc += sprintf("%y: ", err._err.response."data".error_summary);
                }
                desc += err._err.message;
                hash<auto> arg;
                if (err._err{"config", "response"}.size() == 2) {
                    arg = err._err{"config", "response"};
                } else {
                    arg = err;
                }
                throw "JAVASCRIPT-ASYNC-ERROR", desc, arg;
            }
            if (!err && !errstr) {
                err = sprintf("No JvaScript exception information available: %y (from: %s)", err, errloc);
            }
            string desc = "Error in async request";
            if (!err && errstr.val()) {
                desc += ": " + errstr;
            }
            throw "JAVASCRIPT-ASYNC-ERROR", desc, err;
        }

        return rv;
    }

    static auto stripNonSerializableData(auto v) {
        switch (v.typeCode()) {
            case NT_HASH:
                v = map {$1.key: TypeScriptActionEventDataProviderBase::stripNonSerializableData($1.value)},
                    v.pairIterator();
                break;

            case NT_LIST:
                v = map TypeScriptActionEventDataProviderBase::stripNonSerializableData($1), v;
                break;

            case NT_STRING:
            case NT_INT:
            case NT_BOOLEAN:
            case NT_FLOAT:
            case NT_NUMBER:
            case NT_DATE:
            case NT_BINARY:
            case NT_NOTHING:
            case NT_NULL:
                break;

            case NT_OBJECT:
                if (v instanceof JavaScriptObject) {
                    return v.toData();
                }
                # fall down to next case

            default:
                remove v;
                break;
        }
        return v;
    }

    #! Returns call context info
    private *hash<DataContextInfo> getCallContextInfo(*hash<auto> action_opts) {
        if (conn) {
            return <DataContextInfo>{
                "conn_name": conn.name,
                "conn_opts": conn.getRealOptions(),
                "opts": action_opts,
            };
        }
    }
}
}
