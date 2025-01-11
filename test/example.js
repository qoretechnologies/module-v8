exports.actionsCatalogue = {
    registerAppActions: function(api) {
        /** registerApp() takes the same arguments as DataProviderActionCatalog::registerApp() plus:
            - rest?: object -> documented below
            - swagger?: string -> a location to a Swagger 2.0 schema = OpenAPI 2.0
            - swagger_options?: object -> an optional hash of swagger parsing options - the main option is
              - "parse_flags": -1 -> this will turn on all lax parsing options - or you can use 128
                (LM_ACCEPT_QUERY_OBJECTS = accept "object" as a valid type for query parameters like OpenAPI 3.0)
            - swagger_paths?: string[] -> a list of swagger paths to build an optimized schema
        */
        api.registerApp({
            "name": "js-test",
            "display_name": "JavaScript Test",
            "short_desc": "Test",
            "desc": "Test",
            // "logo" is a base64-encoded string
            "logo": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDUyIDYzIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtMTYuNjUsLTIzLjAxNzIpIj4KICAgICAgICA8cGF0aCBkPSJNNjguMzYzLDYzLjk3M0w2OC4zNjMsNDAuMTA5QzY4LjM2Myw0MC4xMDkgNjguMzYzLDM3LjExMyA2NS43NjgsMzUuNjE1TDQ1LjEwMiwyMy42ODNDNDUuMTAyLDIzLjY4MyA0Mi41MDcsMjIuMTg1IDM5LjkxMiwyMy42ODNMMTkuMjQ1LDM1LjYxNUMxOS4yNDUsMzUuNjE1IDE2LjY1LDM3LjExMyAxNi42NSw0MC4xMDlMMTYuNjUsNjMuOTczQzE2LjY1LDYzLjk3MyAxNi42NSw2Ni45NjkgMTkuMjQ1LDY4LjQ2N0w0Ny44MzksODQuODIyQzQ3LjgzOSw4NC44MjIgNTAuNDM0LDg2LjM2OCA1My4wMjksODQuODdMNjQuNjUyLDc4LjExMkw0Mi41Miw2NS41MDNMNDIuNTA3LDY1LjUxMUwzMC44NDMsNTguNzc2TDMwLjg0Myw0NS4zMDdMNDIuNTA3LDM4LjU3M0w1NC4xNzEsNDUuMzA3TDU0LjE3MSw1OC43NzZMNDUuMjEzLDYzLjk0OEw1OS41NjUsNzIuMDVMNjUuNzY4LDY4LjQ2OUM2NS43NjksNjguNDY4IDY4LjM2Myw2Ni45NyA2OC4zNjMsNjMuOTczIiBzdHlsZT0iZmlsbDpyZ2IoNjQsNjQsNjQpO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgPC9nPgo8L3N2Zz4K",
            "logo_file_name": "test.svg",
            "logo_mime_type": "image/svg+xml",
            /** "rest" is an optional object giving information about REST communication with the server; set this if
                the action uses OAuth2, and you need Qorus to create a REST connection that can be used to maintain
                the authentication token and other information for communicating with the server; valid keys are:
                - content_encoding?: string -> use to encode message bodies when sending: "gzip", "bzip2", "deflate",
                  "identity"
                - data?: string -> set to specify message body serialization: "auto" (the default - meaning JSON),
                  "json", "yaml", "rawxml", "xml", "url", "text", "bin"
                - disable_automatic_pings?: bool -> set to disable automatic pings; for rate-limited, metered, or
                  other connections that should not be pinged regularly (default: false)
                - encode_chars?: bool -> "A set of additional characters to subject to percent encoding in URLs
                - headers?: object -> an optional data object of headers to send with every request
                - oauth2_auth_args?: object -> an optional data object with argument to be serialized as query
                  arguments in the request to the \c oauth2_auth_url for the \c authentication_code grant type
                - oauth2_auth_url?: string -> the OAuth2 authorization URL for the \c authorization_code grant type;
                  ignored if the \c token option is set
                - oauth2_auto_refresh?: bool -> If OAuth2 tokens should be automatically refreshed (default: true)
                - oauth2_client_id?: string -> The OAuth2 client ID; ignored if the \c token option is set; this
                  should be for an OAuth2 client associated with Qorus
                - oauth2_client_secret?: string -> the OAuth2 client secret; ignored if the \c token option is set
                - oauth2_grant_type?: string- > the OAuth2 grant type; ignored if the \c token option is set; possible
                  values:
                - "authorization_code": requires \c oauth2_client_id, \c oauth2_client_secret,
                  \c oauth2_auth_url, as well as \c oauth2_token_url; note that this grant type cannot be handled
                  automatically but rather must be handled by external code that redirects the user to the
                  authentication server and then updates the connection with token information retrieved
                - "client_credentials": requires \c oauth2_client_id, \c oauth2_client_secret, as well as
                  \c oauth2_token_url
                - "password": requires a username, password, \c oauth2_client_id, \c oauth2_client_secret, as well
                  as \c oauth2_token_url
                - oauth2_redirect_url?: string -> The OAuth2 redirect URL for the \c authorization_code grant type;
                  ignored if the \c token option is set
                - oauth2_refresh_token?: string -> An OAuth2 refresh token (complements option \c token)
                - oauth2_scopes?: string[] -> A list of OAuth2 scopes to request; ignored if the \c token option is
                  set
                - oauth2_token_args?: object -> Extra arguments for OAuth2 token requests to \c oauth2_token_url; if
                  this option is set as well as \c oauth2_alt_token_url, then the \c oauth2_token_url value will be
                  added to this as well when the request is made to the \c oauth2_alt_token_url
                - oauth2_token_auth_secret_only?: bool -> Use basic authorization with the client secret only when
                  making token requests
                - oauth2_token_url?: string -> The token URL OAuth2 flows; ignored if the \c token option is set
                - oauth2_token_use_basic_auth?: bool -> Use basic auth when making token requests with the client_id
                  and client_secret
                - password?: string -> The password for authentication; do not use with an OAuth2 config
                - ping_method?: string -> The HTTP method to use for pings
                - ping_headers?: object -> Any HTTP headers to send with pings
                - ping_body?: any -> The message body to send with pings
                - proxy?: string -> The proxy URL for connecting through a proxy
                - ssl_cert_data?: string -> a PEM-encoded string for an X.509 client certificate
                - ssl_key_data?: string -> a PEM-encoded string for an X.509 client key
                - ssl_verify_cert?: bool -> if true then server certificates will only be accepted if they pass
                  verification
                - token?: string -> Any bearer token to use for the connection; will be passed as
                  <tt>Authorization: Bearer ...</tt> in request headers; conflicts with username and password options
                  or authentication credentials in the URL; if this option is set then any OAuth2 options are ignored
                - token_type?: string -> The type of token to use for the \c Authentication header; ignored if no
                  \c token option is set
                - url: string -> A string giving the URL to connect to
                - username?: string -> The username for authentication; only used if no username or password is set in
                  the URL and if the \c password option is also used
            */
            "rest": {
                "data": "json",
                "encode_chars": "+",
                "oauth2_auth_args": {
                    "access_type": "offline",
                    "prompt": "consent",
                },
                "oauth2_auth_url": "https://example.com/oauth2/auth",
                "oauth2_client_id": "x",
                "oauth2_client_secret": "y",
                "oauth2_grant_type": "authorization_code",
                "oauth2_token_url": "https://example.com/token",
                "url": "tsrest-js-test://www.example.com/api/{{account_id}}",
            },
            /** "rest_modifiers" is an optional object with the following keys:
                - conn_option_map? object -> maps connection options (normally required options) that map to Swagger
                  path options; the key is the request option name, the value is the action option name; the value of
                  the connection option will be used as the value of the given action option in each call where the
                  option is present
                - io_timeout_secs?: int -> provides the I/O timeout in seconds (NOTE: not yet implemented)
                - options?: object -> describes connection options supported by connections for this application; keys
                  are option names; values are converted to option hashes described by the COnnectionOptionInfo
                  hashdecl: https://qoretechnologies.com/manual/qorus/gitlab-docs/develop/qore/modules/ConnectionProvider/html/struct_connection_provider_1_1_connection_option_info.html
                - required_options?: string[] -> a list of required options for connections for this app
                - set_options_post_auth?: function (ctx? : object) : object? -> A function that is called after
                  authenticating to retrieve additional options to set on the connection; the return value must be an
                  object with serializable values that are connection options; the options will be stored on the
                  connection itself; 'ctx' is an object with the following keys:
                  - conn_name: string -> the connection name, if any is defined
                  - conn_opts: object -> connection options + processed options from the auth response + the auth response itself
                - url_template_options?: string[] -> a list of option names that will be used to substitute values in
                  URLs; the URL should contain strings like '{{option_name}}'
            */
            "rest_modifiers": {
                "options": {
                    "account_id": {
                        "display_name": "Account ID",
                        "short_desc": "The account ID for the connection",
                        "desc": "The account ID for the connection",
                        "type": "string",
                    },
                },
                "set_options_post_auth": function (ctx) {
                    return {
                        "account_id": "abc123",
                    };
                },
                "url_template_options": [
                    "account_id",
                ],
            },
        });

        api.registerAction({
            "app": "js-test",
            "action": "test-api",
            "display_name": "Test API",
            "short_desc": "Test API",
            "desc": "Test API",
            "action_code": 2,  // DPAT_EVENT == 1, DPAT_API == 2

            /** "api_function" is required when "action_code" == DPAT_API
                @param obj: any -> is the main argument used to call the API and must correspond to the request
                type, which can be any serializable data type (including no value). It is normally a data object
                @param opts?: object -> currently unused
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action

                @return the return value for the API; can be of any serializable data type that the API returns
                (including no value)

                @note the function here will be called with no "this" context; "this" cannot be used in this function
            */
            "api_function": async function(obj, opts, ctx) {
                if (!obj.count) {
                    obj.count = 0;
                }
                obj.count += 1;
                //console.log('obj: %d + 1 = %d (OK)', obj.count - 1, obj.count);
                return {
                    "result": obj.count,
                    "status": "OK",
                };
            },
            /** the I/O timeout in seconds for async operations in "api_function" (default if not present: 30)

                @note not yet implemented
            */
            "io_timeout_secs": 30,

            /** "options" defines the API request type when "action_code" == DPAT_API

                This is equivalent to "ActionOptionInfo" in Qore:
                https://qoretechnologies.com/manual/qorus/gitlab-docs/develop/qore/modules/DataProvider/html/struct_data_provider_1_1_action_option_info.html
                except that "type" is created from either a:
                - string: giving the name of a simple type - one of:
                    ["int", "integer", "string", "boolean", "bool", "double", "float", "number", "binary", "list",
                    "hash", "date", "base64binary", "base64urlbinary", "hexbinary",
                    "data", "softint", "softstring", "softbool", "softfloat", "softnumber", "softdate", "softlist",
                    "any", "auto"]
                or
                - hash: which describes a type with the following keys:
                  - type: string -> the data type name
                  - name?: string -> the name of the type - one of the type names listed above
                  - display_name?: string -> the display name of the type
                  - short_desc?: string -> the plain-text description of the type
                  - desc?: string -> the markdown description of the type (can be long)
                  - default_value?: any -> (values must be of the correct type) the default value if none is provided
                    by the user
                  - required?: bool -> if a value is required for this type; will set the corresponding UI flag
                  - preselected?: bool -> if fields of this type should be preselected; will set the corresponding UI
                    flag
                  - multiselect?: bool -> can be true if the field has a list type and allowed_values are the allowed
                    values for the list
                  - allowed_values?: AllowedValues[] -> an array of objects providing the only values allowed for
                    the option
                  - fields?: object -> a hash of field objects; only valid if \c type is "hash"; keys are field
                    names, values are as follows:
                    - display_name?: string -> the user-friendly display name for the field
                    - short_desc?: string -> a short plain-text description of the field
                    - desc?: string -> a longer description for the field that supports markdown formatting
                    - type -> same as this - either a string or a data object again
                    - dependent_fields?: object[] -> a list of data objects describing dependent fields of the last
                      field in this type; each object must have the following keys
                      - value: any -> of the same value type as the last field in under 'type'; must be unique, and
                        must be a value corresponding to the parent field's type
                      - fields: object -> a data object giving descriptions for each additional field, keys are field
                        names, values have the format of this hash
                    - example_value?: any -> (values must use the field's type) any example value to use when
                      generating example data etc
                    - default_value?: any -> (values must use the field's type) the default value if none is provided
                      by the user; this overrides any default value provided by the type
                    - multiselect?: bool -> can be true if the field has a list type and allowed_values are the
                      allowed values for the list
                    - allowed_values?: AllowedValues[] -> an array of objects providing the only values allowed for
                      the field - with the following properties
                    - attr?: Attributes -> an optional data object with any properties
                    - required?: bool -> if the field is required or optional
                    - preselected?: bool -> if this fields should be preselected; will set the corresponding UI flag
                  - element_type?: string | object -> description of a list type; only valid if \c type is "list" or
                    "softlist"

                Note that this data will also be used to create the API request type
            */
            "options": {
                "count": {
                    "type": "int",
                    "display_name": "Count",
                    "short_desc": "A count of something",
                    "desc": "A count of something",
                    "required": true,
                    "preselected": true,
                    "get_allowed_values": async function(ctx) {
                        return [
                            {
                                "display_name": "1",
                                "short_desc": "1",
                                "desc": "1",
                                "value": 1,
                            },
                            {
                                "display_name": "2",
                                "short_desc": "2",
                                "desc": "2",
                                "value": 2,
                            },
                        ];
                    },
                    "allowed_values_creatable": true,
                    "example_value": 1,
                },
                "other": {
                    "type": "list",
                    "element_type": "string",
                    "display_name": "Other",
                    "short_desc": "another value",
                    "desc": "another value",
                    "required": true,
                    "preselected": true,
                    "depends_on": ["count"],
                    "multiselect": true,
                    "get_allowed_values": async function(ctx) {
                        return [
                            {
                                "display_name": "this",
                                "short_desc": "this",
                                "desc": "this",
                                "value": "this",
                            },
                            {
                                "display_name": "that",
                                "short_desc": "that",
                                "desc": "that",
                                "value": "that",
                            },
                        ];
                    },
                },
                "key": {
                    "type": "string",
                    "display_name": "Key",
                    "short_desc": "another option",
                    "desc": "another option",
                    "depends_on": ["count", "other"],
                    "allowed_values": [
                        {
                            "display_name": "A",
                            "short_desc": "A",
                            "desc": "A",
                            "value": "A",
                        },
                        {
                            "display_name": "B",
                            "short_desc": "B",
                            "desc": "B",
                            "value": "B",
                        },
                    ],
                    "get_dependent_options": async function(ctx) {
                        if (ctx.opts.key == 'A') {
                            return {
                                "a0": {
                                    "type": "string",
                                    "display_name": "A0-Key",
                                    "short_desc": "A0 key",
                                    "desc": "A0 key",
                                },
                                "a1": {
                                    "type": "string",
                                    "display_name": "A1-Key",
                                    "short_desc": "A1 key",
                                    "desc": "A1 key",
                                },
                            };
                        } else if (ctx.opts.key == 'B') {
                            return {
                                "b0": {
                                    "type": "string",
                                    "display_name": "B0-Key",
                                    "short_desc": "B0 key",
                                    "desc": "B0 key",
                                },
                                "b1": {
                                    "type": "string",
                                    "display_name": "B1-Key",
                                    "short_desc": "B1 key",
                                    "desc": "B1 key",
                                },
                            };
                        } else {
                            throw new Error('unknown key ' + ctx.opts.key);
                        }
                    }
                },
                "list": {
                    "type": {
                        "type": "softlist",
                        "element_type": {
                            "type": "hash",
                            "fields": {
                                "a": {
                                    "type": "string",
                                },
                                "b": {
                                    "type": "int",
                                },
                            },
                        },
                    },
                },
            },

            /** "response_type" defines the response type when "action_code" == DPAT_API

                The response type data format is the same as the data format for types above, so either a string or a
                hash
            */
            "response_type": {
                "type": "hash",
                "fields": {
                    "result": {
                        "type": "int",
                        "display_name": "Count",
                        "short_desc": "A count of something",
                        "desc": "A count of something",
                        "example_value": 1,
                        "required": true,
                    },
                    "status": {
                        "type": "string",
                        "display_name": "Status",
                        "short_desc": "The status of the operation",
                        "desc": "The status of the operation",
                        "allowed_values": [
                            {
                                "display_name": "OK",
                                "short_desc": "Successful result",
                                "desc": "Successful result",
                                "value": "OK",
                            },
                            {
                                "display_name": "Error",
                                "short_desc": "Error result",
                                "desc": "Error result",
                                "value": "Error",
                            },
                        ],
                        "required": true,
                    },
                },
            },
        });

        // NOTE: this action will be executed as a REST call, no code is necessary
        api.registerAction({
            "app": "js-test",
            "action": "test-search",
            "display_name": "Test Search",
            "short_desc": "Test search",
            "desc": "Test search",
            "action_code": 4,  // DPAT_FIND == 4 (record search)

            // This means that there are no native search capabilities and also generic expressions are supported
            /** all records are fetched and filtered after the fact by the DataProvider infrastructure

                This option is meant for simple data providers providing just a record view of data

                If this option is true, then no "search_options" or "expressions" can be defined

                If this option is false, "search_options" must be defined and the "search_records" function must be
                able to handle them
            */
            "uses_generic_search": true,

            // returns the record type for the action
            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action

                @return the record type for the action; must be a hash (object)
            */
            "get_record_type": async function (ctx) {
                return {
                    "type": "hash",
                    "fields": {
                        "id": {
                            "type": "int",
                        },
                        "name": {
                            "type": "string",
                        },
                    },
                };
            },

            // executes the search and returns a list of the records matched
            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param where_cond?: object -> the optional search expression tree
                @param search_1opts?: object -> search options

                @return a list of records (object[] | void) matching the arguments
            */
            "search_records": async function (ctx, where_cond, search_opts) {
                return [
                    {"id": 1, "name": "a"},
                    {"id": 2, "name": "b"},
                ];
            },

            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
            */
            "begin_transaction": async function (ctx) {
                // begin transaction code here
            },

            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
            */
            "commit": async function (ctx) {
                // commit transaction code here
            },

            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
            */
            "rollback": async function (ctx) {
                // rollback transaction code here
            },
        });

        api.registerApp({
            "name": "js-swagger-test",
            "display_name": "JavaScript Swagger Test",
            "short_desc": "Test",
            "desc": "Test",
            // "logo" is a base64-encoded string
            "logo": 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUF' +
                'VCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2' +
                'ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDUyIDYzIiB2ZXJzaW9uPSIxLj' +
                'EiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkv' +
                'eGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaW' +
                'xsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6' +
                'MjsiPgogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtMTYuNjUsLTIzLjAxNzIpIj4KICAgICAgICA8cGF0aCBkPS' +
                'JNNjguMzYzLDYzLjk3M0w2OC4zNjMsNDAuMTA5QzY4LjM2Myw0MC4xMDkgNjguMzYzLDM3LjExMyA2NS43NjgsMzUuNjE1TDQ1' +
                'LjEwMiwyMy42ODNDNDUuMTAyLDIzLjY4MyA0Mi41MDcsMjIuMTg1IDM5LjkxMiwyMy42ODNMMTkuMjQ1LDM1LjYxNUMxOS4yND' +
                'UsMzUuNjE1IDE2LjY1LDM3LjExMyAxNi42NSw0MC4xMDlMMTYuNjUsNjMuOTczQzE2LjY1LDYzLjk3MyAxNi42NSw2Ni45Njkg' +
                'MTkuMjQ1LDY4LjQ2N0w0Ny44MzksODQuODIyQzQ3LjgzOSw4NC44MjIgNTAuNDM0LDg2LjM2OCA1My4wMjksODQuODdMNjQuNj' +
                'UyLDc4LjExMkw0Mi41Miw2NS41MDNMNDIuNTA3LDY1LjUxMUwzMC44NDMsNTguNzc2TDMwLjg0Myw0NS4zMDdMNDIuNTA3LDM4' +
                'LjU3M0w1NC4xNzEsNDUuMzA3TDU0LjE3MSw1OC43NzZMNDUuMjEzLDYzLjk0OEw1OS41NjUsNzIuMDVMNjUuNzY4LDY4LjQ2OU' +
                'M2NS43NjksNjguNDY4IDY4LjM2Myw2Ni45NyA2OC4zNjMsNjMuOTczIiBzdHlsZT0iZmlsbDpyZ2IoMCwyMzEsMjU1KTtmaWxs' +
                'LXJ1bGU6bm9uemVybzsiLz4KICAgIDwvZz4KPC9zdmc+Cg==',
            "logo_file_name": "test-swagger.svg",
            "logo_mime_type": "image/svg+xml",
            "swagger": "PetStore.swagger.yaml",
            "rest": {
                "data": "json",
                "oauth2_auth_url":  "https://{{subdomain}}.example.com/oauth2/auth",
                "oauth2_client_id": "x",
                "oauth2_client_secret": "y",
                "oauth2_grant_type": "authorization_code",
                "oauth2_token_url": "https://{{subdomain}}.example.com/token",
                "url": "https://{{subdomain}}.example.com/api",
            },
            "rest_modifiers": {
                "options": {
                    "subdomain": {
                        "display_name": "Subdomain",
                        "short_desc": "The subdomain for the URL",
                        "desc": "The subdomain for the URL",
                        "type": "string",
                    },
                },
                "required_options": "subdomain",
                "url_template_options": [
                    "subdomain",
                ],
            },
        });

        // NOTE: this action will be executed as a REST call, no code is necessary
        api.registerAction({
            "app": "js-swagger-test",
            "action": "create-pet",
            "display_name": "Create Pet",
            "short_desc": "Create pet",
            "desc": "Create pet",
            "action_code": 2,  // DPAT_API == 2
            "swagger_path": "pet/POST",
            /** override_options?: object -> allows options to be overridden; keys are non-optimized request property
                paths and must refer to a property that will be presented as an action option after flattening /
                optimization. The attributes of the object are handled like action option attributes
            */
            "override_options": {
                "body.name": {
                    "get_allowed_values": async function(ctx) {
                        return [
                            {
                                "display_name": "Fido",
                                "short_desc": "Fido",
                                "desc": "Fido",
                                "value": "Fido",
                            },
                            {
                                "display_name": "Spot",
                                "short_desc": "Spot",
                                "desc": "Spot",
                                "value": "Spot",
                            },
                        ];
                    },
                },
            },
        });

        // NOTE: this action will be executed as a REST call, no code is necessary
        api.registerAction({
            "app": "js-swagger-test",
            "action": "get-pet",
            "display_name": "Get Pet",
            "short_desc": "Get pet",
            "desc": "Get pet",
            "action_code": 2,  // DPAT_API == 2
            "swagger_path": "pet/{id}/GET",
            /** override_options?: object -> allows options to be overridden; keys are non-optimized request property
                paths and must refer to a property that will be presented as an action option after flattening /
                optimization. The attributes of the object are handled like action option attributes
            */
            "override_options": {
                'id': {
                    "get_allowed_values": async function(ctx) {
                        return [
                            {
                                "display_name": "1",
                                "short_desc": "1",
                                "desc": "1",
                                "value": 1,
                            },
                            {
                                "display_name": "2",
                                "short_desc": "2",
                                "desc": "2",
                                "value": 2,
                            },
                        ];
                    },
                },
            },
        });

        api.registerAction({
            // app: string
            "app": "js-swagger-test",
            // action: string
            "action": "webhook-event-1",
            // display_name: string
            "display_name": "Webhook Event",
            // short_desc: string
            "short_desc": "Webhook event example action",
            // desc: string
            "desc": "Webhook event example action",
            // action_code: int
            "action_code": 1,  // DPAT_EVENT == 1
            // event action options as documented above
            "options": {
                "name": {
                    "type": "string",
                    "display_name": "Name",
                    "short_desc": "A name",
                    "desc": "A name",
                    "required": true,
                    "preselected": true,
                    "get_allowed_values": async function(ctx) {
                        return [
                            {
                                "display_name": "Fred",
                                "short_desc": "Fred",
                                "desc": "Fred",
                                "value": "Fred",
                            },
                            {
                                "display_name": "Albert",
                                "short_desc": "Albert",
                                "desc": "Albert",
                                "value": "Albert",
                            },
                        ];
                    },
                }
            },
            // webbook_method?: string
            /** "webhook_method" is required when action_code is 1 (DPAT_EVENT), and there is no "event_function" and
                "stop_function"
                It must be an HTTP method that the remote server will use when posting a value on the webhook

                In this case, "webhook_register" and "webhook_deregister" must also be defined
            */
            "webhook_method": "POST",
            // webbook_auth?: int
            /** Webhook authentication required?
                - AUTH_NONE = 0 -> no auth required
                - AUTH_REQUIRE_AUTH = 1 -> authentication required
            */
            "webhook_auth": 0, // AUTH_NONE
            // webbook_perms?: string[]
            /** an optional list of string permissions required for authenticated users (when "webhook_auth" == 1  /
                QAUTH_QORUS)
            */
            "webhook_perms": null,
            // webbook_register?: async function(ctx?: object, url: string): object | void {}
            /**
                @param ctx: object -> with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param url: string -> the URL the webhook is reachable on

                @return an optional object that will be passed as the third argument to "webhook_deregister"

                @note the function here will be called with no "this" context; "this" cannot be used in this function
            */
            "webhook_register": async function(ctx, url) {
                if (!ctx || !ctx.opts || !ctx.opts.name) {
                    throw new Error("missing name");
                }
                // this function should register the webhook with the server
            },
            // webbook_deregister?: async function(ctx?: object, url: string, reginfo?: object) {}
            /**
                @param ctx: object -> with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param url: string -> the URL the webhook is reachable on
                @param reginfo?: object -> any value returned from the "webhook_register()" function

                @note the function here will be called with no "this" context; "this" cannot be used in this function
            */
            "webhook_deregister": async function(ctx, url, reginfo) {
                // this function should deregister the webhook with the server
            },
            // webhook_event_loc?: string -> the location of the webhook event data in dot notation
            // event_info: object
            /** The description of the event that the action will generate with the following keys
                - id: *string -> the event code for the event; if not present will default to "event"
                - desc: string -> a description of the event
                - type: object -> type description of that event
            */
            "event_info": {
                "desc": "Data event",
                "type": {
                    "type": "hash",
                    "fields": {
                        "name": {
                            "type": "string",
                            "display_name": "Event Name",
                            "short_desc": "Event name",
                            "desc": "Event name",
                        },
                        "code": {
                            "type": "int",
                            "display_name": "Event Code",
                            "short_desc": "Event code",
                            "desc": "Event code",
                        },
                    },
                },
            },
            // get_example_event_data: function (): object
            /** Returns an example event

                @param ctx: object -> with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
            */
            get_example_event_data: async function (ctx) {
                return {
                    "name": "a name",
                    "code": 1234,
                };
            },
        });

        api.registerAction({
            "app": "js-swagger-test",
            "action": "js-event-1",
            "display_name": "JavaScript Event",
            "short_desc": "JavaScript event example action",
            "desc": "JavaScript event example action",
            "action_code": 1,  // DPAT_EVENT == 1
            // event action options as documented above
            "options": {
                "name": {
                    "type": "string",
                    "display_name": "Name",
                    "short_desc": "A name",
                    "desc": "A name",
                    "required": true,
                    "preselected": true,
                    "get_allowed_values": async function(ctx) {
                        return [
                            {
                                "display_name": "Fred",
                                "short_desc": "Fred",
                                "desc": "Fred",
                                "value": "Fred",
                            },
                            {
                                "display_name": "Albert",
                                "short_desc": "Albert",
                                "desc": "Albert",
                                "value": "Albert",
                            },
                        ];
                    },
                }
            },
            /** "event_function" is required when "action_code" == DPAT_EVENT and "webhook_method" is not present
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param update: function (event_data: object) -> this function should be called when events are
                received to post the event to the observer
                @param should_stop: function (): bool -> this function will return true when event polling should stop

                @note the function here will be called with no "this" context; "this" cannot be used in this function
            */
            "event_function": async function(ctx, update, should_stop) {
                if (!ctx.opts.name) {
                    throw new Error("missing name");
                }
                update({
                    "name": "name-1",
                    "code": 1234,
                });
                while (!should_stop()) {
                    // sleep for 100ms
                    setTimeout(function() {}, 100);
                }
            },
            "event_info": {
                "desc": "Data event",
                "type": {
                    "type": "hash",
                    "fields": {
                        "name": {
                            "type": "string",
                            "display_name": "Event Name",
                            "short_desc": "Event name",
                            "desc": "Event name",
                        },
                        "code": {
                            "type": "int",
                            "display_name": "Event Code",
                            "short_desc": "Event code",
                            "desc": "Event code",
                        },
                    },
                },
            },
            // get_example_event_data: function (): object
            /** Returns an example event

                @param ctx: object -> with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
            */
            get_example_event_data: async function (ctx) {
                return {
                    "name": "a name",
                    "code": 1234,
                };
            },
        });
    }
};
