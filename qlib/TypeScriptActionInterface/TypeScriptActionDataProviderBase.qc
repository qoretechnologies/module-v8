# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionDataProviderBase.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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

#! Main module namespace
public namespace TypeScriptActionInterface {
#! Data provider data context info
public hashdecl DataContextInfo {
    #! Connection name
    *string conn_name;

    #! Connection option info
    *hash<auto> conn_opts;

    #! Action options with known values
    *hash<auto> opts;

    #! User-defined information
    *hash<auto> info;
}

#! Base class for TypeScript action data provider classes
public class TypeScriptActionDataProviderBase inherits AbstractDataProvider, ActionFunctionContext {
    private {
        #! The name of the data provider
        string name;

        #! The connection for the action
        RestConnection conn;

        #! Any REST client to use for reference data, for example
        RestClient rest;

        #! type cache for dependent options; opt val key -> type
        hash<string, AbstractDataProviderType> dtcache;

        #! Data cache for retrieving allowed values
        static TypeScriptDataCache cache();
    }

    #! Creates the object from the arguments
    constructor(string name, string app) : ActionFunctionContext(app) {
        self.name = name;
    }

    #! Creates the object from the arguments
    constructor(RestConnection conn, string name) : ActionFunctionContext(conn.getAppName()) {
        self.name = name;
        self.conn = conn;
    }

    #! Creates the object from the arguments
    constructor(string name, ActionFunctionContext fctx) : ActionFunctionContext(fctx) {
        self.name = name;
    }

    #! Sets the connection
    setConnection(RestConnection conn) {
        self.conn = conn;
        if (!logger && (*LoggerInterface clogger = conn.getLogger())) {
            setLogger(clogger);
        }
    }

    #! Retrieves the current connection
    *RestConnection getConnection() {
        return conn;
    }

    #! Returns the logger interface for logging
    *LoggerInterface getLogger() {
        return logger;
    }

    #! Returns the data provider name
    string getName() {
        return name;
    }

    #! Returns information on supported reference data
    /** @return a hash of supported reference data; keys in the hash returned are supported in calls to
        @ref getReferenceData()
    */
    *hash<string, bool> getSupportedReferenceData() {
        return map {$1: True}, keys (omap + romap);
    }

    #! Returns information on supported reference data values
    /** @return a hash of supported reference data values; keys in the hash returned are supported in calls to
        @ref getReferenceDataValues()
    */
    *hash<string, bool> getSupportedReferenceDataValues() {
        return map {$1: True}, keys dvmap;
    }

    auto getAsyncValue(hash<AsyncCallInfo> api, ...) {
        return getAsyncValueArgs(self, api, argv);
    }

    auto getAsyncValueWithCache(hash<AsyncCallInfo> api, *hash<auto> cache_opts, ...) {
        return getAsyncValueArgs(self, api, argv, cache_opts + {
            "conn_opts": conn.getRealOptions(),
        }, True);
    }

    static auto getAsyncValueArgs(*LoggerInterface logger = DataProvider::getGlobalLogger(), hash<AsyncCallInfo> api,
            *softlist<auto> args, *hash<auto> cache_opts, *bool use_cache) {
        on_error rethrow $1.err, sprintf("%s (context: %s)", $1.desc, api.label);

        if (!cache_opts && !use_cache) {
            return TypeScriptActionDataProviderBase::getAsyncValueArgsIntern(logger, api, args);
        }

        string key = TypeScriptActionDataProviderBase::getKey(api.label, cache_opts);

        bool new_entry;
        CacheEntry entry = cache.get(key, \new_entry);
        if (new_entry) {
            on_error entry.cancel($1);
            entry.setValue(TypeScriptActionDataProviderBase::getAsyncValueArgsIntern(logger, api, args));
        }
        return entry.getValue();
    }

    static private string getKey(string label, *hash<auto> cache_opts) {
        string key = label;
        if (cache_opts) {
            key += sprintf("-%s", TypeScriptActionDataProviderBase::getKeyValue(cache_opts));
        }
        return key.toSHA512();
    }

