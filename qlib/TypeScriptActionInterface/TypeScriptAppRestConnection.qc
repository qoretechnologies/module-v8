# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionRestConnection.qc Copyright 2024 Qore Technologies, s.r.o.

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
#! Generic REST client class for apps provided by the TypeScript API
public class TypeScriptAppRestClient inherits RestClient {
    private {
        TypeScriptAppRestConnection conn;
        *hash<AsyncCallInfo> post_auth;
    }

    #! calls the base class HTTPClient constructor and optionally connects to the REST server
    constructor(TypeScriptAppRestConnection conn, *hash<auto> opts, *softbool do_not_connect)
            : RestClient(opts, do_not_connect) {
        self.conn := conn;
        post_auth = TypeScriptActionInterface::getPostAuthCall(conn.getAppName());
    }

    #! Returns options to update after an OAuth2 login
    private *hash<auto> getUpdateOptionsAfterLogin(hash<auto> h) {
        *hash<auto> rv = RestClient::getUpdateOptionsAfterLogin(h);
        if (post_auth) {
            rv += TypeScriptActionApiDataProvider::getAsyncValueArgs(self, post_auth, {
                "conn_name": conn.name,
                "conn_opts": conn.getRealOptions(),
            });
            info("Connection %y app %y post-auth adding options: %y", conn.name, conn.getAppName(), rv);

            hash<auto> config = {
                "url": getURL(),
                "opts": conn.getRealOptions() + rv,
            };
            config = TypeScriptActionInterface::getRestConfig(conn.getAppName(), config);
            if (config.url.val()) {
                setURL(AbstractConnection::getRealUrl(config.url, conn.getConnectionSchemeInfo(), conn.getType()));
            }
        }
        return rv;
    }
}

#! Generic class for app REST connection for an app provided by the TypeScript API
public class TypeScriptAppRestConnection inherits RestConnection {
    private {
        string scheme;
        string app;
        hash<ConnectionSchemeInfo> info;
        *hash<string, bool> url_template_options;
        *hash<AsyncCallInfo> post_auth;
    }

    #! Creates the object
    #! creates the TypeScriptAppRestConnection object
    /** @param name the name of the connection
        @param description connection description
        @param url the URL for the connection
        @param attributes various attributes. See below
        @param options connection options

        See @ref ConnectionProvider::AbstractConnection::constructor() for \c attributes and \c options reference.

        @throw CONNECTION-OPTION-ERROR missing or invalid connection option
    */
    constructor(string name, string description, string url, hash<auto> attributes = {}, hash<auto> options = {})
            : RestConnection(TypeScriptAppRestConnection::getConfig({
                "name": name,
                "desc": description,
                "url": url,
                "opts": options,
            }), attributes) {
        post_auth = TypeScriptActionInterface::getPostAuthCall(app);
    }

    #! creates the TypeScriptAppRestConnection object
    /** @param config with the following keys:
        - name (required string): the connection name
        - display_name (optional string): the display name
        - short_desc (optional string): a short description in plain text
        - desc (optional string): a long description with markdown formatting
        - url (required string): the connection URL
        - opts (optional hash): connection options
        - logger (optional LoggerInterface object): logger for the connection
        @param attr optional connection attributes
        - monitor (optional bool): should the connection be monitored? Default: True
        - enabled (optional bool): is the connection enabled? Default: True
        - locked (optional bool): is the connection locked? Default: False
        - debug_data (optional bool): debug data? Default: False
        - tags (optional hash): tags for the connection; no default value

        @throw CONNECTION-OPTION-ERROR missing or invalid connection option or attribute
    */
    constructor(hash<auto> config, *hash<auto> attr)
            : RestConnection(TypeScriptAppRestConnection::getConfig(config), attr) {
        post_auth = TypeScriptActionInterface::getPostAuthCall(app);
    }

    #! Returns the app name
    string getAppName() {
        return app;
    }

    #! returns the type
    string getType() {
        return scheme;
    }

    #! returns a data provider object for this connection
    /** @param constructor_options any additional constructor options for the data provider

        @return a data provider object for this connection
    */
    DataProvider::AbstractDataProvider getDataProvider(*hash<auto> constructor_options) {
        return TypeScriptActionInterface::getDataProvider(app, self);
    }

    #! Return OAuth2 options
    /** @return a hash of OAuth2 options
    */
    hash<auto> getOAuth2Options() {
        hash<auto> rv = RestConnection::getOAuth2Options();
        if (url_template_options) {
            foreach string opt in ("oauth2_auth_url", "oauth2_token_url") {
                hash<auto> opts = getConnectionOptions();
                if ((*string url = rv{opt}).val()) {
                    rv{opt} = TypeScriptActionInterface::processUrl(url, opts, url_template_options);
                }
            }
        }
        return rv;
    }

