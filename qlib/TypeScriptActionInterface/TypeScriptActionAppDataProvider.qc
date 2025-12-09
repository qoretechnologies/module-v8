# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionAppDataProvider.qc Copyright 2024 Qore Technologies, s.r.o.

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
#! App data provider for TypeScript apps
class TypeScriptActionAppDataProvider inherits AbstractDataProvider {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "type": "TypeScriptActionAppDataProvider",
            "supports_children": True,
            "children_can_support_apis": True,
        };

        #! Provider summary info
        const ProviderSummaryInfo = cast<hash<DataProviderSummaryInfo>>(ProviderInfo{
            AbstractDataProvider::DataProviderSummaryInfoKeys
        });
    }

    private {
        #! The name of this app
        string name;

        #! connection for the action
        AbstractConnection conn;

        #! Dynamic child data providers; only maintained in the parent
        hash<string, TypeScriptActionDataProviderBase> childMap;

        #! Original data provider object
        TypeScriptActionAppDataProvider parent;

        #! The name of the root data provider class for chilren if this an extension of an existing app
        *StaticMethod registerChildMethod;

        #! For Google APIs
        GoogleApiParentDataProvider google_api_provider;

        #! Children can support records
        bool children_can_support_records = False;

        #! Children can support observers
        bool children_can_support_observers = False;

        #! For Google APIs
        static Class GoogleApiParentDataProviderClass = Class::forName("GoogleApiParentDataProvider");
    }

    #! Creates the object
    constructor(string name, *string root_data_provider) {
        self.name = name;
        if (root_data_provider) {
            registerChildMethod = Class::forName(root_data_provider).getStaticMethod("registerChild");
        }
    }

    #! Copies the object
    copy() {
        # the parent's childMap is the only one with data
        remove childMap;
    }

    TypeScriptActionAppDataProvider copyWithParent(TypeScriptActionAppDataProvider parent, RestConnection conn) {
        TypeScriptActionAppDataProvider rv = copy();
        rv.parent = parent;
        rv.setConnection(conn);
        return rv;
    }

    #! Sets the parent data provider
    setParent(TypeScriptActionAppDataProvider parent) {
        self.parent = parent;
    }

    #! Sets the connection
    setConnection(RestConnection conn) {
        self.conn = conn;
        if (!getLogger() && (*LoggerInterface clogger = conn.getLogger())) {
            setLogger(clogger);
        }
    }

    #! Retrieves the current connection
    *RestConnection getConnection() {
        return conn;
    }

    #! Returns the data provider name
    string getName() {
        return name;
    }

    #! Register a new child (action) data provider
    registerChild(string pathname, DataProvider::AbstractDataProvider prov) {
        if (childMap{pathname}) {
            throw "TYPESCRIPT-CHILD-ERROR", sprintf("child %y already registered", pathname);
        }
        if (!(prov instanceof TypeScriptActionDataProviderBase)) {
            throw "TYPESCRIPT-CHILD-ERROR", sprintf("Child must be an instance of "
                "\"TypeScriptActionDataProviderBase\"; class provider: %y", prov.className());
        }

        childMap{pathname} = prov;

        # add children to the root data provider
        if (registerChildMethod) {
            registerChildMethod.call(pathname, AbstractDataProvider sub (string name, RestConnection conn) {
                TypeScriptActionDataProviderBase prov = childMap{name}.copy();
                prov.setConnection(conn);
                if (!prov.getLogger() && logger) {
                    prov.setLogger(logger);
                }
                return prov;
            });
        }
    }

    #! Deregister child data provider
    *AbstractDataProvider deregisterChild(string child) {
        return remove childMap{child};
    }

    #! Return data provider summary info
    *list<hash<DataProviderSummaryInfo>> getChildProviderSummaryInfo() {
        TypeScriptActionInterface::checkAppActions(name);
        *hash<string, DataProvider::AbstractDataProvider> childMap = self.childMap ?? parent.childMap;
        *RestConnection conn_save = _thread_conn;
        _thread_conn = conn;
        on_exit _thread_conn = conn_save;
        *list<hash<DataProviderSummaryInfo>> rv =
            map cast<hash<DataProviderSummaryInfo>>($1.getInfo(){DataProviderSummaryInfoKeys}), childMap.iterator();
        if (google_api_provider && (*list<hash<DataProviderSummaryInfo>> l =
            google_api_provider.getChildProviderSummaryInfo())) {
            rv += l;
        }
        return rv;
    }

    #! Register actions for the given Google app
    registerGoogleAppActions(string app, hash<GoogleAppInfo> google_app) {
        if (google_api_provider) {
            throw "TYPESCRIPT-CHILD-ERROR", sprintf("Google API provider %y already registered",
                google_api_provider.getDesc());
        }
        list<auto> args += (google_app.api, google_app.resource, google_app.path_args, google_app.path_prefix);
        if (google_app.subpaths) {
            args += google_app.subpaths;
        }
        google_api_provider = GoogleApiParentDataProviderClass.newObjectArgs(args);

        # set a dummy REST client
        google_api_provider.setRestClient(new RestClient({"url": "https://www.googleapis.com"}));

        # register actions
        registerActions(app, google_api_provider);
    }

    private registerActions(string app, GoogleApiParentDataProvider provider, *string parent_path) {
        foreach string child in (provider.getChildProviderNames()) {
            AbstractDataProvider p = provider.getChildProvider(child);
            hash<DataProviderInfo> info = p.getInfo();
            string path = parent_path ? parent_path + "/" + child : child;
            if (info.supports_request) {
                if (!children_can_support_observers
                    && (info.supports_observable || info.children_can_support_observers)) {
                    children_can_support_observers = True;
                }
                if (!children_can_support_records
                    && (info.has_record || info.children_can_support_records)) {
                    children_can_support_records = True;
                }
                string name = parent_path ? parent_path + "-" + child : child;
                hash<string, hash<ActionOptionInfo>> options;
                if ((*AbstractDataProviderType rt = p.getRequestType()) && (*hash<string, AbstractDataField> fields =
                    rt.getFields())) {
                    foreach AbstractDataField field in (fields.iterator()) {
                        AbstractDataProviderType ft = field.getType();
                        hash<ActionOptionInfo> opt = <ActionOptionInfo>{
                            "type": ft,
                            "desc": field.getDescription(),
                            "short_desc": field.getShortDescription(),
                            "required": ft.isMandatory(),
                            "default_value": field.getDefaultValue(),
                            "allowed_values": field.getAllowedValues(),
                            "element_allowed_values": field.getElementAllowedValues(),
                            "example_value": field.getExampleValue(),
                        };
                        map remove opt{$1.key}, opt.pairIterator(), !exists $1.value;
                        if (opt.allowed_values && field.getAllowedValuesCreatable()) {
                            opt.allowed_values_creatable = True;
                        }
                        if (opt.element_allowed_values && field.getElementAllowedValuesCreatable()) {
                            opt.element_allowed_values_creatable = True;
                        }
                        options{field.getName()} = opt;
                    }
                }
                hash<DataProviderActionInfo> action = <DataProviderActionInfo>{
                    "app": app,
                    "action": name,
                    "path": path,
                    "display_name": AbstractDataField::getDisplayName(info.name),
                    "short_desc": AbstractDataField::getShortDescription(info.desc),
                    "desc": info.desc,
                    "action_code": DPAT_API,
                    "options": options,
                };
                DataProviderActionCatalog::registerAction(action);
            }
            if (info.supports_children) {
                registerActions(app, p, path);
            }
        }
    }

    #! Returns a list of child data provider names, if any
    /** @return a list of child data provider names, if any
    */
    private *list<string> getChildProviderNamesImpl() {
        TypeScriptActionInterface::checkAppActions(name);
        *hash<string, DataProvider::AbstractDataProvider> childMap = self.childMap ?? parent.childMap;
        *list<string> rv = keys childMap;
        if (google_api_provider && (*list<string> l = google_api_provider.getChildProviderNames())) {
            rv += l;
        }
        return rv;
    }

    #! Returns the given child provider or @ref nothing if the given child is unknown
    /** @return the given child provider or @ref nothing if the given child is unknown

        @see getChildProviderEx()
    */
    private *AbstractDataProvider getChildProviderImpl(string name) {
        TypeScriptActionInterface::checkAppActions(self.name);
        *hash<string, DataProvider::AbstractDataProvider> childMap = self.childMap ?? parent.childMap;
        if (*TypeScriptActionDataProviderBase prov = childMap{name}) {
            if (!self.childMap) {
                prov = prov.copy();
                prov.setConnection(conn);
            }
            if (!prov.getLogger() && logger) {
                prov.setLogger(logger);
            }
            return prov;
        }
        if (google_api_provider && (*AbstractDataProvider p = google_api_provider.getChildProvider(name))
            && (p instanceof GoogleDataProviderBase)) {
            p = p.copy();
            if (!p.getLogger() && logger) {
                p.setLogger(logger);
            }
            cast<GoogleDataProviderBase>(p).setRestClient(conn.get());
            return p;
        }
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        hash<DataProviderInfo> rv = ProviderInfo;
        if (children_can_support_observers || TypeScriptActionInterface::appSupportsEvents(name)) {
            rv.children_can_support_observers = True;
        }
        if (children_can_support_records || TypeScriptActionInterface::appSupportsRecords(name)) {
            rv.children_can_support_records = True;
        }
        return rv;
    }
}
}

namespace Priv {
thread_local *RestConnection _thread_conn;
}