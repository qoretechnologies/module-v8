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
        *hash<AsyncCallInfo> post_auth_code;
    }

    #! calls the base class HTTPClient constructor and optionally connects to the REST server
    constructor(TypeScriptAppRestConnection conn, hash<auto> opts, *softbool do_not_connect)
            : RestClient(opts, True) {
        self.conn := conn;
        post_auth = TypeScriptActionInterface::getPostAuthCall(conn.getAppName());
        post_auth_code = TypeScriptActionInterface::getPostAuthCodeCall(conn.getAppName());

        if (!do_not_connect) {
            checkLogin();
            connect();
        }
    }

    #! Returns options to update after an OAuth2 login
    private *hash<auto> getUpdateOptionsAfterLogin(hash<auto> h, *bool refresh) {
        *hash<auto> rv = RestClient::getUpdateOptionsAfterLogin(h, refresh);
        LoggerWrapper::debug("Connection %y app %y post-auth resp: %y h: %y rv: %y (post_auth: %y) refresh: %y",
            conn.name, conn.getAppName(), LoggerUtil::getArgSummary(h), LoggerUtil::getArgSummary(rv), post_auth, refresh);
        # do not call "post_auth" when refreshing
        if (post_auth && !refresh) {
            rv += makePostAuthCall(post_auth, h, rv);
        }
        # always call "post_auth_code" if it exists
        if (post_auth_code) {
            rv += makePostAuthCall(post_auth_code, h, rv);
        }
        LoggerWrapper::debug("Connection %y app %y post-auth rv: %y", conn.name, conn.getAppName(),
            LoggerUtil::getArgSummary(rv));
        return rv;
    }

    private *hash<auto> makePostAuthCall(hash<AsyncCallInfo> call, hash<auto> h, *hash<auto> new_opts) {
        *hash<auto> rv;
        try {
            rv = TypeScriptActionDataProviderBase::getAsyncValueArgs(self, call, {
                "conn_name": conn.name,
                "conn_opts": {
                    "url": getURL(),
                } + conn.getRealOptions() + h + new_opts,
            });
            # We have to use the connection scheme if a URL was returned
            if (rv.url && rv.url =~ /^https?:\/\//) {
                rv.url = regex_subst(rv.url, "^https?://", conn.getType() + "://");
            }
            info("Connection %y app %y post-auth adding options: %y", conn.name, conn.getAppName(),
                LoggerUtil::getArgSummary(rv));
        } catch (hash<ExceptionInfo> ex) {
            LoggerWrapper::error("Error executing %s for connection %y: %s: %s (new_opts: %y)", call.label, conn.name,
                ex.err, ex.desc, new_opts);
        }

        hash<auto> config = {
            "url": rv.url ?? getURL(),
            "opts": conn.getRealOptions() + new_opts + rv,
        };
        config = TypeScriptActionInterface::getRestConfig(conn.getAppName(), config);
        if (config.url.val()) {
            setURL(AbstractConnection::getRealUrl(config.url, conn.getConnectionSchemeInfo(), conn.getType()));
        }
        return rv;
    }
}

#! Generic class for app REST connection for an app provided by the TypeScript API
public class TypeScriptAppRestConnection inherits RestConnection {
    private {
        string scheme;
        #! App name in lower case for use with most internal APIs
        string app;
        #! Case-sensitive app name for reporting the app name
        string appname;
        hash<ConnectionSchemeInfo> info;
        *hash<string, bool> url_template_options;
        *hash<AsyncCallInfo> post_auth;
        *hash<AsyncCallInfo> post_auth_code;

        transient Mutex m();
        transient hash<string, Condition> cmap;
        transient hash<string, int> wmap;
        transient hash<string, bool> pmap;
        hash<auto> cache;
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
        post_auth_code = TypeScriptActionInterface::getPostAuthCodeCall(app);
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
        post_auth_code = TypeScriptActionInterface::getPostAuthCodeCall(app);
    }

    #! Gets or sets a cached value
    auto getSetCacheValue(string key, code get, ...) {
        AutoLock al(m);
        if (exists (auto v = cache{key})) {
            return v;
        }
        while (pmap{key}) {
            if (!cmap{key}) {
                cmap{key} = new Condition();
            }
            ++wmap{key};
            cmap{key}.wait(m);
            --wmap{key};
        }
        on_exit {
            if (wmap{key}) {
                (remove cmap{key}).broadcast();
            }
        }
        cache{key} = call_function_args(get, argv);
    }

