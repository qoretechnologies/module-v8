# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionInterface.qc Copyright 2024 Qore Technologies, s.r.o.

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
#! Async call info
public hashdecl AsyncCallInfo {
    #! Label for the call
    string label;

    #! Javascript program pool
    JavaScriptProgramPool pool;

    #! Call to make
    code async_call;

    #! Timeout
    date to;
}

#! Interface class
public class TypeScriptActionInterface {
    public {
        static hash<string, code> Api = TypeScriptActionInterface::getInterface();

        static hash<string, code> TestApi = TypeScriptActionInterface::getTestInterface();

        static TypeScriptActionRootDataProvider root();

        const TypeKeys = (
            "name", "display_name", "short_desc", "desc", "type", "example_value",
            "default_value", "allowed_values", "attr", "required"
        );

        const TypeScriptAppRestConnectionOptions = RestConnection::ConnectionScheme.options;

        #! This provides all supported REST connection option names
        const TypeScriptAppRestOptionKeys = (
            "content_encoding",
            "data",
            "disable_automatic_pings",
            "encode_chars",
            "headers",
            "oauth2_auth_args",
            "oauth2_auth_url",
            "oauth2_auto_refresh",
            "oauth2_client_id",
            "oauth2_client_secret",
            "oauth2_grant_type",
            "oauth2_redirect_url",
            "oauth2_refresh_token",
            "oauth2_scopes",
            "oauth2_token_args",
            "oauth2_token_url",
            "password",
            "ping_method",
            "ping_headers",
            "ping_body",
            "proxy",
            "ssl_cert_data",
            "ssl_key_data",
            "ssl_verify_cert",
            "token",
            "token_type",
            "username",
        );

        #! Default I/O timeout in seconds
        const DefaultIoTimeoutSecs = 30;
    }

    private {
        #! Maps from scheme names to apps
        static hash<string, string> samap;

        #! Maps from app names to REST getOptions
        static hash<string, hash<auto>> armap;

        #! Maps from app names to Swagger schemas
        static hash<string, SwaggerSchema> app_swagger_map;

        #! Maps from app names to REST template options; app -> option -> True
        static hash<string, hash<string, bool>> atmap;

        #! Maps from app names to default URL
        static hash<string, string> aumap;

        #! Maps from app names to connection post-auth functions
        static hash<string, hash<AsyncCallInfo>> app_post_auth_map;

        #! Maps from app names to connection -> Swagger path option maps
        static hash<string, hash<string, string>> app_conn_opt_map;

        #! Connection map for testing
        static hash<string, TypeScriptAppRestConnection> cmap;
    }

    static registerApp(JavaScriptObject app) {
        JavaScriptProgram pgm = app.getProgram();
        JavaScriptProgramPool pool;
        bool first;
        {
            on_error rethrow "APP-ERROR", sprintf("Error registering app %y: %s", app.name, $1.desc);
            pool = JavaScriptProgramPool::getPool(pgm, \first);
        }
        if (first) {
            TypeScriptActionInterface::registerApp(app.toData(), pool);
        }
    }

    static registerAction(JavaScriptObject action) {
        JavaScriptProgram pgm = action.getProgram();
        JavaScriptProgramPool pool;
        bool first;
        {
            on_error rethrow "ACTION-ERROR", sprintf("Error registering app %y action %y: %s",
                action.app, action.action, $1.desc);
            pool = JavaScriptProgramPool::getPool(pgm, \first);
        }
        if (first) {
            TypeScriptActionInterface::registerAction(action.toData(), pool);
        }
    }

