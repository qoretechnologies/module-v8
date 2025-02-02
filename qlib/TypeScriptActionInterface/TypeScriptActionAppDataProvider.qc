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
        return map cast<hash<DataProviderSummaryInfo>>($1.getInfo(){DataProviderSummaryInfoKeys}),
            childMap.iterator();
    }

    #! Returns a list of child data provider names, if any
    /** @return a list of child data provider names, if any
    */
    private *list<string> getChildProviderNamesImpl() {
        TypeScriptActionInterface::checkAppActions(name);
        *hash<string, DataProvider::AbstractDataProvider> childMap = self.childMap ?? parent.childMap;
        return keys childMap;
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
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        hash<DataProviderInfo> rv = ProviderInfo;
        if (TypeScriptActionInterface::appSupportsEvents(name)) {
            rv.children_can_support_observers = True;
        }
        if (TypeScriptActionInterface::appSupportsRecords(name)) {
            rv.children_can_support_records = True;
        }
        return rv;
    }
}
}