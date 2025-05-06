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

    private constructor(string name, *hash<AsyncCallInfo> api, ActionFunctionContext fctx,
            *hash<AsyncCallInfo> get_dynamic_request_type, *hash<AsyncCallInfo> get_dynamic_response_type)
            : TypeScriptActionDataProviderBase(name, fctx) {
        if (api) {
            self.api = api;
        }
        if (get_dynamic_request_type) {
            request_type_info.get_dynamic_type = get_dynamic_request_type;
        }
        if (get_dynamic_response_type) {
            response_type_info.get_dynamic_type = get_dynamic_response_type;
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
        return getDynamicTypeIntern("request", \request_type_info, NOTHING, dtmap);
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

    #! Returns the description of a response message, if this object represents a response message
    /** @return the response type for this response message
    */
    private *DataProvider::AbstractDataProviderType getResponseTypeImpl() {
        return getDynamicTypeIntern("response", \response_type_info);
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

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}