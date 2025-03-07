# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionInterface.qc Copyright 2024 - 2025 Qore Technologies, s.r.o.

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
    #! Unique key for the call
    string key;

    #! App name
    string app;

    #! Action name; only set for calls associated with an app action
    *string action;

    #! Type of call
    string type;

    #! Label for the call
    string label;

    #! Javascript program pool
    JavaScriptProgramPool pool;

    #! Call to make
    code async_call;

    #! Timeout
    date to;

    #! Post-processing of successful call results
    *code post_processing;

    #! Free-form extra info
    *hash<auto> info;
}

#! REST get allowed values config info
hashdecl RestGetAllowedValuesInfo {
    #! The HTTP method for the call
    string method;

    #! The REST request path
    string path;

    #! Any REST body
    *hash<auto> body;

    #! Any REST headers
    *hash<auto> headers;

    #! Location of the values in the result in dot notation (ex: 'body.envelopes.envelopeId')
    string values;

    #! Location of the display names in the result in dot notation (ex: 'body.envelopes.envelopeName')
    *string display_names;

    #! Location of "desc" in the result in dot notation (ex: 'body.envelopes.desc')
    *string descriptions;

    #! Location of "short_desc" in the result in dot notation (ex: 'body.envelopes.shortDesc')
    *string short_descs;
}

#! Required attributes for RestGetAllowedValuesInfo
const RestGetAllowedValuesRequiredKeys = {
    "method": True,
    "path": True,
    "values": True,
};

