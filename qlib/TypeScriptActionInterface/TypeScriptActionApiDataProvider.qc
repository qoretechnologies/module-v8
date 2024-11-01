# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionApiDataProvider.qc Copyright 2024 Qore Technologies, s.r.o.

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

#! Main namespace for the TypeScriptActionInterface module
public namespace TypeScriptActionInterface {
#! Data provider reference data context info
public hashdecl RefDataContextInfo {
    #! Connection name
    *string conn_name;

    #! Connection option info
    *hash<auto> conn_opts;

    #! Action options with known values
    *hash<auto> opts;

    #! User-defined information
    *hash<auto> info;
}

#! Generic API data provider for TypeScript actions
class TypeScriptActionApiDataProvider inherits TypeScriptActionDataProviderBase {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "type": "TypeScriptActionApiDataProvider",
            "supports_request": True,
        };

        #! Provider summary info
        const ProviderSummaryInfo = cast<hash<DataProviderSummaryInfo>>(ProviderInfo{
            AbstractDataProvider::DataProviderSummaryInfoKeys
        });
    }

    private {
        hash<AsyncCallInfo> api;
        *AbstractDataProviderType request_type;
        *AbstractDataProviderType response_type;
        #! options with functions for reference data
        *hash<string, hash<AsyncCallInfo>> omap;
        #! options that determine the structure of other options
        *hash<string, hash<AsyncCallInfo>> dmap;

        #! type cache for dependent options; opt val key -> type
        hash<string, AbstractDataProviderType> dtcache;
    }

    constructor(string name, hash<AsyncCallInfo> api, *AbstractDataProviderType request_type,
            *AbstractDataProviderType response_type, *hash<string, hash<AsyncCallInfo>> omap,
            *hash<string, hash<AsyncCallInfo>> dmap) : TypeScriptActionDataProviderBase(name) {
        self.api = api;
        self.request_type = request_type;
        self.response_type = response_type;
        self.omap = omap;
        self.dmap = dmap;
    }

    private constructor(string name, *hash<AsyncCallInfo> api) : TypeScriptActionDataProviderBase(name) {
        if (api) {
            self.api = api;
        }
    }

    #! Returns information on supported reference data
    /** @return a hash of supported reference data; keys in the hash returned are supported in calls to
        @ref getReferenceData()
    */
    *hash<string, bool> getSupportedReferenceData() {
        return map {$1: True}, keys omap;
    }

    #! "Normalizes" the request and response for testing if necessary
    auto makeNormalizedRequest(auto req, *hash<auto> request_options) {
        return doRequest(req, request_options);
    }

    #! Makes a request and returns the response
    /** @param req the request to serialize and make according to the request type
        @param request_options the request options; will be processed by validateRequestOptions()

        @return the response to the request
    */
    private auto doRequestImpl(auto req, *hash<auto> request_options) {
        return getAsyncValue(api, req, request_options, getCallContextInfo());
    }

    #! Returns reference data of the given kind if available
    /** @param type the unique type name of the reference data
        @param action_opts an optional hash of action options when called when working with an app action

        @return a list of allowed values for this data

        @since DataProvider 3.0
    */
    private *list<hash<AllowedValueInfo>> getReferenceDataImpl(string type, *hash<auto> action_opts) {
        if (*hash<AsyncCallInfo> ref_api = omap{type}) {
            *hash<RefDataContextInfo> arg = getCallContextInfo(action_opts);
            debug("Retrieving reference data for data provider %y type %y arg: %y", getName(), type, arg);
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
        }
    }

    #! Returns the description of a successful request message, if any
    /** @return the request type for this provider
    */
    private *DataProvider::AbstractDataProviderType getRequestTypeImpl() {
        return request_type;
    }

    #! Returns the description of a successful request message with call data, if any
    /** @param req sample request data that can be used to determine the final type

        @return the request type for this provider according to any call data passed

        @note
        - Only called if the provider supports the request / response API
        - This API is meant to provide information about request data types that can depend on the call data

        @since DataProvider 3.0
    */
    private *AbstractDataProviderType getRequestTypeWithDataImpl(auto req) {
        *AbstractDataProviderType rt = getRequestTypeImpl();
        if (!dmap) {
            return rt;
        }
        if (!(rt instanceof HashDataType)) {
            throw "DATA-PROVIDER-REQUEST-TYPE-ERROR", sprintf("Request type is not a hash; cannot add fields to "
                "type %y", rt.getName());
        }
        if (req.typeCode() != NT_HASH) {
            throw "DATA-PROVIDER-REQUEST-TYPE-ERROR", sprintf("Request data has type %y; expecting \"hash\"",
                req.fullType());
        }

        *hash<auto> slice = dmap{keys req};
        if (!slice) {
            return rt;
        }
        # cache key (opt[|opt...]=val[|val])
        *string ckey = getCacheKey(keys slice, req);
        if (exists ckey) {
            if (*AbstractDataProviderType rv = dtcache{ckey}) {
                return rv;
            }
        }

        HashDataType type;
        foreach hash<auto> i in (slice.pairIterator()) {
            auto val = req{i.key};
            debug("Retrieving options dependent on option %y, value %y for data provider %y type %y", i.key, val,
                getName(), type);
            auto res = getAsyncValue(i.value, getCallContextInfo(req));
            if (!exists res) {
                continue;
            }
            if (res.typeCode() != NT_HASH) {
                throw "DATA-PROVIDER-REQUEST-TYPE-ERROR", sprintf("JavaScript 'get_dependent_options()' function "
                    "returned type %y; expecting \"hash\"", res.fullType());
            }
            if (!type) {
                type = cast<HashDataType>(rt.copy());
            }
            type.addQoreFields(map {$1.key: TypeScriptActionInterface::getField($1.key, $1.value)},
                res.pairIterator());
        }
        if (exists ckey) {
            return dtcache{ckey} = type;
        }
        return type ?? rt;
    }

    #! Returns a key to the dependent type cache for the request type
    private static *string getCacheKey(list<string> skeys, hash<auto> req) {
        string ckey;
        foreach string key in (skeys) {
            auto val = req{key};
            if (!val.strp()) {
                return;
            }
            if (exists ckey) {
                ckey += "|";
            }
            ckey += val.toString();
        }
        return (foldl $1 + "|" + $2, skeys) + "=" + ckey;
    }

    #! Returns the description of a response message, if this object represents a response message
    /** @return the response type for this response message
    */
    private *DataProvider::AbstractDataProviderType getResponseTypeImpl() {
        return response_type;
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }

    #! Returns call context info
    private *hash<RefDataContextInfo> getCallContextInfo(*hash<auto> action_opts) {
        if (conn) {
            return <RefDataContextInfo>{
                "conn_name": conn.name,
                "conn_opts": conn.getRealOptions(),
                "opts": action_opts,
            };
        }
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
            err = TypeScriptActionApiDataProvider::stripNonSerializableData(err);

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
                v = map {$1.key: TypeScriptActionApiDataProvider::stripNonSerializableData($1.value)},
                    v.pairIterator();
                break;

            case NT_LIST:
                v = map TypeScriptActionApiDataProvider::stripNonSerializableData($1), v;
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
}
}