# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionGoogleApiDataProvider.qc Copyright 2024 - 2025 Qore Technologies, s.r.o.

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
#! API data provider for Google actions
public class TypeScriptActionGoogleApiDataProvider inherits TypeScriptActionApiDataProvider {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "type": "TypeScriptActionGoogleApiDataProvider",
            "supports_request": True,
        };

        #! Provider summary info
        const ProviderSummaryInfo = cast<hash<DataProviderSummaryInfo>>(ProviderInfo{
            AbstractDataProvider::DataProviderSummaryInfoKeys
        });
    }

    private {
        GoogleApiDataProvider google_api;
    }

    constructor(string name, hash<auto> google_action, *hash<AsyncCallInfo> api,
            ActionFunctionContext fctx, *hash<AsyncCallInfo> get_dynamic_request_type,
            *hash<AsyncCallInfo> get_dynamic_response_type)
            : TypeScriptActionApiDataProvider(name, api, fctx, get_dynamic_request_type, get_dynamic_response_type) {
        google_api = new GoogleApiDataProvider(new RestClientIo({"url": "https://www.googleapis.com"}),
            google_action.app.api, google_action.resource, google_action.path_args ?? google_action.app.path_args);
    }

    private synchronized checkRestClient(*hash<auto> action_opts) {
        TypeScriptActionDataProviderBase::checkRestClient(action_opts);
        google_api.setRestClient(conn.getAsync());
    }

    #! Makes a request and returns the response
    /** @param req the request to serialize and make according to the request type
        @param request_options the request options; will be processed by validateRequestOptions()

        @return the response to the request
    */
    private auto doRequestImpl(auto req, *hash<auto> request_options) {
        checkRestClient(req);
        if (!api) {
            return google_api.doRequest(req, request_options);
        }
        return getAsyncValue(api, req, request_options, getCallContextInfo());
    }

    #! Returns the description of a successful request message, if any
    /** @return the request type for this provider
    */
    private *DataProvider::AbstractDataProviderType getRequestTypeImpl() {
        if (request_type_info.get_dynamic_type || request_type_info.type) {
            return getDynamicTypeIntern("request", \request_type_info, NOTHING, dtmap);
        }
        return google_api.getRequestType();
    }

    #! Returns the description of a response message, if this object represents a response message
    /** @return the response type for this response message
    */
    private *DataProvider::AbstractDataProviderType getResponseTypeImpl() {
        if (response_type_info.get_dynamic_type || response_type_info.type) {
            return getDynamicTypeIntern("response", \response_type_info);
        }
        return google_api.getResponseType();
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}