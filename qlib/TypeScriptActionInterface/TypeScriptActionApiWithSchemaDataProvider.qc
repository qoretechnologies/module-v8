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
public class TypeScriptActionApiWithSchemaDataProvider inherits TypeScriptActionApiDataProvider {
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
        #! Optional Swagger schema label
        *string swagger_schema;

        #! Swagger path
        string swagger_path;

        #! API data provider
        SwaggerRequestDataProvider prov;

        #! Path vars
        *hash<string, bool> path_vars;

        #! Independent path vars
        *hash<string, bool> independent_path_vars;

        #! Info on flattened response types: top-level key -> actual location
        #hash<string, list<string>> resmap;

        #! If the response only has a body key
        bool res_only_body;

        #! Connection to Swagger path option map
        *hash<string, string> conn_opt_map;

        #! Query option set
        *hash<string, bool> query_set;

        #! Request type created?
        bool request_type_done;

        #! Response type created?
        bool response_type_done;

        #! Saved option override info
        *hash<auto> override_options_save;

        #! Saved action attributes
        *hash<auto> action_save;

        #! Request key for static request info
        string request_key;

        #! Code to convert the request data given by the user to the request data required by the API
        *hash<AsyncCallInfo> request_data_converter;

        #! Code to convert the response data provided by the API to the response data for the user
        *hash<AsyncCallInfo> response_data_converter;

        #! Global request type info per action for dynamic types: app-action -> type info
        static hash<string, AbstractDataProviderType> grtmap;

        #! Info on flattened request types: request key -> top-level key -> actual location
        static hash<string, *hash<string, list<string>>> reqmap;

        #! Reverse map for flattened request types: request key -> dotted location -> top-level key
        static hash<string, *hash<string, string>> rreqmap;

