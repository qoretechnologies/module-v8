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

        #! Info on flattened request types: top-level key -> actual location
        *hash<string, list<string>> reqmap;

        #! Reverse map for flattened request types: dotted location -> top-level key
        *hash<string, string> rreqmap;

        #! Info on flattened response types: top-level key -> actual location
        #hash<string, list<string>> resmap;

        #! If the response only has a body key
        bool res_only_body;

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
            HashDataType newreq;
            code check = sub (hash<string, AbstractDataField> fields, string key) {
                list<string> l = (key,);
                while (fields.size() == 1
                    && (*hash<string, AbstractDataField> f = fields.firstValue().getType().getFields())) {
                    l += fields.firstKey();
                    fields = f;
                }
                if (!newreq) {
                    newreq = new HashDataType(request_type.isOrNothingType() ? AutoHashOrNothingType : AutoHashType,
                        request_type.getName(), fields);
                } else if (fields) {
                    map newreq.addField($1), (fields = fields - (keys newreq.getFields())).iterator();
                }
                map reqmap{$1} = l, keys fields;
                map rreqmap{l.join(".")} = $1, keys fields;
            };
            bool stop;
            # process body args
            if (fields.body) {
                if (*hash<string, AbstractDataField> bf = fields.body.getType().getFields()) {
                    # move args to the top level
                    check(bf, "body");
                } else {
                    stop = True;
                }
            }
            # move query args to
            if (!stop && fields.query && (*hash<string, AbstractDataField> qf = fields.query.getType().getFields())) {
                check(qf, "query");
            }
            if (!stop && fields.header && (*hash<string, AbstractDataField> hf =
                fields.header.getType().getFields())) {
                check(hf, "header");
            }
            if (newreq) {
                request_type = newreq;
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
                "attr": {
                    "preselected": True,
                    "required": True,
                },
            })), keys path_vars, !query_set{$1};
        }
    }

    overrideOptions(reference<hash<auto>> action, hash<auto> opts, JavaScriptProgramPool pool) {
        foreach hash<auto> i in (opts.pairIterator()) {
            # find option to update
            string k = rreqmap{i.key} ?? i.key;
            *reference<hash<ActionOptionInfo>> opt = \action.options{k};
            if (!opt) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"override_options\" "
                    "property; cannot find option %y to override; known top-level options: %y", action.app,
                    action.action, i.key, keys action.options);
            }
            TypeScriptActionInterface::getOptionFunctions(\action, \omap, \dmap, i.key, \i.value, pool);
            if (exists i.value.ref_data) {
                opt.ref_data = i.value.ref_data;
            }
            if (i.value.type) {
                opt.type = TypeScriptActionInterface::getType(i.value.type, i.value.required);
            }
            if (i.value.allowed_values) {
                opt.allowed_values = map cast<hash<AllowedValueInfo>>($1), i.value.allowed_values;
            }
        }
    }

    #! "Normalizes" the request and response for testing if necessary
    auto makeNormalizedRequest(auto req, *hash<auto> request_options) {
        if (reqmap && req) {
            hash<auto> req0;
            map req0{$1.key} = $1.value, (
                map findNormalizedValue(req, $1.value, $1.key), reqmap.pairIterator()
            ), $1;
            map remove req{$1[0]}, reqmap.iterator();
            map req0{$1.key} = $1.value, req.pairIterator(), !exists req0{$1.key};
            req = req0;
        }
        auto rv = doRequest(req, request_options);
        if (res_only_body) {
            rv.body = remove rv;
        }
        return rv;
    }

    #! Moves a value in a normalized position to the top of the request hash
    private static *hash<auto> findNormalizedValue(hash<auto> req, list<string> p, string k, int offset = 0) {
        if (req.typeCode() == NT_HASH && (auto nr = req{p[0]}) && (nr.typeCode() == NT_HASH)) {
            int left = p.size() - offset;
            if (left == 1) {
                if (nr.hasKey(k)) {
                    return {
                        "key": k,
                        "value": nr{k},
                    };
                }
                return;
            }

            if (left == 2) {
                if (nr{p[offset + 1]}.hasKey(k)) {
                    return {
                        "key": k,
                        "value": nr{p[offset + 1]}{k},
                    };
                }
                return;
            }

            if (left == 3) {
                if (nr{p[offset + 1]}{p[offset + 2]}.hasKey(k)) {
                    return {
                        "key": k,
                        "value": nr{p[offset + 1]}{p[offset + 2]}{k},
                    };
                }
                return;
            }

            return TypeScriptActionApiWithSchemaDataProvider::findNormalizedValue(nr, p, k, offset + 1);
        }
    }

    #! Makes a request and returns the response
    /** @param req the request to serialize and make according to the request type
        @param request_options the request options; will be processed by validateRequestOptions()

        @return the response to the request
    */
    private auto doRequestImpl(auto req, *hash<auto> request_options) {
        on_error rethrow $1.err, sprintf("%s (req: %y request_options: %y)", $1.desc, req, request_options);
        if (!api) {
            if (!prov.tryGetRestClient()) {
                prov.setRestClient(conn.get());
            }
            if (exists (*string base_path = conn.orig_opts.swagger_base_path)) {
                request_options.base_path = base_path;
            }
            if (path_vars) {
                if (conn_opt_map) {
                    *hash<auto> opts = conn.getRealOptions();
                    map request_options.path_vars{$1.value} = opts{$1.key}, conn_opt_map.pairIterator(),
                        path_vars{$1.value};
                }
                if (*hash<auto> vars = req{keys path_vars}) {
                    req -= keys path_vars;
                    request_options.path_vars += vars;
                }
            }

            hash<auto> req0;
            map fixOptimizedValue(\req0, $1.value, $1.key, remove req{$1.key}), reqmap.pairIterator(),
                req.hasKey($1.key);
            map req0{$1.key} = $1.value, req.pairIterator(), !req0.hasKey($1.key);
            req = req0;

            auto rv = prov.doRequest(req, request_options);
            return res_only_body ? rv.body : rv;
        }
        if (path_vars) {
            request_options.path_vars = remove req{keys path_vars};
            if (conn_opt_map) {
                *hash<auto> opts = conn.getRealOptions();
                map request_options.path_vars{$1.value} = opts{$1.key}, conn_opt_map.pairIterator(),
                    path_vars{$1.value};
            }
        }
        map fixOptimizedValue(\req, $1.value, remove req{$1.key}, $1.key), reqmap.pairIterator(),
            req.hasKey($1.key);
       return getAsyncValue(api, req, request_options, getCallContextInfo());
    }

    #! Moves a value in an optimized position to the standard position of the request hash
    private static fixOptimizedValue(reference<auto> req, list<string> p, string k, auto val, int offset = 0) {
        int len = p.size() - offset - 1;
        if (offset == len) {
            req{p[offset]}{k} = val;
        } else if (offset == (len - 1)) {
            req{p[offset]}{p[offset + 1]}{k} = val;
        } else if (offset == (len - 2)) {
            req{p[offset]}{p[offset + 1]}{p[offset + 2]}{k} = val;
        } else if (offset == (len - 3)) {
            req{p[offset]}{p[offset + 1]}{p[offset + 2]}{p[offset + 3]}{k} = val;
        } else {
            TypeScriptActionApiWithSchemaDataProvider::fixOptimizedValue(\req{p[offset]}, p, k, val, offset + 1);
        }
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}
