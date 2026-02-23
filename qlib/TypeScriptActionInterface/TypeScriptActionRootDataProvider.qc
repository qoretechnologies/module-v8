# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptActionRootDataProvider.qc Copyright 2024 - 2026 Qore Technologies, s.r.o.

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
#! Root data provider for TypeScript apps
class TypeScriptActionRootDataProvider inherits AbstractDataProvider {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "name": Root,
            "type": "TypeScriptActionRootDataProvider",
            "supports_children": True,
            "children_can_support_apis": True,
            "children_can_support_observers": True,
            #"children_can_support_records": True,
        };

        #! Provider summary info
        const ProviderSummaryInfo = cast<hash<DataProviderSummaryInfo>>(ProviderInfo{
            AbstractDataProvider::DataProviderSummaryInfoKeys
        });

        #! Root of the typescript action data providers
        const Root = "ts-root";
    }

    private {
        #! Dynamic child data providers
        static hash<string, TypeScriptActionAppDataProvider> childMap;
    }

    #! Creates the data provider
    constructor(*hash<auto> options) {
        checkOptions("CONSTRUCTOR-ERROR", NOTHING, options);
    }

    #! Returns the data provider name
    string getName() {
        return Root;
    }

    #! Register a new child data provider
    registerChild(string pathname, TypeScriptActionAppDataProvider prov) {
        if (childMap{pathname}) {
            throw "TYPESCRIPT-CHILD-ERROR", sprintf("child %y already registered", pathname);
        }
        childMap{pathname} = prov;
    }

    #! Deregister a child data provider
    deregisterChild(string pathname) {
        remove childMap{pathname};
    }

    #! Return data provider summary info
    *list<hash<DataProviderSummaryInfo>> getChildProviderSummaryInfo() {
        # Return info from already-initialized apps
        *list<hash<DataProviderSummaryInfo>> rv =
            map cast<hash<DataProviderSummaryInfo>>($1.getInfo(){DataProviderSummaryInfoKeys}),
                childMap.iterator();
        # Also return summary info for pending (not-yet-initialized) apps from metadata
        rv += TypeScriptActionInterface::getPendingAppSummaryInfo();
        return rv;
    }

    #! Returns a list of child data provider names, if any
    /** @return a list of child data provider names, if any
    */
    private *list<string> getChildProviderNamesImpl() {
        *list<string> rv = keys childMap;
        rv += TypeScriptActionInterface::getPendingApps();
        return rv;
    }

    #! Returns the given child provider or @ref nothing if the given child is unknown
    /** @return the given child provider or @ref nothing if the given child is unknown

        @see getChildProviderEx()
    */
    private *TypeScriptActionAppDataProvider getChildProviderImpl(string name) {
        TypeScriptActionInterface::initApp(name);
        return childMap{name};
    }

    #! Returns data provider static info
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}