    static string getKeyValue(auto arg) {
        switch (arg.typeCode()) {
            case NT_STRING:
                return sprintf("(%s):%y", arg.fullType(), arg.toSHA512());
            case NT_INT:
            case NT_FLOAT:
            case NT_NUMBER:
            case NT_DATE:
            case NT_BOOLEAN:
                return sprintf("(%s):%y", arg.fullType(), arg.toString().toSHA512());
            case NT_BINARY:
                return sprintf("(%s):%y", arg.fullType(), arg.toSHA512());
            case NT_CALLREF:
            case NT_CLOSURE:
            case NT_OBJECT:
                return sprintf("%s", arg.uniqueHash());
            case NT_LIST:
                return sprintf("[%s]", (foldl $1 + "," + $2, (
                    map TypeScriptActionDataProviderBase::getKeyValue($1), arg
                )));
            case NT_HASH:
                return sprintf("(%s):{%s}", arg.fullType(), (foldl $1 + "," + $2, (
                    map sprintf("%s: %s", $1.key, TypeScriptActionDataProviderBase::getKeyValue($1.value)),
                        arg.pairIterator()
                )));
            case NT_NOTHING:
                return "N";
            case NT_NULL:
                return "n";
        }
        throw "ARG-ERROR", sprintf("Cannot calculate key value for type %y", arg.fullType());
    }

    static private auto getAsyncValueArgsIntern(*LoggerInterface logger, hash<AsyncCallInfo> api,
            *softlist<auto> args) {
        if (no_io) {
            return;
        }
        date start = now_us();
        on_exit TSAI::debug("perf: %y get async value: %y", api.label, now_us() - start);
        on_error TSAI::error("%s", get_exception_string($1));

        # handle the call with a remote process
        if (TSAI::checkServer()) {
            TSAI::info("%y: acquiring proxy for %y: %y", api.label, api.key, args);
            JavaScriptProgramProxy proxy = TypeScriptActionInterface::server.get();
            TSAI::info("%y: proxy acquired for %y", api.label, api.key);
            on_exit TypeScriptActionInterface::server.release(proxy);
            return proxy.getAsyncValue(api, args);
        }

        auto v;
        try {
            v = call_function_args(api.async_call, args);
        } catch (hash<ExceptionInfo> ex) {
            TSAI::error("%y: error making async JavaScript request: %s", api.label, get_exception_string(ex));
            rethrow;
        }
        auto rv;
        auto err;
        string errloc;
        if (v instanceof JavaScriptPromise) {
            JavaScriptProgram js = v.getProgram();
            code run = js.getGlobal().runWithTimeout.toData();
            int ms = api.to.durationMilliseconds();
            TSAI::debug("%y: running Promise with async timeout: %dms", api.label, ms);
            v = run(v, ms);
            Queue q();
            code push_val = sub (string w, auto v) {
                if (v.name && v.message && v.stack) {
                    q.push({
                        "where": w,
                        "err": {
                            'name': v.name,
                            'message': v.message,
                            'stack': v.stack,
                            'errstr': v.toString(),
                            'err': v,
                        },
                    });
                } else {
                    q.push({
                        "where": w,
                        "val": v,
                    });
                }
            };
            # wait for any I/O in the background in case it did not complete
            on_exit js.spinOnce();

            try {
                v = v.then(sub (auto val) {
                    push_val("then", val);
                }, sub (auto e) {
                    push_val("rejected", e);
                }).doCatch(sub (auto e) {
                    push_val("exception caught", e);
                });
                # wait for the IO in the background - this will only complete when the I/O is complete
                background sub () {
                    v.wait();
                }();
                TSAI::debug("Waiting for result");
                # this will return a value as soon as the first value is ready
                rv = q.get();
                if (rv."where" == "then") {
                    rv = rv.val;
                } else {
                    errloc = rv."where";
                    err = rv.err;
                    TSAI::debug("Async error result: %y", rv);
                }
            } catch (hash<ExceptionInfo> ex) {
                TSAI::error("Error waiting for async JavaScript request %y: %s", api.label, get_exception_string(ex));
                rethrow;
            }

            if (exists err) {
                string desc;
                hash<auto> arg;
                TypeScriptActionDataProviderBase::processError(\desc, \arg, errloc, err);
                TSAI::error("JAVASCRIPT-ASYNC-ERROR: Async JavaScript request returned an error %y: %s (%y)",
                    api.label, desc, arg);
                throw "JAVASCRIPT-ASYNC-ERROR", desc, arg;
            }
        } else {
            rv = v;
        }

        if (rv instanceof JavaScriptObject) {
            rv = rv.toData();
        } else if (rv.typeCode() == NT_LIST && (rv[0] instanceof JavaScriptObject)) {
            rv = map $1.toData(), rv;
        }

        TSAI::debug("Async result: %y", rv);

        if (!exists err && api.post_processing) {
            try {
                api.post_processing(logger, api, args, \rv);
                TSAI::debug("Post-processed async result: %y", rv);
            } catch (hash<ExceptionInfo> ex) {
                TSAI::error("Error post processing call result %y: %s", api.label, get_exception_string(ex));
                rethrow;
            }
        }

        return rv;
    }