    #! Returns the logger interface for logging
    *LoggerInterface getLogger() {
        return logger;
    }

    #! Processes the OAuth2 token response
    private *hash<auto> processOAuth2TokenResponseImpl(hash<auto> resp) {
        *hash<auto> new_opts = RestConnection::processOAuth2TokenResponseImpl(resp);
        #LoggerWrapper::debug("Connection %y app %y post-auth resp: %y new_opts: %y (post_auth: %y)", name, app, resp,
        #    new_opts, post_auth);
        if (new_opts && post_auth) {
            on_error rethrow $1.err, sprintf("%s (new_opts: %y)", $1.desc, new_opts);
            new_opts += TypeScriptActionApiDataProvider::getAsyncValueArgs(self, post_auth, {
                "conn_name": name,
                "conn_opts": real_opts + new_opts,
            });
            LoggerWrapper::info("Connection %y app %y post-auth adding options: %y from %y", name, app, new_opts,
                resp);
        }
        return new_opts;
    }

    #! performs options validation in the constructor
    /** @param options a hash with options from the constructor
        @param check_required check that all required options are set

        @return validated option hash

        This method can be overloaded in connections where are options created dynamically for example

        @throw CONNECTION-OPTION-ERROR missing or invalid connection option
    */
    private hash<auto> validateOptions(hash<auto> options, bool check_required = True) {
        setupTs(url);
        return RestConnection::validateOptions(options, check_required);
    }

    #! Set up the generic object from the app config
    private setupTs(string url) {
        *string scheme = (url =~ x/^(tsrest-[^:]+):/)[0];
        if (!exists scheme) {
            throw "TYPESCRIPT-REST-CONNECTION-ERROR", sprintf("Cannot determine TypeScript REST scheme from URL %y",
                url);
        }
        self.scheme = scheme;
        *string app = (scheme =~ x/^tsrest-(.+)$/)[0];
        if (!exists app) {
            throw "TYPESCRIPT-REST-CONNECTION-ERROR", sprintf("Cannot determine TypeScript REST app from scheme %y "
                "in URL %y", scheme, url);
        }
        self.app = app;
        url_template_options = TypeScriptActionInterface::getUrlTemplateOptions(app);
        info = ConnectionSchemeCache::getSchemeEx(scheme);
    }

    #! Sets child data provider capabilities
    private setChildCapabilities() {
        children_can_support_apis = True;
    }

    #! returns a @ref TypeScriptAppRestConnection object
    /** @param connect if @ref True "True", then the connection is returned already connected
        @param rtopts this connection type does not accept any runtime options, so this parameter is ignored

        @return a @ref TypeScriptAppRestConnection object
    */
    private TypeScriptAppRestClient getImpl(bool connect = True, *hash<auto> rtopts) {
        *hash<auto> opts = getConnectionOptions();
        if (url_template_options) {
            foreach string opt in ("oauth2_auth_url", "oauth2_token_url") {
                if ((*string url = opts{opt}).val()) {
                    opts{opt} = TypeScriptActionInterface::processUrl(url, opts, url_template_options);
                }
            }
        }
        return new TypeScriptAppRestClient(self, opts, !connect);
    }

    #! Returns the ConnectionSchemeInfo hash for this object
    private hash<ConnectionSchemeInfo> getConnectionSchemeInfoImpl() {
        return info;
    }

    string getAuthUrl(*bool allow_relative) {
        return getUrlOption("oauth2_auth_url", allow_relative);
    }

    #! Returns the value of a URL option or throws an exception if not set
    /*  @param opt the URL option name
        @param allow_relative if @ref True then a relative URL (path only) can be returned; the default (@ref False)
        is to return a full URL
    */
    private string getUrlOption(string opt, *bool allow_relative) {
        string url = RestConnection::getUrlOption(opt, allow_relative);
        if (url_template_options && (opt == "oauth2_auth_url" || opt == "oauth2_token_url")) {
            url = TypeScriptActionInterface::processUrl(url, getConnectionOptions(), url_template_options);
        }
        return url;
    }

    #! Returns options for @ref TypeScriptAppRestConnection::constructor()
    static private hash<auto> getConfig(hash<auto> config) {
        *string url = config.url;
        if (!url.val()) {
            throw "TYPESCRIPT-REST-CONNECTION-ERROR", "Cannot determine TypeScript REST app; missing URL";
        }
        *string app = (url =~ x/^tsrest-(.+):\/\//)[0];
        if (!exists app) {
            throw "TYPESCRIPT-REST-CONNECTION-ERROR", sprintf("Cannot determine TypeScript REST app from URL %y",
                url);
        }
        return config + TypeScriptActionInterface::getRestConfig(app, config);
    }
}
}