    #! Returns the app name
    *string getAppName() {
        return appname;
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
            hash<auto> opts = getConnectionOptions();
            map rv{$1} = opts{$1}, ("oauth2_auth_url", "oauth2_token_url"), rv{$1}.val() && opts{$1}.val();
        }
        return rv;
    }

    #! Returns the ping path from the \c ping_path option
    private *string getPingPath() {
        return opts.ping_path.val() && url_template_options
            ? TypeScriptActionInterface::processUrl(opts.ping_path, opts, url_template_options)
            : opts.ping_path;
    }

    #! Sets child data provider capabilities
    private setChildCapabilities() {
        children_can_support_apis = True;
        if (TypeScriptActionInterface::appSupportsEvents(app)) {
            children_can_support_observers = True;
        }
        if (TypeScriptActionInterface::appSupportsRecords(app)) {
            children_can_support_records = True;
        }
    }

    #! Processes the OAuth2 token response
    private *hash<auto> processOAuth2TokenResponseImpl(hash<auto> resp) {
        *hash<auto> new_opts = RestConnection::processOAuth2TokenResponseImpl(resp);
        LoggerWrapper::debug("Connection %y app %y post-auth resp: %y new_opts: %y (post_auth: %y)", name, app,
            LoggerUtil::getArgSummary(resp), LoggerUtil::getArgSummary(new_opts), post_auth);
        # only execute post_auth when the token changes
        if (new_opts && (new_opts.token != real_opts.token)) {
            if (post_auth) {
                new_opts += makePostAuthCall(post_auth, new_opts, resp);
            }
            if (post_auth_code) {
                new_opts += makePostAuthCall(post_auth_code, new_opts, resp);
            }
        }
        LoggerWrapper::debug("Connection %y app %y post-auth rv: %y", name, app, LoggerUtil::getArgSummary(new_opts));
        return new_opts;
    }

    private *hash<auto> makePostAuthCall(hash<AsyncCallInfo> call, *hash<auto> new_opts, hash<auto> resp) {
        try {
            *hash<auto> rv = TypeScriptActionDataProviderBase::getAsyncValueArgs(self, call, {
                "conn_name": name,
                "conn_opts": {
                    "url": real_url,
                } + real_opts + new_opts + resp,
            });
            # We have to use the connection scheme if a URL was returned
            if (rv.url && rv.url =~ /^https?:\/\//) {
                rv.url = regex_subst(rv.url, "^https?://", scheme + "://");
            }
            LoggerWrapper::info("Connection %y app %y %s adding options: %y from %y", name, app, call.label,
                LoggerUtil::getArgSummary(new_opts + rv), LoggerUtil::getArgSummary(resp));
            return rv;
        } catch (hash<ExceptionInfo> ex) {
            LoggerWrapper::error("Error executing %s for connection %y: %s: %s (new_opts: %y)", call.label, name,
                ex.err, ex.desc, new_opts);
        }
    }

    #! performs options validation in the constructor
    /** @param options a hash with options from the constructor
        @param check_required check that all required options are set

        @return validated option hash

        This method can be overloaded in connections where are options created dynamically for example

        @throw CONNECTION-OPTION-ERROR missing or invalid connection option
    */
    private hash<auto> validateOptions(hash<auto> options, bool check_required = True) {
        scheme = "tsrest-" + options.app;
        setupTs(options.app);
        return RestConnection::validateOptions(options - "app", check_required);
    }

    #! Set up the generic object from the app config
    private setupTs(string app) {
        self.app = app;
        appname = TypeScriptActionInterface::getCamelCaseAppName(app);
        url_template_options = TypeScriptActionInterface::getUrlTemplateOptions(app);
        info = ConnectionSchemeCache::getSchemeEx(scheme);
    }

    #! returns a @ref TypeScriptAppRestClient object
    /** @param connect if @ref True "True", then the connection is returned already connected
        @param rtopts this connection type does not accept any runtime options, so this parameter is ignored

        @return a @ref TypeScriptAppRestClient object
    */
    private TypeScriptAppRestClient getImpl(bool connect = True, *hash<auto> rtopts) {
        return new TypeScriptAppRestClient(self, getConnectionOptions(), !connect);
    }

    #! Returns the ConnectionSchemeInfo hash for this object
    private hash<ConnectionSchemeInfo> getConnectionSchemeInfoImpl() {
        return info;
    }

    string getAuthUrl(*bool allow_relative) {
        return getUrlOption("oauth2_auth_url", allow_relative);
    }

    #! Returns options for creating a new connection
    *hash<auto> getConnectionOptions(*hash<auto> rtopts) {
        *hash<auto> opts = orig_opts + rtopts;
        if (opts && url_template_options) {
            map opts{$1} = TypeScriptActionInterface::processUrl(opts{$1}, opts, url_template_options),
                ("oauth2_auth_url", "oauth2_token_url"), opts{$1}.val();
        }
        return {
            "url": real_url,
        } + opts;
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
        config.opts.app = (url =~ x/^tsrest-(.+):\/\//)[0];
        if (!exists config.opts.app) {
            throw "TYPESCRIPT-REST-CONNECTION-ERROR", sprintf("Cannot determine TypeScript REST app from URL %y",
                url);
        }
        hash<auto> rv = config + TypeScriptActionInterface::getRestConfig(config.opts.app, config);
        if (*string opt = TypeScriptActionInterface::getUrlOptionForApp(config.opts.app)) {
            *string val = config.opts{opt};
            if (!val) {
                throw "TYPESCRIPT-REST-CONNECTION-ERROR",
                    sprintf("Required option %y missing for app %y", opt, config.opts.app);
            }
            string scheme = "tsrest-" + config.opts.app.lwr() + "://";
            if (val =~ /^https?:\/\//) {
                val = regex_subst(val, "^https?://", scheme);
            } else if (!regex(val, "^" + scheme)) {
                throw "TYPESCRIPT-REST-CONNECTION-ERROR", sprintf("URL option %y provides URL with invalid scheme "
                    "for app: %y; expecting scheme %y", opt, val, scheme);
            }
            rv.url = val;
        }
        return rv;
    }
}