    static processError(reference<string> desc, reference<hash<auto>> arg, *string errloc, auto err) {
        *string name;
        *string message;
        *string errstr;
        *string stack;
        if (err.typeCode() == NT_HASH && err.size() == 5 && err.name && err.message && err.stack && err.errstr
            && err.err) {
            name = err.name;
            message = err.message;
            stack = err.stack;
            errstr = err.errstr;
            err = err.err;
            if (err instanceof JavaScriptObject) {
                err = err.toData();
            }
        }
        else if (err instanceof JavaScriptObject) {
            name = err.name;
            message = err.message;
            stack = err.stack;
            errstr = err.toString();
            err = err.toData();
        } else if (err.typeCode() == NT_LIST && (err[0] instanceof JavaScriptObject)) {
            err = map $1.toData(), err;
        }

        if (exists stack) {
            stack =~ s/\n+/\n/g;
        }

        # strip non-serializable data from err
        err = TypeScriptActionEventDataProviderBase::stripNonSerializableData(err);

        if (err._err{"message", "name", "code"}.size() == 3) {
            desc = sprintf("Error in async request: %s: %s: ", err._err.name, err._err."code");
            if (err._err.response{"status", "statusText"}.size() == 2) {
                desc += sprintf("%s %s: ", err._err.response.status, err._err.response.statusText);
            }
            if (err._err.response."data".error_summary.val()) {
                desc += sprintf("%y: ", err._err.response."data".error_summary);
            }
            desc += err._err.message;
            if (exists stack) {
                desc += sprintf(" detail: %s", stack);
            }
            if (err._err{"config", "response"}.size() == 2) {
                arg = err._err{"config", "response"};
            } else {
                arg = err;
            }
            return;
        }
        if (err.response{"status", "statusText", "headers", "data"}.size() == 4) {
            if (errstr.val()) {
                desc = sprintf("Error in async request: %s: %y", errstr, err.response."data");
            } else {
                desc = sprintf("Error in async request: %d %s: %y", err.response.status, err.response.statusText,
                    err.response."data");
            }
            if (exists stack) {
                desc += sprintf(" detail: %s", stack);
            }
            return;
        }
        if (!err && !errstr) {
            err = sprintf("No JavaScript exception information available: %y (from: %s)", err, errloc);
        }
        desc = "Error in async request";
        if (exists errloc) {
            desc += sprintf(" (promise %s)", errloc);
        }
        if (exists stack) {
            desc += sprintf(" detail: %s", stack);
        } else if (exists errstr) {
            desc += sprintf(" detail: %s", errstr);
        } else if (exists name) {
            desc += sprintf(" %s", name);
        }
    }

    static auto stripNonSerializableData(auto v) {
        switch (v.typeCode()) {
            case NT_HASH:
                v = map {$1.key: TypeScriptActionEventDataProviderBase::stripNonSerializableData($1.value)},
                    v.pairIterator();
                break;

            case NT_LIST:
                v = map TypeScriptActionEventDataProviderBase::stripNonSerializableData($1), v;
                break;

            case NT_STRING:
            case NT_INT:
            case NT_BOOLEAN:
            case NT_FLOAT:
            case NT_NUMBER:
            case NT_DATE:
            case NT_BINARY:
            case NT_NOTHING:
            case NT_NULL:
                break;

            case NT_OBJECT:
                if (v instanceof JavaScriptObject) {
                    return v.toData();
                }
                # fall down to next case

            default:
                remove v;
                break;
        }
        return v;
    }