        #! Mutex for global request type info
        static Mutex gtlock();
    }

    #! Creates the object from the arguments
    constructor(reference<hash<auto>> action, string swagger_path, *hash<AsyncCallInfo> api,
            *hash<string, bool> path_vars, *hash<string, bool> independent_path_vars,
            *hash<string, string> conn_opt_map, *hash<auto> override_options, ActionFunctionContext fctx,
            *hash<AsyncCallInfo> get_dynamic_request_type, *hash<AsyncCallInfo> get_dynamic_response_type,
            *hash<AsyncCallInfo> request_data_converter, *hash<AsyncCallInfo> response_data_converter,
            *AbstractDataProviderType request_type, *AbstractDataProviderType response_type)
            : TypeScriptActionApiDataProvider(action.action, api, fctx, get_dynamic_request_type,
            get_dynamic_response_type) {
        self.swagger_schema = remove action.swagger_schema;
        swagger_path =~ s/^\///;
        self.swagger_path = swagger_path;
        self.path_vars = path_vars;
        self.conn_opt_map = conn_opt_map;
        self.request_data_converter = request_data_converter;
        self.response_data_converter = response_data_converter;
        if (conn_opt_map) {
            query_set = map {$1: True}, conn_opt_map.iterator();
        }
        # if we need to override options, we do it now, so that action options reflect the requested changes
        if (override_options) {
            action_save = action;
            override_options_save = override_options;
            # remove options, as they will be processed on demand
            action -= "options";
            action.get_dynamic_options = sub (reference<hash<DataProviderActionInfo>> info) {
                if (!request_type_done) {
                    NoIoHelper nih();
                    createRequestType();
                }
                info += action_save;
                if (request_type_info.type && (*hash<string, AbstractDataField> fields =
                    request_type_info.type.getFields())) {
                    info.options = DataProviderActionCatalog::getActionOptionFromFields(fields);
                }
            };
        }
        if (request_type) {
            if (override_options) {
                throw "ACTION-ERROR", sprintf("@%s/%s: Cannot provide a request type and override options in the "
                    "same action", action.app, action.action);
            }
            if (get_dynamic_request_type) {
                throw "ACTION-ERROR", sprintf("@%s/%s: Cannot provide a request type and a "
                    "`get_dynamic_request_type()` function in the same action", action.app, action.action);
            }
            request_type_done = True;
            string key = sprintf("%s-%s", action.app, action.action);
            request_type_info.type = grtmap{key} = request_type;
        }
        if (response_type) {
            if (get_dynamic_response_type) {
                throw "ACTION-ERROR", sprintf("@%s/%s: Cannot provide a response type and a "
                    "`get_dynamic_response_type()` function in the same action", action.app, action.action);
            }
            response_type_done = True;
            response_type_info.type = response_type;
        }
    }

    #! Initialize data provider if necessary
    init() {
        if (override_options_save && !request_type_done) {
            NoIoHelper nih();
            createRequestType();
        }
    }

    # returns True if a dynamic type was generated
    static *bool overrideOptionType(string path, hash<auto> action, AbstractDataProviderType type, list<string> l,
            *hash<auto> type_hash, string k, *ActionFunctionContext fctx) {
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
            f = new QoreDataField({
                "name": key,
                "type": new HashDataType(),
            });
            t.addField(f);
        } else if (!(f instanceof QoreDataField)) {
            throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y cannot override field %y in %y of class %y; "
                "expecting \"QoreDataField\"", action.app, action.action, key, k, f.className());
        }
        if (l) {
            AbstractDataProviderType ftype = f.getType();
            *bool rv = overrideOptionType(path, action, ftype, l, type_hash, k, fctx);
            if (rv && !ftype.getTags().dynamic) {
                ftype.setDynamicTag();
            }
            return rv;
        }

        # update field
        QoreDataField qdf = cast<QoreDataField>(f);
        hash<auto> info += qdf.getConfigInfo();
        # make sure and save "attr"
        *hash<auto> attr = info.attr;

        AbstractDataProviderType type;

        *bool req = remove type_hash.required;
        if (exists (auto tdesc = remove type_hash.type)) {
            type = TypeScriptActionInterface::getType(path, tdesc, req ?? info.attr.required ?? qdf.isMandatory(),
                NOTHING, fctx);
        } else if (exists req) {
            type = qdf.getType();
            if (req) {
                if (type.isOrNothingType()) {
                    type = type.getMandatoryType();
                }
            } else {
                if (type.isMandatory()) {
                    type = type.getOrNothingType();
                }
            }
        }

        info += TypeScriptActionInterface::getFieldHash(path, info.name, type ?? qdf.getType(), \type_hash, req,
            fctx);
        if (attr) {
            info.attr += attr;
        }
        #printf("Editing %y -> %y\n", key, info);

        if (type_hash) {
            throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y cannot override field %y in %y with unknown "
                "keys: %y", action.app, action.action, key, k, keys type_hash);
        }
        on_error printf("%y info: %N\n", key, info + {"type": info.type.getName()});
        t.addOrReplaceField(new TypeScriptDataField(info, fctx));
        #printf("Edited %y (%s) => %y mandatory: %y av: %y (parent %y)\n", key, t.getFields(){key}.uniqueHash(),
        #    t.getFields(){key}.getType().className(), t.getFields(){key}.isMandatory(),
        #    t.getFields(){key}.getAllowedValues(), t.className());
        if (info.attr.dynamic) {
            t.setDynamicTag();
        }
        return info.attr.dynamic;
    }

    #! "Normalizes" the request and response for testing if necessary
    auto makeNormalizedRequest(auto req, *hash<auto> request_options) {
        if (!request_type_done) {
            NoIoHelper nih();
            createRequestType();
        }
        if (reqmap{request_key} && req) {
            hash<auto> req0;
            map req0{$1.key} = $1.value, (
                map findNormalizedValue(req, $1.value, $1.key), reqmap{request_key}.pairIterator()
            ), $1;
            map remove req{$1[0]}, reqmap{request_key}.iterator();
            map req0{$1.key} = $1.value, req.pairIterator(), !exists req0{$1.key};
            req = req0;
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

        @throw INVALID-OPERATION the data provider does not support the request API
        @throw INVALID-REQUEST the request argument provided do not match the expected request type
    */
    auto doRequest(auto req, *hash<auto> request_options) {
        DataProviderContextHelper apch(self);
        return TypeScriptActionApiDataProvider::doRequest(req, request_options);
    }

    #! Returns action options corresponding to the request type with the given request data, if possible
    /** @param req sample request data that can be used to determine the final type

        @return action options corresponding to the request type

        @note This API is meant to provide information about request data types that can depend on the call data
    */
    *hash<string, hash<ActionOptionInfo>> tryGetActionOptionsFromRequestTypeWithData(auto req) {
        DataProviderContextHelper apch(self);
        return TypeScriptActionApiDataProvider::tryGetActionOptionsFromRequestTypeWithData(req);
    }

    private overrideOptions(HashDataType type) {
        *hash<string, AbstractDataField> fields = type.getFields();
        foreach hash<auto> i in (override_options_save.pairIterator()) {
            # find option to update
            string k = rreqmap{request_key}{i.key} ?? i.key;
            list<string> l = k.split(".");
            string key = l[0];

            on_error rethrow $1.err, sprintf("%s (while processing option %y in %y)", $1.desc, key, i.key);

            *AbstractDataField f = fields{key};
            hash<auto> opt;
            if (!f) {
                TypeScriptActionInterface::getOptionFunctions(\action_save, self, i.key, \i.value, True);
                if (l.size() > 1) {
                    overrideOptionType("option", type, l, i.value, k);
                    continue;
                }

                type.addField(TypeScriptActionInterface::getField("option", key, i.value, self));
                if (i.value.depends_on) {
                    TypeScriptActionInterface::checkFieldDependencies(type);
                }
                if (i.value_depends_on) {
                    depmap{key} = map {$1: True}, i.value.depends_on;
                }
                if (prov.op.method != "GET") {
                    reqmap{request_key}{key} = ("body",);
                    rreqmap{request_key}{"body." + key} = key;
                } else {
                    reqmap{request_key}{key} = ("query",);
                    rreqmap{request_key}{"query." + key} = key;
                }
            } else {
                if (!(f instanceof QoreDataField)) {
                    throw "OPTION-OVERRIDE-ERROR", sprintf("App %y action %y option %y: cannot override %s; "
                        "expecting \"QoreDataField\"", action_save.app, action_save.action, key, f.className());
                }
                if (l.size() == 1) {
                    TypeScriptActionInterface::getOptionFunctions(\action_save, self, i.key, \i.value, True);
                }
                overrideOptionType("option", type, l, i.value, k);
                if (l.size() == 1 && (*list<auto> dl = i.value.depends_on)) {
                    depmap{l[0]} = map {$1: True}, dl;
                }
            }
        }
    }

    private overrideOptionType(string path, AbstractDataProviderType type, list<string> l, hash<auto> type_hash, string k) {
        TypeScriptActionApiWithSchemaDataProvider::overrideOptionType(path, action_save, type, l, type_hash, k, self);
    }

    #! Returns the request type for this API
    /** @return the request type for this API
    */
    private *DataProvider::AbstractDataProviderType getRequestTypeImpl() {
        if (!request_type_done) {
            createRequestType();
        }
        return request_type_info.type;
    }

    #! Returns the response type for this API
    /** @return the response type for this API
    */
    private *DataProvider::AbstractDataProviderType getResponseTypeImpl() {
        if (!response_type_done) {
            createResponseType();
        }
        return response_type_info.type;
    }

    #! Creates the request type for this API
    private createRequestType() {
        if (request_type_done) {
            return;
        }
        request_type_done = True;

        checkDataProvider();

        # get type key
        request_key = sprintf("%s-%s", app, action);

        # check global map unlocked
        request_type_info.type = grtmap{request_key};
        if (!request_type_info.type) {
            # check again in the lock
            gtlock.lock();
            on_exit gtlock.unlock();

            request_type_info.type = grtmap{request_key};
            if (!request_type_info.type) {
                createRequestTypeIntern();
                return;
            }
        }
    }

    #! Creates the request type for this API
    private createRequestTypeIntern() {
        request_type_info.type = prov.getRequestType();

        if (request_type_info.type && (*hash<string, AbstractDataField> fields = request_type_info.type.getFields())) {
            HashDataType newreq;
            code check = sub (hash<string, AbstractDataField> fields, string key) {
                list<string> l = (key,);
                while (fields.size() == 1
                    && (*hash<string, AbstractDataField> f = fields.firstValue().getType().getFields())) {
                    l += fields.firstKey();
                    fields = f;
                }
                if (!newreq) {
                    newreq = new HashDataType(request_type_info.type.isOrNothingType() ? AutoHashOrNothingType : AutoHashType,
                        request_type_info.type.getName(), fields);
                } else if (fields) {
                    map newreq.addField($1), (fields = fields - (keys newreq.getFields())).iterator();
                }
                map reqmap{request_key}{$1} = l, keys fields;
                map rreqmap{request_key}{l.join(".") + ("." + $1)} = $1, keys fields;
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
                request_type_info.type = newreq;
                fields = request_type_info.type.getFields();
            }
        }

        if (path_vars) {
            hash<string, AbstractDataField> fields = map {$1: new TypeScriptDataField({
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

            if (request_type_info.type) {
                if (!(request_type_info.type instanceof HashDataType)) {
                    string fname = "data";
                    int i;
                    while (path_vars{fname}) {
                        fname = sprintf("data-%d", ++i);
                    }
                    fields{fname} = new TypeScriptDataField({
                        "name": fname,
                        "type": request_type_info.type,
                        "desc": "API request type",
                    });
                } else {
                    # NOTE: here we assume that any fields in the request type with the same name as a path var
                    # represent the same value
                    fields += request_type_info.type.getFields() - keys path_vars;
                }
            }
            request_type_info.type = new HashDataType(AutoHashType, "RestRequestType", fields);
        }

        # allow options to be updated
        if (override_options_save) {
            if (!request_type_info.type) {
                bool required = True;
                foreach hash<auto> v in (override_options_save.iterator()) {
                    if (!v.required) {
                        required = False;
                        break;
                    }
                }
                request_type_info.type = new HashDataType(required ? AutoHashType : AutoHashOrNothingType);
            } else if (!(request_type_info.type instanceof HashDataType)) {
                throw "ACTION-ERROR", sprintf("Cannot override options of app %y action %y with non-hash "
                    "request type %y", action_save.app, action_save.action, request_type_info.type.getName());
            }
            overrideOptions(cast<HashDataType>(request_type_info.type));
            if (!prov.op.consumes) {
                prov.op.consumes{MimeTypeJson} = True;
            }
            prov.disableRequestTypeCheck();
        }

        if (request_type_info.type && (*hash<string, AbstractDataField> fields = request_type_info.type.getFields())) {
            NoIoHelper nih();
            action_save.options = DataProviderActionCatalog::getActionOptionFromFields(fields);
            TypeScriptActionInterface::sortOptions({"name": action_save.app}, action_save, \action_save.options);

            if (depmap) {
                foreach hash<auto> i in (action_save.options.pairIterator()) {
                    if (path_vars{i.key}) {
                        if (*hash<auto> deps = depmap{i.key}) {
                            action_save.options{i.key}.depends_on = keys deps;
                        }
                    } else {
                        *hash<string, bool> dp = map {$1: True}, keys path_vars;
                        map dp{$1} = True, action_save.options{i.key}.depends_on;
                        if (dp) {
                            action_save.options{i.key}.depends_on = keys dp;
                        }
                    }
                }
            }
        }

        grtmap{request_key} = request_type_info.type;
    }

    #! Creates the response type for this API
    private createResponseType() {
        if (response_type_done) {
            return;
        }
        response_type_done = True;
        checkDataProvider();
        response_type_info.type = prov.getResponseType();
        if (response_type_info.type && (*hash<string, AbstractDataField> fields = response_type_info.type.getFields())
            && fields.size() == 1 && fields.body) {
            res_only_body = True;
            response_type_info.type = fields.body.getType();
        }
    }

    AbstractDataProvider checkDataProvider() {
        if (!prov) {
            on_error rethrow $1.err, sprintf("Error setting data provider from app %y action %y: %s (Swagger "
                "path: %y)", app, action, $1.desc, swagger_path);

            AbstractDataProvider p = TypeScriptActionInterface::getSwaggerDataProvider(app, swagger_schema)
                .getChildProviderPath(swagger_path);
            if (!(p instanceof SwaggerRequestDataProvider)) {
                throw "ACTION-ERROR", sprintf("App %y action %y: Swagger path %y is not an API endpoint (%s -> %y)", app,
                    action, swagger_path, p.className(), p.getChildProviderNames());
            }
            prov = cast<SwaggerRequestDataProvider>(p);
        }
        return prov;
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

            return findNormalizedValue(nr, p, k, offset + 1);
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
            return makeSwaggerRequest(req, request_options);
        }
        if (path_vars) {
            request_options.path_vars = remove req{keys path_vars};
            if (conn_opt_map) {
                *hash<auto> opts = conn.getRealOptions();
                map request_options.path_vars{$1.value} = opts{$1.key}, conn_opt_map.pairIterator(),
                    path_vars{$1.value};
            }
        }
        map fixOptimizedValue(\req, $1.value, remove req{$1.key}, $1.key), reqmap{request_key}.pairIterator(),
            req.hasKey($1.key);
        return getAsyncValue(api, req, request_options, getCallContextInfo());
    }

    #! Makes a request and returns the response
    /** @param req the request to serialize and make according to the request type
        @param request_options the request options; will be processed by validateRequestOptions()

        @return the response to the request
    */
    private auto makeSwaggerRequest(auto req, *hash<auto> request_options) {
        checkDataProvider();
        # *always* replace the RestClient with each call; it can have outdated auth info
        prov.setRestClient(rest = conn.get());
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
        debug("Action options for action %y: %y reqmap: %y", getName(), req, reqmap{request_key});
        map fixOptimizedValue(\req0, $1.value, $1.key, remove req{$1.key}), reqmap{request_key}.pairIterator(),
            req.hasKey($1.key);
        map req0{$1.key} = $1.value, req.pairIterator(), !req0.hasKey($1.key);
        req = req0;
        debug("REST request for action %y: %y", getName(), req);

        *hash<DataContextInfo> ctxinfo;
        if (request_data_converter) {
            ctxinfo = getCallContextInfo();
            req = getAsyncValue(request_data_converter, req, ctxinfo);
            debug("REST request for action after conversion %y: %y", getName(), req);
        }

        auto rv = prov.doRequest(req, request_options +
            (response_data_converter
                ? {"include_response_headers": True}
                : NOTHING
            )
        );
        if (response_data_converter) {
            if (!ctxinfo) {
                ctxinfo = getCallContextInfo();
            }
            rv = getAsyncValue(response_data_converter, rv, ctxinfo);
            debug("REST response for action after conversion %y: %y", getName(), rv);
        }
        return res_only_body ? rv.body : rv;
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
            fixOptimizedValue(\req{p[offset]}, p, k, val, offset + 1);
        }
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}

namespace Priv {
class ActionProviderContextHelper {
    static *TypeScriptActionDataProviderBase get() {
        *AbstractDataProvider prov = DataProviderContextHelper::get();
        if (prov && (prov instanceof TypeScriptActionDataProviderBase)) {
            return cast<TypeScriptActionDataProviderBase>(prov);
        } else if (prov) {
            TSAI::info("IGNORING %y", prov.className());
        }
    }
}
}