#! Generic REST client class for apps provided by the TypeScript API
public class TypeScriptAwsAppRestClient inherits TypeScriptAppRestClient {
    public {
        #! Qore digest algorithm to use for HMAC calculations; must match AwsSignatureAlgorithm
        const QoreDigest = CRYPTO_DIGEST_SHA256;

        #! AWS signature algorithm used; must match QoreDigest
        const AwsSignatureAlgorithm = "AWS4-HMAC-SHA256";

        #! Fixed termination string
        const AwsTermination = "aws4_request";
    }

    private:internal {
        # the AWS access key ID
        string aws_keyid;
        # the AWS secret access key
        string aws_secret;
        # the AWS region
        string aws_region;
        # the AWS service
        string aws_service;
        # is this request for AWS S3?
        bool aws_s3 = False;
        # temporary session token
        string aws_token;
        # credential scope suffix
        string credential_scope_suffix;
    }

    #! calls the base class HTTPClient constructor and optionally connects to the REST server
    constructor(TypeScriptAwsAppRestConnection conn, hash<auto> opts, *softbool do_not_connect)
            : TypeScriptAppRestClient(conn, opts, do_not_connect) {
        if (!opts.service.val()) {
            throw "AWS-REST-ARG-ERROR", sprintf("Missing required option \"service\" for AWS app %y",
                conn.getAppName());
        }
        aws_service = opts.service;
        aws_s3 = (opts.service == "s3");
        if (!opts.region.val()) {
            throw "AWS-REST-ARG-ERROR", sprintf("Missing required option \"region\" for AWS app %y",
                conn.getAppName());
        }
        aws_region = opts.region;
        if (!opts.access_key_id.val()) {
            throw "AWS-REST-ARG-ERROR", sprintf("Missing required option \"access_key_id\" for AWS app %y",
                conn.getAppName());
        }
        aws_keyid = opts.access_key_id;
        if (!opts.secret_access_key.val()) {
            throw "AWS-REST-ARG-ERROR", sprintf("Missing required option \"secret_access_key\" for AWS app %y",
                conn.getAppName());
        }
        aws_secret = opts.secret_access_key;

        # get credential scope suffix
        credential_scope_suffix = sprintf("%s/%s/%s", aws_region, aws_service, AwsTermination);
    }