    #! Returns call context info
    *hash<DataContextInfo> getCallContextInfo(*hash<auto> action_opts) {
        if (conn) {
            return <DataContextInfo>{
                "conn_name": conn.name,
                "conn_opts": conn.getRealOptions(),
                "opts": action_opts,
            };
        } else if (action_opts) {
            return <DataContextInfo>{
                "opts": action_opts,
            };
        }
    }

    #! Returns a key to the dependent type cache for the request type
    private static *string getCacheKey(list<string> skeys, hash<auto> req) {
        string ckey;
        foreach string key in (skeys) {
            auto val = req{key};
            if (!val.strp()) {
                return;
            }
            if (exists ckey) {
                ckey += "|";
            }
            ckey += val.toString();
        }
        return (foldl $1 + "|" + $2, skeys) + "=" + ckey;
    }

    #! Returns a data type for the given base type and request / option data
    private AbstractDataProviderType getDynamicDataType(string cmd, AbstractDataProviderType rt, hash<auto> req) {
        *hash<auto> slice = dmap{keys req};
        if (!slice) {
            return rt;
        }
        # cache key (opt[|opt...]=val[|val])
        *string ckey = getCacheKey(keys slice, req);
        if (exists ckey) {
            if (*AbstractDataProviderType rv = dtcache{ckey}) {
                return rv;
            }
        }

        *HashDataType type;
        if (TSAI::checkServer()) {
            TSAI::debug("Starting proxy for app %y action %y: request type with args: %y", app, action, req);
            JavaScriptProgramProxy proxy = TypeScriptActionInterface::server.get();
            TSAI::debug("Proxy started for app %y action %y: request type with args", app, action);
            on_exit TypeScriptActionInterface::server.release(proxy);
            type = proxy.getDynamicType(cmd, app, action, conn.name, conn.getRealOptions(), req);
        } else {
            type = getDynamicTypeIntern(rt, slice, req);
        }
        if (exists ckey) {
            return dtcache{ckey} = type ?? rt;
        }
        return type ?? rt;
    }

    private *HashDataType getDynamicTypeIntern(AbstractDataProviderType rt, hash<auto> slice, hash<auto> req) {
        HashDataType type;
        foreach hash<auto> i in (slice.pairIterator()) {
            auto val = req{i.key};
            debug("Retrieving options dependent on option %y, value %y for data provider %y type %y", i.key, val,
                getName(), type);
            auto res = getAsyncValueWithCache(i.value, req, getCallContextInfo(req));
            if (!exists res) {
                continue;
            }
            if (res.typeCode() != NT_HASH) {
                throw "DATA-PROVIDER-DYNAMIC-TYPE-ERROR", sprintf("JavaScript 'get_dependent_options()' function "
                    "returned type %y; expecting \"hash\"", res.fullType());
            }
            if (!type) {
                type = cast<HashDataType>(rt.copy());
            }
            map type.addField(TypeScriptActionInterface::getField("dynamic-type", $1.key, $1.value, self, True)),
                res.pairIterator();
        }
        return type;
    }

    #! Returns reference data of the given kind if available
    /** @param type the unique type name of the reference data
        @param action_opts an optional hash of action options when called when working with an app action

        @return a list of allowed values for this data
    */
    private *list<hash<AllowedValueInfo>> getReferenceDataImpl(string type, *hash<auto> action_opts) {
        return getReferenceDataIntern(omap, romap, type, action_opts);
    }

    #! Returns element reference data of the given kind if available
    /** @param type the unique type name of the reference data
        @param action_opts an optional hash of action options when called when working with an app action

        @return a list of allowed element values for this data
    */
    private *list<hash<AllowedValueInfo>> getElementReferenceDataImpl(string type, *hash<auto> action_opts) {
        return getReferenceDataIntern(eomap, reomap, type, action_opts, "element ");
    }