    static registerApp(hash<auto> app, JavaScriptProgramPool pool) {
        if (app.name =~ / /) {
            throw "APP-ERROR", sprintf("App name %y is invalid; it contains one or more spaces", app.name);
        }
        on_error printf("%s\n", get_exception_string($1));
        SwaggerSchema schema;
        if ((*string swagger_loc = remove app.swagger).val()) {
            *hash<auto> swagger_opts = remove app.swagger_options;
            schema = SwaggerLoader::fromString(FileLocationHandler::getTextFileFromLocation(swagger_loc), NOTHING,
                swagger_opts);
        }
        hash<auto> app0 += app;
        if (app.logo) {
            app0.logo = parse_base64_string(app.logo);
        }
        string appname = app.name.lwr();
        hash<string, bool> url_template_options;
        if (*hash<auto> rest = remove app0.rest) {
            string sname = "tsrest-" + app.name.lwr();

            *string url = remove rest.url;
            if (url =~ /^https?:\/\//) {
                url = regex_subst(url, "^https?", sname);
            }

            hash<string, hash<ConnectionOptionInfo>> opts = TypeScriptAppRestConnectionOptions;
            foreach hash<auto> i in (rest.pairIterator()) {
                if (!opts{i.key}) {
                    throw "TYPESCRIPT-REST-OPTION-ERROR", sprintf("Unknown REST connection option %y; known "
                        "options: %y", i.key, keys opts);
                }
                if (exists i.value) {
                    opts{i.key}.default_value = i.value;
                }
            }
            *string required_options;
            hash<AsyncCallInfo> post_auth;
            hash<string, string> conn_opt_map;
            if (*hash<auto> rest_modifiers = remove app0.rest_modifiers) {
                foreach hash<auto> i in (rest_modifiers.options.pairIterator()) {
                    if (i.value.allowed_values) {
                        i.value.allowed_values = map cast<hash<AllowedValueInfo>>($1), i.value.allowed_values;
                    }
                    opts{i.key} = cast<hash<ConnectionOptionInfo>>(i.value);
                }
                if (rest_modifiers.required_options.val()) {
                    required_options = rest_modifiers.required_options;
                }
                if (rest_modifiers.set_options_post_auth.val()) {
                    if (!rest_modifiers.set_options_post_auth.callp()) {
                        throw "REST-MODIFIER-ERROR", sprintf("The 'set_options_post_auth' REST modifier option must "
                            "be a callable value; got type %y instead",
                            rest_modifiers.set_options_post_auth.fullType());
                    }
                    post_auth = <AsyncCallInfo>{
                        "label": sprintf("REST post-auth option function for app %y", app.name),
                        "pool": pool,
                        "async_call": rest_modifiers.set_options_post_auth,
                        "to": seconds(remove rest_modifiers.io_timeout_secs ?? DefaultIoTimeoutSecs),
                    };
                }
                if (rest_modifiers.conn_option_map) {
                    conn_opt_map = cast<hash<string, string>>(rest_modifiers.conn_option_map);
                }
                if (rest_modifiers.url_template_options) {
                    url_template_options = map {$1: True}, rest_modifiers.url_template_options;
                }
            }
            hash<ConnectionSchemeInfo> scheme = <ConnectionSchemeInfo>{
                "display_name": app.display_name,
                "short_desc": app.short_desc,
                "desc": app.desc,
                "cls": Class::forName("TypeScriptAppRestConnection"),
                "schemes": {
                    sname: True,
                },
                "base_scheme_map": {
                    "https": sname,
                },
                "options": opts,
                "required_options": required_options,
                "auto_url": exists url,
            };
            ConnectionSchemeCache::registerScheme(sname, scheme);
            samap{sname} = app.name;
            armap{appname} = map {$1.key: $1.value}, rest{TypeScriptAppRestOptionKeys}.pairIterator(), exists $1.value;
            app0.scheme = sname;
            if (exists url) {
                aumap{appname} = url;
            }
            if (post_auth) {
                app_post_auth_map{appname} = post_auth;
            }
            if (conn_opt_map) {
                app_conn_opt_map{appname} = conn_opt_map;
            }
        }
        DataProviderActionCatalog::registerApp(cast<hash<DataProviderAppInfo>>(app0));
        if (schema) {
            app_swagger_map{appname} = schema;
        }
        if (url_template_options) {
            atmap{appname} = url_template_options;
        }
    }

    static registerAction(hash<auto> action, JavaScriptProgramPool pool) {
        on_error printf("%s\n", get_exception_string($1));

        on_error rethrow $1.err, sprintf("%s (while registering action %y for app %y)", $1.desc, action.action,
            action.app);
        TypeScriptActionInterface::generateDataProvider(\action, pool);
        DataProviderActionCatalog::registerAction(cast<hash<DataProviderActionInfo>>(action));
    }

