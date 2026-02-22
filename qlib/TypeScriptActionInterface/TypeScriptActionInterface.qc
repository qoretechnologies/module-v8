# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionInterface.qc Copyright 2024 - 2026 Qore Technologies, s.r.o.

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

#! When defining Google apps
hashdecl GoogleAppInfo {
    #! The name of the Google API in the Discovery API
    string api;

    #! The resource path to the APIs under the app in the Discory API
    /** Only provided if the app should generate actions automatically
    */
    *string resource;

    #! Any path arguments to be automatically provided when making calls: key -> value
    *hash<auto> path_args;

    #! Any path prefix for the subpaths
    /** This option is only used with subpaths, which is only used if \a resource is set
    */
    *string path_prefix;

    #! A list of one or more subpaths to use to only expose the given paths in the app
    /** Ignored if \a resource is not set
    */
    *list<string> subpaths;
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
            "name", "display_name", "short_desc", "desc", "example_value", "default_value",
            "type", "allowed_values", "allowed_values_creatable",
            "get_allowed_values",
            "element_type", "element_allowed_values", "element_allowed_values_creatable",
            "get_element_allowed_values",
            "attr", "required", "on_change", "preselected", "depends_on", "validation_regex",
        );

        const TypeScriptAppRestConnectionOptions = RestConnection::ConnectionScheme.options;

        const TypeScriptAwsAppRestConnectionOptions = TypeScriptAwsAppRestConnection::ConnectionScheme.options;

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

        #! Default table path var
        const TablePathVar = <DataProviderPathVarInfo>{
            "display_name": "Table",
            "desc": "The table name",
            "short_desc": "The table name",
        };
    }

    private {
        #! App map for delayed initialization: app -> info
        static hash<string, hash<AppInfo>> appmap;

        #! App map after app initialization: app -> info
        static hash<string, hash<AppInfo>> initialized_appmap;

        #! Init map for apps already initialized
        static hash<string, bool> initmap;

        #! Action map for delayed initialization: app -> action -> info
        static hash<string, hash<string, hash<ActionInfo>>> actionmap;

        #! Maps from scheme names to apps
        static hash<string, string> samap;

        #! Maps from app names to REST getOptions
        static hash<string, hash<auto>> armap;

        #! Maps from app names to REST schemas (Swagger 2.0 or OpenAPI 3.0/3.1)
        static hash<string, AbstractRestSchemaValidator> app_schema_map;

        #! Maps from app names to RestSchemaDataProvider objects
        static hash<string, RestSchemaDataProvider> app_schema_dp;

        #! Maps from app and schema names to REST schemas (Swagger 2.0 or OpenAPI 3.0/3.1)
        static hash<string, hash<string, AbstractRestSchemaValidator>> app_schema_schema_map;

        #! Maps from app and schema names to RestSchemaDataProvider objects
        static hash<string, hash<string, RestSchemaDataProvider>> app_schema_schema_dp;

        #! Maps from lower-case app names to Google app definitions
        static hash<string, hash<GoogleAppInfo>> google_app_map;

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

        #! Maps from app names to connection -> REST schema path option maps
        static hash<string, hash<string, string>> app_conn_opt_map;

        #! Maps from app names to URL option names
        static hash<string, string> app_url_option_map;

        #! Flag AWS apps
        static hash<string, bool> aws_app_map;

        #! Maps from app names to include_response_headers flag (default: True)
        static hash<string, bool> app_include_response_headers_map;

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

        #! In-process pool for concurrent access without IPC overhead
        static JavaScriptInProcessPool in_process_server;

        #! In-process on-demand flag
        static bool in_process_on_demand;

        #! Optional pool for on-demand in-process server creation
        static *JavaScriptProgramPool in_process_on_demand_pool;

        #! Optional maximum pool size for on-demand in-process server creation
        static *int in_process_max_size;
    }

    #! Performs static initialization of the module
    static init() {
        TypeScriptActionInterface::checkRoot();

        int opts = DataProvider::getOptions();
        if (opts & DPO_EnableServers) {
            on_demand = True;
        } else if (opts & DPO_EnableInProcessServers) {
            in_process_on_demand = True;
        }
        if (opts & DPO_DisableOnDemandInitialization) {
            TypeScriptActionInterface::initAllApps(opts & DPO_EnableOnDemandActions ? False : True);
        }
    }

    #! Register one or more dynamic apps from a JavaScript file
    static *list<string> registerDynamicAppsFromJavaScript(string base_dir, data fdata, *bool replace) {
        *list<string> rv = TypeScriptActionInterfacePriv::processDynamicJavaScriptAppFile(base_dir, fdata, replace);
        map initApp($1), rv;
        return rv;
    }

    #! Deregister a dynamic app given the app name
    static deregisterDynamicApp(string name) {
        *hash<DataProviderAppInfo> app = DataProviderActionCatalog::deregisterDynamicApp(name);
        if (!app) {
            return;
        }
        on_success if (app.info.path.val()) {
            remove_path(app.info.path);
        }

        remove appcasemap{name};
        remove initmap{name};
        remove appmap{name};
        remove initialized_appmap{name};

        string appname = app.name.lwr();

        root.deregisterChild(appname);

        string sname = "tsrest-" + appname;
        remove samap{sname};
        remove armap{appname};
        remove aumap{appname};
        remove app_post_auth_map{appname};
        remove app_post_auth_code_map{appname};
        remove app_conn_update_map{appname};
        remove app_conn_opt_map{appname};
        remove app_url_option_map{appname};
        remove aws_app_map{appname};
        remove app_include_response_headers_map{appname};
        remove app_schema_map{appname};
        remove app_schema_schema_map{appname};
        remove google_app_map{appname};
        remove atmap{appname};
        ConnectionSchemeCache::deregisterScheme(sname);
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
    static shutdownServer(*int signal) {
        sm.lock();
        on_exit sm.unlock();

        *JavaScriptThreadProcessPool server = remove TypeScriptActionInterface::server;
        if (!server) {
            return;
        }

        DataProvider::deregisterShutdownHandler(server.uniqueHash());
        delete server;
    }

    #! Returns the first registered JavaScriptProgramPool, if any
    static *JavaScriptProgramPool getFirstPool() {
        return TypeScriptActionInterfacePriv::getFirstPool();
    }

    #! Sets the in-process server to start on demand
    /** @param pool optional specific pool to use; if not provided, uses the first registered pool
        @param max_size optional maximum number of programs in the pool; NOTHING = unlimited
    */
    static startInProcessServerOnDemand(*JavaScriptProgramPool pool, *int max_size) {
        sm.lock();
        on_exit sm.unlock();

        in_process_on_demand = True;
        in_process_on_demand_pool = pool;
        in_process_max_size = max_size;
    }

    #! Sets the in-process server directly
    /** Replaces any existing in-process server with the given pool instance.
        The caller is responsible for creating the pool with the desired max_size.

        @param ip the in-process pool to use as the server

        @par Example:
        @code{.py}
        JavaScriptInProcessPool ip(pool, 8);
        TypeScriptActionInterface::setInProcessServer(ip);
        @endcode
    */
    static setInProcessServer(JavaScriptInProcessPool ip) {
        sm.lock();
        on_exit sm.unlock();

        in_process_server = ip;
    }

    #! Disables on-demand in-process server creation and clears any stored pool/max_size configuration
    static disableInProcessServerOnDemand() {
        sm.lock();
        on_exit sm.unlock();

        in_process_on_demand = False;
        remove in_process_on_demand_pool;
        remove in_process_max_size;
    }

    #! Returns the in-process pool if active, starting it on demand if configured
    /** Uses double-checked locking: first checks without the mutex for the fast path,
        then acquires the mutex and checks again to avoid races during lazy creation.

        @return the in-process pool, or NOTHING if not active and on-demand is not configured
    */
    static *JavaScriptInProcessPool checkInProcessServer() {
        if (in_process_server) {
            return in_process_server;
        }
        if (!in_process_on_demand) {
            return;
        }

        # lock and check everything again in case of contention
        sm.lock();
        on_exit sm.unlock();
        if (in_process_server) {
            return in_process_server;
        }
        if (in_process_on_demand) {
            TypeScriptActionInterface::startInProcessServerIntern();
            return in_process_server;
        }
    }

    #! Starts the in-process server using registered program pools
    private static startInProcessServerIntern() {
        # use the on-demand pool if set, otherwise find the first registered pool
        *JavaScriptProgramPool pool = in_process_on_demand_pool ?? TypeScriptActionInterfacePriv::getFirstPool();
        if (!pool) {
            throw "IN-PROCESS-SERVER-ERROR", "Cannot start in-process server: no JavaScriptProgramPool available";
        }

        in_process_server = new JavaScriptInProcessPool(pool, in_process_max_size);
        DataProvider::registerShutdownHandler(in_process_server.uniqueHash(),
            \TypeScriptActionInterface::shutdownInProcessServer());
    }

    #! Shuts the in-process server down if it's running
    /** Calls shutdown() on the pool (which wakes waiting threads and sets the shutdown flag)
        rather than deleting the pool immediately, since concurrent threads may still be
        executing against the pool via checkInProcessServer()->execCall().
    */
    static shutdownInProcessServer(*int signal) {
        sm.lock();
        on_exit sm.unlock();

        *JavaScriptInProcessPool ip = remove in_process_server;
        if (!ip) {
            return;
        }

        DataProvider::deregisterShutdownHandler(ip.uniqueHash());
        ip.shutdown();
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
            # in pool clone mode, capture closures without modifying global state
            if (_pool_clone_mode) {
                call.key = key;
                _pool_clone_closures{key} = call.async_call;
                return key;
            }
            if (acmap{key} && ((acmap{key} - "key") == (call - "key"))) {
                # function is being reused
                return key;
            }
            # function is being replaced
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
        # in pool clone mode, capture closures without modifying global state
        if (_pool_clone_mode) {
            call.key = key;
            _pool_clone_closures{key} = call.async_call;
            return key;
        }
        if (acmap{key} && ((acmap{key} - "key") == (call - "key"))) {
            # function is being reused
            return key;
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
        if (first || _pool_clone_mode) {
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
        if (first || _pool_clone_mode) {
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
        if (first || _pool_clone_mode) {
            TypeScriptActionInterface::registerAction(action.toData(), pool);
            TSAI::debug("Registered TypeScript app %y action %y: %s", action.app, action.action);
        }
    }

    static registerApp(hash<auto> app, JavaScriptProgramPool pool) {
        string appname = app.name.lwr();

        if (!_pool_clone_mode) {
            # Validation only needed for first registration
            if (app.name =~ / /) {
                throw "APP-ERROR", sprintf("App name %y is invalid; it contains one or more spaces", app.name);
            }
            deregisterDynamicApp(app.name);
            if (exists appcasemap{app.name}) {
                if (IgnoreDuplicateAppHelper::get()) {
                    return;
                }
                throw "APP-ERROR", sprintf("App %y has already been registered and is pending initialization",
                    app.name);
            }
            if (initmap{app.name}) {
                if (IgnoreDuplicateAppHelper::get()) {
                    return;
                }
                throw "APP-ERROR", sprintf("App %y has already been registered", app.name);
            }
            if (*hash<auto> info = DynamicAppContextHelper::get(app.name)) {
                app += info;
                DynamicAppContextHelper::addApp(app.name);
                TSAI::info("Registering dynamic app with info: %N", info);
            }
        }

        if (_pool_clone_mode) {
            # In clone mode, extract all app-level closures via the shared tryGetAsyncAttribute path.
            # Also extract REST modifier closures that are normally registered in registerAppIntern.
            captureAppClosures(app, pool);
            return;
        }

        hash<AsyncCallInfo> get_table_list;
        hash<AsyncCallInfo> begin_transaction;
        hash<AsyncCallInfo> commit;
        hash<AsyncCallInfo> rollback;
        hash<AsyncCallInfo> get_record_type;
        hash<AsyncCallInfo> search_records;
        hash<AsyncCallInfo> create_records;
        hash<AsyncCallInfo> update_records;
        hash<AsyncCallInfo> upsert_records;
        hash<AsyncCallInfo> delete_records;

        hash<auto> expressions;
        hash<auto> search_options;
        hash<auto> create_options;
        hash<auto> upsert_options;

        timeout io_timeout;
        if (app.get_table_list) {
            io_timeout = seconds(remove app.io_timeout_secs ?? DefaultIoTimeoutSecs);
            get_table_list = tryGetAsyncAttribute(\app, "get_table_list", "get table list", pool, io_timeout,
                app.name);
        }
        code check_record_based = sub () {
            if (!get_table_list) {
                throw "APP-ERROR", sprintf("App %y cannot define 'begin_transaction' without also defining "
                    "'get_table_list'", app.name);
            }
        };
# transaction management is disabled until we have a concrete use case
# and solve transaction persistence / thread-resource issues
%ifdef TransactionManagement
        if (app.begin_transaction) {
            check_record_based();
            begin_transaction = tryGetAsyncAttribute(\app, "begin_transaction", "begin transaction", pool, io_timeout,
                app.name);
        }
        if (app.commit) {
            check_record_based();
            commit = tryGetAsyncAttribute(\app, "commit", "commit transaction", pool, io_timeout,
                app.name);
        } else if (app.begin_transaction) {
            throw "APP-ERROR", sprintf("App %y cannot define 'begin_transaction' without also defining 'commit'",
                app.name);
        }
        if (app.rollback) {
            check_record_based();
            rollback = tryGetAsyncAttribute(\app, "rollback", "rollback transaction", pool, io_timeout,
                app.name);
        } else if (app.commit) {
            throw "APP-ERROR", sprintf("App %y cannot define 'commit' without also defining 'rollback'",
                app.name);
        }
%else
        app -= ("begin_transaction", "commit", "rollback");
%endif
        if (app.get_record_type) {
            check_record_based();
            get_record_type = tryGetAsyncAttribute(\app, "get_record_type", "get record type", pool, io_timeout,
                app.name);
        } else if (get_table_list) {
            throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y is missing its \"get_record_type\" attribute, but this "
                "attribute is required for apps supporting tables", app.name);
        }

        if (app.expressions) {
            check_record_based();
            expressions = remove app.expressions;
        }

        if (app.search_records) {
            check_record_based();
            search_records = tryGetAsyncAttribute(\app, "search_records", "search records", pool, io_timeout,
                app.name);
        }

        if (app.create_records) {
            check_record_based();
            create_records = tryGetAsyncAttribute(\app, "create_records", "create records", pool, io_timeout,
                app.name);

            if (app.create_options) {
                create_options = remove app.create_options;
            }
        } else if (app.create_options) {
            throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y cannot define \"get_create_options\" without also "
                "defining 'create_records()'", app.name);
        }

        if (app.update_records) {
            check_record_based();
            update_records = tryGetAsyncAttribute(\app, "update_records", "update records", pool, io_timeout,
                app.name);
        }

        if (app.upsert_records) {
            check_record_based();
            upsert_records = tryGetAsyncAttribute(\app, "upsert_records", "upsert records", pool, io_timeout,
                app.name);

            if (app.upsert_options) {
                upsert_options = remove app.upsert_options;
            }
        } else if (app.upsert_options) {
            throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y cannot define \"upsert_options\" without also "
                "defining 'upsert_records()'", app.name);
        }

        if (app.delete_records) {
            check_record_based();
            delete_records = tryGetAsyncAttribute(\app, "delete_records", "delete records", pool, io_timeout,
                app.name);
        }

        if (app.search_options) {
            if (!expressions) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y cannot define \"search_options\" when it "
                    "uses generic search functionality (missing 'expressions')", app.name);
            }
            if (!search_records && !update_records && !delete_records) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y cannot define \"search_options\" without also "
                    "defining at least one of 'search_records()', 'update_records()', or 'delete_records()'",
                    app.name);
            }
            search_options = remove app.search_options;
        }
        appmap{app.name} = <AppInfo>{
            "app": app,

            "get_table_list": get_table_list,
            "begin_transaction": begin_transaction,
            "commit": commit,
            "rollback": rollback,
            "get_record_type": get_record_type,
            "search_records": search_records,
            "create_records": create_records,
            "update_records": update_records,
            "upsert_records": upsert_records,
            "delete_records": delete_records,

            "expressions": expressions,
            "search_options": search_options,
            "create_options": create_options,
            "upsert_options": upsert_options,

            "pool": pool,
        };

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
        TSAI::info("Registered TypeScript app %y -> %y", app.name, app.info);
        TSAI::debug("Registered TypeScript app %y", app.name);
    }

    static registerExistingApp(hash<auto> app, JavaScriptProgramPool pool) {
        if (_pool_clone_mode) {
            # In clone mode, existing apps have no JS closures to capture; skip
            return;
        }
        if (app.name.typeCode() != NT_STRING || !app.name.val()) {
            throw "APP-ERROR", sprintf("App name %y is invalid; must be a non-empty string", app.name);
        }
        if (app."module".typeCode() != NT_STRING || !app."module".val()) {
            throw "APP-ERROR", sprintf("App module %y is invalid; must be a non-empty string", app."module");
        }
        string appname = app.name.lwr();
        if (exists appcasemap{app.name}) {
            if (IgnoreDuplicateAppHelper::get()) {
                return;
            }
            throw "APP-ERROR", sprintf("App %y has already been registered and is pending initialization", app.name);
        }
        if (initmap{app.name}) {
            if (IgnoreDuplicateAppHelper::get()) {
                return;
            }
            throw "APP-ERROR", sprintf("App %y has already been registered", app.name);
        }

        # load the referenced module immediately
        load_module(app."module");

        hash<AppInfo> info = <AppInfo>{
            "app": app,
            "pool": pool,
        };

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

    static bool initApp(string app, *bool do_actions, *string dynamic_path) {
        if (exists (*string rn = appcasemap{app})) {
            app = rn;
        }
        return TypeScriptActionInterface::initAppIntern(app, do_actions, dynamic_path);
    }

    static hash<AppInfo> getInitializedRecordBasedAppInfo(string app) {
        if (exists (*string rn = appcasemap{app})) {
            app = rn;
        }
        *hash<AppInfo> info = initialized_appmap{app};
        if (!info) {
            throw "APP-ERROR", sprintf("No app %y has been initialized", app);
        }
        if (!info.get_table_list) {
            throw "APP-ERROR", sprintf("App %y is not a record-based app", app);
        }
        return info;
    }

    static private synchronized bool initAppIntern(string app, *bool do_actions, *string dynamic_path) {
        if (initmap{app}) {
            return False;
        }
        if (*hash<AppInfo> info = remove appmap{app}) {
            return TypeScriptActionInterface::initAppIntern(info, do_actions);
        }
        if (dynamic_path) {
            string fname = sprintf("%s/index.js", dynamic_path);
            if (is_readable(fname)) {
                TSAI::debug("Loading dynamic app %y from path %y", app, fname);
                # try to load the dynamic app from the given path
                if (*list<string> apps = TypeScriptActionInterface::registerDynamicAppsFromJavaScript(
                    dynamic_path, File::readTextFile(fname))) {
                    return TypeScriptActionInterface::initAppIntern(app, do_actions);
                }
            }
        }
        throw "APP-ERROR", sprintf("No app %y has been registered for deferred initialization by the "
            "TypeScriptActionInterface module", app);
    }

    static private bool initAppIntern(hash<AppInfo> info, *bool do_actions) {
        initialized_appmap{info.app.name} = info;
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
        # always initialize record-based actions if applicable
        if (info.get_table_list) {
            TypeScriptActionInterface::registerRecordBasedActions(info);
        }

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

        # Normalize swagger_* aliases to openapi_* (openapi_* are the primary property names)
        if (app.swagger) {
            app.openapi = remove app.swagger;
        }
        if (app.swagger_options) {
            app.openapi_options = remove app.swagger_options;
        }
        if (app.swagger_paths) {
            app.openapi_paths = remove app.swagger_paths;
        }
        if (app.swagger_type_overrides) {
            app.openapi_type_overrides = remove app.swagger_type_overrides;
        }
        if (app.swagger_schema_map) {
            app.openapi_schema_map = remove app.swagger_schema_map;
        }

        AbstractRestSchemaValidator schema;
        hash<string, AbstractRestSchemaValidator> schema_schema_map;
        # Extract include_response_headers flag from openapi_options (default: True for backwards compatibility)
        *bool include_response_headers;
        if (app.openapi_options.hasKey("include_response_headers")) {
            include_response_headers = app.openapi_options.include_response_headers;
            remove app.openapi_options.include_response_headers;
        }
        # Handle openapi property (with auto-detection for Swagger 2.0 vs OpenAPI 3.0 content)
        if ((*string openapi_loc = remove app.openapi).val()) {
            on_error rethrow $1.err, sprintf("%s (while loading app %y)", $1.desc, app.name);
            if (app.openapi_schema_map) {
                throw "APP-ERROR", "Invalid 'openapi_schema_map' property; this property "
                    "cannot be given if `openapi` is provided";
            }
            schema = TypeScriptActionInterface::getRestSchema(appname, openapi_loc, remove app.openapi_options,
                remove app.openapi_paths, remove app.openapi_type_overrides);
        # Handle schema map
        } else if (*hash<auto> smap = remove app.openapi_schema_map) {
            *hash<auto> schema_options = remove app.openapi_options;
            foreach hash<auto> i in (smap.pairIterator()) {
                on_error rethrow $1.err, sprintf("%s (while creating schema for app %y schema %y): %y", $1.desc,
                    app.name, i.key, i.value);
                # Normalize swagger alias to openapi in map entries
                if (i.value.swagger) {
                    i.value.openapi = remove i.value.swagger;
                }
                if (i.value.swagger_options) {
                    i.value.openapi_options = remove i.value.swagger_options;
                }
                if (i.value.swagger_paths) {
                    i.value.openapi_paths = remove i.value.swagger_paths;
                }
                if (i.value.swagger_type_overrides) {
                    i.value.openapi_type_overrides = remove i.value.swagger_type_overrides;
                }
                string schema_loc = i.value.openapi;
                if (!schema_loc) {
                    throw "APP-ERROR", sprintf("Schema map entry %y must have an 'openapi' key",
                        i.key);
                }
                schema_schema_map{i.key} = TypeScriptActionInterface::getRestSchema(appname, schema_loc,
                    remove i.value.openapi_options ?? schema_options,
                    remove i.value.openapi_paths, remove i.value.openapi_type_overrides);
            }
        }
        hash<auto> app0 += app;
        if (app.logo) {
            app0.logo = parse_base64_string(app.logo);
        }
        # default groups to ApiIntegration for JS/TS apps that don't specify it
        if (!app0.groups) {
            app0.groups = (DataProvider::AppGroup::ApiIntegration,);
        }

        hash<GoogleAppInfo> google_app;
        if (exists (*hash<auto> h = remove app0.google_app)) {
            if (schema) {
                throw "APP-ERROR", sprintf("App %y cannot define both the \"google_app\" (%y) and \"openapi\" "
                    "attributes", app.name, google_app);
            }
            if (schema_schema_map) {
                throw "APP-ERROR", sprintf("App %y cannot define both the \"google_app\" (%y) and "
                    "\"openapi_schema_map\" attributes", app.name, google_app);
            }
            if (h.api.typeCode() != NT_STRING) {
                throw "APP-ERROR", sprintf("App %y google_app.api must be a string; got type %y instead",
                    app.name, h.api.fullType());
            }
            if (exists h.resource && (h.resource.typeCode() != NT_STRING)) {
                throw "APP-ERROR", sprintf("App %y google_app.resource must be a string if present; got type %y "
                    "instead", app.name, h.resource.fullType());
            }
            if (exists h.path_args && (h.path_args.typeCode() != NT_HASH)) {
                throw "APP-ERROR", sprintf("App %y google_app.path_args must be a hash; got type %y instead",
                    app.name, h.path_args.fullType());
            }
            if (exists h.path_prefix && (h.path_prefix.typeCode() != NT_STRING)) {
                throw "APP-ERROR", sprintf("App %y google_app.path_prefix must be a string; got type %y instead",
                    app.name, h.path_prefix.fullType());
            }
            if (exists h.subpaths && (h.subpaths.typeCode() != NT_LIST)) {
                throw "APP-ERROR", sprintf("App %y google_app.subpaths must be a list; got type %y instead",
                    app.name, h.subpaths.fullType());
            }

            google_app = cast<hash<GoogleAppInfo>>(h);
        }

        hash<string, bool> url_template_options;
        if (*hash<auto> rest = remove app0.rest) {
            string sname = "tsrest-" + app.name.lwr();

            *string url = remove rest.url;
            if (url =~ /^https?:\/\//) {
                url = regex_subst(url, "^https?", sname);
            }

            # check for AWS apps
            *string aws_service = remove app0.rest_modifiers.aws_service;

            hash<string, hash<ConnectionOptionInfo>> opts = aws_service
                ? TypeScriptAwsAppRestConnectionOptions
                : TypeScriptAppRestConnectionOptions;
            foreach hash<auto> i in (rest.pairIterator()) {
                if (!opts{i.key}) {
                    throw "TYPESCRIPT-REST-OPTION-ERROR", sprintf("Unknown REST connection option %y for app %y; known "
                        "options: %y", i.key, app.name, keys opts);
                }
                if (exists i.value) {
                    opts{i.key}.default_value = i.value;
                }
            }
            if (aws_service) {
                opts.service.default_value = aws_service;
            }

            *string required_options;
            hash<AsyncCallInfo> post_auth;
            hash<AsyncCallInfo> post_auth_code;
            hash<auto> conn_update;
            hash<string, string> conn_opt_map;
            string url_from_option;
            *softlist<hash<UiMessageInfo>> messages;
            if (*hash<auto> rest_modifiers = remove app0.rest_modifiers) {
                foreach hash<auto> i in (rest_modifiers.options.pairIterator()) {
                    if (i.value.allowed_values) {
                        i.value.allowed_values = map cast<hash<AllowedValueInfo>>($1), i.value.allowed_values;
                    }
                    if (i.value.element_allowed_values) {
                        i.value.element_allowed_values = map cast<hash<AllowedValueInfo>>($1),
                            i.value.element_allowed_values;
                    }
                    opts{i.key} = cast<hash<ConnectionOptionInfo>>(i.value);
                }
                if (rest_modifiers.required_options.val()) {
                    required_options = rest_modifiers.required_options;
                    if (aws_service) {
                        if (required_options !~ /\bregion\b/) {
                            required_options += ",region";
                        }
                        if (required_options !~ /\baccess_key_id\b/) {
                            required_options += ",access_key_id";
                        }
                        if (required_options !~ /\bsecret_access_key\b/) {
                            required_options += ",secret_access_key";
                        }
                    }
                } else if (aws_service) {
                    required_options = "region,access_key_id,secret_access_key";
                }
                if (rest_modifiers.messages) {
                    try {
                        messages = map cast<hash<UiMessageInfo>>($1), rest_modifiers.messages;
                    } catch (hash<ExceptionInfo> ex) {
                        throw "REST-MODIFIER-ERROR", sprintf("The 'messages' REST modifier option must be a list of "
                            "UI message info hashes; got %y -> %s", rest_modifiers.messages, ex.desc);
                    }
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
                if (rest_modifiers.url_from_option) {
                    url_from_option = rest_modifiers.url_from_option;
                }
            } else if (aws_service) {
                required_options = "region,access_key_id,secret_access_key";
            }

            hash<ConnectionSchemeInfo> scheme = <ConnectionSchemeInfo>{
                "display_name": app.display_name,
                "short_desc": app.short_desc,
                "desc": app.desc,
                "cls": Class::forName(aws_service ? "TypeScriptAwsAppRestConnection" : "TypeScriptAppRestConnection"),
                "schemes": {
                    sname: True,
                },
                "base_scheme_map": {
                    "https": sname,
                },
                "options": opts,
                "required_options": required_options,
                "auto_url": exists url,
                "messages": messages,
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
            if (url_from_option) {
                app_url_option_map{appname} = url_from_option;
            }
            if (aws_service) {
                aws_app_map{appname} = True;
            }
        }
        DataProviderActionCatalog::registerApp(cast<hash<DataProviderAppInfo>>(app0));

        TypeScriptActionAppDataProvider prov(appname);
        TypeScriptActionInterface::checkRoot();
        root.registerChild(appname, prov);

        if (google_app) {
            if (google_app.resource.val()) {
                # register all actions for the app
                prov.registerGoogleAppActions(app.name, google_app);
            }
            google_app_map{appname} = google_app;
        }

        if (schema) {
            app_schema_map{appname} = schema;
        }
        if (schema_schema_map) {
            app_schema_schema_map{appname} = schema_schema_map;
        }
        if (url_template_options) {
            atmap{appname} = url_template_options;
        }
        # Store include_response_headers flag if explicitly set (only store if False to save memory)
        if (exists include_response_headers && !include_response_headers) {
            app_include_response_headers_map{appname} = include_response_headers;
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

    static AbstractRestSchemaValidator getRestSchema(string appname, string schema_loc, *hash<auto> schema_opts,
            *list<auto> paths, *hash<auto> type_overrides) {
        # first check cache
        string path_sha512;
        if (paths) {
            path_sha512 = (foldl $1 + "," + $2, paths).toSHA512();
        } else {
            path_sha512 = "none";
        }
        string filename = sprintf("schema-%s-%s.yaml", encode_url(schema_loc, True), path_sha512);
        bool store_in_cache;
        *string schema_source = TypeScriptActionInterface::getCachedSchema(\store_in_cache, filename);
        if (!schema_source) {
            schema_source = FileLocationHandler::getTextFileFromLocation(schema_loc);
            if (paths) {
                # Note: path optimization currently only works for Swagger 2.0 schemas
                schema_source = TypeScriptActionInterface::getOptimizedSchema(appname, schema_source, paths);
            }
        }

        # Auto-detect schema type (Swagger 2.0 vs OpenAPI 3.0) and format (JSON vs YAML)
        AbstractRestSchemaValidator schema = RestSchemaLoader::fromString(schema_source, NOTHING, schema_opts);

        if (store_in_cache) {
            TypeScriptActionInterface::cacheSchema(filename, schema_source);
        }
        if (type_overrides) {
            TypeScriptActionInterface::overrideTypes(appname, schema, type_overrides);
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
                if (!RestSchemaDataProvider::HttpMethods{m}) {
                    throw "INVALID-HTTP-METHOD", sprintf("Method %y is unknown; expecting one of: %y", m,
                        keys RestSchemaDataProvider::HttpMethods);
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

    static registerRecordBasedActions(hash<AppInfo> info) {
        int cnt;
        # option function map; type -> function map
        hash<string, hash<string, hash<auto>>> ofmap;
        hash<DataProviderInfo> prov_info = TypeScriptActionRecordBasedDataProvider::getDataProviderInfo(info, \ofmap);
        if (info.search_records) {
            string desc = sprintf("Search for matching records in the given table in app %y", info.app.name);
            DataProviderActionCatalog::registerAction(<DataProviderActionInfo>{
                "app": info.app.name,
                "action": "search",
                "display_name": "Search Records",
                "short_desc": desc,
                "desc": desc,
                "action_code": DPAT_FIND,
                "path": "tables/{table}",
                "path_vars": {
                    "table": TablePathVar,
                },
                "groups": ("Record-Based",),
                "data_dependent_options": True,
                "data_provider_info": prov_info,
            });
            desc = sprintf("Search for a single matching record in the given table in app %y", info.app.name);
            DataProviderActionCatalog::registerAction(<DataProviderActionInfo>{
                "app": info.app.name,
                "action": "search-single",
                "display_name": "Find a Single Record",
                "short_desc": desc,
                "desc": desc,
                "action_code": DPAT_FIND_SINGLE,
                "path": "tables/{table}",
                "path_vars": {
                    "table": TablePathVar,
                },
                "groups": ("Record-Based",),
                "data_dependent_options": True,
                "data_provider_info": prov_info,
            });
            ++cnt;
        }
        if (info.create_records) {
            string desc = sprintf("Create new records in the given table in app %y", info.app.name);
            DataProviderActionCatalog::registerAction(<DataProviderActionInfo>{
                "app": info.app.name,
                "action": "create",
                "display_name": "Create Records",
                "short_desc": desc,
                "desc": desc,
                "action_code": DPAT_CREATE,
                "path": "tables/{table}",
                "path_vars": {
                    "table": TablePathVar,
                },
                "groups": ("Record-Based",),
                "data_dependent_options": True,
                "data_provider_info": prov_info,
            });
            ++cnt;
        }
        if (info.update_records) {
            string desc = sprintf("Update existing records in the given table in app %y", info.app.name);
            DataProviderActionCatalog::registerAction(<DataProviderActionInfo>{
                "app": info.app.name,
                "action": "update",
                "display_name": "Update Records",
                "short_desc": desc,
                "desc": desc,
                "action_code": DPAT_UPDATE,
                "path": "tables/{table}",
                "path_vars": {
                    "table": TablePathVar,
                },
                "groups": ("Record-Based",),
                "data_dependent_options": True,
                "data_provider_info": prov_info,
            });
            ++cnt;
        }
        if (info.upsert_records) {
            string desc = sprintf("Upsert records in the given table in app %y", info.app.name);
            DataProviderActionCatalog::registerAction(<DataProviderActionInfo>{
                "app": info.app.name,
                "action": "upsert",
                "display_name": "Upsert Records",
                "short_desc": desc,
                "desc": desc,
                "action_code": DPAT_UPSERT,
                "path": "tables/{table}",
                "path_vars": {
                    "table": TablePathVar,
                },
                "groups": ("Record-Based",),
                "data_dependent_options": True,
                "data_provider_info": prov_info,
            });
            ++cnt;
        }
        if (info.delete_records) {
            string desc = sprintf("Delete records from the given table in app %y", info.app.name);
            DataProviderActionCatalog::registerAction(<DataProviderActionInfo>{
                "app": info.app.name,
                "action": "delete",
                "display_name": "Delete Records",
                "short_desc": desc,
                "desc": desc,
                "action_code": DPAT_DELETE,
                "path": "tables/{table}",
                "path_vars": {
                    "table": TablePathVar,
                },
                "groups": ("Record-Based",),
                "data_dependent_options": True,
                "data_provider_info": prov_info,
            });
            ++cnt;
        }
        if (!cnt) {
            throw "APP-ERROR", sprintf("App %y is a record-based app but has no record-based actions", info.app.name);
        }
        ActionFunctionContext fctx(info.app.name, "tables", info.pool);
        TypeScriptActionAppDataProvider prov = TypeScriptActionInterface::getAppDataProvider(info.app.name);
        prov.registerChild("tables", new TypeScriptActionTablesDataProvider(fctx, prov_info, ofmap));
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

    # Used by external code to add child data providers to an app
    static registerAppChildDataProvider(string app, AbstractDataProvider prov) {
        initApp(app);
        TypeScriptActionAppDataProvider parent = TypeScriptActionInterface::getAppDataProvider(app);
        parent.registerChild(prov.getName(), prov);
    }

    # Used by external code to add child data providers to an app
    static bool tryRegisterAppChildDataProvider(string app, AbstractDataProvider prov) {
        try {
            registerAppChildDataProvider(app, prov);
            return True;
        } catch (hash<ExceptionInfo> ex) {
            TSAI::warn("Failed to register child provider of app %y: %s: %s", app, ex.err, ex.desc);
        }
        return False;
    }

    # Used by external code to revert adding child data providers to an app
    static *AbstractDataProvider deregisterAppChildDataProvider(string app, string child) {
        TypeScriptActionAppDataProvider parent = TypeScriptActionInterface::getAppDataProvider(app);
        return parent.deregisterChild(child);
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
        if (_pool_clone_mode) {
            # In clone mode, only extract async call closures; skip all global state registration
            captureActionClosures(action, pool);
            return;
        }
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
        # Normalize swagger_* aliases to openapi_* (openapi_* are the primary property names)
        if (action.swagger_schema) {
            action.openapi_schema = remove action.swagger_schema;
        }
        if (action.swagger_path) {
            action.openapi_path = remove action.swagger_path;
        }

        hash<DataProviderAppInfo> app;
        {
            on_error rethrow "TYPESCRIPT-ACTION-ERROR", sprintf("Error registering action %y: %s: %s", action.action,
                $1.err, $1.desc);
            app = DataProviderActionCatalog::getAppEx(action.app);
        }
        string appname = action.app.lwr();
        *AbstractRestSchemaValidator schema;
        if (exists (*string rest_schema = action.openapi_schema)) {
            schema = app_schema_schema_map{appname}{rest_schema};
            if (!schema) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y refers to unknown REST schema %y; "
                    "known schemas for this app: %y", app.name, action.action, rest_schema,
                    keys app_schema_schema_map{appname});
            }
        } else {
            if ((action.action_code == DPAT_API) && !action.api_function && app_schema_schema_map{appname}) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y API action %y has no 'api_function' attribute and "
                    "is missing the \"openapi_schema\" attribute; known schemas for this app: %y", app.name,
                    action.action, keys app_schema_schema_map{appname});
            }
            schema = app_schema_map{appname};
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

            default:
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y action_code: %y is unsupported",
                    action.app, action.action, action.action_code);
        }
    }

    static string generateEventDataProvider(hash<DataProviderAppInfo> app, reference<hash<auto>> action,
            JavaScriptProgramPool pool, *AbstractRestSchemaValidator schema) {
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

        hash<AsyncCallInfo> get_dynamic_type;
        if (exists (auto c = remove action.get_dynamic_type)) {
            if (!c.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid "
                    "\"get_dynamic_type\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, c.fullType());
            }
            get_dynamic_type = <AsyncCallInfo>{
                "app": action.app,
                "action": action.action,
                "type": "get_dynamic_type",
                "label": sprintf("Dynamic option type function for app %y action %y", action.app, action.action),
                "pool": pool,
                "async_call": c,
                "to": seconds(io_timeout),
                "post_processing": \TypeScriptActionInterface::postProcessDynamicTypeInfo(),
            };
            # NOTE: all calls must be registered
            TypeScriptActionInterface::registerAsyncCall(\get_dynamic_type, "app", app.name, action.action);
        }

        if (*hash<auto> opts = remove action.options) {
            action.options = TypeScriptActionInterface::getOptions(app, \action, opts, fctx);
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
            auto webhook_confirmation_key_loc = remove action.webhook_confirmation_key_loc;
            if (exists webhook_confirmation_key_loc && webhook_confirmation_key_loc.typeCode() != NT_STRING) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid "
                    "\"webhook_confirmation_key_loc\" attribute; got type %y; expecting \"string\"", action.app,
                    action.action, webhook_confirmation_key_loc.fullType());
            }
            auto webhook_confirmation_value = remove action.webhook_confirmation_value;
            auto webhook_confirmation_url_loc = remove action.webhook_confirmation_url_loc;
            if (exists webhook_confirmation_url_loc && webhook_confirmation_url_loc.typeCode() != NT_STRING) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid "
                    "\"webhook_confirmation_url_loc\" attribute; got type %y; expecting \"string\"", action.app,
                    action.action, webhook_confirmation_url_loc.fullType());
            }
            auto webhook_confirmation_method = remove action.webhook_confirmation_method;
            if (exists webhook_confirmation_method && webhook_confirmation_method.typeCode() != NT_STRING) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid "
                    "\"webhook_confirmation_method\" attribute; got type %y; expecting \"string\"", action.app,
                    action.action, webhook_confirmation_url_loc.fullType());
            }
            auto webhook_assume_json = remove action.webhook_assume_json;
            if (exists webhook_assume_json && (webhook_assume_json.typeCode() != NT_STRING)) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"webhook_assume_json\" "
                    "attribute; got type %y; expecting \"string\"", action.app, action.action,
                    webhook_assume_json.fullType());
            }
            *hash<AsyncCallInfo> format_event_data = TypeScriptActionInterface::tryGetAsyncAttribute(\action,
                "format_event_data", "format event data", pool, io_timeout, action.app, action.action);
            TypeScriptActionInterface::registerAsyncCall(\webhook_register, "app", app.name, action.action);
            TypeScriptActionInterface::registerAsyncCall(\webhook_deregister, "app", app.name, action.action);
            if (format_event_data) {
                TypeScriptActionInterface::registerAsyncCall(\format_event_data, "app", app.name, action.action);
            }

            child = new TypeScriptActionWebhookEventDataProvider(action.action, event_id, event_info,
                get_example_event_data, get_dynamic_type, fctx, method, webhook_register, webhook_deregister,
                webhook_auth, webhook_perms, webhook_event_loc, webhook_echo_header, webhook_echo_body_keys,
                webhook_confirmation_key_loc, webhook_confirmation_value, webhook_confirmation_url_loc,
                webhook_confirmation_method, webhook_assume_json, format_event_data);
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
                get_dynamic_type, fctx, event);
            rv = AES_JS_EVENT;
        }

        TypeScriptActionAppDataProvider prov = TypeScriptActionInterface::getAppDataProvider(action.app);
        prov.registerChild(action.action, child);

        #printf("Registered %s %s (%y)\n", action.app, action.action);

        action.action_val = event_id;
        action.path = action.action;
        return rv;
    }

    #! Extracts app-level async closures in pool clone mode without modifying global state
    /** This method must be kept in sync with registerApp(hash, pool) and registerAppIntern().
        It captures all closures that would normally be registered during app registration:
        - Table/record closures: get_table_list, get_record_type, search_records, create_records,
          update_records, upsert_records, delete_records (direct app attributes)
        - REST modifier closures: post_auth (rest_modifiers.set_options_post_auth),
          post_auth_code (rest_modifiers.set_options_post_auth_code),
          conn_update (rest_modifiers.connection_update_option.code)
    */
    private static captureAppClosures(hash<auto> app, JavaScriptProgramPool pool) {
        timeout io_timeout = seconds(app.io_timeout_secs ?? DefaultIoTimeoutSecs);
        string name = app.name;

        # Extract table/record async attribute closures (direct app attributes)
        foreach string attr in ("get_table_list", "get_record_type", "search_records", "create_records",
                "update_records", "upsert_records", "delete_records") {
            tryGetAsyncAttribute(\app, attr, attr, pool, io_timeout, name);
        }

        # Extract REST modifier closures from their actual paths in the app hash
        if (*hash<auto> rest_modifiers = app.rest_modifiers) {
            if (rest_modifiers.set_options_post_auth.callp()) {
                hash<AsyncCallInfo> call = <AsyncCallInfo>{
                    "app": name,
                    "type": "post_auth",
                    "label": sprintf("clone: post_auth for app %y", name),
                    "pool": pool,
                    "async_call": rest_modifiers.set_options_post_auth,
                    "to": seconds(rest_modifiers.io_timeout_secs ?? DefaultPostAuthIoTimeoutSecs),
                };
                TypeScriptActionInterface::registerAsyncCall(\call, "app", name);
            }
            if (rest_modifiers.set_options_post_auth_code.callp()) {
                hash<AsyncCallInfo> call = <AsyncCallInfo>{
                    "app": name,
                    "type": "post_auth_code",
                    "label": sprintf("clone: post_auth_code for app %y", name),
                    "pool": pool,
                    "async_call": rest_modifiers.set_options_post_auth_code,
                    "to": seconds(rest_modifiers.io_timeout_secs ?? DefaultPostAuthIoTimeoutSecs),
                };
                TypeScriptActionInterface::registerAsyncCall(\call, "app", name);
            }
            if (rest_modifiers.connection_update_option.val()
                    && rest_modifiers.connection_update_option."code".callp()) {
                hash<AsyncCallInfo> call = <AsyncCallInfo>{
                    "app": name,
                    "type": "conn_update",
                    "label": sprintf("clone: conn_update for app %y", name),
                    "pool": pool,
                    "async_call": rest_modifiers.connection_update_option."code",
                    "to": seconds(rest_modifiers.io_timeout_secs ?? DefaultIoTimeoutSecs),
                };
                TypeScriptActionInterface::registerAsyncCall(\call, "app", name);
            }
        }
    }

    #! Extracts action-level async closures in pool clone mode without modifying global state
    /** This method must be kept in sync with generateApiDataProvider() and generateEventDataProvider().
        It captures all closures that would normally be registered during action registration:
        - API closures: api_function, get_dynamic_request_type, get_dynamic_response_type,
          request_data_converter, response_data_converter
        - Event closures: get_dynamic_type, get_example_event_data, format_event_data, event_function
        - Webhook closures: webhook_register, webhook_deregister
        - Option closures: get_allowed_values, get_element_allowed_values, get_default_value,
          get_dependent_options, get_dependent_response_options, get_dynamic_type
    */
    private static captureActionClosures(hash<auto> action, JavaScriptProgramPool pool) {
        string app = action.app;
        string act = action.action;
        timeout io_timeout = seconds(action.io_timeout_secs ?? DefaultIoTimeoutSecs);

        # API-level closures directly registered (matching key generation in generateApiDataProvider)
        if (action.api_function.callp()) {
            hash<AsyncCallInfo> call = <AsyncCallInfo>{
                "app": app,
                "action": act,
                "type": "api_function",
                "label": sprintf("clone: API function for app %y action %y", app, act),
                "pool": pool,
                "async_call": action.api_function,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\call, "app", app, act);
        }

        # Closures registered with extra arg in key (type = "api_function", extra arg distinguishes them)
        foreach string attr in ("get_dynamic_request_type", "get_dynamic_response_type",
                "request_data_converter", "response_data_converter") {
            if (action{attr}.callp()) {
                hash<AsyncCallInfo> call = <AsyncCallInfo>{
                    "app": app,
                    "action": act,
                    "type": "api_function",
                    "label": sprintf("clone: %s for app %y action %y", attr, app, act),
                    "pool": pool,
                    "async_call": action{attr},
                    "to": seconds(io_timeout),
                };
                TypeScriptActionInterface::registerAsyncCall(\call, "app", app, act, attr);
            }
        }

        # Event-related closures (registered via tryGetAsyncAttribute or direct; type = attribute name)
        foreach string attr in ("get_dynamic_type", "get_example_event_data", "format_event_data") {
            tryGetAsyncAttribute(\action, attr, attr, pool, io_timeout, app, act);
        }

        # Event function (type = "event_function")
        if (action.event_function.callp()) {
            hash<AsyncCallInfo> call = <AsyncCallInfo>{
                "app": app,
                "action": act,
                "type": "event_function",
                "label": sprintf("clone: event function for app %y action %y", app, act),
                "pool": pool,
                "async_call": action.event_function,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\call, "app", app, act);
        }

        # Webhook closures (type = "webhook_register" / "webhook_deregister")
        foreach string attr in ("webhook_register", "webhook_deregister") {
            if (action{attr}.callp()) {
                hash<AsyncCallInfo> call = <AsyncCallInfo>{
                    "app": app,
                    "action": act,
                    "type": attr,
                    "label": sprintf("clone: %s for app %y action %y", attr, app, act),
                    "pool": pool,
                    "async_call": action{attr},
                    "to": seconds(io_timeout),
                };
                TypeScriptActionInterface::registerAsyncCall(\call, "app", app, act);
            }
        }

        # Option-level closures
        if (action.options.typeCode() == NT_HASH) {
            foreach hash<auto> i in (action.options.pairIterator()) {
                if (i.value.typeCode() != NT_HASH) {
                    continue;
                }
                # get_allowed_values, get_element_allowed_values, get_default_value
                foreach string opt_attr in ("get_allowed_values", "get_element_allowed_values",
                        "get_default_value") {
                    if (i.value{opt_attr}.callp()) {
                        hash<AsyncCallInfo> call = <AsyncCallInfo>{
                            "app": app,
                            "action": act,
                            "type": opt_attr,
                            "label": sprintf("clone: %s for app %y action %y option %y",
                                opt_attr, app, act, i.key),
                            "pool": pool,
                            "async_call": i.value{opt_attr},
                            "to": seconds(io_timeout),
                        };
                        TypeScriptActionInterface::registerAsyncCall(\call, "app", app, act, i.key);
                    }
                }
                # Dependent option closures
                foreach string dep_attr in ("get_dependent_options", "get_dependent_response_options",
                        "get_dynamic_type") {
                    if (i.value{dep_attr}.callp()) {
                        hash<AsyncCallInfo> call = <AsyncCallInfo>{
                            "app": app,
                            "action": act,
                            "type": dep_attr,
                            "label": sprintf("clone: %s for app %y action %y option %y",
                                dep_attr, app, act, i.key),
                            "pool": pool,
                            "async_call": i.value{dep_attr},
                            "to": seconds(io_timeout),
                        };
                        TypeScriptActionInterface::registerAsyncCall(\call, "app", app, act, i.key);
                    }
                }
            }
        }
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
            JavaScriptProgramPool pool, *AbstractRestSchemaValidator schema) {
        string appname = app.name.lwr();
        hash<auto> google_action;
        if (auto h = remove action.google_action) {
            if (h.typeCode() != NT_HASH) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"google_action\" "
                    "attribute; got type %y; expecting \"hash\"", action.app, action.action,
                    h.fullType());
            }
            # must have a registered google app for this action
            *hash<GoogleAppInfo> gapp = google_app_map{appname};
            if (!gapp) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"google_action\" "
                    "attribute; app %y is not registered as a Google app", action.app, action.action, h.app);
            }

            if (h.resource.typeCode() != NT_STRING) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y \"google_action.resource\" must be a "
                    "string; got type %y instead", app.name, action.action, h.resource.fullType());
            }
            (*string category, *string name) = (h.resource =~ x/([^\/]+)\/([^\/]+)/);
            if (!category.val() || !name.val()) {
                throw "APP-ERROR", sprintf("Invalid resource %y for app %y action %y; must be of the form "
                    "category/resource", h.resource, app.name, action.action);
            }
            if (exists h.path_args && (h.path_args.typeCode() != NT_HASH)) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y \"google_action.path_args\" must be a "
                    "hash when present; got type %y instead", app.name, action.action, h.path_args.fullType());
            }
            if (exists h.query_args && (h.query_args.typeCode() != NT_HASH)) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y \"google_action.query_args\" must be a "
                    "hash when present; got type %y instead", app.name, action.action, h.query_args.fullType());
            }
            h.app = gapp;

            google_action = h;
        }
        hash<AsyncCallInfo> api;
        {
            auto api_function = remove action.api_function;
            if (!api_function.callp() && !schema && !google_action) {
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
                "label": sprintf("Request type function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": js_api,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\get_dynamic_request_type, "app", app.name, action.action,
                "get_dynamic_request_type");
        }
        hash<AsyncCallInfo> get_dynamic_response_type;
        if (auto js_api = remove action.get_dynamic_response_type) {
            if (!js_api.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has no REST schema and has an invalid "
                    "\"get_dynamic_response_type\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, js_api.fullType());
            }
            timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);
            get_dynamic_response_type = <AsyncCallInfo>{
                "app": app.name,
                "action": action.action,
                "type": "api_function",
                "label": sprintf("Response type function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": js_api,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\get_dynamic_response_type, "app", app.name, action.action,
                "get_dynamic_response_type");
        }
        hash<AsyncCallInfo> request_data_converter;
        if (auto js_api = remove action.request_data_converter) {
            if (!js_api.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"request_data_converter\" "
                    "attribute; got type %y; expecting a callable value", action.app, action.action, js_api.fullType());
            }
            timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);
            request_data_converter = <AsyncCallInfo>{
                "app": app.name,
                "action": action.action,
                "type": "api_function",
                "label": sprintf("Request type function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": js_api,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\request_data_converter, "app", app.name, action.action,
                "request_data_converter");
        }
        hash<AsyncCallInfo> response_data_converter;
        if (auto js_api = remove action.response_data_converter) {
            if (!js_api.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"response_data_converter\" "
                    "attribute; got type %y; expecting a callable value", action.app, action.action, js_api.fullType());
            }
            timeout io_timeout = seconds(remove action.io_timeout_secs ?? DefaultIoTimeoutSecs);
            response_data_converter = <AsyncCallInfo>{
                "app": app.name,
                "action": action.action,
                "type": "api_function",
                "label": sprintf("Request type function for app %y action %y", app.name, action.action),
                "pool": pool,
                "async_call": js_api,
                "to": seconds(io_timeout),
            };
            TypeScriptActionInterface::registerAsyncCall(\response_data_converter, "app", app.name, action.action,
                "response_data_converter");
        }

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

        TypeScriptActionApiDataProvider child;
        if ((*string openapi_path = remove action.openapi_path).val()) {
            if (!schema) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"openapi_path\" "
                    "attribute %y; this attribute can only be used when the application declares a REST schema",
                    action.app, action.action, openapi_path);
            }
            if (remove action.options) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y has an invalid \"options\" property; "
                    "this property cannot be defined when \"openapi_path\" (%y) is also defined for the action",
                    action.app, action.action, openapi_path);
            }

            *softlist<string> independent_path_vars = remove action.independent_path_vars;

            ActionFunctionContext fctx(action.app, action.action, pool);

            # check for path vars
            *hash<string, bool> path_vars = map {$1: True}, (openapi_path =~ x/\{([^\}]*)}/g);
            # Get include_response_headers flag (default: True for backwards compatibility)
            bool include_response_headers = app_include_response_headers_map{appname} ?? True;
            TypeScriptActionApiWithSchemaDataProvider dp(\action, openapi_path, api, path_vars,
                (map {$1: True}, independent_path_vars), app_conn_opt_map{appname},
                remove action.override_options, remove action.ignore_options, fctx, get_dynamic_request_type,
                get_dynamic_response_type, request_data_converter, response_data_converter, request_type,
                response_type, include_response_headers);
            child = dp;

            action.output_type = child.getResponseType();
        } else if (google_action) {
            child = new TypeScriptActionGoogleApiDataProvider(action.action, google_action, api, fctx,
                get_dynamic_request_type, get_dynamic_response_type);
        } else {
            child = new TypeScriptActionApiDataProvider(action.action, api, request_type, response_type, fctx,
                get_dynamic_request_type, get_dynamic_response_type);
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

    static *bool getOptionAllowedValuesFunction(reference<hash<auto>> action, ActionFunctionContext fctx, string key,
            reference<hash<auto>> h, *date io_timeout, *bool keep_field_functions) {
        if (exists (auto get_allowed_values = remove h.get_allowed_values)) {
            if (!get_allowed_values.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_allowed_values\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_allowed_values.fullType());
            }
            if (!io_timeout) {
                io_timeout = seconds(remove h.io_timeout_secs ?? DefaultIoTimeoutSecs);
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
            action.data_dependent_options = True;
            # remove any manual allowed values
            remove h.allowed_values;
            return True;
        }
    }

    static *bool getOptionElementAllowedValuesFunction(reference<hash<auto>> action, ActionFunctionContext fctx, string key,
            reference<hash<auto>> h, *date io_timeout, *bool keep_field_functions) {
        if (exists (auto get_element_allowed_values = remove h.get_element_allowed_values)) {
            if (!get_element_allowed_values.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_allowed_values\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_element_allowed_values.fullType());
            }
            if (!io_timeout) {
                io_timeout = seconds(remove h.io_timeout_secs ?? DefaultIoTimeoutSecs);
            }
            fctx.eomap{key} = <AsyncCallInfo>{
                "app": action.app,
                "action": action.action,
                "type": "get_element_allowed_values",
                "label": sprintf("Element reference data function for app %y action %y option %y", action.app,
                    action.action, key),
                "pool": fctx.pool,
                "async_call": get_element_allowed_values,
                "to": io_timeout,
            };
            TypeScriptActionInterface::registerAsyncCall(\fctx.eomap{key}, "app", action.app, action.action, key);

            h.element_ref_data = key;
            action.data_dependent_options = True;
            # remove any manual allowed values
            remove h.element_allowed_values;
            return True;
        }
    }

    static *bool getOptionDefaultValueFunction(reference<hash<auto>> action, ActionFunctionContext fctx, string key,
            reference<hash<auto>> h, *date io_timeout, *bool keep_field_functions) {
        if (exists (auto get_default_value = h.get_default_value)) {
            if (!get_default_value.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_default_value\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_default_value.fullType());
            }
            if (!io_timeout) {
                io_timeout = seconds(remove h.io_timeout_secs ?? DefaultIoTimeoutSecs);
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
            return True;
        }
    }

    #! Returns True if any option functions were found
    static *bool getOptionFunctions(reference<hash<auto>> action, ActionFunctionContext fctx, string key,
            reference<hash<auto>> h, *bool keep_field_functions) {
        on_error rethrow $1.err, sprintf("%s (while processing option %y)", $1.desc, key);
        date io_timeout = seconds(remove h.io_timeout_secs ?? DefaultIoTimeoutSecs);

        *bool found = getOptionAllowedValuesFunction(\action, fctx, key, \h, io_timeout, keep_field_functions);
        if (getOptionElementAllowedValuesFunction(\action, fctx, key, \h, io_timeout, keep_field_functions)
            && !found) {
            found = True;
        }
        if (getOptionDefaultValueFunction(\action, fctx, key, \h, io_timeout, keep_field_functions) && !found) {
            found = True;
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
            found = True;
        }
        if (exists (auto rest_get_element_allowed_values = remove h.rest_get_element_allowed_values)) {
            if (rest_get_element_allowed_values.typeCode() != NT_HASH) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_element_allowed_values\" attribute; got type %y; expecting \"hash\"", action.app,
                    action.action, key, rest_get_element_allowed_values.fullType());
            }
            if (fctx.eomap{key}) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_element_allowed_values\" attribute; this option already has a "
                    "\"get_element_allowed_values\" value; cannot use both attributes for a single option",
                    action.app, action.action, key);
            }
            hash<RestGetAllowedValuesInfo> info;
            {
                on_error rethrow "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_element_allowed_values\" attribute: %s: %s", action.app, action.action, key, $1.err,
                    $1.desc);
                info = cast<hash<RestGetAllowedValuesInfo>>(rest_get_element_allowed_values);
            }
            if (*hash<auto> h = (RestGetAllowedValuesRequiredKeys - keys info)) {
                on_error rethrow "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"rest_get_element_allowed_values\" attribute; the following required keys are missing: %y",
                    action.app, action.action, key, keys h);
            }
            fctx.reomap{key} = info;
            h.element_ref_data = key;
            # remove any manual allowed values
            remove h.element_allowed_values;
            if (!found) {
                found = True;
            }
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
            if (!found) {
                found = True;
            }
        }
        if (exists (auto get_dependent_response_options = remove h.get_dependent_response_options)) {
            if (!get_dependent_response_options.callp()) {
                throw "TYPESCRIPT-ACTION-ERROR", sprintf("App %y action %y option %y has an invalid "
                    "\"get_dependent_response_options\" attribute; got type %y; expecting a callable value", action.app,
                    action.action, key, get_dependent_response_options.fullType());
            }
            fctx.drmap{key} = <AsyncCallInfo>{
                "app": action.app,
                "action": action.action,
                "type": "get_dependent_response_options",
                "label": sprintf("Dependent response option function for app %y action %y option %y", action.app,
                    action.action, key),
                "pool": fctx.pool,
                "async_call": get_dependent_response_options,
                "to": io_timeout,
            };
            TypeScriptActionInterface::registerAsyncCall(\fctx.drmap{key}, "app", action.app, action.action, key);
            if (!found) {
                found = True;
            }
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
            if (!found) {
                found = True;
            }
        }
        if (h.required && !h.preselected && !exists h.default_value) {
            h.preselected = True;
        }
        return found;
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

    static hash<auto> getOptionHashInfo(string path, hash<auto> opt, *ActionFunctionContext fctx,
            *bool resolve_dynamic) {
        opt.type = TypeScriptActionInterface::getType(path, opt.type, opt.required, remove opt.element_type, fctx,
            NOTHING, resolve_dynamic);
        if (opt.allowed_values) {
            opt.allowed_values = map cast<hash<AllowedValueInfo>>($1), opt.allowed_values;
        }
        if (opt.element_allowed_values) {
            opt.element_allowed_values = map cast<hash<AllowedValueInfo>>($1), opt.element_allowed_values;
        }
        if (opt.required_groups) {
            opt.required_groups = cast<list<string>>(opt.required_groups);
        }
        if (opt.messages) {
            opt.messages = map cast<hash<UiMessageInfo>>($1), opt.messages;
        }
        return opt;
    }

    static hash<ActionOptionInfo> getOptionInfo(string path, hash<auto> opt, *ActionFunctionContext fctx,
            *bool resolve_dynamic) {
        return cast<hash<ActionOptionInfo>>(getOptionHashInfo(path, opt, fctx, resolve_dynamic));
    }

    static AbstractDataProviderType getType(string path, string name, *bool required, auto element_type,
            *ActionFunctionContext fctx, *bool ignore_dup, *bool resolve_dynamic) {
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
                element_type, NOTHING, NOTHING, fctx, ignore_dup, resolve_dynamic);
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

    static AbstractDataProviderType getGoogleType(bool input, string path, hash<auto> h, *bool required,
            auto element_type, *ActionFunctionContext fctx, *bool ignore_dup) {
        on_error rethrow $1.err, sprintf("%s (type: %y)", $1.desc, h);
        string key = input ? "google_input_type" : "google_output_type";
        if (h{key}.typeCode() != NT_HASH) {
            throw "TYPE-ERROR", sprintf("Expecting %y to be type \"hash\"; got %y instead", key, h{key}.fullType());
        }
        if (h{key}.app.typeCode() != NT_STRING) {
            throw "TYPE-ERROR", sprintf("Expecting %y.\"app\" to be type \"string\"; got %y instead", key,
                h{key}.app.fullType());
        }
        string app = h{key}.app;
        if (h{key}.type.typeCode() != NT_STRING) {
            throw "TYPE-ERROR", sprintf("Expecting %y.\"type\" to be type \"string\"; got %y instead", key,
                h{key}.type.fullType());
        }
        string type = h{key}.type;
        if (h.size() > 1) {
            throw "TYPE-ERROR", sprintf("Google type description has unsupported keys: %y", keys (h - key));
        }
        if (element_type) {
            throw "TYPE-ERROR", sprintf("Cannot use an element type with Google %s type %y %y",
                input ? "input" : "output", app, type);
        }
        AbstractDataProviderType rv = input
            ? GoogleDataProviderBase::getInputTypeForSchema(app, type)
            : GoogleDataProviderBase::getTypeForSchema(app, type);
        if (!required) {
            rv = rv.getOrNothingType();
        }
        return rv;
    }

    static AbstractDataProviderType getType(string path, hash<auto> h, *bool required, auto element_type,
            *ActionFunctionContext fctx, *bool ignore_dup, *bool resolve_dynamic) {
        if (h.google_input_type) {
            return getGoogleType(True, path, h, required, element_type, fctx, ignore_dup);
        } else if (h.google_output_type) {
            return getGoogleType(False, path, h, required, element_type, fctx, ignore_dup);
        }

        if (h.required.typeCode() == NT_BOOLEAN) {
            required = h.required;
        }
        hash<auto> orig = h;
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

        if (h.type.typeCode() != NT_STRING) {
            return TypeScriptActionInterface::getHashType(path, h, required, fctx, ignore_dup, tags, resolve_dynamic);
        }

        hash<auto> info;
        *Type type = DataTypeMap{(!required ? "*" : "") + remove h.type};
        if (!type) {
            throw "TYPE-ERROR", sprintf("Cannot match type %y to a known Qore type", orig.type);
        }
        hash<NameDescInfo> attr();
        map attr{$1.key} = $1.value, (remove h{"name", "display_name", "short_desc", "desc"}).pairIterator();
        auto default_value = remove h.default_value;
        AbstractDataProviderType rv;
        if (orig.type == "hash") {
            *hash<auto> f = remove h.fields;
            HashDataType ht(type, attr.name, NOTHING, tags, default_value, attr);
            if (f) {
                TypeScriptActionInterface::getHashTypeIntern(path, ht, f, required, fctx, ignore_dup,
                    resolve_dynamic);
            } else if (exists element_type) {
                AbstractDataProviderType element_type = TypeScriptActionInterface::getType(path + "-element",
                    element_type, NOTHING, NOTHING, fctx, ignore_dup, resolve_dynamic);
                ht.setDefaultOtherFieldType(element_type);
            }
            rv = ht;
        } else if (orig.type == "list") {
            rv = getListType(path, \h, orig.required, element_type, fctx, ignore_dup, tags, default_value, attr,
                resolve_dynamic);
        } else if (orig.type == "softlist") {
            rv = getListType(path, \h, orig.required, element_type, fctx, ignore_dup, tags, default_value, attr,
                resolve_dynamic, True);
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
            throw "TYPE-ERROR", sprintf("Type description at path %y has unknown keys: %y", path, keys h);
        }
        return rv;
    }

    static AbstractDataProviderType getListType(string path, reference<hash<auto>> h, *bool required,
            auto element_type, *ActionFunctionContext fctx, *bool ignore_dup, *hash<auto> tags,
            auto default_value, hash<NameDescInfo> attr, *bool resolve_dynamic, *bool soft) {
        AbstractDataProviderType et;
        if (auto t = (remove h.element_type ?? element_type)) {
            et = TypeScriptActionInterface::getType(path + "-element", t, NOTHING, NOTHING, fctx, ignore_dup,
                resolve_dynamic);
            if (!required) {
                et = et.getOrNothingType();
            }
        }
        hash<QoreTypeInfo> info = <QoreTypeInfo>{
            "type": required ? AutoListType : AutoListOrNothingType,
            "name": attr.name,
            "display_name": attr.display_name,
            "short_desc": attr.short_desc,
            "desc": attr.desc,
            "tags": tags,
            "default_value": default_value,
        };
        if (soft) {
            return new SoftListDataType(info, et ?? AutoType);
        }
        return new ListDataType(info, et ?? AutoType);
    }

    static HashDataType getHashType(string path, hash<auto> h, *bool required, *ActionFunctionContext fctx,
            *bool ignore_dup, *hash<auto> tags, *bool resolve_dynamic) {
        on_error rethrow $1.err, sprintf("%s (type: %y)", $1.desc, h);
        HashDataType type(required ? AutoHashType : AutoHashOrNothingType, NOTHING, NOTHING, tags);
        return TypeScriptActionInterface::getHashTypeIntern(path, type, h, required, fctx, ignore_dup,
            resolve_dynamic);
    }

    static HashDataType getHashTypeIntern(string path, HashDataType type, hash<auto> h, *bool required,
            *ActionFunctionContext fctx, *bool ignore_dup, *bool resolve_dynamic) {
        on_error rethrow $1.err, sprintf("%s (fields: %y)", $1.desc, h);
        if (*hash<auto> err = (map {$1.key: $1.value}, h.pairIterator(), (
            $1.value.typeCode() != NT_HASH && $1.value.typeCode () != NT_STRING))) {
            throw "TYPE-ERROR", sprintf("%y: the following fields could not be parsed: %y", path, err);
        }
        map type.addField(TypeScriptActionInterface::getField(path, $1.key, $1.value, fctx, ignore_dup,
            resolve_dynamic)), h.pairIterator();
        checkFieldDependencies(type);
        return type;
    }

    static AbstractDataProviderType getType(string path, auto v, *bool required, auto element_type,
            *ActionFunctionContext fctx, *bool ignore_dup, *bool resolve_dynamic) {
        throw "TYPE-ERROR", sprintf("Expecting \"string\" or \"hash\" for the option \"type\"; got %y "
            "instead", v.fullType());
    }

    static TypeScriptDataField getField(string path, string name, string type, *ActionFunctionContext fctx,
            *bool ignore_dup, *bool resolve_dynamic) {
        on_error rethrow $1.err, sprintf("%s (field: %N)", $1.desc, type);
        bool req;
        if (type =~ /^\*/) {
            type = type[1..];
        } else {
            req = True;
        }
        return new TypeScriptDataField({
            "name": name,
            "type": TypeScriptActionInterface::getType(path, type, req, NOTHING, fctx, ignore_dup, resolve_dynamic),
        }, fctx);
    }

    static TypeScriptDataField getField(string path, string name, hash<auto> h, *ActionFunctionContext fctx,
            *bool ignore_dup, *bool resolve_dynamic) {
        hash<auto> rv;
        {
            hash<auto> orig = h;
            on_error rethrow $1.err, sprintf("%s (field: %N)", $1.desc, orig);
            *bool req = remove h.required;
            path += "-" + name;
            AbstractDataProviderType type = TypeScriptActionInterface::getType(path, remove h.type, req,
                remove h.element_type, fctx, ignore_dup, resolve_dynamic);
            rv = TypeScriptActionInterface::getFieldHash(path, name, type, \h, req, fctx, ignore_dup,
                resolve_dynamic);
            if (h) {
                throw "FIELD-ERROR", sprintf("Description for field %y has unknown keys: %y", name, keys h);
            }
        }
        on_error rethrow $1.err, sprintf("%s (field desc: %N)", $1.desc, rv);
        return new TypeScriptDataField(rv, fctx);
    }

    static checkFieldDependencies(HashDataType type) {
        *hash<string, AbstractDataField> fields = type.getFields();
        foreach AbstractDataField f in (fields.iterator()) {
            foreach string dep in (f.getAttributes().depends_on) {
                *AbstractDataField df = fields{dep};
                if (!df) {
                    throw "FIELD-ERROR", sprintf("Field %y depends on unknown field %y; known fields: %y",
                        f.getName(), dep, keys fields);
                }
                df.setAttributes({"has_dependents": True});
            }
        }
    }

    static hash<auto> getFieldHash(string path, string name, AbstractDataProviderType type,
            reference<hash<auto>> type_hash, *bool req, *ActionFunctionContext fctx, *bool ignore_dup,
            *bool resolve_dynamic) {
        hash<auto> info += {
            "name": name,
            "type": type,
        };

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
        if ((*string str = remove type_hash.element_ref_data).val()) {
            info.attr.element_ref_data = str;
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
        if ((*string str = remove type_hash.validation_regex).val()) {
            info.attr.validation_regex = str;
        }
        if (exists (auto v = remove type_hash.on_change)) {
            info.attr.on_change = v;
        }
        if (auto v = remove type_hash.allowed_values) {
            info.allowed_values = v;
        }
        if (remove type_hash.allowed_values_creatable) {
            info.allowed_values_creatable = True;
        }
        if (auto v = remove type_hash.element_allowed_values) {
            info.element_allowed_values = v;
        }
        if (remove type_hash.element_allowed_values_creatable) {
            info.element_allowed_values_creatable = True;
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
        } else if (!exists info.default_value && exists (v = info.type.getDefaultValue())) {
            info.default_value = v;
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
                if (resolve_dynamic) {
                    info.allowed_values = cast<AbstractDataProvider>(fctx).getReferenceDataSafe(key,
                        DataProviderDataContextHelper::getHash());
                } else {
                    info.attr.ref_data = key;
                    info.attr.dynamic = True;
                }
            }
            if (exists (*code c = remove type_hash.get_element_allowed_values)) {
                string key = sprintf("%s-%s", path, name);
                fctx.eomap{key} = <AsyncCallInfo>{
                    "key": key,
                    "app": fctx.app,
                    "action": fctx.action,
                    "type": "get_element_allowed_values",
                    "label": sprintf("Element reference data function for app %y action %y option %y", fctx.app,
                        fctx.action, key),
                    "pool": fctx.pool,
                    "async_call": c,
                    "to": fctx.io_timeout,
                };
                TypeScriptActionInterface::registerAsyncCall(ignore_dup, \fctx.eomap{key}, "app", fctx.app,
                    fctx.action, key);

                # remove any manual allowed values
                remove info.element_allowed_values;
                if (resolve_dynamic) {
                    info.allowed_values = cast<AbstractDataProvider>(fctx).getElementReferenceDataSafe(key,
                        DataProviderDataContextHelper::getHash());
                } else {
                    info.attr.element_ref_data = key;
                    info.attr.dynamic = True;
                }
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

                # NOTE: this must be the full key to the call and not the index in fctx.dtmap
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
                if (resolve_dynamic) {
                    info.default_value = cast<AbstractDataProvider>(fctx).getReferenceDataValueSafe(ix,
                        DataProviderDataContextHelper::getHash());
                } else {
                    info.attr.get_default_value = ix;
                    info.attr.dynamic = True;
                }
            }
        }
        if (info.attr.dynamic) {
            info.type = info.type.copy();
            info.type.setDynamicTag();
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
        TypeScriptAppRestConnection conn = aws_app_map{app.lwr()}
            ? new TypeScriptAwsAppRestConnection(opts)
            : new TypeScriptAppRestConnection(opts);
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
        foreach string pat in (keys url_template_options) {
            if (opts{pat} =~ /^https?:\/\//) {
                url = regex_subst(url, "^(https?://)?.*{{" + pat + "}}", opts{pat});
            } else {
                url = replace(url, "{{" + pat + "}}", opts{pat} ?? "");
            }
        }
        return url;
    }

    static *string getDynamicAppPath(*string app) {
        return initialized_appmap{app}.app.info.path ?? appmap{app}.app.info.path;
    }

    static *string getUrlOptionForApp(string app) {
        return app_url_option_map{app.lwr()};
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
        - perms (list of strings): an optional list of string permissions when \c auth is 1
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
    /** @param h hash with the following keys for the webhook
        - method (string): the HTTP method for the webhook
        - auth (int): one of:
          - QAUTH_NONE = 0 -> no auth required
          - QAUTH_QORUS = 1 -> authentication required
        - perms (list of strings): an optional list of string permissions when \c auth is 1
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

    #! Returns a REST schema data provider for the given app (supports Swagger 2.0 and OpenAPI 3.0/3.1)
    static RestSchemaDataProvider getSchemaDataProvider(string app, *string schema_name) {
        string appname = app.lwr();
        *RestSchemaDataProvider rv = exists schema_name
            ? app_schema_schema_dp{appname}{schema_name}
            : app_schema_dp{appname};
        if (!rv) {
            *AbstractRestSchemaValidator schema = exists schema_name
                ? app_schema_schema_map{appname}{schema_name}
                : app_schema_map{appname};
            if (!schema) {
                if (exists schema_name) {
                    throw "APP-ERROR", sprintf("App %y has no REST schema %y", app, schema_name);
                } else {
                    throw "APP-ERROR", sprintf("App %y has no REST schema", app);
                }
            }
            rv = new RestSchemaDataProvider(schema);
            if (exists schema_name) {
                app_schema_schema_dp{appname}{schema_name} = rv;
            } else {
                app_schema_dp{appname} = rv;
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
        if (args[0].conn_name && (auto req = DataProviderDataContextHelper::get())) {
            TSAI::info("postProcessDynamicTypeInfoIntern() req: %y", req);
            if (req.typeCode() == NT_LIST) {
                # can be a list when the context data is set as the acutal args from ts-proxy
                args = req;
            } else if (req.typeCode() == NT_HASH) {
                # can be a hash when the context data is set in the local process as the options
                args[0].opts = req;
            }
        }
        foreach hash<auto> i in (info.fields.pairIterator()) {
            if (i.value.type == "hash" && i.value.fields) {
                postProcessDynamicTypeInfoIntern(logger, call, args, \info{i.key});
            }
            if (i.value.get_allowed_values.callp()) {
                code c = remove info.fields{i.key}.get_allowed_values;
                hash<AsyncCallInfo> new_call = call;
                new_call.type = "get_allowed_values";
                new_call.label = sprintf("Ad-hoc reference data function for app %y action %y option %y field %y",
                    call.app, call.action, call.key, i.key),
                new_call.async_call = c;
                info.fields{i.key}.allowed_values = TypeScriptActionDataProviderBase::getAsyncValueArgs(logger,
                    new_call, args);
            }
            if (i.value.get_element_allowed_values.callp()) {
                code c = remove info.fields{i.key}.get_element_allowed_values;
                hash<AsyncCallInfo> new_call = call;
                new_call.type = "get_element_allowed_values";
                new_call.label = sprintf("Ad-hoc element reference data function for app %y action %y option %y "
                    "field %y", call.app, call.action, call.key, i.key),
                new_call.async_call = c;
                info.fields{i.key}.element_allowed_values = TypeScriptActionDataProviderBase::getAsyncValueArgs(logger,
                    new_call, args);
            }
            if (i.value.get_default_value.callp()) {
                code c = remove info.fields{i.key}.get_default_value;
                hash<AsyncCallInfo> new_call = call;
                new_call.type = "get_default_value";
                new_call.label = sprintf("Ad-hoc default value function for app %y action %y option %y field %y",
                    call.app, call.action, call.key, i.key),
                new_call.async_call = c;
                info.fields{i.key}.default_value = TypeScriptActionDataProviderBase::getAsyncValueArgs(logger,
                    new_call, args);
            }
        }
    }

    static resolveDynamicType(TypeScriptActionDataProviderBase prov, auto req, HashDataType type) {
        # find allowed values
        foreach TypeScriptDataField f in (type.getFields().iterator()) {
            *hash<auto> attr = f.getAttributes();
            if (attr.ref_data.val()) {
                f.setAllowedValues(prov.getReferenceData(attr.ref_data, req) ?? (), f.getAllowedValuesCreatable());
                f.replaceAttributes(attr - "ref_data");
            }
            if (attr.element_ref_data.val()) {
                f.setElementAllowedValues(prov.getReferenceData(attr.element_ref_data, req) ?? (),
                    f.getElementAllowedValuesCreatable());
                f.replaceAttributes(attr - "element_ref_data");
            }
            if (attr.default_ref_data) {
                hash<AsyncCallInfo> call = TypeScriptActionInterface::getCall(attr.get_default_value);
                try {
                    auto v = prov.getAsyncValue(call, prov.getCallContextInfo(req));
                    f.setDefaultValue(v);
                } catch (hash<ExceptionInfo> ex) {
                    TSAI::error("Failed to retrieve default value for field %y: %y: %s", f.getName(), call.label,
                        get_exception_string(ex));
                }
                f.replaceAttributes(attr - "default_ref_data");
            }
            AbstractDataProviderType t = f.getType();
            if (t instanceof HashDataType) {
                resolveDynamicType(prov, req, cast<HashDataType>(t));
            }
            if (t instanceof ListDataType) {
                ListDataType ldt = cast<ListDataType>(t);
                if (ldt.getElementType() instanceof HashDataType) {
                    resolveDynamicType(prov, req, cast<HashDataType>(ldt.getElementType()));
                }
            }
        }
    }

    static private overrideTypes(string app, AbstractRestSchemaValidator schema, hash<auto> type_overrides) {
        foreach hash<auto> i in (type_overrides.pairIterator()) {
            list<string> l = i.key.split(".");
            string n = shift l;
            AbstractDataProviderType t = schema.getTypeForReference(n);
            if (!l) {
                # override existing type
                t = TypeScriptActionInterface::getModifiedType(app, n, t, i.value);
                schema.replaceCachedTypeForReference(n, t);
            } else {
                TypeScriptActionApiWithSchemaDataProvider::overrideOptionType("schema-" + i.key, {
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
            throw "APP-ERROR", sprintf("App %y: cannot update the following attributes on REST schema types: %y", app, h);
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

    #! Callback to list tables for the app; required for apps that support record-based actions
    *hash<AsyncCallInfo> get_table_list;

    #! Callback to begine a transaction in the app; only supported for apps that support record-based actions
    *hash<AsyncCallInfo> begin_transaction;

    #! Callback to begin a transaction in the app; only supported for apps that support record-based actions
    /** must be declared if the app declares a begin_transaction callback
    */
    *hash<AsyncCallInfo> commit;

    #! Callback to roll back a transaction in the app; only supported for apps that support record-based actions
    /** must be declared if the app declares commit or begin_transaction callbacks
    */
    *hash<AsyncCallInfo> rollback;

    #! Callback to retrieve the record type for a given table; required for apps that support record-based actions
    /** must be declared if the app declares a get_table_list callback
    */
    *hash<AsyncCallInfo> get_record_type;

    #! Callback to make native searches for the app
    /** May only be declared if the app declares a get_table_list callback
    */
    *hash<AsyncCallInfo> search_records;

    #! Callback to create record(s) for the app
    /** May only be declared if the app declares a get_table_list callback
    */
    *hash<AsyncCallInfo> create_records;

    #! Callback to update record(s) for the app
    /** May only be declared if the app declares a get_table_list callback
    */
    *hash<AsyncCallInfo> update_records;

    #! Callback to upsert record(s) for the app
    /** May only be declared if the app declares a get_table_list callback
    */
    *hash<AsyncCallInfo> upsert_records;

    #! Callback to delete record(s) for the app
    /** May only be declared if the app declares a get_table_list callback
    */
    *hash<AsyncCallInfo> delete_records;

    #! Supported expressions with record-based options for the app
    /** May only be declared if the app declares a get_table_list callback
    */
    *hash<auto> expressions;

    #! Search options for the app
    /** May only be declared if the app declares \a get_table_list and \a search_records callbacks
    */
    *hash<auto> search_options;

    #! Create options for the app
    /** May only be declared if the app declares \a get_table_list and \a create_records callbacks
    */
    *hash<auto> create_options;

    #! Upsert options for the app
    /** May only be declared if the app declares \a get_table_list and \a upsert_records callbacks
    */
    *hash<auto> upsert_options;

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
        # maps from options to "get_element_allowed_values" code
        *hash<string, hash<AsyncCallInfo>> eomap;
        # maps from options to "get_dependent_options" code
        *hash<string, hash<AsyncCallInfo>> dmap;
        # maps from options to "get_dependent_response_options" code
        *hash<string, hash<AsyncCallInfo>> drmap;
        # maps from options to "get_dynamic_type" code
        *hash<string, hash<AsyncCallInfo>> dtmap;
        # maps from options to "rest_get_allowed_values" descriptions
        *hash<string, hash<RestGetAllowedValuesInfo>> romap;
        # maps from options to "rest_get_element_allowed_values" descriptions
        *hash<string, hash<RestGetAllowedValuesInfo>> reomap;
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
        eomap = fctx.eomap;
        dmap = fctx.dmap;
        drmap = fctx.drmap;
        dtmap = fctx.dtmap;
        romap = fctx.romap;
        reomap = fctx.reomap;
        dvmap = fctx.dvmap;
        depmap = fctx.depmap;
        io_timeout = fctx.io_timeout;
    }
}
}