    #! Returns allowed value data of the given kind if available
    private *list<hash<AllowedValueInfo>> getReferenceDataIntern(*hash<string, hash<AsyncCallInfo>> omap,
            *hash<string, hash<RestGetAllowedValuesInfo>> reomap, string type, *hash<auto> action_opts,
            *string rtype) {
        if (((*hash<auto> deps = depmap{type})
            && (action_opts{keys deps}.size() != deps.size()))) {
            return;
        }

        if (*hash<AsyncCallInfo> ref_api = omap{type}) {
            *hash<DataContextInfo> arg = getCallContextInfo(action_opts);
            debug("Retrieving %sreference data with JS for data provider %y type %y arg: %y (deps: %y)", rtype,
                getName(), type, arg, depmap);
            *softlist<auto> l = getAsyncValueWithCache(ref_api, action_opts, arg);
            debug("Got %sreference data for data provider %y type %y: %y", rtype, getName(), type, l);
            if (!l) {
                return ();
            }
            if (l[0] instanceof JavaScriptObject) {
                l = map $1.toData(), l;
            }
            if (l[0].typeCode() != NT_HASH) {
                return map <AllowedValueInfo>{
                    "display_name": $1.toString(),
                    "short_desc": $1.toString(),
                    "desc": $1.toString(),
                    "value": $1,
                }, l;
            }
            # ensure "desc" is set
            foreach hash<auto> h in (\l) {
                if (!h.desc.val()) {
                    h.desc = h.short_desc.val() ? h.short_desc : (h.display_name ?? h.value.toString());
                }
            }
            on_error rethrow $1.err, sprintf("%s (l: %y)", $1.desc, l);
            return map cast<hash<AllowedValueInfo>>($1), l;
        } else if (*hash<RestGetAllowedValuesInfo> ref_rest = romap{type}) {
            if (!rest) {
                checkRestClient(action_opts);
            }
            string path = ref_rest.path;
            if (action_opts) {
                map path = replace(path, "{" + $1.key + "}", $1.value), action_opts.pairIterator(),
                    $1.value.typeCode() == NT_STRING;
            }

            string key = TypeScriptActionDataProviderBase::getKey("rest-" + type, action_opts);

            bool new_entry;
            CacheEntry entry = cache.get(key, \new_entry);
            if (new_entry) {
                on_error entry.cancel($1);

                hash<auto> info;
                debug("Retrieving %sreference data with REST for data provider %y type %y: %s %s", rtype, getName(),
                    type, ref_rest.method, path);
                on_error rethrow $1.err, sprintf("%s: info: %y", $1.desc, info{"request-uri", "response-uri"});
                entry.setValue(rest.doRequest(ref_rest.method, path, ref_rest.body, \info, NOTHING,
                    ref_rest.headers));
            }
            hash<auto> resp = entry.getValue();

            debug("Got %sreference data with REST for data provider %y type %y: %y", rtype, getName(), type,
                resp);
            *softlist<hash<AllowedValueInfo>> rv = getAllowedValues(resp, ref_rest.values.split(".")) ?? ();
            if (rv && ref_rest.display_names.val()) {
                getAttributes("display_name", type, resp, ref_rest.display_names.split("."), \rv);
            }
            if (rv && ref_rest.descriptions.val()) {
                getAttributes("desc", type, resp, ref_rest.descriptions.split("."), \rv);
            }
            if (rv && ref_rest.short_descs.val()) {
                getAttributes("short_desc", type, resp, ref_rest.short_descs.split("."), \rv);
            }
            debug("Got %sreference data with REST for data provider %y type %y allowed values: %y", rtype, getName(),
                type, rv);
            return rv;
        }
    }

    #! Returns a reference data value of the given kind if available
    /** @param type the unique type name of the reference data
        @param action_opts an optional hash of action options when called when working with an app action

        @return the value of the reference data
    */
    private auto getReferenceDataValueImpl(string type, *hash<auto> action_opts) {
        if (((*hash<auto> deps = depmap{type})
            && (action_opts{keys deps}.size() != deps.size()))) {
            return;
        }

        if (*hash<AsyncCallInfo> ref_api = dvmap{type}) {
            *hash<DataContextInfo> arg = getCallContextInfo(action_opts);
            debug("Retrieving a reference data value with JS for data provider %y type %y arg: %y (deps: %y)",
                getName(), type, arg, depmap);
            auto rv = getAsyncValueWithCache(ref_api, action_opts, arg);
            debug("Reference data value for data provider %y type %y: %y", getName(), type, rv);
            if (rv.typeCode() == NT_LIST && (rv[0] instanceof JavaScriptObject)) {
                rv = map $1.toData(), rv;
            }
            return rv;
        }
    }

