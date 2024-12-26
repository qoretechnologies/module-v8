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
        SwaggerRequestDataProvider prov;

        #! Path vars
        *hash<string, bool> path_vars;

        #! Independent path vars
        *hash<string, bool> independent_path_vars;

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
    constructor(reference<hash<auto>> action, string swagger_path, *hash<AsyncCallInfo> api,
            *hash<string, bool> path_vars, *hash<string, bool> independent_path_vars,
            *hash<string, string> conn_opt_map, *hash<auto> override_options,
            JavaScriptProgramPool pool) : TypeScriptActionApiDataProvider(action.action, api) {
        self.swagger_path = swagger_path;
        self.conn_opt_map = conn_opt_map;
        if (conn_opt_map) {
            query_set = map {$1: True}, conn_opt_map.iterator();
        }

        # set request and response types
        {
            swagger_path =~ s/^\///;
            on_error rethrow $1.err, sprintf("%s (Swagger path: %y)", $1.desc, swagger_path);
            prov = TypeScriptActionInterface::getSwaggerDataProvider(action.app).getChildProviderPath(swagger_path);
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
                map rreqmap{l.join(".") + ("." + $1)} = $1, keys fields;
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
            if (!stop && fields.formData) {
                if (*hash<string, AbstractDataField> bf = fields.formData.getType().getFields()) {
                    # move args to the top level
                    check(bf, "formData");
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
                fields = request_type.getFields();
            }
        }

        if (path_vars) {
            self.path_vars = path_vars;
            hash<string, AbstractDataField> fields = map {$1: new QoreDataField({
                "name": $1,
                "type": AbstractDataProviderTypeMap."softstring",
                "desc": sprintf("URI path variable %y", $1),
                "attr": {
                    "preselected": True,
                    "required": True,
                },
            })}, keys path_vars, !query_set{$1};

            hash<string, bool> dm;
            foreach string path in (keys path_vars) {
                if (!independent_path_vars{path}) {
                    if (dm) {
                        depmap{path} = dm;
                    }
                    dm{path} = True;
                }
            }

            if (request_type) {
                if (!(request_type instanceof HashDataType)) {
                    string fname = "data";
                    int i;
                    while (path_vars{fname}) {
                        fname = sprintf("data-%d", ++i);
                    }
                    fields{fname} = new QoreDataField({
                        "name": fname,
                        "type": request_type,
                        "desc": "API request type",
                    });
                } else {
                    fields += request_type.getFields();
                }
            }
            request_type = new HashDataType(AutoHashType, "RestRequestType", fields);
        }

        # allow options to be updated
        if (override_options) {
            if (!request_type) {
                bool required = True;
                foreach hash<auto> v in (override_options.iterator()) {
                    if (!v.required) {
                        required = False;
                        break;
                    }
                }
                request_type = new HashDataType(required ? AutoHashType : AutoHashOrNothingType);
            } else if (!(request_type instanceof HashDataType)) {
                throw "ACTION-ERROR", sprintf("Cannot override options of app %y action %y with non-hash "
                    "request type %y", action.app, action.action, request_type.getName());
            }
            overrideOptions(\action, cast<HashDataType>(request_type), override_options, pool);
            if (!prov.op.consumes) {
                prov.op.consumes{MimeTypeJson} = True;
            }
            prov.disableRequestTypeCheck();
        }

        if (request_type && (*hash<string, AbstractDataField> fields = request_type.getFields())) {
            action.options = DataProviderActionCatalog::getActionOptionFromFields(fields);
            TypeScriptActionInterface::sortOptions({"name": action.app}, action, \action.options);

            if (depmap) {
                foreach hash<auto> i in (action.options.pairIterator()) {
                    if (path_vars{i.key}) {
                        if (*hash<auto> deps = depmap{i.key}) {
                            action.options{i.key}.depends_on = keys deps;
                        }
                    } else {
                        *hash<string, bool> dp = map {$1: True}, keys path_vars;
                        map dp{$1} = True, action.options{i.key}.depends_on;
                        if (dp) {
                            action.options{i.key}.depends_on = keys dp;
                        }
                    }
                }
            }
        }

        response_type = prov.getResponseType();
        if (response_type && (*hash<string, AbstractDataField> fields = response_type.getFields())
            && fields.size() == 1 && fields.body) {
            res_only_body = True;
            response_type = fields.body.getType();
        }
    }

    overrideOptions(reference<hash<auto>> action, HashDataType type, hash<auto> opts, JavaScriptProgramPool pool) {
        *hash<string, AbstractDataField> fields = type.getFields();
        foreach hash<auto> i in (opts.pairIterator()) {
            # find option to update
            string k = rreqmap{i.key} ?? i.key;
            list<string> l = k.split(".");
            string key = l[0];

            on_error rethrow $1.err, sprintf("%s (while processing option %y in %y)", $1.desc, key, i.key);

            *AbstractDataField f = fields{key};
            hash<auto> opt;
            if (!f) {
                if (l.size() > 1) {
                    throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y cannot override unknown top-level "
                        "option %y; known top-level options: %y", action.app, action.action, key,
                        keys fields);
                }
                TypeScriptActionInterface::getOptionFunctions(\action, \omap, \dmap, \romap, \dvmap, i.key,
                    \i.value, pool);

                type.addField(new QoreDataField(TypeScriptActionInterface::getField(key, i.value)));
                if (i.value_depends_on) {
                    depmap{key} = map {$1: True}, i.value.depends_on;
                }
                if (prov.op.method != "GET") {
                    reqmap{key} = ("body",);
                    rreqmap{"body." + key} = key;
                } else {
                    reqmap{key} = ("query",);
                    rreqmap{"query." + key} = key;
                }
            } else {
                if (!(f instanceof QoreDataField)) {
                    throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y option %y: cannot override %s; "
                        "expecting \"QoreDataField\"", action.app, action.action, key, f.className());
                }
                if (l.size() == 1) {
                    TypeScriptActionInterface::getOptionFunctions(\action, \omap, \dmap, \romap, \dvmap, i.key,
                        \i.value, pool);
                }
                if (i.value) {
                    type.replaceField(cast<QoreDataField>(f = f.copy()).updateFieldType(f.getType().copy()));
                    overrideOptionType(action, type, l, i.value, k);
                    if (l.size() == 1 && (*list<auto> dl = i.value.depends_on)) {
                        depmap{l[0]} = map {$1: True}, dl;
                    }
                }
            }
        }
    }

    static overrideOptionType(hash<auto> action, AbstractDataProviderType type, list<string> l,
            hash<auto> type_hash, string k) {
        string key = shift l;
        HashDataType t;
        *hash<string, AbstractDataField> fields;
        ListDataType lt;
        if (type instanceof HashDataType) {
            t = cast<HashDataType>(type);
            fields = t.getFields();
        } else if ((type instanceof ListDataType) && (*AbstractDataProviderType et = type.getElementType())
            && (et instanceof HashDataType)) {
            lt = cast<ListDataType>(type);
            t = cast<HashDataType>(et);
            fields = et.getFields();
        }
        *AbstractDataField f = fields{key};
        if (!f) {
            throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y cannot override unknown field %y in %y; known "
                "fields: %y", action.app, action.action, key, k, keys fields);
        }
        if (!(f instanceof QoreDataField)) {
            throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y cannot override field %y in %y of class %y; "
                "expecting \"QoreDataField\"", action.app, action.action, key, k, f.className());
        }
        if (l) {
            TypeScriptActionApiWithSchemaDataProvider::overrideOptionType(action, f.getType(), l, type_hash, k);
            return;
        }

        # update field
        QoreDataField qdf = cast<QoreDataField>(f);
        hash<auto> info += qdf.getConfigInfo();

        AbstractDataProviderType type;

        *bool req = remove type_hash.required;
        if (exists (auto tdesc = remove type_hash.type)) {
            type = TypeScriptActionInterface::getType(tdesc, req ?? info.attr.required ?? qdf.isMandatory());
        }
        info += TypeScriptActionInterface::getFieldHash(info.name, qdf.getType(), \type_hash, req);
        if (type_hash) {
            throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y cannot override field %y in %y with unknown "
                "keys: %y", action.app, action.action, key, k, keys type_hash);
        }
        on_error printf("%y info: %N\n", key, info + {"type": info.type.getName()});
        t.replaceField(new QoreDataField(info));

        #printf("Edited %y => %y mandatory: %y attr: %y av: %y (parent %y)\n", key, fields{key}.getType().className(),
        #    fields{key}.isMandatory(), info.attr, fields{key}.getAllowedValues(), type.className());
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
            *RestClient rest = prov.tryGetRestClient();
            if (!rest) {
                prov.setRestClient(rest = conn.get());
            }
            if (req && req.typeCode() == NT_HASH) {
                checkUpdateRestOptions(rest, req);
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
            debug("Action options for action %y: %y reqmap: %y", getName(), req, reqmap);
            map fixOptimizedValue(\req0, $1.value, $1.key, remove req{$1.key}), reqmap.pairIterator(),
                req.hasKey($1.key);
            map req0{$1.key} = $1.value, req.pairIterator(), !req0.hasKey($1.key);
            req = req0;
            debug("REST request for action %y: %y", getName(), req);

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