#! Interface class
public class TypeScriptActionInterface {
    public {
        static hash<string, code> Api = TypeScriptActionInterface::getInterface();

        static hash<string, code> TestApi = TypeScriptActionInterface::getTestInterface();

        static TypeScriptActionRootDataProvider root;

        static code WebhookCreate;
        static code WebhookDelete;

        #! Set if server mode is active
        static JavaScriptThreadProcessPool server;

        const TypeKeys = (
            "name", "display_name", "short_desc", "desc", "type", "example_value", "default_value", "multiselect",
            "allowed_values", "allowed_values_creatable", "attr", "required", "on_change",
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

        #! Default post_auth I/O timeout in seconds
        const DefaultPostAuthIoTimeoutSecs = 30;

        #! JavaScript event subtype for connections
        const AES_JS_EVENT = "javascript-event";

        #! Webhook event subtype for connections
        const AES_WH_EVENT = "webhook-event";

        #! Default event ID
        const DefaultEventId = "event";
    }

    private {
        #! App map for delayed initialization: app -> info
        static hash<string, hash<AppInfo>> appmap;

        #! Init map for apps already initialized
        static hash<string, bool> initmap;

        #! Action map for delayed initialization: app -> action -> info
        static hash<string, hash<string, hash<ActionInfo>>> actionmap;

        #! Maps from scheme names to apps
        static hash<string, string> samap;

        #! Maps from app names to REST getOptions
        static hash<string, hash<auto>> armap;

        #! Maps from app names to Swagger schemas
        static hash<string, SwaggerSchema> app_swagger_map;

        #! Maps from app names to SwaggerDataProvider objects
        static hash<string, SwaggerDataProvider> app_swagger_dp;

        #! Maps from app and schema names to Swagger schemas
        static hash<string, hash<string, SwaggerSchema>> app_swagger_schema_map;

        #! Maps from app and schema names names to SwaggerDataProvider objects
        static hash<string, hash<string, SwaggerDataProvider>> app_swagger_schema_dp;

        #! Maps from app names to REST template options; app -> option -> True
        static hash<string, hash<string, bool>> atmap;

        #! Maps from app names to default URL
        static hash<string, string> aumap;

        #! Maps from app names to connection post-auth functions
        static hash<string, hash<AsyncCallInfo>> app_post_auth_map;

        #! Maps from app names to connection post-auth-code functions
        static hash<string, hash<AsyncCallInfo>> app_post_auth_code_map;

        #! Maps from app names to connection update info
        static hash<string, hash<auto>> app_conn_update_map;

        #! Maps from app names to connection -> Swagger path option maps
        static hash<string, hash<string, string>> app_conn_opt_map;

        #! Connection map for testing
        static hash<string, TypeScriptAppRestConnection> cmap;

        #! Actions supporting events; app -> action -> subtype
        static hash<string, hash<string, string>> emap;

        #! Actions supporting record search; app -> action -> True
        static hash<string, hash<string, bool>> smap;

        #! Actions supporting record creation; app -> action -> True
        static hash<string, hash<string, bool>> crmap;

        #! Actions supporting record updates; app -> action -> True
        static hash<string, hash<string, bool>> updmap;

        #! Actions supporting record upserts; app -> action -> True
        static hash<string, hash<string, bool>> upsmap;

        #! Actions supporting record deletes; app -> action -> True
        static hash<string, hash<string, bool>> dmap;

        #! Global async call map
        static hash<string, hash<AsyncCallInfo>> acmap;

        #! Maps lower-case app names to camel case names
        static hash<string, string> appcasemap;

        #! Server lock
        static Mutex sm();

        #! On-demand server flag
        static bool on_demand;
    }

    #! Performs static initialization of the module
    static init() {
        TypeScriptActionInterface::checkRoot();

        int opts = DataProvider::getOptions();
        if (opts & DPO_EnableServers) {
            on_demand = True;
        }
        if (opts & DPO_DisableOnDemandInitialization) {
            TypeScriptActionInterface::initAllApps();
        }
    }

    #! Initialize all pending apps
    static initAllApps(bool do_actions = True) {
        map TypeScriptActionInterface::initApp($1, do_actions), keys appmap;
    }

    #! Returns a list of all pending apps
    static *list<string> getPendingApps() {
        return map $1.lwr(), keys appmap;
    }

    #! Sets the server to start on demand
    static startServerOnDemand() {
        sm.lock();
        on_exit sm.unlock();

        on_demand = True;
    }

    #! Sets the server to start on demand
    static disableServerOnDemand() {
        sm.lock();
        on_exit sm.unlock();

        on_demand = False;
    }

    #! Starts the server if it has not been started
    static bool checkServer() {
        if (server) {
            return True;
        }
        if (!on_demand) {
            return False;
        }

        # lock and check everything again in case of contention
        sm.lock();
        on_exit sm.unlock();
        if (server) {
            return True;
        }
        if (on_demand) {
            TypeScriptActionInterface::startServerIntern();
            return True;
        }

        return False;
    }

    #! Start the process server to run JavaScript code in dedicated processes
    /** @return True if the server was started
    */
    static bool startServer() {
        sm.lock();
        on_exit sm.unlock();

        if (server) {
            return False;
        }
        TypeScriptActionInterface::startServerIntern();
        return True;
    }

    #! Starts the server
    private static startServerIntern() {
        server = new JavaScriptThreadProcessPool();
        set_signal_handler(SIGTERM, \TypeScriptActionInterface::shutdownServer());
        set_signal_handler(SIGINT, \TypeScriptActionInterface::shutdownServer());
        set_signal_handler(SIGHUP, \TypeScriptActionInterface::shutdownServer());
        set_signal_handler(SIGUSR2, \TypeScriptActionInterface::shutdownServer());

        DataProvider::registerShutdownHandler(server.uniqueHash(), \TypeScriptActionInterface::shutdownServer());
    }

    #! Shuts the server down if it's running
    static shutdownServer() {
        sm.lock();
        on_exit sm.unlock();

        if (!server) {
            return;
        }

        DataProvider::deregisterShutdownHandler(server.uniqueHash());
        delete server;
    }

    static string getCamelCaseAppName(string lc) {
        *string name = appcasemap{lc};
        if (!exists name) {
            throw "APP-ERROR", sprintf("No lower-case app %y has been registered; known strings: %y", lc,
                keys appcasemap);
        }
        return name;
    }

    static string registerAsyncCall(*bool ignore_dup, reference<hash<AsyncCallInfo>> call, ...) {
        string key;
        try {
            key = (foldl $1 + "-" + $2, argv) + sprintf("-%s", call.type);
            if (acmap{key}) {
                throw "ASYNC-CALL-ERROR", sprintf("Call %s is already registered", key);
            }
            call.key = key;
            acmap{key} = call;
        } catch (hash<ExceptionInfo> ex) {
            if (!ignore_dup || (ex.err != "ASYNC-CALL-ERROR")) {
                rethrow;
            }
        }
        return key;
    }

    static string registerAsyncCall(reference<hash<AsyncCallInfo>> call, ...) {
        return TypeScriptActionInterface::registerAsyncCallArgs(\call, argv);
    }

    static string registerAsyncCallArgs(reference<hash<AsyncCallInfo>> call, list<auto> args) {
        string key = (foldl $1 + "-" + $2, args) + sprintf("-%s", call.type);
        if (acmap{key}) {
            throw "ASYNC-CALL-ERROR", sprintf("Call %s is already registered", key);
        }
        call.key = key;
        acmap{key} = call;
        return key;
    }

    static hash<AsyncCallInfo> getCall(string key) {
        *hash<AsyncCallInfo> rv = acmap{key};
        if (!rv) {
            throw "ASYNC-CALL-ERROR", sprintf("Unknown call %y; known calls: %y", key, keys acmap);
        }
        return rv;
    }

    static registerApp(JavaScriptObject app) {
        JavaScriptProgram pgm = app.getProgram();
        JavaScriptProgramPool pool;
        bool first;
        on_error TSAI::error("TypeScriptActionInterface: error registering app %y: %s", app.name,
            get_exception_string($1));
        {
            on_error rethrow "APP-ERROR", sprintf("Error registering app %y: %s", app.name, $1.desc);
            pool = JavaScriptProgramPool::getPool(pgm, \first);
        }
        if (first) {
            TypeScriptActionInterface::registerApp(app.toData(), pool);
        }
    }

    static registerExistingApp(JavaScriptObject app) {
        JavaScriptProgram pgm = app.getProgram();
        JavaScriptProgramPool pool;
        bool first;
        on_error TSAI::error("TypeScriptActionInterface: error registering existing app %y: %s", app.name,
            get_exception_string($1));
        {
            on_error rethrow "APP-ERROR", sprintf("Error registering existing app %y: %s", app.name, $1.desc);
            pool = JavaScriptProgramPool::getPool(pgm, \first);
        }
        if (first) {
            TypeScriptActionInterface::registerExistingApp(app.toData(), pool);
        }
    }

    static registerAction(JavaScriptObject action) {
        JavaScriptProgram pgm = action.getProgram();
        JavaScriptProgramPool pool;
        bool first;
        on_error TSAI::error("TypeScriptActionInterface: error registering app %y action %y: %s", action.app,
            action.action, get_exception_string($1));
        {
            on_error rethrow "ACTION-ERROR", sprintf("Error registering app %y action %y: %s",
                action.app, action.action, $1.desc);
            pool = JavaScriptProgramPool::getPool(pgm, \first);
        }
        if (first) {
            TypeScriptActionInterface::registerAction(action.toData(), pool);
            TSAI::debug("Registered TypeScript app %y action %y: %s", action.app, action.action);
        }
    }

    static registerApp(hash<auto> app, JavaScriptProgramPool pool) {
        if (app.name =~ / /) {
            throw "APP-ERROR", sprintf("App name %y is invalid; it contains one or more spaces", app.name);
        }
        appmap{app.name} = <AppInfo>{
            "app": app,
            "pool": pool,
        };

        string appname = app.name.lwr();
        appcasemap{appname} = app.name;

        if (app.rest) {
            string sname = "tsrest-" + appname;
            ConnectionSchemeCache::registerPendingScheme(sname, sub () {
                TypeScriptActionInterface::initApp(app.name);
            });
        }
        DataProviderActionCatalog::registerPendingApp(app.name, sub () {
            TypeScriptActionInterface::initApp(app.name);
        });
        TSAI::debug("Registered TypeScript app %y", app.name);
    }

    static registerExistingApp(hash<auto> app, JavaScriptProgramPool pool) {
        if (app.name.typeCode() != NT_STRING || !app.name.val()) {
            throw "APP-ERROR", sprintf("App name %y is invalid; must be a non-empty string", app.name);
        }
        if (app."module".typeCode() != NT_STRING || !app."module".val()) {
            throw "APP-ERROR", sprintf("App module %y is invalid; must be a non-empty string", app."module");
        }

        # load the referenced module immediately
        load_module(app."module");

        hash<AppInfo> info = <AppInfo>{
            "app": app,
            "pool": pool,
        };

        string appname = app.name.lwr();
        appcasemap{appname} = app.name;

        # must register the app immediately
        TypeScriptActionInterface::initExistingAppIntern(info);
        TSAI::debug("Registered existing app %y", app.name);
    }

    static bool initAppAction(string app, string action) {
        TypeScriptActionInterface::initApp(app);
        if (*hash<ActionInfo> info = remove actionmap{app}{action}) {
            if (!actionmap{app}) {
                remove actionmap{app};
            }
            TypeScriptActionInterface::registerActionIntern(info.action, info.pool);
            return True;
        }
        return False;
    }

    static bool initApp(string app, *bool do_actions) {
        if (exists (*string rn = appcasemap{app})) {
            app = rn;
        }
        if (initmap{app}) {
            return False;
        }
        return TypeScriptActionInterface::initAppIntern(app, do_actions);
    }

    static private synchronized bool initAppIntern(string app, *bool do_actions) {
        if (initmap{app}) {
            return False;
        }
        if (*hash<AppInfo> info = remove appmap{app}) {
            return TypeScriptActionInterface::initAppIntern(info, do_actions);
        }
        throw "APP-ERROR", sprintf("No app %y has been registered for deferred initialization by the "
            "TypeScriptActionInterface module", app);
    }

    static private bool initAppIntern(hash<AppInfo> info, *bool do_actions) {
        initmap{info.app.name} = True;
        # change the cwd to process relative paths and restore on exit
        string cwd = getcwd();
        on_exit chdir(cwd);
        chdir(info.cwd);
        if (!do_actions) {
            # mark the app with action capabilities before registering
            map info.app{ActionCodeFlagMap{$1.action.action_code}} = True, actionmap{info.app.name}.iterator();
        }

        TypeScriptActionInterface::registerAppIntern(info.app, info.pool);

        if (do_actions) {
            TypeScriptActionInterface::checkAppActions(info.app.name);
        }
        return True;
    }

    static private bool initExistingAppIntern(hash<AppInfo> info, *bool do_actions) {
        initmap{info.app.name} = True;
        # change the cwd to process relative paths and restore on exit
        string cwd = getcwd();
        on_exit chdir(cwd);
        chdir(info.cwd);
        TypeScriptActionInterface::registerExistingAppIntern(info.app, info.pool);

        if (do_actions) {
            TypeScriptActionInterface::checkAppActions(info.app.name);
        }
        return True;
    }

    #! Initialize all actions for the given app
    static checkAppActions(string app) {
        if (exists (*string rn = appcasemap{app})) {
            app = rn;
        }
        if (*hash<string, hash<ActionInfo>> actions = remove actionmap{app}) {
            map TypeScriptActionInterface::registerActionIntern($1.action, $1.pool), actions.iterator();
        }
    }

    static private registerAppIntern(hash<auto> app, JavaScriptProgramPool pool) {
        #printf("TypeScriptActionInterface::registerApp() %y %y\n", now_us(), app.name);
        if (app.name =~ / /) {
            throw "APP-ERROR", sprintf("App name %y is invalid; it contains one or more spaces", app.name);
        }
        on_success TSAI::debug("TypeScriptActionInterface: registered app %y", app.name);
        on_error TSAI::error("%s", get_exception_string($1));
        string appname = app.name.lwr();
        SwaggerSchema schema;
        hash<string, SwaggerSchema> swagger_schema_map;
        if ((*string swagger_loc = remove app.swagger).val()) {
            on_error rethrow $1.err, sprintf("%s (while loading app %y)", $1.desc, app.name);
            if (app.swagger_schema_map) {
                throw "APP-ERROR", "Invalid 'swagger_schema_map' property; this property cannot be given if "
                    "`swagger` is provided";
            }
            schema = TypeScriptActionInterface::getSwaggerSchema(appname, swagger_loc, remove app.swagger_options,
                remove app.swagger_paths, remove app.swagger_type_overrides);
        } else if (*hash<auto> schema_map = remove app.swagger_schema_map) {
            *hash<auto> swagger_options = remove app.swagger_options;
            foreach hash<auto> i in (schema_map.pairIterator()) {
                on_error rethrow $1.err, sprintf("%s (while creating schema for app %y schema %y): %y", $1.desc,
                    app.name, i.key, i.value);
                swagger_schema_map{i.key} = TypeScriptActionInterface::getSwaggerSchema(appname, i.value.swagger,
                    remove i.value.swagger_options ?? swagger_options,
                    remove i.value.swagger_paths, remove i.value.swagger_type_overrides);
            }
        }
        hash<auto> app0 += app;
        if (app.logo) {
            app0.logo = parse_base64_string(app.logo);
        }
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
            hash<AsyncCallInfo> post_auth_code;
            hash<auto> conn_update;
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
                        "app": app.name,
                        "type": "post_auth",
                        "label": sprintf("REST post-auth option function for app %y", app.name),
                        "pool": pool,
                        "async_call": rest_modifiers.set_options_post_auth,
                        "to": seconds(remove rest_modifiers.io_timeout_secs ?? DefaultPostAuthIoTimeoutSecs),
                    };
                    TypeScriptActionInterface::registerAsyncCall(\post_auth, "app", app.name);
                }
                if (rest_modifiers.set_options_post_auth_code.val()) {
                    if (!rest_modifiers.set_options_post_auth_code.callp()) {
                        throw "REST-MODIFIER-ERROR", sprintf("The 'set_options_post_auth' REST modifier option must "
                            "be a callable value; got type %y instead",
                            rest_modifiers.set_options_post_auth.fullType());
                    }
                    post_auth_code = <AsyncCallInfo>{
                        "app": app.name,
                        "type": "post_auth_code",
                        "label": sprintf("REST post-auth-code option function for app %y", app.name),
                        "pool": pool,
                        "async_call": rest_modifiers.set_options_post_auth_code,
                        "to": seconds(remove rest_modifiers.io_timeout_secs ?? DefaultPostAuthIoTimeoutSecs),
                    };
                    TypeScriptActionInterface::registerAsyncCall(\post_auth_code, "app", app.name);
                }
                if (rest_modifiers.connection_update_option.val()) {
                    if (rest_modifiers.connection_update_option.option.typeCode() != NT_STRING) {
                        throw "REST-MODIFIER-ERROR", sprintf("The 'connection_update_option.option' REST modifier "
                            "option must be a string; got type %y instead",
                            rest_modifiers.connection_update_option.option.fullType());
                    }
                    if (!rest_modifiers.connection_update_option."code".callp()) {
                        throw "REST-MODIFIER-ERROR", sprintf("The 'connection_update_option.code' REST modifier "
                            "option must be a callable value; got type %y instead",
                            rest_modifiers.connection_update_option."code".fullType());
                    }
                    conn_update = {
                        "option": rest_modifiers.connection_update_option,
                        "code": <AsyncCallInfo>{
                            "app": app.name,
                            "type": "conn_update",
                            "label": sprintf("REST connection update option function for app %y", app.name),
                            "pool": pool,
                            "async_call": rest_modifiers.connection_update_option."code",
                            "to": seconds(remove rest_modifiers.io_timeout_secs ?? DefaultIoTimeoutSecs),
                        },
                    };
                    TypeScriptActionInterface::registerAsyncCall(\conn_update."code", "app", app.name);
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
            if (post_auth_code) {
                app_post_auth_code_map{appname} = post_auth_code;
            }
            if (conn_update) {
                app_conn_update_map{appname} = conn_update;
            }
            if (conn_opt_map) {
                app_conn_opt_map{appname} = conn_opt_map;
            }
        }
        DataProviderActionCatalog::registerApp(cast<hash<DataProviderAppInfo>>(app0));

        TypeScriptActionAppDataProvider prov(appname);
        TypeScriptActionInterface::checkRoot();
        root.registerChild(appname, prov);