    #! Signs requests before sending
    private signRequest(string method, *string path, *data body, reference<hash<auto>> hdr) {
        # get request time
        date gmtime = Qore::gmtime();
        # get credential scope
        string scope = sprintf("%s/%s", gmtime.format("YYYYMMDD"), credential_scope_suffix);

        # get signature and signed header string
        string signed_headers;

        # add configured headers without overriding
        hdr = headers + hdr;

        # ensure the request path is set correctly
        if (!path.val()) {
            path = getConnectionPath() ?* getDefaultPath() ?* "/";
        }

        # get signature
        string sig = getSignature(method, path, \hdr, body, gmtime, scope, \signed_headers);

        # add authorization header
        hdr.Authorization = sprintf("%s Credential=%s/%s, SignedHeaders=%s, Signature=%s", AwsSignatureAlgorithm,
            aws_keyid, scope, signed_headers, sig);

        debug("sending (signed) %y: path: %y body: %d bytes hdr: %y", method, path, body.size(), hdr);
    }

    string getSignature(string http_method, string path, reference<hash<auto>> hdr, *data body, date gmtime,
            string scope, reference<string> signed_headers) {
        string req_string = getRequestString(http_method, path, \hdr, body, gmtime, scope, \signed_headers);

        # calculate a signature
        string gmdate = gmtime.format("YYYYMMDD");
        # 1: key, date
        binary signing_key = hmac(QoreDigest, gmdate, "AWS4" + aws_secret);
        # 2: hash, region
        signing_key = hmac(QoreDigest, aws_region, signing_key);
        # 3: hash, service
        signing_key = hmac(QoreDigest, aws_service, signing_key);
        # 4: hash, termination
        signing_key = hmac(QoreDigest, AwsTermination, signing_key);

        string sig = hmac(QoreDigest, req_string, signing_key).toHex();

        return sig;
    }

    private string getRequestString(string http_method, string path, reference<hash<auto>> hdr, *data body,
            date gmtime, string scope, reference<string> signed_headers) {
        # get AWS date value
        string aws_date = gmtime.format("YYYYMMDDTHHmmSS") + "Z";
        hdr."X-Amz-Date" = aws_date;
        string csig = getCanonicalSignature(http_method, path, hdr, body, \signed_headers);

        string msg = AwsSignatureAlgorithm + "\n"
            + aws_date + "\n"
            + scope + "\n"
            + csig;

        return msg;
    }

    private string getCanonicalSignature(string http_method, string path, hash<auto> hdr, *data body,
            reference<string> signed_headers) {
        # create the canonical string
        # 1: HTTP request method
        string cstr = http_method + "\n";

        # make canonical URI
        hash<UriQueryInfo> uri_info = parse_uri_query(path);

        # 2: canonical URI parameter
        string uri = uri_info.method ?? "/";

        # normalize the path if not an S3 request
        if (!aws_s3) {
            uri = normalize_dir_unix(uri, "/");
        }

        # URI-encode the path
        uri = encode_url(uri, False);
        # non-AWS-S3 requests must be URI-encoded twice
        # https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
        if (!aws_s3) {
            uri = encode_url(uri, False);
        }
        # add to canonical string
        cstr += uri + "\n";

        # 3: canonical query string
        if (uri_info.params) {
            # process sorted query parameters in order
            cstr += (
                foldl $1 + "&" + $2, (
                    map
                        sprintf("%s=%s", encode_url($1, True),
                            uri_info.params{$1} === True ? "" : encode_url(uri_info.params{$1}, True)),
                        sort(keys uri_info.params)
                )
            );
        }
        cstr += "\n";

        # 4: canonical headers
        # convert header keys to lowercase
        hdr = map {$1.key.lwr(): $1.value}, hdr.pairIterator();
        # add host header
        hdr += {"host": getHostHeaderValue()};

        # sort headers
        hdr = map {$1: hdr{$1}}, sort(keys hdr);

        cstr += (
            foldl $1 + $2, (
                map
                    sprintf("%s:%s\n", $1, trimall(hdr.$1)),
                    sort(keys hdr)
            )
        ) + "\n";

        # 5: signed headers
        signed_headers = (foldl $1 + ";" + $2, keys hdr);
        cstr += signed_headers + "\n";

        # 6: digest
        cstr += digest(QoreDigest, body ?? "").toHex();
        #printf("CSTR:\n%s\n", cstr);
        return digest(QoreDigest, cstr).toHex();
    }

