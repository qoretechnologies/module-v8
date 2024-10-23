# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionApiWithSchemaDataProvider.qc Copyright 2024 Qore Technologies, s.r.o.

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
#! Generic API data provider for TypeScript actions based on a Swagger schema
class TypeScriptActionApiWithSchemaDataProvider inherits TypeScriptActionApiDataProvider {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "type": "TypeScriptActionApiWithSchemaDataProvider",
            "supports_request": True,
        };

        #! Provider summary info
        const ProviderSummaryInfo = cast<hash<DataProviderSummaryInfo>>(ProviderInfo{
            AbstractDataProvider::DataProviderSummaryInfoKeys
        });
    }

    private {
        #! Swagger path
        string swagger_path;

        #! API data provider
        SwaggerDataProviderCommon prov;

        #! Path vars
        *hash<string, bool> path_vars;

        #! If the response only has a body key
        bool res_only_body;

        #! If the request only has a body key
        bool req_only_body;

        #! Connection to Swagger path option map
        *hash<string, string> conn_opt_map;

        #! Query option set
        *hash<string, bool> query_set;
    }

    #! Creates the object from the arguments
    constructor(string name, SwaggerSchema schema, string swagger_path, *hash<AsyncCallInfo> api,
            *hash<string, bool> path_vars, *hash<string, string> conn_opt_map)
            : TypeScriptActionApiDataProvider(name, api) {
        self.swagger_path = swagger_path;
        self.conn_opt_map = conn_opt_map;
        if (conn_opt_map) {
            query_set = map {$1: True}, conn_opt_map.iterator();
        }

        # set request and response types
        {
            swagger_path =~ s/^\///;
            on_error rethrow $1.err, sprintf("%s (Swagger path: %y)", $1.desc, swagger_path);
            prov = new SwaggerDataProvider(schema).getChildProviderPath(swagger_path);
        }
        request_type = prov.getRequestType();
        if (request_type && (*hash<string, AbstractDataField> fields = request_type.getFields())) {
            if (fields.size() == 1 && fields.body) {
                *AbstractDataProviderType t = fields.body.getType();
                if (!path_vars || !t || !t.getFields(){keys path_vars}) {
                    req_only_body = True;
                    request_type = t;
                    fields = t.getFields();
                }
            }
        }
        response_type = prov.getResponseType();
        if (response_type && (*hash<string, AbstractDataField> fields = response_type.getFields())
            && fields.size() == 1 && fields.body) {
            res_only_body = True;
            response_type = fields.body.getType();
        }

        if (path_vars) {
            self.path_vars = path_vars;
            if (!request_type) {
                request_type = new HashDataType();
            } else if (!(request_type instanceof HashDataType)) {
                HashDataType h();
                string fname = "data";
                int i;
                while (path_vars{fname}) {
                    fname = sprintf("data-%d", ++i);
                }
                h.addField(new QoreDataField({
                    "name": fname,
                    "type": request_type,
                    "desc": "API request type",
                }));
                request_type = h;
            } else {
                # do not modify the underlying data provider's type
                request_type = request_type.copy();
            }
            map request_type.addField(new QoreDataField({
                "name": $1,
                "type": AbstractDataProviderTypeMap."softstring",
                "desc": sprintf("URI path variable %y", $1),
            })), keys path_vars, !query_set{$1};
        }
    }

    #! "Normalizes" the request and response for testing if necessary
    auto makeNormalizedRequest(auto req, *hash<auto> request_options) {
        if (req_only_body && req.hasKey("body")) {
            req = req.body + (req - "body");
        }
        auto rv = doRequest(req, request_options);
        if (res_only_body) {
            rv.body = remove rv;
        }
        return rv;
    }

    #! Makes a request and returns the response
    /** @param req the request to serialize and make according to the request type
        @param request_options the request options; will be processed by validateRequestOptions()

        @return the response to the request
    */
    private auto doRequestImpl(auto req, *hash<auto> request_options) {
        if (path_vars) {
            request_options.path_vars = remove req{keys path_vars};
            if (conn_opt_map) {
                *hash<auto> opts = conn.getRealOptions();
                map request_options.path_vars{$1.value} = opts{$1.key}, conn_opt_map.pairIterator(),
                    path_vars{$1.value};
            }
        }
        if (!api) {
            if (!prov.tryGetRestClient()) {
                prov.setRestClient(conn.get());
            }
            if (exists (*string base_path = conn.orig_opts.swagger_base_path)) {
                request_options.base_path = base_path;
            }
            if (path_vars && (*hash<auto> vars = req{keys path_vars})) {
                req -= keys path_vars;
                request_options.path_vars = vars;
            }
            if (req_only_body) {
                req = {
                    "body": req,
                };
            }
            auto rv = prov.doRequest(req, request_options);
            return res_only_body ? rv.body : rv;
        }
        return getAsyncValue(api, req, request_options, getCallContextInfo());
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}