    #! Returns the path to the data provider
    static generateDataProvider(reference<hash<auto>> action, JavaScriptProgramPool pool) {
        hash<DataProviderAppInfo> app;
        {
            on_error rethrow "TYPESCRIPT-ACTION-ERROR", sprintf("Error registering action %y: %s: %s", action.action,
                $1.err, $1.desc);
            app = DataProviderActionCatalog::getAppEx(action.app);
        }
        *SwaggerSchema schema = app_swagger_map{action.app.lwr()};

        switch (action.action_code) {
            case DPAT_API: {
                TypeScriptActionInterface::generateApiDataProvider(app, \action, pool, schema);
                break;
            }

            default:
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y action_code: %y is unsupported",
                    action.app, action.action, action.action_code);
        }
    }

    static generateApiDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        hash<AsyncCallInfo> api;
        {
            auto api_function = remove action.api_function;
            if (!api_function.callp() && !schema) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"api_function\" "
                    "attribute; got type %y; expecting a callable value", action.app, action.action,
                    api_function.fullType());
            }
            timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);
            if (api_function) {
                api = <AsyncCallInfo>{
                    "label": sprintf("API function for app %y action %y", app.name, action.action),
                    "pool": pool,
                    "async_call": api_function,
                    "to": seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs),
                };
            }
        }

        TypeScriptActionApiDataProvider child;
        if ((*string swagger_path = remove action.swagger_path).val()) {
            if (!schema) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"swagger_path\" "
                    "attribute %y; this attribute can only been used when the application declares a Swagger schema",
                    action.app, action.action, swagger_path);
            }

            # check for path vars
            *hash<string, bool> path_vars = map {$1: True}, (swagger_path =~ x/\{([^\}]*)}/g);
            child = new TypeScriptActionApiWithSchemaDataProvider(action.action, schema, swagger_path, api,
                path_vars, app_conn_opt_map{app.name.lwr()});

            if ((*AbstractDataProviderType t = child.getRequestType())
                && (*hash<string, AbstractDataField> fields = t.getFields())) {
                action.options = DataProviderActionCatalog::getActionOptionFromFields(fields);
            }
            action.output_type = child.getResponseType();
            if (remove action.request_type) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"request_type\" property; "
                    "this property cannot be defined when \"swagger_path\" (%y) is also defined for the action",
                    action.app, action.action, swagger_path);

            }
            if (remove action.response_type) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"response_type\" "
                    "property; this property cannot be defined when \"swagger_path\" (%y) is also defined for the "
                    "action", action.app, action.action, swagger_path);
            }
        } else {
            # maps from options to "get_allowed_values" code for each option
            hash<string, hash<AsyncCallInfo>> omap;
            # maps from options to "get_dependent_options" code for each option
            hash<string, hash<AsyncCallInfo>> dmap;
            *AbstractDataProviderType request_type;
            if (*hash<auto> opts = remove action.options) {
                request_type = TypeScriptActionInterface::getType(map {$1.key: $1.value{TypeKeys}},
                    opts.pairIterator());
                action.options = TypeScriptActionInterface::getOptions(app, \action, opts, \omap, \dmap, pool);
            }

            *AbstractDataProviderType response_type;
            if (action.response_type.val()) {
                response_type = TypeScriptActionInterface::getType(remove action.response_type);
                action.output_type = response_type;
            } else if (action.hasKey("response_type")) {
                remove action.response_type;
            }

            child = new TypeScriptActionApiDataProvider(action.action, api, request_type, response_type, omap,
                dmap);
        }

        TypeScriptActionAppDataProvider prov = TypeScriptActionInterface::getAppDataProvider(action.app);
        prov.registerChild(action.action, child);

        action.path = action.action;
    }

    static TypeScriptActionAppDataProvider getAppDataProvider(string app) {
        string appname = app.lwr();
        if (*AbstractDataProvider app_prov = root.getChildProvider(appname)) {
            return cast<TypeScriptActionAppDataProvider>(app_prov);
        }
        TypeScriptActionAppDataProvider prov(appname);
        root.registerChild(appname, prov);
        return prov;
    }

    static TypeScriptActionAppDataProvider getDataProvider(string app, TypeScriptAppRestConnection conn) {
        TypeScriptActionAppDataProvider rv = cast<TypeScriptActionAppDataProvider>(root.getChildProviderEx(app));
        rv = rv.copy();
        rv.setConnection(conn);
        return rv;
    }

    static *hash<string, hash<ActionOptionInfo>> getOptions(hash<DataProviderAppInfo> app,
            reference<hash<auto>> action, hash<auto> opts, reference<hash<string, hash<AsyncCallInfo>>> omap,
            reference<hash<string, hash<AsyncCallInfo>>> dmap, JavaScriptProgramPool pool) {
        hash<string, hash<ActionOptionInfo>> rv;
        foreach hash<auto> i in (opts.pairIterator()) {
            on_error rethrow $1.err, sprintf("%s (while processing option %y)", $1.desc, i.key);
            date io_timeout = seconds(remove i.value.io_timeout_secs ?? DefaultIoTimeoutSecs);
            if (exists (auto get_allowed_values = remove i.value.get_allowed_values)) {
                if (!get_allowed_values.callp()) {
                    throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                        "\"get_allowed_values\" attribute; got type %y; expecting a callable value", action.app,
                        action.action, i.key, get_allowed_values.fullType());
                }
                omap{i.key} = <AsyncCallInfo>{
                    "label": sprintf("Reference data function for app %y action %y option %y", app.name,
                        action.action, i.key),
                    "pool": pool,
                    "async_call": get_allowed_values,
                    "to": io_timeout,
                };
                i.value.ref_data = i.key;
            }
            if (exists (auto get_dependent_options = remove i.value.get_dependent_options)) {
                if (!get_dependent_options.callp()) {
                    throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                        "\"get_dependent_options\" attribute; got type %y; expecting a callable value", action.app,
                        action.action, i.key, get_dependent_options.fullType());
                }
                dmap{i.key} = <AsyncCallInfo>{
                    "label": sprintf("Dependent option function for app %y action %y option %y", app.name,
                        action.action, i.key),
                    "pool": pool,
                    "async_call": get_dependent_options,
                    "to": io_timeout,
                };
                action.data_dependent_options = True;
            }
            if (i.value.required && !i.value.preselected && !exists i.value.default_value) {
                i.value.preselected = True;
            }
            rv{i.key} = TypeScriptActionInterface::getOptionInfo(i.value);
            if (dmap{i.key}) {
                rv{i.key}.structural_determinate = True;
            }
        }
        return rv;
    }

    static hash<ActionOptionInfo> getOptionInfo(hash<auto> opt) {
        opt.type = TypeScriptActionInterface::getType(opt.type, opt.required);
        if (opt.allowed_values) {
            opt.allowed_values = map cast<hash<AllowedValueInfo>>($1), opt.allowed_values;
        }
        return cast<hash<ActionOptionInfo>>(opt);
    }

    static AbstractDataProviderType getType(string name, *bool required) {
        if (!required) {
            if (name !~ /^\*/) {
                name = "*" + name;
            }
        } else if (name =~ /^\*/) {
            throw "TYPE-ERROR", sprintf("Cannot use an \"or-nothing\" type like %y when \"required\" is set; use "
                "type %y instead", name, name[1..]);
        }
        *AbstractDataProviderType type = AbstractDataProviderTypeMap{name};
        if (!type) {
            throw "TYPE-ERROR", sprintf("Cannot match type %y to a known Qore type", name);
        }
        return type;
    }

    static AbstractDataProviderType getType(hash<auto> h, *bool required) {
        on_error rethrow $1.err, sprintf("%s (type: %y)", $1.desc, h);
        HashDataType type(required ? AutoHashType : AutoHashOrNothingType);
        list<hash<auto>> dependent_fields;
        if (exists (auto dps = remove h.dependent_fields)) {
            if (dps.typeCode() != NT_LIST) {
                throw "TYPE-ERROR", sprintf("\"dependent_fields\" must be a list; got type %y instead",
                    dps.fullType());
            }
            dependent_fields = dps;
        }
        type.addQoreFields(map {$1.key: TypeScriptActionInterface::getField($1.key, $1.value)}, h.pairIterator());

        # add dependent fields
        foreach auto dp in (dependent_fields) {
            if (dp.typeCode() != NT_HASH) {
                throw "TYPE-ERROR", sprintf("Each element of \"dependent_fields\" must be a hash; got type %y "
                    "instead", dp.fullType());
            }
            if (dp.fields.typeCode() != NT_HASH) {
                throw "TYPE-ERROR", sprintf("Each element of \"dependent_fields\" have a \"fields\" key with type "
                    "\"hash\"; element %d has type %y", $# + 1, dp.fields.fullType());
            }
            hash<string, QoreDataField> fields = map {$1.key: new QoreDataField({"name": $1.key} + $1.value)},
                dp.fields.pairIterator();
            type.addDependentFields(dp.value, fields);
        }

        return type;
    }

    static AbstractDataProviderType getType(auto v) {
        throw "TYPE-ERROR", sprintf("Expecting \"string\" or \"hash\" for the option \"type\"; got %y "
            "instead", v.fullType());
    }

    static hash<auto> getField(string name, hash<auto> h) {
        on_error rethrow $1.err, sprintf("%s (field: %y)", $1.desc, h);
        h.name = name;
        h.type = TypeScriptActionInterface::getType(h.type, h.required);
        return h;
    }

    #! Returns a hash that can be used to access these methods in JavaScript
    static hash<string, code> getInterface() {
        return {
            "registerApp": \TypeScriptActionInterface::registerApp(),
            "registerAction": \TypeScriptActionInterface::registerAction(),
        };
    }

    #! Returns a hash that can be used to access these methods in JavaScript
    static hash<string, code> getTestInterface() {
        return {
            "createConnection": \TypeScriptActionInterface::createConnection(),
            "execAppAction": \TypeScriptActionInterface::execAppAction(),
        };
    }

    #! Creates a connection for the given app
    static string createConnection(string app, JavaScriptObject opts) {
        return TypeScriptActionInterface::createConnection(app, opts.toData());
    }

    #! Creates a connection for the given app
    static string createConnection(string app, *hash<auto> opts) {
        if (!opts.name.val()) {
            opts.name = sprintf("app-%s", get_random_string());
        }
        if (!opts.url.val()) {
            opts.url = sprintf("tsrest-%s://", app);
        }
        if (cmap{opts.name}) {
            throw "TYPESCRIPT-CONNECTION-ERROR", sprintf("Duplicate connection name %y", opts.name);
        }
        TypeScriptAppRestConnection conn(opts);
        cmap{opts.name} = conn;
        return opts.name;
    }

    #! Returns the connection object created with createConnection()
    static AbstractConnection getConnection(string name) {
        if (*AbstractConnection rv = cmap{name}) {
            return rv;
        }
        throw "TYPESCRIPT-CONNECTION-ERROR", sprintf("No connection %y is available", name);
    }

    #! Executes the given app action with the given arguments
    static auto execAppAction(string app, string action, string connection, *JavaScriptObject opts,
            *JavaScriptObject request_options, *bool silent) {
        on_error if (!silent) {
            printf("%s\n", get_exception_string($1));
        }
        return TypeScriptActionInterface::execAppActionIntern(app, action, connection, opts ? opts.toData() : NOTHING,
            request_options ? request_options.toData() : NOTHING);
    }

    #! Executes the given app action with the given arguments
    static auto execAppActionIntern(string app, string action, string connection, auto req, *hash<auto> request_options) {
        *TypeScriptAppRestConnection conn = cmap{connection};
        if (!conn) {
            throw "TYPESCRIPT-ACTION-ERROR", sprintf("Unknown connection %y; known connections: %y",
                connection, keys cmap);
        }

        TypeScriptActionApiDataProvider p =
            TypeScriptActionInterface::getDataProvider(app, conn).getChildProviderEx(action);
        try {
            return p.makeNormalizedRequest(req, request_options);
        } catch (hash<ExceptionInfo> ex) {
            #printf("%s\n", get_exception_string(ex));
            rethrow;
        }
    }

    #! Returns any URL template options for the given application
    static *hash<string, bool> getUrlTemplateOptions(string app) {
        return atmap{app.lwr()};
    }

    #! Returns REST options for the given app
    static hash<auto> getRestConfig(string app, *hash<auto> config) {
        string appname = app.lwr();
        if ((*string url = aumap{appname}).val()) {
            config.url = url;
        }
        *hash<auto> opts = armap{appname};
        if (!opts) {
            throw "TYPESCRIPT-APP-ERROR", sprintf("Cannot find any REST options for app %y", app);
        }
        config.opts = (map {$1.key: $1.value}, opts.pairIterator(), exists $1.value) + config.opts;
        if (*hash<string, bool> url_template_options = atmap{appname}) {
            if (config.url.val()) {
                config.url = TypeScriptActionInterface::processUrl(config.url, config.opts, url_template_options);
            }
        }
        return config;
    }

    static string processUrl(string url, hash<auto> opts, hash<string, bool> url_template_options) {
        map url = replace(url, "{{" + $1 + "}}", opts{$1}), keys url_template_options,
            opts{$1}.typeCode() == NT_STRING && opts{$1}.val();
        return url;
    }

    static *hash<AsyncCallInfo> getPostAuthCall(string app) {
        return app_post_auth_map{app.lwr()};
    }
}
}