    #! Returns allowed values info from the given location in a hash
    static private *softlist<hash<AllowedValueInfo>> getAllowedValues(auto v, list<string> kl) {
        string k = shift kl;
        auto v0 = v{k};
        if (!exists v0) {
            return;
        }
        if (!kl) {
            return map cast<hash<AllowedValueInfo>>({
                "display_name": $1,
                "value": $1,
            }), v0;
        }
        return foldl $1 + $2, (map TypeScriptActionDataProviderBase::getAllowedValues($1, kl), v0);
    }

    #! Adds attributes to allowed values
    private getAttributes(string attr, string type, auto v, list<string> attrl, reference<list<hash<AllowedValueInfo>>> rv) {
        if (*list<string> l = getAttributeIntern(attr, type, v, attrl)) {
            if (l.size() != rv.size()) {
                throw "REST-ALLOWED-VALUES-ERROR", sprintf("Data provider %y type %y returned %d %s%s "
                    "for %d value%s", getName(), type, l.size(), attr, l.size() == 1 ? "" : "s",
                    rv.size(), rv.size() == 1 ? "" : "s");
            }

            # check for duplicates
            bool dup;
            {
                hash<string, bool> m;
                foreach string attrstr in (l) {
                    if (m{attrstr}) {
                        dup = True;
                        break;
                    }
                    m{attrstr} = True;
                }
            }
            foreach hash<AllowedValueInfo> info in (\rv) {
                info{attr} = dup
                    ? sprintf("%s-%s", l[$#], info.value)
                    : l[$#];
            }
        }
    }

    #! Adds display names to allowed values
    private *list<string> getAttributeIntern(string attr, string type, auto v, list<string> attrl) {
        string k = shift attrl;
        auto v0 = v{k};
        if (!exists v0) {
            return;
        }
        if (!attrl) {
            list<string> rv;
            foreach auto attrstr in (v0) {
                if (!attrstr.strp()) {
                    throw "REST-ALLOWED-VALUES-ERROR", sprintf("Data provider %y type %y %s has type %y (%y) that "
                        "cannot be converted to a string", getName(), type, attr, attrstr.fullType(), attrstr);
                }
                rv += attrstr.toString();
            }
            return rv;
        }
        return foldl $1 + $2, (map TypeScriptActionDataProviderBase::getAttributeIntern(attr, type, $1, attrl), v0);
    }

    #! Check and assign REST client
    private synchronized checkRestClient(*hash<auto> action_opts) {
        if (!rest) {
            rest = conn.get();
        }
        # get connection update options
        if (action_opts) {
            checkUpdateRestOptions(rest, action_opts);
        }
    }

    private checkUpdateRestOptions(RestClient rest, hash<auto> action_opts) {
        if ((*hash<auto> cuo = TypeScriptActionInterface::getConnectionUpdateOptions(conn.getAppName()))
            && (exists (auto v = action_opts{cuo.option}))) {
            *hash<DataContextInfo> arg = getCallContextInfo(action_opts);
            debug("Retrieving connection update data with JS for data provider %y option: %s = %y arg: %y",
                getName(), cuo.option, v, arg);
            *string new_url = getAsyncValue(cuo."code", arg);
            debug("Connection update data with JS for data provider %y new URL: %y", getName(), new_url);
            if (exists new_url) {
                string url = rest.getURL();
                if (url != new_url) {
                    debug("Connection update data with JS for data provider %y new URL: %y", getName(), new_url);
                    rest.setURL(new_url);
                }
            }
        }
    }
}
}

namespace Priv {
thread_local *bool no_io;
class NoIoHelper {
    private {
        *bool old_no_io;
    }

    constructor() {
        old_no_io = no_io;
        no_io = True;
    }

    destructor() {
        no_io = old_no_io;
    }
}
}