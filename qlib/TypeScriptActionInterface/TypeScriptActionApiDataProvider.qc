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
#! Generic API data provider for TypeScript actions
public class TypeScriptActionApiDataProvider inherits TypeScriptActionDataProviderBase {
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

        #! type cache for dependent options; opt val key -> type
        hash<string, AbstractDataProviderType> dtcache;
    }

    constructor(string name, hash<AsyncCallInfo> api, *AbstractDataProviderType request_type,
            *AbstractDataProviderType response_type, ActionFunctionContext fctx)
            : TypeScriptActionDataProviderBase(name, fctx) {
        self.api = api;
        self.request_type = request_type;
        self.response_type = response_type;
    }

    private constructor(string name, *hash<AsyncCallInfo> api, ActionFunctionContext fctx)
            : TypeScriptActionDataProviderBase(name, fctx) {
        if (api) {
            self.api = api;
        }
    }

    #! "Normalizes" the request and response for testing if necessary
    auto makeNormalizedRequest(auto req, *hash<auto> request_options) {
        return doRequest(req, request_options);
    }

    #! Sets the connection
    setConnection(TypeScriptAppRestConnection conn) {
        TypeScriptActionDataProviderBase::setConnection(conn);
        if (*hash<string, hash<AsyncCallInfo>> dvmap = remove self.dvmap) {
            *hash<string, AbstractDataField> fields = request_type.getFields();
            *hash<DataContextInfo> arg = getCallContextInfo();
            hash<string, bool> vmap;
            foreach hash<auto> i in (dvmap.pairIterator()) {
                try {
                    auto v = conn.getSetCacheValue(i.key, auto sub () {
                        debug("Connection %y retrieving default value for %y", conn.name, i.key);
                        auto rv = getAsyncValue(i.value, arg);
                        debug("Connection %y retrieved default value %y = %y", conn.name, i.key, rv);
                        return rv;
                    });
                    if (v) {
                        *AbstractDataField f = fields{i.key};
                        if (!f) {
                            throw "ACTION-CONFIG-ERROR", sprintf("Cannot set default type for unknown option %y",
                                i.key);
                        }
                        f.setDefaultValue(v);
                        vmap{i.key} = True;
                    }
                } catch (hash<ExceptionInfo> ex) {
                    error("ACTION-OPTION-ERROR", "Exception retrieving default value for data provider %y "
                        "option %y: %s", getName(), i.key, get_exception_string(ex));
                    rethrow;
                }
            }
            # make "or-nothing" type if appropriate
            bool ok = True;
            foreach hash<auto> i in (fields.pairIterator()) {
                if (!vmap{i.key} && (!exists i.value.getDefaultValue()) && i.value.isMandatory()) {
                    ok = False;
                    break;
                }
            }
            if (ok) {
                request_type = request_type.getOrNothingType();
            }
        }
    }

    #! Makes a request and returns the response
    /** @param req the request to serialize and make according to the request type
        @param request_options the request options; will be processed by validateRequestOptions()

        @return the response to the request
    */
    private auto doRequestImpl(auto req, *hash<auto> request_options) {
        return getAsyncValue(api, req, request_options, getCallContextInfo());
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

        *HashDataType type;
        if (TSAI::checkServer()) {
            TSAI::debug("Starting proxy for app %y action %y: request type with args: %y", api.app, api.action, req);
            JavaScriptProgramProxy proxy = TypeScriptActionInterface::server.get();
            TSAI::debug("Proxy started for app %y action %y: request type with args", api.app, api.action);
            on_exit TypeScriptActionInterface::server.release(proxy);
            type = proxy.getRequestType(api.app, api.action, conn.name, conn.getRealOptions(), req);
        } else {
            type = getRequestTypeIntern(rt, slice, req);
        }
        if (exists ckey) {
            return dtcache{ckey} = type ?? rt;
        }
        return type ?? rt;
    }

    *HashDataType getRequestTypeExtern(*string conn_name, *hash<auto> conn_opts, hash<auto> req) {
        AbstractDataProviderType rt = getRequestTypeImpl();
        hash<auto> slice = dmap{keys req};

        HashDataType type;
        foreach hash<auto> i in (slice.pairIterator()) {
            auto val = req{i.key};
            debug("Retrieving options dependent on option %y, value %y for data provider %y type %y", i.key, val,
                getName(), type);

            auto res = getAsyncValueArgs(self, i.value, {
                "conn_name": conn_name,
                "conn_opts": conn_opts,
                "opts": req,
            }, req + {
                "conn_opts": conn_opts,
            }, True);
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
            type.addQoreFields(map {$1.key: TypeScriptActionInterface::getField("request-type", $1.key, $1.value)},
                res.pairIterator());
        }
        return type;
    }

    private *HashDataType getRequestTypeIntern(AbstractDataProviderType rt, hash<auto> slice, hash<auto> req) {
        HashDataType type;
        foreach hash<auto> i in (slice.pairIterator()) {
            auto val = req{i.key};
            debug("Retrieving options dependent on option %y, value %y for data provider %y type %y", i.key, val,
                getName(), type);
            auto res = getAsyncValueWithCache(i.value, req, getCallContextInfo(req));
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
            type.addQoreFields(map {$1.key: TypeScriptActionInterface::getField("request-type", $1.key, $1.value)},
                res.pairIterator());
        }
        return type;
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
}
}