        if (schema) {
            app_swagger_map{appname} = schema;
        }
        if (swagger_schema_map) {
            app_swagger_schema_map{appname} = swagger_schema_map;
        }
        if (url_template_options) {
            atmap{appname} = url_template_options;
        }
    }

    static private registerExistingAppIntern(hash<auto> app, JavaScriptProgramPool pool) {
        on_success TSAI::debug("TypeScriptActionInterface: registered app %y", app.name);
        on_error TSAI::error("%s", get_exception_string($1));

        string appname = app.name.lwr();
        TypeScriptActionAppDataProvider prov(appname, app."root_provider" ?? app."module");
        TypeScriptActionInterface::checkRoot();
        root.registerChild(appname, prov);
    }

    static SwaggerSchema getSwaggerSchema(string appname, string swagger_loc, *hash<auto> swagger_opts,
            *list<auto> paths, *hash<auto> swagger_type_overrides) {
        # first check cache
        string path_sha512;
        if (paths) {
            path_sha512 = (foldl $1 + "," + $2, paths).toSHA512();
        } else {
            path_sha512 = "none";
        }
        string filename = sprintf("swagger-%s-%s.yaml", encode_url(swagger_loc, True), path_sha512);
        bool store_in_cache;
        *string schema_source = TypeScriptActionInterface::getCachedSchema(\store_in_cache, filename);
        if (!schema_source) {
            schema_source = FileLocationHandler::getTextFileFromLocation(swagger_loc);
            if (paths) {
                schema_source = TypeScriptActionInterface::getOptimizedSchema(appname, schema_source, paths);
            }
        }
        SwaggerSchema schema = SwaggerLoader::fromString(schema_source, NOTHING, swagger_opts);
        if (store_in_cache) {
            TypeScriptActionInterface::cacheSchema(filename, schema_source);
        }
        if (swagger_type_overrides) {
            TypeScriptActionInterface::overrideTypes(appname, schema, swagger_type_overrides);
        }
        return schema;
    }

    static string getOptimizedSchema(string app, string schema_source, list<auto> paths) {
        string ser = SwaggerLoader::detectSourceEncoding(schema_source);
        hash<auto> h = SwaggerLoader::parseSchemaSource(schema_source, ser);
        # prepare paths: path -> method -> True
        hash<string, hash<string, bool>> pmap;
        foreach string path in (paths) {
            path =~ s/^\///;
            list<string> l = path.split(":");
            string m;
            if (l.size() == 2) {
                m = (pop l).upr();
                if (!SwaggerDataProvider::HttpMethods{m}) {
                    throw "INVALID-HTTP-METHOD", sprintf("Method %y is unknown; expecting one of: %y", m,
                        keys SwaggerDataProvider::HttpMethods);
                }
            }
            string p = l.join("/");
            # normalize variables to {x}
            if (softlist<string> vars = (p =~ x/(\{[^\}]*\})/g)) {
                map p = replace(p, $1, "{x}"), vars;
            }
            pmap{p}{m ? m.lwr() : "*"} = True;
        }
        #printf("pmap: %N\n", pmap);

        # remove unneeded paths
        foreach hash<auto> i in (h.paths.pairIterator()) {
            string path = i.key;
            # remove leading slash
            path =~ s/^\///;
            # normalize variables to {x}
            if (softlist<string> vars = (path =~ x/(\{[^\}]*\})/g)) {
                map path = replace(path, $1, "{x}"), vars;
            }
            *hash<string, bool> mmap = pmap{path};
            if (!mmap) {
                remove h.paths{i.key};
                #printf("Removed path %y\n", i.key);
                continue;
            }
            #printf("Removing %y from path %y; leaving: %y\n", keys (i.value - keys mmap), i.key, keys mmap);
            if (!mmap."*") {
                h.paths{i.key} = i.value{keys mmap + ("parameters",)};
            }
        }

        # map all types referenced
        if (h.definitions) {
            hash<string, bool> tmap;
            foreach hash<auto> i in (h.paths.pairIterator()) {
                foreach hash<auto> j in (i.value.pairIterator()) {
                    if (j.key == "parameters") {
                        map TypeScriptActionInterface::scanType($1, \tmap, h.definitions), j.value,
                            exists ($1.schema."$ref" ?? $1.schema.items."$ref");
                        continue;
                    }
                    map TypeScriptActionInterface::scanType($1, \tmap, h.definitions), j.value.parameters,
                        exists ($1.schema."$ref" ?? $1.schema.items."$ref");
                    map TypeScriptActionInterface::scanType($1, \tmap, h.definitions), j.value.responses.iterator(),
                        exists ($1.schema."$ref" ?? $1.schema.items."$ref");
                }
            }

            #printf("tmap: %N\n", tmap);
            # remove unreferenced types
            h.definitions = h.definitions{keys tmap} ?? {};
        }

        int old_size = schema_source.size();
        schema_source = ser == "yaml" ? make_yaml(h) : make_json(h);
        int new_size = schema_source.size();

        #printf("%s: compressed schema; old size: %d bytes new size: %d bytes (%f %% reduction)\n", app, old_size,
        #    new_size, (new_size - old_size) / old_size.toFloat() * 100.0);

        return schema_source;
    }

    static scanType(hash<auto> h, reference<hash<string, bool>> tmap, *hash<auto> definitions, *string name) {
        if (exists (*string ref = ((h."$ref" ?? h.schema."$ref" ?? h.items."$ref" ?? h.additionalProperties."$ref"
            ?? h.additionalProperties.items."$ref")
            =~ x/^#\/definitions\/(.*)/)[0])) {
            if (!tmap{ref}) {
                TypeScriptActionInterface::addReference(ref, \tmap, definitions);
            }
        }
        map TypeScriptActionInterface::scanType($1, \tmap, definitions), h.allOf;
        map TypeScriptActionInterface::scanType($1, \tmap, definitions), h.anyOf;
        map TypeScriptActionInterface::scanType($1, \tmap, definitions), h.properties.iterator();
    }

    static addReference(string ref, reference<hash<string, bool>> tmap, *hash<auto> definitions) {
        tmap{ref} = True;
        *hash<auto> rh = definitions{ref};
        if (!rh) {
            throw "REFERENCE-ERROR", sprintf("Cannot find reference to type %y", ref);
        }
        foreach string type in ("allOf", "anyOf") {
            if (rh{type}) {
                map TypeScriptActionInterface::scanType($1, \tmap, definitions), rh{type};
            }
        }

        map TypeScriptActionInterface::scanType($1, \tmap, definitions), rh.properties.iterator();
    }

    static scanType(*list<auto> l, reference<hash<string, bool>> tmap, *hash<auto> definitions) {
        map TypeScriptActionInterface::scanType($1, \tmap, definitions), l;
    }

    static cacheSchema(string filename, *string schema_source) {
        *string dir;
        if (!(dir = ENV.QORE_V8_CACHE_DIR).val() || !is_writable(dir)) {
            return;
        }
        string path = sprintf("%s/%s", dir, filename);
        File f();
        f.open2(path, O_CREAT | O_TRUNC | O_WRONLY);
        f.write(schema_source);
        #printf("Cached schema for %y (%d bytes)\n", filename, schema_source.size());
    }

    static *string getCachedSchema(reference<bool> store_in_cache, string filename) {
        *string dir;
        if (!(dir = ENV.QORE_V8_CACHE_DIR).val() || ENV.QORE_V8_DISABLE_CACHE) {
            return;
        }
        if (!is_dir(dir) && mkdir(dir, 0755, True)) {
            return;
        }
        string path = sprintf("%s/%s", dir, filename);
        if (is_readable(path) && (*hash<StatInfo> info = hstat(path)).size) {
            #printf("Returning %y from cache (%d bytes)\n", filename, info.size);
            return File::readTextFile(path);
        }
        store_in_cache = True;
    }

    static registerAction(hash<auto> action, JavaScriptProgramPool pool) {
        # register the action immediately if the app has already been registered
        if (initmap{action.app}) {
            TypeScriptActionInterface::registerActionIntern(action, pool);
            return;
        }
        actionmap{action.app}{action.action} = <ActionInfo>{
            "action": action,
            "pool": pool,
        };
        DataProviderActionCatalog::registerPendingAppAction(action.app, action.action, sub () {
            TypeScriptActionInterface::initAppAction(action.app, action.action);
        });
    }

    private static registerActionIntern(hash<auto> action, JavaScriptProgramPool pool) {
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
        string appname = action.app.lwr();
        *SwaggerSchema schema;
        if (exists (*string swagger_schema = action.swagger_schema)) {
            schema = app_swagger_schema_map{appname}{swagger_schema};
            if (!schema) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y refers to unknown Swagger schema %y; "
                    "known schemas for this app: %y", app.name, action.action, swagger_schema,
                    keys app_swagger_schema_map{appname});
            }
        } else {
            if ((action.action_code == DPAT_API) && !action.api_function && app_swagger_schema_map{appname}) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y API action %y has no 'api_function' attribute and "
                    "is missing the \"swagger_schema\" attribute; known schemas for this app: %y", app.name,
                    action.action, keys app_swagger_schema_map{appname});
            }
            schema = app_swagger_map{appname};
        }

        switch (action.action_code) {
            case DPAT_API: {
                TypeScriptActionInterface::generateApiDataProvider(app, \action, pool, schema);
                break;
            }

            case DPAT_EVENT: {
                string type = TypeScriptActionInterface::generateEventDataProvider(app, \action, pool, schema);
                string actionname = action.action.lwr();
                if (!emap{appname}{actionname}) {
                    emap{appname}{actionname} = type;
                }
                break;
            }

            case DPAT_FIND: {
                TypeScriptActionInterface::generateSearchDataProvider(app, \action, pool, schema);
                string actionname = action.action.lwr();
                if (!smap{appname}{actionname}) {
                    smap{appname}{actionname} = True;
                }
                break;
            }

            case DPAT_CREATE: {
                TypeScriptActionInterface::generateCreateDataProvider(app, \action, pool, schema);
                string actionname = action.action.lwr();
                if (!crmap{appname}{actionname}) {
                    crmap{appname}{actionname} = True;
                }
                break;
            }

            case DPAT_UPDATE: {
                TypeScriptActionInterface::generateUpdateDataProvider(app, \action, pool, schema);
                string actionname = action.action.lwr();
                if (!updmap{appname}{actionname}) {
                    updmap{appname}{actionname} = True;
                }
                break;
            }

            case DPAT_UPSERT: {
                TypeScriptActionInterface::generateUpsertDataProvider(app, \action, pool, schema);
                string actionname = action.action.lwr();
                if (!upsmap{appname}{actionname}) {
                    upsmap{appname}{actionname} = True;
                }
                break;
            }

            case DPAT_DELETE: {
                TypeScriptActionInterface::generateDeleteDataProvider(app, \action, pool, schema);
                string actionname = action.action.lwr();
                if (!dmap{appname}{actionname}) {
                    dmap{appname}{actionname} = True;
                }
                break;
            }

            default:
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y action_code: %y is unsupported",
                    action.app, action.action, action.action_code);
        }
    }

    static generateSearchDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);

        *hash<AsyncCallInfo> get_record_type = TypeScriptActionInterface::tryGetAsyncAttribute(\action,
            "get_record_type", "get record type", pool, io_timeout, action.app, action.action);
        if (!get_record_type) {
            throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y is missing its \"get_record_type\" "
                "attribute, but this attribute is required for actions supporting searches", action.app,
                action.action);
        }

        ActionFunctionContext fctx(app.name, action.action, pool);
        if (*hash<auto> opts = remove action.options) {
            action.options = TypeScriptActionInterface::getOptions(app, \action, opts, fctx);
            if (fctx.dmap) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"options\" "
                    "attribute; search actions do not support get_dependent_options() callbacks", action.app,
                    action.action);
            }
        }
        *hash<AsyncCallInfo> begin_transaction = TypeScriptActionInterface::tryGetAsyncAttribute(\action,
            "begin_transaction", "begin transaction", pool, io_timeout, action.app, action.action);
        *hash<AsyncCallInfo> commit = TypeScriptActionInterface::tryGetAsyncAttribute(\action,
            "commit", "commit", pool, io_timeout, action.app, action.action);
        *hash<AsyncCallInfo> rollback = TypeScriptActionInterface::tryGetAsyncAttribute(\action,
            "rollback", "rollback", pool, io_timeout, action.app, action.action);

        *hash<AsyncCallInfo> search_records = TypeScriptActionInterface::tryGetAsyncAttribute(\action,
            "search_records", "search records", pool, io_timeout, action.app, action.action);
        if (!search_records) {
            throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y is missing its \"search_records\" "
                "attribute, but this attribute is required for actions supporting searches", action.app,
                action.action);
        }

        bool uses_generic_search = remove action.uses_generic_search ?? False;

        hash<string, hash<DataProviderOptionInfo>> search_options;
        if (*hash<auto> opts = remove action.search_options) {
            if (uses_generic_search) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y cannot define \"search_options\" when "
                    "\"uses_generic_search\" is also defined", action.app, action.action);
            }
            throw "UNSUPPORTED", "search options are not yet supported";
        } else if (uses_generic_search) {
            search_options = AbstractDataProvider::GenericRecordSearchOptions;
        }

        hash<string, hash<DataProviderExpressionInfo>> expressions;
        if (*hash<auto> opts = remove action.expressions) {
            if (uses_generic_search) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y cannot define \"expressions\" when "
                    "\"uses_generic_search\" is also defined", action.app, action.action);
            }
            throw "UNSUPPORTED", "custom expressions are not yet supported";
        } else {
            expressions = AbstractDataProvider::GenericExpressions;
        }

        TypeScriptActionSearchDataProvider child(action.action, get_record_type, begin_transaction, commit, rollback,
            search_records, search_options, expressions, !uses_generic_search, fctx);

        TypeScriptActionAppDataProvider prov = TypeScriptActionInterface::getAppDataProvider(action.app);
        prov.registerChild(action.action, child);

        #printf("Registered %s %s (%y)\n", action.app, action.action);

        action.path = action.action;
    }

    static registerAppChildDataProvider(string app, AbstractDataProvider prov) {
        initApp(app);
        TypeScriptActionAppDataProvider parent = TypeScriptActionInterface::getAppDataProvider(app);
        parent.registerChild(prov.getName(), prov);
    }

    static bool tryRegisterAppChildDataProvider(string app, AbstractDataProvider prov) {
        try {
            registerAppChildDataProvider(app, prov);
            return True;
        } catch (hash<ExceptionInfo> ex) {
            TSAI::warn("Failed to register child provider of app %y: %s: %s", app, ex.err, ex.desc);
        }
        return False;
    }

    static *AbstractDataProvider deregisterAppChildDataProvider(string app, string child) {
        TypeScriptActionAppDataProvider parent = TypeScriptActionInterface::getAppDataProvider(app);
        return parent.deregisterChild(child);
    }

    static generateCreateDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        throw "UNSUPPORTED";
    }

    static generateUpdateDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        throw "UNSUPPORTED";
    }

    static generateUpsertDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        throw "UNSUPPORTED";
    }

    static generateDeleteDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        throw "UNSUPPORTED";
    }

    static string generateEventDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        ActionFunctionContext fctx(app.name, action.action, pool);
        # get event info
        string event_id;
        hash<DataProviderMessageInfo> event_info;
        {
            auto event = remove action.event_info;
            if (event.typeCode() != NT_HASH) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"event_info\" "
                    "attribute; got type %y; expecting \"hash\"", action.app, action.action,
                    event.fullType());
            }
            if (exists event.id) {
                if (event.id.typeCode() != NT_STRING) {
                    throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid "
                        "\"event_info.id\" attribute; got type %y; expecting \"string\"", action.app,
                        action.action, event.id.fullType());
                }
                event_id = event.id;
            } else {
                event_id = DefaultEventId;
            }
            if (event.desc.typeCode() != NT_STRING) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid "
                    "\"event_info.desc\" attribute; got type %y; expecting \"string\"", action.app,
                    action.action, event.desc.fullType());
            }
            on_error rethrow "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"event_info\" "
                "attribute: %s: %s", action.app, action.action, $1.err, $1.desc);

            event_info = <DataProviderMessageInfo>{
                "desc": event.desc,
                "type": TypeScriptActionInterface::getType("event", event.type, True, NOTHING, fctx),
            };
        }

        timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);

        if (*hash<auto> opts = remove action.options) {
            action.options = TypeScriptActionInterface::getOptions(app, \action, opts, fctx);
            if (fctx.dmap) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"options\" "
                    "attribute; event actions do not support get_dependent_options() callbacks", action.app,
                    action.action);
            }
        }
        *hash<AsyncCallInfo> get_example_event_data = TypeScriptActionInterface::tryGetAsyncAttribute(\action,
            "get_example_event_data", "example event data", pool, io_timeout, action.app, action.action);

        TypeScriptActionEventDataProviderBase child;

        string rv;
        if ((auto method = remove action.webhook_method).val()) {
            if (method.typeCode() != NT_STRING) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_method\" "
                    "attribute; got type %y; expecting \"string\"", action.app, action.action,
                    method.fullType());
            }
            auto webhook_auth = remove action.webhook_auth;
            if (exists webhook_auth && (webhook_auth.typeCode() != NT_INT)) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_auth\" "
                    "attribute; expected \"int\"; got %y", action.app, action.action, webhook_auth.fullType());
            }
            auto webhook_perms = remove action.webhook_perms;
            if (exists webhook_perms) {
                int t = webhook_perms.typeCode();
                if (t == NT_STRING) {
                    webhook_perms = (webhook_perms,);
                } else if (t != NT_LIST) {
                    throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_perms\" "
                        "attribute; expected \"list\" or \"string\"; got %y", action.app, action.action,
                        webhook_perms.fullType());
                }
            }
            auto webhook_register_code = remove action.webhook_register;
            if (!webhook_register_code.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_register\" "
                    "attribute; got type %y; expecting a callable value", action.app, action.action,
                    webhook_register_code.fullType());
            }

            hash<AsyncCallInfo> webhook_register = <AsyncCallInfo>{
                "app": app.name,
                "action": action.action,
                "type": "webhook_register",
                "label": sprintf("Webhook registration function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": webhook_register_code,
                "to": seconds(io_timeout),
            };

            auto webhook_deregister_code = remove action.webhook_deregister;
            if (!webhook_deregister_code.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_deregister\" "
                    "attribute; got type %y; expecting a callable value", action.app, action.action,
                    webhook_deregister_code.fullType());
            }

            hash<AsyncCallInfo> webhook_deregister = <AsyncCallInfo>{
                "app": app.name,
                "action": action.action,
                "type": "webhook_deregister",
                "label": sprintf("Webhook deregistration function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": webhook_deregister_code,
                "to": seconds(io_timeout),
            };

            auto webhook_event_loc = remove action.webhook_event_loc;
            if (exists webhook_event_loc && (webhook_event_loc.typeCode() != NT_STRING)) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_event_loc\" "
                    "attribute; got type %y; expecting \"string\"", action.app, action.action,
                    webhook_event_loc.fullType());
            }

            auto webhook_echo_header = remove action.webhook_echo_header;
            if (exists webhook_echo_header && (webhook_echo_header.typeCode() != NT_STRING)) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_echo_header\" "
                    "attribute; got type %y; expecting \"string\"", action.app, action.action,
                    webhook_echo_header.fullType());
            }
            *softlist<auto> webhook_echo_body_keys = remove action.webhook_echo_body_keys;
            if (webhook_echo_body_keys && (webhook_echo_body_keys[0].typeCode() != NT_STRING)) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_echo_body_keys\" "
                    "attribute; got type %y; expecting \"list<string>\"", action.app, action.action,
                    webhook_echo_body_keys.fullType());
            }

            TypeScriptActionInterface::registerAsyncCall(\webhook_register, "app", app.name, action.action);
            TypeScriptActionInterface::registerAsyncCall(\webhook_deregister, "app", app.name, action.action);

            child = new TypeScriptActionWebhookEventDataProvider(action.action, event_id, event_info,
                get_example_event_data, fctx, method, webhook_register, webhook_deregister, webhook_auth,
                webhook_perms, webhook_event_loc, webhook_echo_header, webhook_echo_body_keys);
            rv = AES_WH_EVENT;
        } else {
            auto event_function = remove action.event_function;
            if (!event_function.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"event_function\" "
                    "attribute; got type %y; expecting a callable value", action.app, action.action,
                    event_function.fullType());
            }
            hash<AsyncCallInfo> event = <AsyncCallInfo>{
                "app": app.name,
                "action": action.action,
                "type": "event_function",
                "label": sprintf("Async event function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": event_function,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\event, "app", app.name, action.action);
            child = new TypeScriptActionEventDataProvider(action.action, event_id, event_info, get_example_event_data,
                fctx, event);
            rv = AES_JS_EVENT;
        }

        TypeScriptActionAppDataProvider prov = TypeScriptActionInterface::getAppDataProvider(action.app);
        prov.registerChild(action.action, child);

        #printf("Registered %s %s (%y)\n", action.app, action.action);

        action.action_val = event_id;
        action.path = action.action;
        return rv;
    }

    static *hash<AsyncCallInfo> tryGetAsyncAttribute(reference<hash<auto>> h, string key, string type,
            JavaScriptProgramPool pool, timeout io_timeout, string app, *string action, *string option) {
        auto callable = remove h{key};
        if (!(exists callable)) {
            return;
        }
        code get_desc = string sub () {
            string desc = sprintf("App %y", app);
            if (exists action) {
                desc += sprintf(" action %y", action);
                if (exists option) {
                    desc += sprintf(" option %y", option);
                }
            }
            return desc;
        };
        if (!callable.callp()) {
            throw "TYPESCRIPT-ACTION-ERROR", sprintf("%s has an invalid %y attribute; got type %y; expecting a "
                "callable value", get_desc(), key, callable.fullType());
        }
        hash<AsyncCallInfo> rv = <AsyncCallInfo>{
            "app": app,
            "type": key,
            "label": sprintf("%s %s function", get_desc(), type),
            "pool": pool,
            "async_call": callable,
            "to": seconds(io_timeout),
        };
        if (action) {
            rv.action = action;
            TypeScriptActionInterface::registerAsyncCall(\rv, "app", app, action);
        } else {
            TypeScriptActionInterface::registerAsyncCall(\rv, "app", app);
        }
        return rv;
    }

    static generateApiDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *SwaggerSchema schema) {
        hash<AsyncCallInfo> api;
        {
            auto api_function = remove action.api_function;
            if (!api_function.callp() && !schema) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has no REST schema and has a missing or "
                    "invalid \"api_function\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, api_function.fullType());
            }
            timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);
            if (api_function) {
                api = <AsyncCallInfo>{
                    "app": app.name,
                    "action": action.action,
                    "type": "api_function",
                    "label": sprintf("API function for app %y action %y", app.name, action.action),
                    "pool": pool,
                    "async_call": api_function,
                    "to": seconds(io_timeout),
                };
                TypeScriptActionInterface::registerAsyncCall(\api, "app", app.name, action.action);
            }
        }
        hash<AsyncCallInfo> get_dynamic_request_type;
        if (auto js_api = remove action.get_dynamic_request_type) {
            if (!js_api.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has no REST schema and has an invalid "
                    "\"get_dynamic_request_type\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, js_api.fullType());
            }
            timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);
            get_dynamic_request_type = <AsyncCallInfo>{
                "app": app.name,
                "action": action.action,
                "type": "api_function",
                "label": sprintf("API function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": js_api,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\get_dynamic_request_type, "app", app.name, action.action,
                "get_dynamic_request_type");
        }

        TypeScriptActionApiDataProvider child;
        if ((*string swagger_path = remove action.swagger_path).val()) {
            if (!schema) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"swagger_path\" "
                    "attribute %y; this attribute can only been used when the application declares a Swagger schema",
                    action.app, action.action, swagger_path);
            }
            if (remove action.options) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"options\" property; "
                    "this property cannot be defined when \"swagger_path\" (%y) is also defined for the action",
                    action.app, action.action, swagger_path);
            }
            *softlist<string> independent_path_vars = remove action.independent_path_vars;

            ActionFunctionContext fctx(action.app, action.action, pool);

            # check for path vars0
            *hash<string, bool> path_vars = map {$1: True}, (swagger_path =~ x/\{([^\}]*)}/g);
            TypeScriptActionApiWithSchemaDataProvider dp(\action, swagger_path, api, path_vars,
                (map {$1: True}, independent_path_vars), app_conn_opt_map{app.name.lwr()},
                remove action.override_options, fctx, get_dynamic_request_type);
            child = dp;

            action.output_type = child.getResponseType();
            if (remove action.response_type) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"response_type\" "
                    "property; this property cannot be defined when \"swagger_path\" (%y) is also defined for the "
                    "action", action.app, action.action, swagger_path);
            }
        } else {
            *AbstractDataProviderType request_type;

            ActionFunctionContext fctx(app.name, action.action, pool);
            if (*hash<auto> opts = remove action.options) {
                request_type = TypeScriptActionInterface::getType("request", (map {$1.key: $1.value{TypeKeys}},
                    opts.pairIterator()), NOTHING, NOTHING, fctx);
                action.options = TypeScriptActionInterface::getOptions(app, \action, opts, fctx);
            }

            *AbstractDataProviderType response_type;
            if (action.response_type.val()) {
                response_type = TypeScriptActionInterface::getType("response", remove action.response_type, NOTHING,
                    NOTHING, fctx);
                action.output_type = response_type;
            } else if (action.hasKey("response_type")) {
                remove action.response_type;
            }

            child = new TypeScriptActionApiDataProvider(action.action, api, request_type, response_type, fctx,
                get_dynamic_request_type);
        }

        TypeScriptActionAppDataProvider prov = TypeScriptActionInterface::getAppDataProvider(action.app);
        prov.registerChild(action.action, child);

        TSAI::debug("Registered provider/action %s/%s", prov.getName(), action.action);

        action.path = action.action;
    }

    static TypeScriptActionAppDataProvider getAppDataProvider(string app) {
        if (*hash<AppInfo> info = remove appmap{app}) {
            TypeScriptActionInterface::initAppIntern(info);
        }
        string appname = app.lwr();
        return root.getChildProviderEx(appname);
    }

    static TypeScriptActionAppDataProvider getDataProvider(string app, TypeScriptAppRestConnection conn) {
        TypeScriptActionInterface::checkRoot();
        TypeScriptActionAppDataProvider parent = cast<TypeScriptActionAppDataProvider>(root.getChildProviderEx(app));
        return parent.copyWithParent(parent, conn);
    }

    static TypeScriptActionAppDataProvider getDataProvider(string app, RestConnection conn) {
        TypeScriptActionInterface::checkRoot();
        TypeScriptActionAppDataProvider parent = cast<TypeScriptActionAppDataProvider>(root.getChildProviderEx(app));
        return parent.copyWithParent(parent, conn);
    }

    static checkRoot() {
        if (root) {
            return;
        }
        TypeScriptActionInterface::checkRootIntern();
    }

    static private synchronized checkRootIntern() {
        if (root) {
            return;
        }
        root = new TypeScriptActionRootDataProvider();
        root.setLogger(DataProvider::getGlobalLogger());
    }

    static getOptionFunctions(reference<hash<auto>> action, ActionFunctionContext fctx, string key,
            reference<hash<auto>> h, *bool keep_field_functions) {
        on_error rethrow $1.err, sprintf("%s (while processing option %y)", $1.desc, key);
        date io_timeout = seconds(remove h.io_timeout_secs ?? DefaultIoTimeoutSecs);
        if (exists (auto get_allowed_values = remove h.get_allowed_values)) {
            if (!get_allowed_values.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_allowed_values\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_allowed_values.fullType());
            }
            fctx.omap{key} = <AsyncCallInfo>{
                "app": action.app,
                "action": action.action,
                "type": "get_allowed_values",
                "label": sprintf("Reference data function for app %y action %y option %y", action.app,
                    action.action, key),
                "pool": fctx.pool,
                "async_call": get_allowed_values,
                "to": io_timeout,
            };
            TypeScriptActionInterface::registerAsyncCall(\fctx.omap{key}, "app", action.app, action.action, key);

            h.ref_data = key;
            # remove any manual allowed values
            remove h.allowed_values;
        }
        if (exists (auto rest_get_allowed_values = remove h.rest_get_allowed_values)) {
            if (rest_get_allowed_values.typeCode() != NT_HASH) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_allowed_values\" attribute; got type %y; expecting \"hash\"", action.app,
                    action.action, key, rest_get_allowed_values.fullType());
            }
            if (fctx.omap{key}) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_allowed_values\" attribute; this option already has a \"get_allowed_values\" value; "
                    "cannot use both attributes for a single option", action.app, action.action, key);
            }
            hash<RestGetAllowedValuesInfo> info;
            {
                on_error rethrow "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_allowed_values\" attribute: %s: %s", action.app, action.action, key, $1.err, $1.desc);
                info = cast<hash<RestGetAllowedValuesInfo>>(rest_get_allowed_values);
            }
            if (*hash<auto> h = (RestGetAllowedValuesRequiredKeys - keys info)) {
                on_error rethrow "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_allowed_values\" attribute; the following required keys are missing: %y", action.app,
                    action.action, key, keys h);
            }
            fctx.romap{key} = info;
            h.ref_data = key;
            # remove any manual allowed values
            remove h.allowed_values;
        }
        if (exists (auto get_dependent_options = remove h.get_dependent_options)) {
            if (!get_dependent_options.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_dependent_options\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_dependent_options.fullType());
            }
            fctx.dmap{key} = <AsyncCallInfo>{
                "app": action.app,
                "action": action.action,
                "type": "get_dependent_options",
                "label": sprintf("Dependent option function for app %y action %y option %y", action.app,
                    action.action, key),
                "pool": fctx.pool,
                "async_call": get_dependent_options,
                "to": io_timeout,
            };
            TypeScriptActionInterface::registerAsyncCall(\fctx.dmap{key}, "app", action.app, action.action, key);
            action.data_dependent_options = True;
        }
        if (exists (auto get_dynamic_type = h.get_dynamic_type)) {
            if (!get_dynamic_type.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_dynamic_type\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_dynamic_type.fullType());
            }
            fctx.dtmap{key} = <AsyncCallInfo>{
                "app": action.app,
                "action": action.action,
                "type": "get_dynamic_type",
                "label": sprintf("Dynamic option type function for app %y action %y option %y", action.app,
                    action.action, key),
                "pool": fctx.pool,
                "async_call": get_dynamic_type,
                "to": io_timeout,
                "post_processing": \TypeScriptActionInterface::postProcessDynamicTypeInfo(),
            };
            TypeScriptActionInterface::registerAsyncCall(\fctx.dtmap{key}, "app", action.app, action.action, key);
            h.dynamic_type = fctx.dtmap{key}.key;
            action.data_dependent_options = True;
            if (!keep_field_functions) {
                remove h.get_dynamic_type;
            }
        }
        if (exists (auto get_default_value = h.get_default_value)) {
            if (!get_default_value.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_default_value\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_default_value.fullType());
            }
            fctx.dvmap{key} = <AsyncCallInfo>{
                "app": action.app,
                "action": action.action,
                "type": "get_default_value",
                "label": sprintf("Default value data function for app %y action %y option %y", action.app,
                    action.action, key),
                "pool": fctx.pool,
                "async_call": get_default_value,
                "to": io_timeout,
            };
            TypeScriptActionInterface::registerAsyncCall(\fctx.dvmap{key}, "app", action.app, action.action, key);
            h.default_ref_data = key;
            action.data_dependent_options = True;
            if (!keep_field_functions) {
                remove h.get_default_value;
            }
        }
        if (h.required && !h.preselected && !exists h.default_value) {
            h.preselected = True;
        }
    }

    static *hash<string, hash<ActionOptionInfo>> getOptions(hash<DataProviderAppInfo> app,
            reference<hash<auto>> action, hash<auto> opts, ActionFunctionContext fctx) {
        TypeScriptActionInterface::sortOptions(app, action, \opts);
        hash<string, hash<ActionOptionInfo>> rv;
        foreach hash<auto> i in (opts.pairIterator()) {
            TypeScriptActionInterface::getOptionFunctions(\action, fctx, i.key, \i.value);
            rv{i.key} = TypeScriptActionInterface::getOptionInfo("option", i.value, fctx);
            if (fctx.dmap{i.key}) {
                rv{i.key}.structural_determinate = True;
            }
            if ((*list<auto> deps = i.value.depends_on)
                && (hash<auto> dh = map {$1: True}, deps)
                && (*hash<auto> missing = (dh - keys opts))) {
                throw "ACTION-ERROR", sprintf("App %y action %y option %y depends on unknown options: %y",
                    action.app, action.action, i.key, keys missing);
            }
            map fctx.depmap{i.key}{$1} = True, i.value.depends_on;
        }
        return rv;
    }

    #! Sort options based on depends_on
    static sortOptions(hash<auto> app, hash<auto> action, reference<hash<auto>> opts) {
        hash<auto> new_opts;
        code check_dep = sub (string opt, string dep) {
            if (new_opts{dep}) {
                return;
            }
            *hash<auto> depval = opts{dep};
            if (!exists depval) {
                throw "ACTION-ERROR", sprintf("App %y action %y option %y claims a dependency on %y which is not "
                    "in the option set", app.name, action.action, opt, dep);
            }
            map check_dep(dep, $1), depval.depends_on;
            new_opts{dep} = depval;
        };
        foreach hash<auto> i in (opts.pairIterator()) {
            if (new_opts{i.key}) {
                continue;
            }
            map check_dep(i.key, $1), i.value.depends_on;
            new_opts{i.key} = i.value;
        }
        opts = new_opts;
    }

    static hash<ActionOptionInfo> getOptionInfo(string path, hash<auto> opt, *ActionFunctionContext fctx) {
        opt.type = TypeScriptActionInterface::getType(path, opt.type, opt.required, remove opt.element_type, fctx);
        if (opt.allowed_values) {
            opt.allowed_values = map cast<hash<AllowedValueInfo>>($1), opt.allowed_values;
        }
        if (opt.required_groups) {
            opt.required_groups = cast<list<string>>(opt.required_groups);
        }
        return cast<hash<ActionOptionInfo>>(opt);
    }

    static AbstractDataProviderType getType(string path, string name, *bool required, auto element_type,
            *ActionFunctionContext fctx, *bool ignore_dup) {
        if (!required) {
            if (name !~ /^\*/ && name != "auto" && name != "any") {
                name = "*" + name;
            }
        } else if (name =~ /^\*/) {
            throw "TYPE-ERROR", sprintf("Cannot use an \"or-nothing\" type like %y when \"required\" is set; use "
                "type %y instead", name, name[1..]);
        }
        path += "-" + name;
        if (exists element_type) {
            AbstractDataProviderType et = TypeScriptActionInterface::getType(path + "-element",
                element_type, NOTHING, NOTHING, fctx, ignore_dup);
            if (name =~ /^\*?list$/) {
                return new ListDataType(et, !required);
            } else if (name =~ /^\*?hash$/) {
                HashDataType rv(required ? AutoHashType : AutoHashOrNothingType);
                rv.setDefaultOtherFieldType(et);
                return rv;
            } else {
                throw "TYPE-ERROR", sprintf("Cannot use an element type with type %y", name);
            }
        }
        *AbstractDataProviderType type = AbstractDataProviderTypeMap{name};
        if (!type) {
            throw "TYPE-ERROR", sprintf("Cannot match type %y to a known Qore type", name);
        }
        return type;
    }

    static AbstractDataProviderType getType(string path, hash<auto> h, *bool required, auto element_type,
            *ActionFunctionContext fctx, *bool ignore_dup) {
        if (h.required.typeCode() == NT_BOOLEAN) {
            required = h.required;
        }
        if (h.type.typeCode() != NT_STRING) {
            return TypeScriptActionInterface::getHashType(path, h, required, fctx, ignore_dup);
        }

        hash<auto> orig = h;
        hash<auto> info;
        *Type type = DataTypeMap{(!required ? "*" : "") + remove h.type};
        if (!type) {
            throw "TYPE-ERROR", sprintf("Cannot match type %y to a known Qore type", orig.type);
        }
        hash<NameDescInfo> attr();
        map attr{$1.key} = $1.value, (remove h{"name", "display_name", "short_desc", "desc"}).pairIterator();
        auto default_value = remove h.default_value;
        hash<auto> tags;
        if (exists h.required) {
            tags.required = remove h.required;
        }
        if (remove h.preselected) {
            tags.preselected = True;
        }
        if (remove h.readonly) {
            tags.readonly = True;
        }
        if (remove h.disabled) {
            tags.disabled = True;
        }
        AbstractDataProviderType rv;
        if (orig.type == "hash") {
            *hash<auto> f = remove h.fields;
            /*
            AbstractDataProviderType et;
            if (auto t = remove h.element_type) {
                et = TypeScriptActionInterface::getType(t);
            }
            */
            HashDataType ht(type, attr.name, NOTHING, tags, default_value, attr);
            if (f) {
                TypeScriptActionInterface::getHashTypeIntern(path, ht, f, h.required, fctx, ignore_dup);
            } else if (exists element_type) {
                AbstractDataProviderType element_type = TypeScriptActionInterface::getType(path + "-element",
                    element_type, NOTHING, NOTHING, fctx);
                ht.setDefaultOtherFieldType(element_type);
            }
            rv = ht;
        } else if (orig.type == "list") {
            AbstractDataProviderType et;
            if (auto t = (remove h.element_type ?? element_type)) {
                et = TypeScriptActionInterface::getType(path, t, NOTHING, NOTHING, fctx);
            }
            rv = new ListDataType(et ?? AutoType, !orig.required, NOTHING, tags, default_value, attr);
        } else if (orig.type == "softlist") {
            AbstractDataProviderType et;
            if (auto t = (remove h.element_type ?? element_type)) {
                et = TypeScriptActionInterface::getType(path + "-element", t, NOTHING, NOTHING, fctx);
            }
            rv = new SoftListDataType(et ?? AutoType, !orig.required, NOTHING, tags, default_value, attr);
        } else {
            if (*hash<auto> f = remove h.fields) {
                throw "TYPE-ERROR", sprintf("Type %y cannot support fields; use type \"hash\" with fields",
                    orig.type);
            }
            if (auto t = (remove h.element_type ?? element_type)) {
                throw "TYPE-ERROR", sprintf("Type %y cannot support an element type", orig.type);
            }
            rv = new QoreDataType(type, NOTHING, tags, default_value, attr);
        }
        if (h) {
            throw "TYPE-ERROR", sprintf("Type description has unknown keys: %y", keys h);
        }
        return rv;
    }

    static HashDataType getHashType(string path, hash<auto> h, *bool required, *ActionFunctionContext fctx,
            *bool ignore_dup) {
        on_error rethrow $1.err, sprintf("%s (type: %y)", $1.desc, h);
        HashDataType type(required ? AutoHashType : AutoHashOrNothingType);
        return TypeScriptActionInterface::getHashTypeIntern(path, type, h, required, fctx, ignore_dup);
    }

    static HashDataType getHashTypeIntern(string path, HashDataType type, hash<auto> h, *bool required,
            *ActionFunctionContext fctx, *bool ignore_dup) {
        map type.addField(TypeScriptActionInterface::getField(path, $1.key, $1.value, fctx, ignore_dup)),
            h.pairIterator();
        return type;
    }

    static AbstractDataProviderType getType(string path, auto v, *bool required, auto element_type,
            *ActionFunctionContext fctx, *bool ignore_dup) {
        throw "TYPE-ERROR", sprintf("Expecting \"string\" or \"hash\" for the option \"type\"; got %y "
            "instead", v.fullType());
    }

    static TypeScriptDataField getField(string path, string name, hash<auto> h, *ActionFunctionContext fctx,
            *bool ignore_dup) {
        on_error rethrow $1.err, sprintf("%s (field: %y)", $1.desc, h);
        *bool req = remove h.required;
        path += "-" + name;
        AbstractDataProviderType type = TypeScriptActionInterface::getType(path, remove h.type, req, NOTHING, fctx,
            ignore_dup);
        hash<auto> rv = TypeScriptActionInterface::getFieldHash(path, name, type, \h, req, fctx, ignore_dup);
        if (h) {
            throw "FIELD-ERROR", sprintf("Field description has unknown keys: %y", keys h);
        }
        return new TypeScriptDataField(rv);
    }

    static hash<auto> getFieldHash(string path, string name, AbstractDataProviderType type,
            reference<hash<auto>> type_hash, *bool req, *ActionFunctionContext fctx, *bool ignore_dup) {
        hash<auto> info += {
            "name": name,
            "type": type,
        };

        # turn on multiselect for all list types
        if (type.getBaseTypeCode() == NT_LIST) {
            info.multiselect = True;
        }

        if (req) {
            if (!type.isMandatory()) {
                info.type = type.getMandatoryType();
            }
            info.attr.required = True;
        }

        if (remove type_hash.preselected) {
            info.attr.preselected = True;
        }
        if (remove type_hash.sensitive) {
            info.attr.sensitive = True;
        }
        if (remove type_hash.readonly) {
            info.attr.readonly = True;
        }
        if (remove type_hash.disabled) {
            info.attr.disabled = True;
        }
        if ((*string str = remove type_hash.ref_data).val()) {
            info.attr.ref_data = str;
        }
        if ((*string str = remove type_hash.default_ref_data).val()) {
            info.attr.default_ref_data = str;
        }
        if ((*string str = remove type_hash.dynamic_type).val()) {
            info.attr.dynamic_type = str;
        }
        if (*list<auto> l = remove type_hash.required_groups) {
            info.attr.required_groups = l;
        }
        if (*softlist<auto> l = remove type_hash.depends_on) {
            info.attr.depends_on = l;
        }
        if (exists (auto v = remove type_hash.on_change)) {
            info.attr.on_change = v;
        }
        if (remove type_hash.multiselect) {
            info.multiselect = True;
        }
        if (auto v = remove type_hash.allowed_values) {
            info.allowed_values = v;
        }
        if (remove type_hash.allowed_values_creatable) {
            info.allowed_values_creatable = True;
        }
        if ((*string str = remove type_hash.display_name).val()) {
            info.display_name = str;
        }
        if ((*string str = remove type_hash.short_desc).val()) {
            info.short_desc = str;
        }
        if ((*string str = remove type_hash.desc).val()) {
            info.desc = str;
        }
        if (exists (auto v = remove type_hash.default_value)) {
            info.default_value = v;
        } else if (!info.default_value) {
            info.default_value = info.type.getDefaultValue();
        }
        if (exists (auto v = remove type_hash.example_value)) {
            info.example_value = v;
        }
        if (fctx) {
            if (exists (*code c = remove type_hash.get_allowed_values)) {
                string key = sprintf("%s-%s", path, name);
                fctx.omap{key} = <AsyncCallInfo>{
                    "key": key,
                    "app": fctx.app,
                    "action": fctx.action,
                    "type": "get_allowed_values",
                    "label": sprintf("Reference data function for app %y action %y option %y", fctx.app, fctx.action,
                        key),
                    "pool": fctx.pool,
                    "async_call": c,
                    "to": fctx.io_timeout,
                };
                TypeScriptActionInterface::registerAsyncCall(ignore_dup, \fctx.omap{key}, "app", fctx.app,
                    fctx.action, key);

                # remove any manual allowed values
                remove info.allowed_values;
                info.attr.ref_data = fctx.dtmap{key}.key;
                info.attr.dynamic = True;
            }
            if (exists (*code c = remove type_hash.get_dynamic_type)) {
                string key = sprintf("%s-%s", path, name);
                fctx.dtmap{key} = <AsyncCallInfo>{
                    "key": key,
                    "app": fctx.app,
                    "action": fctx.action,
                    "type": "get_dynamic_type",
                    "label": sprintf("Dynamic type function for app %y action %y option %y", fctx.app, fctx.action,
                        key),
                    "pool": fctx.pool,
                    "async_call": c,
                    "to": fctx.io_timeout,
                    "post_processing": \TypeScriptActionInterface::postProcessDynamicTypeInfo(),
                };
                TypeScriptActionInterface::registerAsyncCall(ignore_dup, \fctx.dtmap{key}, "app", fctx.app,
                    fctx.action, key);

                info.attr.dynamic_type = fctx.dtmap{key}.key;
                info.attr.dynamic = True;
            }
            if (exists (*code c = remove type_hash.get_dependent_options)) {
                string key = sprintf("%s-%s", path, name);
                fctx.dmap{key} = <AsyncCallInfo>{
                    "key": key,
                    "app": fctx.app,
                    "action": fctx.action,
                    "type": "get_dependent_options",
                    "label": sprintf("Dependent option function for app %y action %y option %y", fctx.app,
                        fctx.action, key),
                    "pool": fctx.pool,
                    "async_call": c,
                    "to": fctx.io_timeout,
                };
                TypeScriptActionInterface::registerAsyncCall(ignore_dup, \fctx.dmap{key}, "app", fctx.app,
                    fctx.action, key);
                info.attr.data_dependent_options = True;
                info.attr.dynamic = True;
            }
            if (exists (*code c = remove type_hash.get_default_value)) {
                string key = sprintf("%s-%s", path, name);
                fctx.dvmap{key} = <AsyncCallInfo>{
                    "key": key,
                    "app": fctx.app,
                    "action": fctx.action,
                    "type": "get_default_value",
                    "label": sprintf("Default value data function for app %y action %y option %y", fctx.app,
                        fctx.action, key),
                    "pool": fctx.pool,
                    "async_call": c,
                    "to": fctx.io_timeout,
                    "info": {
                        "subtype": True,
                    },
                };
                string ix = TypeScriptActionInterface::registerAsyncCall(ignore_dup, \fctx.dvmap{key}, "app",
                    fctx.app, fctx.action, key);
                info.attr.get_default_value = ix;
                info.attr.dynamic = True;
            }
        }

        return info;
    }

    #! Returns a hash that can be used to access these methods in JavaScript
    static hash<string, code> getInterface() {
        return {
            "registerApp": \TypeScriptActionInterface::registerApp(),
            "registerExistingApp": \TypeScriptActionInterface::registerExistingApp(),
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
    static auto execAppActionIntern(string app, string action, string connection, auto req,
            *hash<auto> request_options) {
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
            throw "TYPESCRIPT-APP-ERROR", sprintf("Cannot find any REST options for app %y (apps with REST options "
                "registered: %y)", app, keys armap);
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

    static *hash<AsyncCallInfo> getPostAuthCodeCall(string app) {
        return app_post_auth_code_map{app.lwr()};
    }

    static bool appSupportsEvents(string app) {
        return exists emap{app.lwr()};
    }

    static bool appSupportsRecords(string app) {
        string appname = app.lwr();
        return exists smap{appname} || exists crmap{appname} || exists updmap{appname} || exists upsmap{appname}
            || dmap{appname};
    }

    static bool appSupportsSearch(string app) {
        return exists smap{app.lwr()};
    }

    static bool appSupportsCreate(string app) {
        return exists crmap{app.lwr()};
    }

    static bool appSupportsUpdate(string app) {
        return exists updmap{app.lwr()};
    }

    static bool appSupportsUpsert(string app) {
        return exists upsmap{app.lwr()};
    }

    static bool appSupportsDelete(string app) {
        return exists dmap{app.lwr()};
    }

    static *hash<auto> getConnectionUpdateOptions(string app) {
        return app_conn_update_map{app.lwr()};
    }

    static setupConsoleLogger(LoggerLevel level = LoggerLevel::LevelInfo) {
        Logger logger("qore-ts-api-console", level);
        logger.addAppender(new StdoutAppender());
        DataProvider::setGlobalLogger(logger);
    }

    static registerLogger(LoggerInterface logger) {
        DataProvider::setGlobalLogger(logger);
    }

    #! Registers an API for creating a webhook
    /** @param create a callable value taking a hash argument with the following keys:
        - method (string): the HTTP method for the webhook
        - auth (int): one of:
          - QAUTH_NONE = 0 -> no auth required
          - QAUTH_QORUS = 1 -> authentication required
        - perms (*list<string>): an optional list of string permissions when \c auth is 1
        - callback (code): a callback taking the arguments passed to the webhook to generate events
        This callback must return a hash with \c url and \c ctx keys providing a URL string for the URL used for the
        webhook, and a context object for destroying the webhook, respectively
        @param destroy a callable value taking the hash returned by the \a create callback
    */
    static registerWebhookCreateDestroyApis(code create, code destroy) {
        if (WebhookCreate) {
            throw "WEBHOOK-API-ERROR", "There are already webhook creation and deletion APIs in place";
        }
        WebhookCreate = create;
        WebhookDelete = destroy;
    }

    #! Create a webhook and return the public URL for it
    /** @param a hash with the following keys for the webhook
        - method (string): the HTTP method for the webhook
        - auth (int): one of:
          - QAUTH_NONE = 0 -> no auth required
          - QAUTH_QORUS = 1 -> authentication required
        - perms (*list<string>): an optional list of string permissions when \c auth is 1
        - callback (code): a callback taking the arguments passed to the webhook to generate events

        @return the hash returned by the create callback with \c url and \c ctx keys
    */
    static hash<auto> createWebhook(hash<auto> h) {
        if (!WebhookCreate) {
            throw "WEBHOOK-API-ERROR", "Cannot create a webhook; there is no webhook creation API in place";
        }
        return TypeScriptActionInterface::WebhookCreate(h);
    }

    #! Destroy a webhook identified by the URL given as an argument
    static deleteWebhook(hash<auto> info) {
        if (!WebhookDelete) {
            throw "WEBHOOK-API-ERROR", "Cannot delete a webhook; there is no webhook deletion API in place";
        }
        TypeScriptActionInterface::WebhookDelete(info);
    }

    #! Returns a Swagger data provider for the given app
    static SwaggerDataProvider getSwaggerDataProvider(string app, *string swagger_schema) {
        string appname = app.lwr();
        *SwaggerDataProvider rv = exists swagger_schema
            ? app_swagger_schema_dp{appname}{swagger_schema}
            : app_swagger_dp{appname};
        if (!rv) {
            *SwaggerSchema schema = exists swagger_schema
                ? app_swagger_schema_map{appname}{swagger_schema}
                : app_swagger_map{appname};
            if (!schema) {
                if (exists swagger_schema) {
                    throw "APP-ERROR", sprintf("App %y has no Swagger schema %y", app, swagger_schema);
                } else {
                    throw "APP-ERROR", sprintf("App %y has no Swagger schema", app);
                }
            }
            if (exists swagger_schema) {
                app_swagger_schema_dp{appname}{swagger_schema} = rv = new SwaggerDataProvider(schema);
            } else {
                app_swagger_dp{appname} = rv = new SwaggerDataProvider(schema);
            }
        }
        return rv;
    }

    static private postProcessDynamicTypeInfo(*LoggerInterface logger, hash<AsyncCallInfo> call, *softlist<auto> args,
            reference<auto> info) {
        if (info.type != "hash") {
            return;
        }
        postProcessDynamicTypeInfoIntern(logger, call, args, \info);
    }

    static private postProcessDynamicTypeInfoIntern(*LoggerInterface logger, hash<AsyncCallInfo> call,
            *softlist<auto> args, reference<*hash<auto>> info) {
        foreach hash<auto> i in (info.fields.pairIterator()) {
            if (i.value.type == "hash" && i.value.fields) {
                postProcessDynamicTypeInfoIntern(logger, call, args, \info{i.key});
            }
            if (i.value.get_allowed_values.callp()) {
                code c = remove info.fields{i.key}.get_allowed_values;
                hash<AsyncCallInfo> new_call = call;
                new_call.type = "get_allowed_values";
                new_call.label = sprintf("Ad-hoc reference data function for app %y action %y option %y",
                    call.app, call.action, call.key),
                new_call.async_call = c;
                info.fields{i.key}.allowed_values = TypeScriptActionDataProviderBase::getAsyncValueArgs(logger,
                    new_call, args);
            }
            if (i.value.get_default_value.callp()) {
                code c = remove info.fields{i.key}.get_default_value;
                hash<AsyncCallInfo> new_call = call;
                new_call.type = "get_default_value";
                new_call.label = sprintf("Ad-hoc default value function for app %y action %y option %y",
                    call.app, call.action, call.key),
                new_call.async_call = c;
                info.fields{i.key}.default_value = TypeScriptActionDataProviderBase::getAsyncValueArgs(logger,
                    new_call, args);
            }
        }
    }

    static private overrideTypes(string app, SwaggerSchema schema, hash<auto> swagger_type_overrides) {
        foreach hash<auto> i in (swagger_type_overrides.pairIterator()) {
            list<string> l = i.key.split(".");
            string n = shift l;
            AbstractDataProviderType t = schema.getTypeForReference(n);
            if (!l) {
                # override existing type
                t = TypeScriptActionInterface::getModifiedType(app, n, t, i.value);
                schema.replaceCachedTypeForReference(n, t);
            } else {
                TypeScriptActionApiWithSchemaDataProvider::overrideOptionType("swagger-" + i.key, {
                    "app": app,
                    "action": "<all>",
                }, t, l, i.value, i.key);
            }
        }
    }

    static AbstractDataProviderType getModifiedType(string app, string opt, AbstractDataProviderType t,
            hash<auto> h, *ActionFunctionContext fctx) {
        if (h.type) {
            return TypeScriptActionInterface::getType("type", h.type, h.required, NOTHING, fctx);
        }

        QoreDataType rv;
        if (!(t instanceof QoreDataType)) {
            rv = new QoreDataType(new Type((rv ?? t).getBaseTypeName()));
        } else {
            rv = t.copy();
        }

        if (exists (*bool req = remove h.required)) {
            if (req) {
                if (!t.isMandatory()) {
                    TyeScriptTypeEditor::setMandatory(rv);
                }
            } else if (t.isMandatory()) {
                TyeScriptTypeEditor::setOrNothing(rv);
            }
        }

        map TyeScriptTypeEditor::setProp(rv, $1.key, $1.value),
            (remove h{"name", "display_name", "desc", "short_desc", "default_value"}).pairIterator();

        if (h) {
            throw "APP-ERROR", sprintf("App %y: cannot update the following attributes on Swagger types: %y", app, h);
        }

        return rv;
    }
}
}

namespace Priv {
class TyeScriptTypeEditor inherits QoreDataType {
    static setProp(QoreDataType t, string prop, auto val) {
        t{prop} = val;
    }

    static setMandatory(QoreDataType t) {
        if (t.name && t.name =~ /^\*/) {
            t.name = t.name[1..];
        }
        if (t.display_name && t.display_name =~ /^\*/) {
            t.display_name = t.display_name[1..];
        }
        t.or_nothing_type = False;
        remove t.accept_type_hash_simple."nothing";
        remove t.accept_type_hash."nothing";
        remove t.accept_type_hash_simple."null";
        remove t.accept_type_hash."null";
        remove t.return_type_hash_simple."nothing";
        remove t.return_type_hash."nothing";
        remove t.return_type_hash_simple."null";
        remove t.return_type_hash."null";
        remove t.base_type_hash{NT_NOTHING};
        remove t.base_type_hash{NT_NULL};
        t.type = t.type.getMandatoryType();
    }

    static setOrNothing(QoreDataType t) {
        if (t.name && t.name !~ /^\*/) {
            t.name = "*" + t.name;
        }
        if (t.display_name && t.display_name !~ /^\*/) {
            t.display_name = "*" + t.display_name;
        }
        t.or_nothing_type = True;
        t.accept_type_hash_simple."nothing" = t.accept_type_hash."nothing" = True;
        t.return_type_hash_simple."nothing" = t.return_type_hash."nothing" = True;
        if (!t.options."qore.no_null") {
            t.accept_type_hash_simple."null" = t.accept_type_hash."null" = True;
        }
        t.type = t.type.getOrNothingType();
    }
}

# For delayed app initialization
hashdecl AppInfo {
    #! The app info from JavaScript
    hash<auto> app;

    #! The current working directory
    string cwd = getcwd();

    # The program pool info
    JavaScriptProgramPool pool;
}

# For delayed action initialization
hashdecl ActionInfo {
    # The action info from JavaScript
    hash<auto> action;

    # The program pool info
    JavaScriptProgramPool pool;
}
}

# private namespace
namespace TSAI {
# private class with convenience methods
class TSAI inherits TypeScriptActionInterface {
    static debug(string fmt, ...) {
        if (*LoggerInterface logger = DataProvider::getGlobalLogger()) {
            logger.logArgs(LoggerLevel::LevelDebug, fmt, argv);
        } else {
            stdout.vprintf(fmt + "\n", argv);
        }
    }

    static info(string fmt, ...) {
        if (*LoggerInterface logger = DataProvider::getGlobalLogger()) {
            logger.logArgs(LoggerLevel::LevelInfo, fmt, argv);
        } else {
            stdout.vprintf(fmt + "\n", argv);
        }
    }

    static warn(string fmt, ...) {
        if (*LoggerInterface logger = DataProvider::getGlobalLogger()) {
            logger.logArgs(LoggerLevel::LevelWarn, fmt, argv);
        } else {
            stderr.vprintf(fmt + "\n", argv);
        }
    }

    static error(string fmt, ...) {
        if (*LoggerInterface logger = DataProvider::getGlobalLogger()) {
            logger.logArgs(LoggerLevel::LevelError, fmt, argv);
        } else {
            stderr.vprintf(fmt + "\n", argv);
        }
    }

    static fatal(string fmt, ...) {
        if (*LoggerInterface logger = DataProvider::getGlobalLogger()) {
            logger.logArgs(LoggerLevel::LevelFatal, fmt, argv);
        } else {
            stderr.vprintf(fmt + "\n", argv);
        }
    }

    static logArgs(Logger::LoggerLevel level, string fmt, *list<auto> args) {
        if (*LoggerInterface logger = DataProvider::getGlobalLogger()) {
            logger.logArgs(level, fmt, args);
        } else {
            stderr.vprintf(fmt + "\n", args);
        }
    }
}

class ActionFunctionContext {
    public {
        string app;
        string action;

        # the program pool for JS execution
        JavaScriptProgramPool pool;

        # maps from options to "get_allowed_values" code
        *hash<string, hash<AsyncCallInfo>> omap;
        # maps from options to "get_dependent_options" code
        *hash<string, hash<AsyncCallInfo>> dmap;
        # maps from options to "get_dynamic_type" code
        *hash<string, hash<AsyncCallInfo>> dtmap;
        # maps from options to "rest_get_allowed_values" descriptions
        *hash<string, hash<RestGetAllowedValuesInfo>> romap;
        # maps from options to "get_default_value" code
        *hash<string, hash<AsyncCallInfo>> dvmap;
        # maps from dependent options -> option -> True
        *hash<string, hash<string, bool>> depmap;

        date io_timeout;
    }

    constructor(string app) {
        self.app = app;
        action = "none";
    }

    constructor(string app, string action, JavaScriptProgramPool pool,
            date io_timeout = seconds(TypeScriptActionInterface::DefaultIoTimeoutSecs)) {
        self.app = app;
        self.action = action;
        self.pool = pool;
        self.io_timeout = io_timeout;
   }

    constructor(ActionFunctionContext fctx) {
        app = fctx.app;
        action = fctx.action;
        pool = fctx.pool;
        omap = fctx.omap;
        dmap = fctx.dmap;
        dtmap = fctx.dtmap;
        romap = fctx.romap;
        dvmap = fctx.dvmap;
        depmap = fctx.depmap;
        io_timeout = fctx.io_timeout;
    }
}
}