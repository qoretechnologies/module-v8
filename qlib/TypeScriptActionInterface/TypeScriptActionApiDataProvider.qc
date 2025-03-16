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
hashdecl DynamicTypeInfo {
    *hash<AsyncCallInfo> get_dynamic_type;
    bool dynamic_type_done;
    *hash<string, AbstractDataField> dtfields;
    bool dtfields_done;
    *AbstractDataProviderType type;
}

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

        hash<DynamicTypeInfo> request_type_info();
        hash<DynamicTypeInfo> response_type_info();
    }

    constructor(string name, hash<AsyncCallInfo> api, *AbstractDataProviderType request_type,
            *AbstractDataProviderType response_type, ActionFunctionContext fctx,
            *hash<AsyncCallInfo> get_dynamic_request_type, *hash<AsyncCallInfo> get_dynamic_response_type)
            : TypeScriptActionDataProviderBase(name, fctx) {
        self.api = api;
        request_type_info.get_dynamic_type = get_dynamic_request_type;
        request_type_info.type = request_type;

        response_type_info.get_dynamic_type = get_dynamic_response_type;
        response_type_info.type = response_type;
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
        return getTypeImplIntern("request", \request_type_info);
    }

    #! Retrieves dynamic type info
    private *DataProvider::AbstractDataProviderType getTypeImplIntern(string dtype,
            reference<hash<DynamicTypeInfo>> type_info) {
        on_error LoggerWrapper::error("%s", get_exception_string($1));
        bool new_type;
        if (type_info.get_dynamic_type && !type_info.dynamic_type_done) {
            # include any context data in case request-specific info needs to be returned
            *hash<auto> opts = DataProviderDataContextHelper::get();
            auto res = getAsyncValueArgs(self, type_info.get_dynamic_type, {
                "conn_name": conn.name,
                "conn_opts": conn.getRealOptions(),
                "opts": opts,
            }, {
                "conn_opts": conn.getRealOptions(),
            }, True);
            if (res) {
                AbstractDataProviderType t = TypeScriptActionInterface::getType("get_dynamic_" + dtype + "_type", res,
                    NOTHING, NOTHING, self);
                if (!(t instanceof HashDataType)) {
                    throw "DYNAMIC-TYPE-ERROR", sprintf("Dynamic %s type for @%s/%s is type %y; expecting \"hash\"",
                        dtype, api.app, api.action, t.getName());
                }
                if (!type_info.type) {
                    type_info.type = t;
                } else if (*hash<string, AbstractDataField> fields = t.getFields()) {
                    if (!(type_info.type instanceof HashDataType)) {
                        throw "DYNAMIC-TYPE-ERROR", sprintf("Cannot add dynamic type for @%s/%s to existing %s "
                            "type %y; must be a hash to extend", api.app, api.action, dtype, type_info.type.getName());
                    }
                    # do not modify the original type
                    type_info.type = type_info.type.copyWithFields(type_info.type.getFields() + fields);
                }
                new_type = True;
            }
            type_info.dynamic_type_done = True;
        }
        if (dtype == "request" && !type_info.dtfields_done && dtmap) {
            foreach hash<auto> i in (dtmap.pairIterator()) {
                debug("Retrieving dynamic type for option %y for data provider %y", i.key, getName());
                # include any context data in case request-specific info needs to be returned
                *hash<auto> opts = DataProviderDataContextHelper::get();
                auto res = getAsyncValueArgs(self, i.value, {
                    "conn_name": conn.name,
                    "conn_opts": conn.getRealOptions(),
                    "opts": opts,
                }, {
                    "conn_opts": conn.getRealOptions(),
                }, True);
                if (!res) {
                    continue;
                }

                AbstractDataProviderType t = TypeScriptActionInterface::getType(dtype + " option " + i.key, res,
                    NOTHING, NOTHING, self);
                TypeScriptDataField field({
                    "name": i.key,
                    "type": t,
                });
                type_info.dtfields{i.key} = field;
            }
            type_info.dtfields_done = True;
        }
        if (type_info.dtfields) {
            if (!type_info.type) {
                type_info.type = new HashDataType(AutoHashType, dtype[0].upr() + dtype[1..] + "Type");
            } else {
                type_info.type = type_info.type.copy();
            }
            map type_info.type.addField($1), type_info.dtfields.iterator();
            debug("Added dynamic fields: %y", keys type_info.dtfields);
        }
        return type_info.type;
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
        if (!dmap || !exists req) {
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
        return getDynamicDataType(PC_GET_REQUEST_TYPE, rt, req);
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
            map type.addField(TypeScriptActionInterface::getField("request-type", $1.key, $1.value, self, True)),
                res.pairIterator();
            TypeScriptActionInterface::checkFieldDependencies(type);
        }
        return type;
    }

    #! Returns the description of a response message, if this object represents a response message
    /** @return the response type for this response message
    */
    private *DataProvider::AbstractDataProviderType getResponseTypeImpl() {
        return getTypeImplIntern("response", \response_type_info);
    }

    #! Returns the description of a successful response message with call data, if any
    /** @param req sample request data that can be used to determine the final type

        @return the response type for this provider according to any call data passed

        @note
        - Only called if the provider supports the request / response API
        - This API is meant to provide information about request data types that can depend on the call data

        @since DataProvider 3.0
    */
    private *AbstractDataProviderType getResponseTypeWithDataImpl(auto req) {
        *AbstractDataProviderType rt = getResponseTypeImpl();
        if (!drmap || !exists req) {
            return rt;
        }
        if (!(rt instanceof HashDataType)) {
            throw "DATA-PROVIDER-RESPONSE-TYPE-ERROR", sprintf("Response type is not a hash; cannot add fields to "
                "type %y", rt.getName());
        }
        if (req.typeCode() != NT_HASH) {
            throw "DATA-PROVIDER-RESPONSE-TYPE-ERROR", sprintf("Response data has type %y; expecting \"hash\"",
                req.fullType());
        }
        return getDynamicDataType(PC_GET_RESPONSE_TYPE, rt, req);
    }

    *HashDataType getResponseTypeExtern(*string conn_name, *hash<auto> conn_opts, hash<auto> req) {
        AbstractDataProviderType rt = getResponseTypeImpl();
        hash<auto> slice = drmap{keys req};

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
                throw "DATA-PROVIDER-RESPONSE-TYPE-ERROR", sprintf("JavaScript 'get_dependent_response_options()' function "
                    "returned type %y; expecting \"hash\"", res.fullType());
            }
            if (!type) {
                type = cast<HashDataType>(rt.copy());
            }
            map type.addField(TypeScriptActionInterface::getField("response-type", $1.key, $1.value, self, True)),
                res.pairIterator();
            TypeScriptActionInterface::checkFieldDependencies(type);
        }
        return type;
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}