    static private:internal string trimall(string str) {
        # remove leading and trailing whitespace
        trim str;
        # collapse multiple spaces to a single space
        str =~ s/ +/ /g;
        return str;
    }
}

#! Base class for AWS app REST connections for apps provided by the TypeScript API
public class TypeScriptAwsAppRestConnection inherits TypeScriptAppRestConnection {
    public {
        #! Connection entry info
        const ConnectionScheme = <ConnectionSchemeInfo>{
            "options": TypeScriptAppRestConnection::ConnectionScheme.options - ("username", "password") + {
                "region": <ConnectionOptionInfo>{
                    "display_name": "AWS Region",
                    "short_desc": "The AWS region to use",
                    "type": "string",
                    "desc": "The AWS region to use",
                    "allowed_values": (
                        <AllowedValueInfo>{
                            "value": "us-east-1",
                        }, <AllowedValueInfo>{
                            "value": "us-east-2",
                        }, <AllowedValueInfo>{
                            "value": "us-west-1",
                        }, <AllowedValueInfo>{
                            "value": "us-west-2",
                        }, <AllowedValueInfo>{
                            "value": "ap-east-1",
                        }, <AllowedValueInfo>{
                            "value": "ap-south-1",
                        }, <AllowedValueInfo>{
                            "value": "ap-northeast-1",
                        }, <AllowedValueInfo>{
                            "value": "ap-northeast-2",
                        }, <AllowedValueInfo>{
                            "value": "ap-northeast-3",
                        }, <AllowedValueInfo>{
                            "value": "ap-southeast-1",
                        }, <AllowedValueInfo>{
                            "value": "ap-southeast-2",
                        }, <AllowedValueInfo>{
                            "value": "ca-central-1",
                        }, <AllowedValueInfo>{
                            "value": "eu-central-1",
                        }, <AllowedValueInfo>{
                            "value": "eu-west-1",
                        }, <AllowedValueInfo>{
                            "value": "eu-west-2",
                        }, <AllowedValueInfo>{
                            "value": "eu-west-3",
                        }, <AllowedValueInfo>{
                            "value": "eu-north-1",
                        }, <AllowedValueInfo>{
                            "value": "sa-east-1",
                        }
                    ),
                    "default_value": "us-east-1",
                    # for when new regions come online
                    "allowed_values_creatable": True,
                },
                "service": <ConnectionOptionInfo>{
                    "display_name": "AWS Service",
                    "short_desc": "The AWS service to use",
                    "type": "string",
                    "desc": "The AWS service to use",
                },
                "access_key_id": <ConnectionOptionInfo>{
                    "display_name": "AWS Access Key ID",
                    "short_desc": "The AWS Access Key ID",
                    "type": "string",
                    "desc": "This should be a severely restricted key that only has access to the specific resources "
                        "you want to use. We recommend you create a new user in the "
                        "(IAM console)[https://console.aws.amazon.com/iam/home#users]",
                    "sensitive": True,
                },
                "secret_access_key": <ConnectionOptionInfo>{
                    "display_name": "AWS Secret Access Key",
                    "short_desc": "The AWS Secret Access Key",
                    "type": "string",
                    "desc": "The AWS Secret Access Key",
                    "sensitive": True,
                },
            },
        } + (RestConnection::ConnectionScheme - "options");
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
            : TypeScriptAppRestConnection(name, description, url, attributes, options) {
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
    constructor(hash<auto> config, *hash<auto> attr) : TypeScriptAppRestConnection(config, attr) {
    }

    #! returns a @ref TypeScriptAwsAppRestClient object
    /** @param connect if @ref True "True", then the connection is returned already connected
        @param rtopts this connection type does not accept any runtime options, so this parameter is ignored

        @return a @ref TypeScriptAwsAppRestClient object
    */
    private TypeScriptAwsAppRestClient getImpl(bool connect = True, *hash<auto> rtopts) {
        return new TypeScriptAwsAppRestClient(self, getConnectionOptions(), !connect);
    }
}
}
