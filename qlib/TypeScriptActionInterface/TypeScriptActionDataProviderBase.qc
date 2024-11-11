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

        #! Options with functions for reference data
        *hash<string, hash<AsyncCallInfo>> omap;

        #! Options with REST configuration for retrieving reference data
        *hash<string, hash<RestGetAllowedValuesInfo>> romap;

        #! Any REST client to use for reference data, for example
        RestClient rest;
    }

    #! Creates the object from the arguments
    constructor(string name, *hash<string, hash<AsyncCallInfo>> omap,
            *hash<string, hash<RestGetAllowedValuesInfo>> romap) {
        self.name = name;
        self.omap = omap;
        self.romap = romap;
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

    #! Returns information on supported reference data
    /** @return a hash of supported reference data; keys in the hash returned are supported in calls to
        @ref getReferenceData()
    */
    *hash<string, bool> getSupportedReferenceData() {
        return map {$1: True}, keys (omap + romap);
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
                    errloc = sprintf("rejected");
                    err = e;
                }).doCatch(sub (auto e) {
                    errloc = "exception caught";
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
        *string stack;
        if (rv instanceof JavaScriptObject) {
            rv = rv.toData();
        } else if (rv.typeCode() == NT_LIST && (rv[0] instanceof JavaScriptObject)) {
            rv = map $1.toData(), rv;
        } else if (err instanceof JavaScriptObject) {
            errstr = err.toString();
            if (exists (stack = err.stack)) {
                stack =~ s/\n+/\n/g;
            }
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
                if (exists stack) {
                    desc += sprintf(" detail: %s", stack);
                }
                hash<auto> arg;
                if (err._err{"config", "response"}.size() == 2) {
                    arg = err._err{"config", "response"};
                } else {
                    arg = err;
                }
                throw "JAVASCRIPT-ASYNC-ERROR", desc, arg;
            }
            if (err.response{"status", "statusText", "headers", "data"}.size() == 4) {
                string desc;
                if (errstr.val()) {
                    desc = sprintf("Error in async request: %s: %y", errstr, err.response."data");
                } else {
                    desc = sprintf("Error in async request: %d %s: %y", err.response.status, err.response.statusText,
                        err.response."data");
                }
                if (exists stack) {
                    desc += sprintf(" detail: %s", stack);
                }
                throw "JAVASCRIPT-ASYNC-ERROR", desc, err;
            }
            if (!err && !errstr) {
                err = sprintf("No JvaScript exception information available: %y (from: %s)", err, errloc);
            }
            string desc = "Error in async request";
            if (errloc) {
                desc += sprintf(" (promise %s)", errloc);
            }
            if (!err && errstr.val()) {
                desc += ": " + errstr;
            }
            if (exists stack) {
                desc += sprintf(" detail: %s", stack);
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

    #! Returns reference data of the given kind if available
    /** @param type the unique type name of the reference data
        @param action_opts an optional hash of action options when called when working with an app action

        @return a list of allowed values for this data

        @since DataProvider 3.0
    */
    private *list<hash<AllowedValueInfo>> getReferenceDataImpl(string type, *hash<auto> action_opts) {
        if (*hash<AsyncCallInfo> ref_api = omap{type}) {
            *hash<DataContextInfo> arg = getCallContextInfo(action_opts);
            debug("Retrieving reference data with JS for data provider %y type %y arg: %y", getName(), type, arg);
            *softlist<auto> l = getAsyncValue(ref_api, arg);
            debug("Reference data for data provider %y type %y: %y", getName(), type, l);
            if (!l) {
                return;
            }
            if (l[0].typeCode() != NT_HASH) {
                return map <AllowedValueInfo>{
                    "display_name": $1.toString(),
                    "short_desc": $1.toString(),
                    "desc": $1.toString(),
                    "value": $1,
                }, l;
            }
            return map cast<hash<AllowedValueInfo>>($1 instanceof JavaScriptObject ? $1.toData() : $1), l;
        } else if (*hash<auto> ref_rest = romap{type}) {
            if (!rest) {
                checkRestClient();
            }
            string path = ref_rest.path;
            if (action_opts) {
                map path = replace(path, "{" + $1.key + "}", $1.value), action_opts.pairIterator(),
                    $1.value.typeCode() == NT_STRING;
            }
            hash<auto> info;
            debug("Retrieving reference data with REST for data provider %y type %y: %s %s", getName(), type,
                ref_rest.method, path);
            on_error rethrow $1.err, sprintf("%s: info: %y", $1.desc, info{"request-uri", "response-uri"});
            hash<auto> resp = rest.doRequest(ref_rest.method, path, ref_rest.body, \info, NOTHING,
                ref_rest.headers);
            debug("Reference data with REST for data provider %y type %y got: %y", getName(), type, resp);
            hash<auto> v = resp;
            *softlist<hash<AllowedValueInfo>> rv = getAllowedValues(resp, ref_rest.values.split("."));
            if (rv && ref_rest.display_names.val()) {
                *list<string> dnl = getDisplayNames(type, resp, ref_rest.display_names.split("."));
                if (dnl.size() != rv.size()) {
                    throw "REST-ALLOWED-VALUES-ERROR", sprintf("Data provider %y type %y returned %d display_name%s "
                        "for %d value%s", getName(), type, dnl.size(), dnl.size() == 1 ? "" : "s",
                        rv.size(), rv.size() == 1 ? "" : "s");
                }
                foreach hash<AllowedValueInfo> info in (\rv) {
                    info.display_name = dnl[$#];
                }
            }
            debug("Reference data with REST for data provider %y type %y allowed values: %y", getName(), type, rv);
            return rv;
        }
    }

    #! Returns allowed values info from the given location in a hash
    static private *softlist<hash<AllowedValueInfo>> getAllowedValues(auto v, list<string> kl) {
        string k = shift kl;
        auto v0 = v{k};
        if (!exists v0) {
            return;
        }
        if (!kl) {
            return map cast<hash<AllowedValueInfo>>({
                "display_name": $1,
                "value": $1,
            }), v0;
        }
        return foldl $1 + $2, (map TypeScriptActionDataProviderBase::getAllowedValues($1, kl), v0);
    }

    #! Adds display names to allowed values
    private *list<string> getDisplayNames(string type, auto v, list<string> dnl) {
        string k = shift dnl;
        auto v0 = v{k};
        if (!exists v0) {
            return;
        }
        if (!dnl) {
            list<string> rv;
            foreach auto dn in (v0) {
                if (!dn.strp()) {
                    throw "REST-ALLOWED-VALUES-ERROR", sprintf("Data provider %y type %y display name has type "
                        "%y (%y) that cannot be converted to a string", getName(), type, dn.fullType(), dn);
                }
                rv += dn.toString();
            }
            return rv;
        }
        return foldl $1 + $2, (map TypeScriptActionDataProviderBase::getDisplayNames(type, $1, dnl), v0);
    }

    #! Check and assign REST client
    private synchronized checkRestClient() {
        if (!rest) {
            rest = conn.get();
        }
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
