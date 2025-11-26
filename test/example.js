exports.actionsCatalogue = {
    registerAppActions: function(api) {
        /** registerApp() takes the same arguments as DataProviderActionCatalog::registerApp() plus:
            - rest?: object -> documented below
            - swagger?: string -> a location to a Swagger 2.0 schema = OpenAPI 2.0
            - swagger_options?: object -> an optional hash of swagger parsing options - the main option is
              - "parse_flags": -1 -> this will turn on all lax parsing options - or you can use 128
                (LM_ACCEPT_QUERY_OBJECTS = accept "object" as a valid type for query parameters like OpenAPI 3.0)
            - swagger_paths?: string[] -> a list of swagger paths to build an optimized schema
            - swagger_type_overrides?: object -> an object keyed by Swagger type (in dot notation), values are applied
              to override the given types
            - swagger_schema_map?: object -> keyed by swagger scheme label, values are:
              - swagger?: string -> a location to a Swagger 2.0 schema = OpenAPI 2.0
              - swagger_options?: object -> an optional hash of swagger parsing options - the main option is
                - "parse_flags"?: int -1 -> this will turn on all lax parsing options - or you can use 128
                  (LM_ACCEPT_QUERY_OBJECTS = accept "object" as a valid type for query parameters like OpenAPI 3.0)
                - utc_dates?: boolean -> if date/time values should be serialized in UTC as Swagger query args
                - query_date_format?: string -> the date format to use when serializing Swagger query date args
              - swagger_paths?: string[] -> a list of swagger paths to build an optimized schema
              - swagger_type_overrides?: object -> an object keyed by Swagger type (in dot notation), values are
                applied to override the given types
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
                - required_options?: string -> required options for connections for this app; required option names
                  are separated by commas (","); if there are multiple possibilities, they should be separated by pipe
                  chars ("|"); ex: "client_id,client_secret,tenant|token"; all strings must be valid option names in
                  options
                - set_options_post_auth?: async function (ctx? : object) : object? -> A function that is called after
                  authenticating to retrieve additional options to set on the connection; the return value must be an
                  object with serializable values that are connection options; the options will be stored on the
                  connection itself; 'ctx' is an object with the following keys:
                  - conn_name: string -> the connection name, if any is defined
                  - conn_opts: object -> connection options + processed options from the auth response + the auth
                    response itself
                - set_options_post_auth_code?: function (ctx? : object) : object? -> A function that is called after
                  authenticating to retrieve additional options to set on the connection; the return value must be an
                  object with serializable values that are connection options; no I/O should be performed in this
                  function, as it will be called from the async connection poller object; options returned will be
                  stored on the connection itself; 'ctx' is an object with the following keys:
                  - conn_name: string -> the connection name, if any is defined
                  - conn_opts: object -> connection options + processed options from the auth response + the auth
                    response itself
                - url_from_option?: string -> the name of an option that will provide the URL value; the option must
                  be required
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
                "set_options_post_auth": async function (ctx) {
                    return {
                        "account_id": "abc123",
                    };
                },
                "url_template_options": [
                    "account_id",
                ],
            },
            /** "get_table_list" is required for record-based action support
                get_table_list(ctx: object): string[] {}
                @param ctx: object -> with the following properties:
                - conn_name: string -> the connection name, if any is defined
                - conn_opts: object -> connection options + processed options from the auth response + the auth
                  response itself
                @return a list of table names (string[])
            */
            "get_table_list": async function(ctx) {
                return ["test"];
            },
            /** "begin_transaction" allows an explicit transaction to be started
                begin_transaction(ctx: object): void {}
                - conn_name: string -> the connection name, if any is defined
                - conn_opts: object -> connection options + processed options from the auth response + the auth
                  response itself
            */
            "begin_transaction": async function(ctx) {
            },
            /** "commit" allows a transaction to be committed
                commit(ctx: object): void {}
                - conn_name: string -> the connection name, if any is defined
                - conn_opts: object -> connection options + processed options from the auth response + the auth
                  response itself
            */
            "commit": async function(ctx) {
            },
            /** "rollback" allows a transaction to be rolled back
                rollback(ctx: object): void {}
                - conn_name: string -> the connection name, if any is defined
                - conn_opts: object -> connection options + processed options from the auth response + the auth
                  response itself
            */
            "rollback": async function(ctx) {
            },
            /** "get_record_type" is required for record-based action support
                get_record_type(ctx: object, table_name: string): object {}
                @param ctx: object -> with the following properties:
                - conn_name: string -> the connection name, if any is defined
                - conn_opts: object -> connection options + processed options from the auth response + the auth
                  response itself
                @param table_name: string -> the name of the table to get the record type for
                @return the record type for the given table; must be a type hash defining a "hash" type
            */
            "get_record_type": async function(ctx, table_name) {
                if (table_name != 'test') {
                    throw new Error('Unknown table ' + search_opts.table);
                }
                return {
                    "type": "hash",
                    "fields": {
                        "id": {
                            "type": "int",
                            "display_name": "ID",
                            "short_desc": "The ID",
                            "desc": "The ID",
                            "example_value": 1,
                            "required": true,
                        },
                        "name": {
                            "type": "string",
                            "display_name": "Name",
                            "short_desc": "A name",
                            "desc": "A name",
                            "example_value": "Bill",
                            "required": true,
                        },
                    },
                };
            },
            /** "expressions" defines global expressions for record-based action support
                # the following type is used in the expression definition; "search" is for expressions that can be used
                # in search filters, "field" is for expressions that can be used in field lists or in the value of
                # update operations
                type Role = 'search' | 'field';
                # the following type describes an argument to an expression
                type Arg = {
                    type_code: 'any' // the argument can be an expression, an immediate value, or a field refefence
                        | 'value',   // the argument must be an immediate value
                        | 'field,    // the argument must be a field reference
                    type: string | object, // the argument type
                    display_name?: string, // the user-friendly display name for the argument
                    short_desc?: string,   // a short plain-text description of the argument
                    desc?: string,         // a longer description for the argument that supports markdown formatting
                    default_value? : any,  // values must use the argument's type
                    sensitive?: bool,      // if the argument is sensitive (password, etc)
                    allowed_values?: AllowedValues[], // an array of objects providing the only values allowed for
                                           // the argument
                    allowed_values_creatable?: bool, // if true, then values not in allowed_values can be used
                    element_allowed_values?: AllowedValues[], // an array of objects providing the only values allowed
                                           // for list elements
                    element_allowed_values_creatable?: bool, // if true, then values not in element_allowed_values can
                                           // be used
                    example_value?: any,   // values must use the argument's type
                };
                expressions: {
                    [key: string]: {
                        // the type of expression
                        type: "operator" | "function",
                        // the subtype of the expression
                        subtype: "generic" | "logic-operator" = "generic",
                        name: string,
                        display_name: string,
                        short_desc: string,
                        desc: string,
                        // the symbol or text to use when rendering the expression
                        symbol: string,
                        // the expression role code(s) which determine where the expression can be used
                        roles: Role[],
                        // the arguments the expression takes
                        args: Arg[],
                        // the return type of the expression
                        return_type: string | object,
                        // if true, the last argument can be repeated indefinitely
                        varargs?: bool,
                    },
                } {}
                standard operator names (keys for the get_expressions() return value):
                - "&&": logical and
                - "||": logical or
                - "regex": regular expression match
                - "<": less than
                - "<=": less than or equal
                - ">": greater than
                - ">=": greater than or equal
                - "=": equal
                - "!=": not equal
                - "in": in operator
                - "!": logical negation
                - "like": SQL-like "like" operator with "%" as the wildcard character
                - "between": between operator
                @param ctx: object -> with the following properties:
                - conn_name: string -> the connection name, if any is defined
                - conn_opts: object -> connection options + processed options from the auth response + the auth
                  response itself
                @return an object defining global expressions; the format is as described above
            */
            "expressions": {
                "&&": {
                    "type": "operator",
                    "subtype": "logic-operator",
                    "name": "&&",
                    "display_name": "and (&&)",
                    "short_desc": "Returns True if all arguments are True with logic short-circuiting",
                    "desc": "Returns `True` if all arguments are `True` with logic short-circuiting",
                    "symbol": "&&",
                    "roles": ["search", "field"],
                    "args": [
                        {
                            "type_code": "any",
                            "type": "bool",
                        },
                    ],
                    "varargs": true,
                    "return_type": "bool",
                },
                "==": {
                    "type": "operator",
                    "subtype": "logic-operator",
                    "name": "==",
                    "display_name": "equals (==)",
                    "short_desc": "Returns True if the two arguments are logically equal; types are converted if necessary",
                    "desc": "Returns `True` if the two arguments are logically equal; types are converted if necessary",
                    "symbol": "==",
                    "roles": ["search", "field"],
                    "args": [
                        {
                            "type_code": "any",
                            "type": "any",
                        },
                        {
                            "type_code": "any",
                            "type": "any",
                        },
                    ],
                    "return_type": "bool",
                },
                "test": {
                    "type": "function",
                    "name": "test",
                    "display_name": "test",
                    "short_desc": "Test function",
                    "desc": "Test function",
                    "symbol": "test",
                    "roles": ["search", "field"],
                    "args": [
                        {
                            "type_code": "any",
                            "type": "string",
                            "allowed_values": [
                                {
                                    "display_name": "A",
                                    "short_desc": "A",
                                    "desc": "A",
                                    "value": "a",
                                },
                            ],
                        },
                    ],
                    "return_type": "bool",
                },
            },

            // executes the search and returns a list of the records matched
            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param where_cond?: object -> the optional search expression tree
                @param search_opts?: object -> search options; the table will be provided as search_opts.table

                @return get_record(ctx?: object, block_size: number): object -> a callable object that returns a
                record set as an object with keys that correspond to the field names with values that are lists of
                field values

                record must be a data object that matches the record type for the table
            */
            "search_records": async function (ctx, where_cond, search_opts) {
                if (search_opts.table != 'test') {
                    throw new Error('Unknown table ' + search_opts.table);
                }
                let done = false;
                function get_records(ctx, block_size) {
                    if (!done) {
                        done = true;
                        return {
                            "id": [1, 2],
                            "name": ["a", "b"],
                        };
                    }
                }
                return get_records;
            },

            // get search options
            "search_options": {
                "for_update": {
                    "display_name": "For Update?",
                    "short_desc": "Should rows be locked for update?",
                    "desc": "Should rows be locked for update?",
                    "type": "string",
                    "required": false,
                    "default_value": false,
                    "on_change": ["refetch"],
                },
                "isolation_level": {
                    "display_name": "Transaction Isolation Level",
                    "short_desc": "The transaction isolation level to use",
                    "desc": "The transaction isolation level to use",
                    "type": "string",
                    "required": false,
                    "get_allowed_values": async function(ctx) {
                        // simulate a call where the connection info is required
                        if (!ctx.conn_opts) {
                            return;
                        }
                        return [
                            {
                                "display_name": "Read Uncommitted",
                                "short_desc": "Read uncommitted",
                                "desc": "Read uncommitted",
                                "value": "read-uncommitted",
                            },
                            {
                                "display_name": "Read Committed",
                                "short_desc": "Read committed",
                                "desc": "Read committed",
                                "value": "read-committed",
                            },
                            {
                                "display_name": "Repeatable Read",
                                "short_desc": "Repeatable read",
                                "desc": "Repeatable read",
                                "value": "repeatable-read",
                            },
                            {
                                "display_name": "Serializable",
                                "short_desc": "Serializable",
                                "desc": "Serializable",
                                "value": "serializable",
                            },
                        ];
                    },
                    "get_default_value": async function(ctx) {
                        // simulate a call where the connection info is required
                        if (!ctx.conn_opts) {
                            return;
                        }
                        return "read-committed";
                    },
                },
            },

            // creates one or more records and returns the created records
            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param records: object -> the record(s) to create; keys are field names and values are lists of values
                to create for each field
                @param create_opts?: object -> create options; the table will be provided as create_opts.table

                @return object?: if any new record(s) were generated, then the return value must be an object with
                the keys of the generated data where the values are lists of the generated data in the same order as
                the data submitted
            */
            "create_records": async function (ctx, records, create_opts) {
                if (create_opts.table != 'test') {
                    throw new Error('Unknown table ' + create_opts.table);
                }
                return {
                    "new": new Array(Object.values(records)[0].length).fill("value"),
                };
            },

            // updates records and returns the number of records updated
            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param update_fields: object -> the fields to update; must resolve to a data object that matches the
                record type for the table for the fields to be updated; values can be expressions
                @param where_cond?: object -> the optional search expression tree
                @param search_opts?: object -> search options; the table will be provided as search_opts.table
                @return the number of records updated
            */
            "update_records": async function (ctx, update_fields, where_cond, search_opts) {
                if (search_opts.table != 'test') {
                    throw new Error('Unknown table ' + search_opts.table);
                }
                return 1;
            },

            // upserts a record and returns the result code of the operation
            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param records: object -> the record to upsert; keys are field names and values are lists of values
                to create for each field
                @param upsert_opts?: object -> upsert options; the table will be provided as upsert_opts.table
                @return string[]?: if known, the result code of the operation for each record upserted:
                - inserted: record inserted
                - updated: record updated
                - verified: record was either inserted or updated (the default if no value is returned)
                - unchanged: record was found and no changes were necessary
                - deleted: record was deleted (only possible with specific upsert options)
            */
            "upsert_records": async function (ctx, records, upsert_opts) {
                if (upsert_opts.table != 'test') {
                    throw new Error('Unknown table ' + upsert_opts.table);
                }
            },

            // deletes records and returns the number of records deleted
            /**
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
                @param where_cond?: object -> the optional search expression tree
                @param search_opts?: object -> search options; the table will be provided as search_opts.table
                @return the number of records deleted
            */
            "delete_records": async function (ctx, where_cond, search_opts) {
                if (search_opts.table != 'test') {
                    throw new Error('Unknown table ' + search_opts.table);
                }
                return 1;
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

            /** "get_dynamic_request_type" can be defined when "action_code" == DPAT_API to describe the request type
                @param ctx?: object with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition

                @return an object describing the request type for the action

                @note the function here will be called with no "this" context; "this" cannot be used in this function
            */
            "get_dynamic_request_type": async function(ctx) {
                return {
                    "ax0": {
                        "type": "string",
                        "display_name": "AX0-Key",
                        "short_desc": "AX0 key",
                        "desc": "AX0 key",
                    },
                    "ax1": {
                        "type": "string",
                        "display_name": "AX1-Key",
                        "short_desc": "AX1 key",
                        "desc": "AX1 key",
                    },
                };
            },

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
                  - readonly?: bool -> is the type read-only?
                  - disabled?: bool -> is the type disabled?
                  - preselected?: bool -> if fields of this type should be preselected; will set the corresponding UI
                    flag
                  - allowed_values?: AllowedValues[] -> an array of objects providing the only values allowed for
                    the option
                  - fields?: object -> a hash of field objects; only valid if \c type is "hash"; keys are field
                    names, values are as follows:
                    - display_name?: string -> the user-friendly display name for the field
                    - short_desc?: string -> a short plain-text description of the field
                    - desc?: string -> a longer description for the field that supports markdown formatting
                    - type -> same as this - either a string or a data object again
                    - example_value?: any -> (values must use the field's type) any example value to use when
                      generating example data etc
                    - default_value?: any -> (values must use the field's type) the default value if none is provided
                      by the user; this overrides any default value provided by the type
                    - allowed_values?: AllowedValues[] -> an array of objects providing the only values allowed for
                      the field - with the following properties
                    - readonly?: bool -> is the field read-only?
                    - disabled?: bool -> is the field disabled?
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
                    "get_element_allowed_values": async function(ctx) {
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
                    "type": "hash",
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
                    },
                },
                "dyn": {
                    "type": "hash",
                    "display_name": "Dyn",
                    "short_desc": "Dynamic option",
                    "desc": "Dynamic option",
                    "get_dynamic_type": async function(ctx) {
                        return {
                            "type": "hash",
                            "fields": {
                                "o0": {
                                    "type": "string",
                                    "display_name": "O0-Key",
                                    "short_desc": "O0 key",
                                    "desc": "O0 key",
                                },
                                "o1": {
                                    "type": "string",
                                    "display_name": "O1-Key",
                                    "short_desc": "O1 key",
                                    "desc": "O1 key",
                                },
                            },
                        };
                    },
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
                                    "get_default_value": function (ctx) {
                                        return 100;
                                    },
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
            /** ignore_options?: string[] -> ignores options given in the request type
            */
            /** override_options?: object -> allows options to be overridden; keys are non-optimized request property
                paths and must refer to a property that will be presented as an action option after flattening /
                optimization. The attributes of the object are handled like action option attributes
            */
            "override_options": {
                "name": {
                    "validation_regex": "^.*$",
                    "get_allowed_values": async (ctx) => [
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
                    ],
                },
                "new0.new1": {
                    "get_dynamic_type": async function(ctx) {
                        return {
                            "type": "hash",
                            "fields": {
                                "a": {
                                    "type": "string",
                                },
                            },
                        };
                    }
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
            // webhook_echo_header?: string -> the name of any header in the input request that should be echoed in
            // the response
            // webhook_echo_body_keys?: string[] -> the name of any key in the input request body that should be echoed
            // in the response
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
                },
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
                if (!ctx?.opts?.name) {
                    throw new Error("missing name");
                }
                var event = {
                    "name": "name-1",
                    "code": 1234,
                };
                if (ctx?.opts && ctx?.opts?.extra === true) {
                    event = {...event, extra: "hi"};
                }
                update(event);
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
            "get_example_event_data": async function (ctx) {
                var rv = {
                    "name": "a name",
                    "code": 1234,
                };
                if (ctx && ctx.opts && ctx.opts.extra === true) {
                    rv = {...rv, extra: "hi"};
                }
                return rv;
            },
            // get_dynamic_type?: function (): object
            /** Returns type info to be added dynamically to any \a event_info

                @param ctx: object -> with the following properties:
                - conn_name?: string -> the connection name, if any is defined
                - conn_opts?: object -> connection options; for REST connections, see the 'rest' object definition
                - opts?: object -> a data object with option values set for the current action
            */
            "get_dynamic_type": async function (ctx) {
                if (ctx && ctx.opts && ctx.opts.extra === true) {
                    return {
                        "type": "hash",
                        "fields": {
                            "extra": {
                                "type": "string",
                            },
                        },
                    };
                }
            },
        });

        // this will add actions to discord
        api.registerExistingApp({
            "name": "Discord",
            "module": "DiscordDataProvider",
        });

        api.registerAction({
            "app": "Discord",
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

        api.registerApp({
            "name": "gmail-test",
            "display_name": "JavaScript Gmail Test",
            "short_desc": "Gmail test",
            "desc": "Gmail test",
            // "logo" is a base64-encoded string
            "logo": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDUyIDYzIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtMTYuNjUsLTIzLjAxNzIpIj4KICAgICAgICA8cGF0aCBkPSJNNjguMzYzLDYzLjk3M0w2OC4zNjMsNDAuMTA5QzY4LjM2Myw0MC4xMDkgNjguMzYzLDM3LjExMyA2NS43NjgsMzUuNjE1TDQ1LjEwMiwyMy42ODNDNDUuMTAyLDIzLjY4MyA0Mi41MDcsMjIuMTg1IDM5LjkxMiwyMy42ODNMMTkuMjQ1LDM1LjYxNUMxOS4yNDUsMzUuNjE1IDE2LjY1LDM3LjExMyAxNi42NSw0MC4xMDlMMTYuNjUsNjMuOTczQzE2LjY1LDYzLjk3MyAxNi42NSw2Ni45NjkgMTkuMjQ1LDY4LjQ2N0w0Ny44MzksODQuODIyQzQ3LjgzOSw4NC44MjIgNTAuNDM0LDg2LjM2OCA1My4wMjksODQuODdMNjQuNjUyLDc4LjExMkw0Mi41Miw2NS41MDNMNDIuNTA3LDY1LjUxMUwzMC44NDMsNTguNzc2TDMwLjg0Myw0NS4zMDdMNDIuNTA3LDM4LjU3M0w1NC4xNzEsNDUuMzA3TDU0LjE3MSw1OC43NzZMNDUuMjEzLDYzLjk0OEw1OS41NjUsNzIuMDVMNjUuNzY4LDY4LjQ2OUM2NS43NjksNjguNDY4IDY4LjM2Myw2Ni45NyA2OC4zNjMsNjMuOTczIiBzdHlsZT0iZmlsbDpyZ2IoNjQsNjQsNjQpO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgPC9nPgo8L3N2Zz4K",
            "logo_file_name": "gmail-test.svg",
            "logo_mime_type": "image/svg+xml",
            "google_app": {
                "api": "gmail",
            },
            "rest": {
                "data": "json",
                "oauth2_auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
                "oauth2_client_id": "x",
                "oauth2_client_secret": "y",
                "oauth2_grant_type": "authorization_code",
                "oauth2_token_url": "https://oauth2.googleapis.com/token",
                "url": "tsrest-gmail-test://www.googleapis.com",
            },
        });

        api.registerAction({
            "app": "gmail-test",
            "action": "send-email",
            "display_name": "Send Email",
            "short_desc": "Send email",
            "desc": "Send email",
            "action_code": 2,  // DPAT_API == 2
            "google_action": {
                "resource": "users/messages/send",
                "path_args": {
                    "userId": "me",
                },
            },
        });
    }
};
