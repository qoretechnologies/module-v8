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
            *hash<DataContextInfo> arg = getCallContextInfo(action_opts);
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
}
}