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

        #! Dynamic child data providers
        hash<string, DataProvider::AbstractDataProvider> childMap;
    }

    #! Creates the object
    constructor(string name) {
        self.name = name;
    }

    #! Copies the object
    copy() {
        if (*hash<string, DataProvider::AbstractDataProvider> cmap = remove childMap) {
            map childMap{$1.key} = $1.value.copy(), cmap.pairIterator();
        }
    }

    #! Sets the connection
    setConnection(TypeScriptAppRestConnection conn) {
        self.conn = conn;
        map $1.setConnection(conn), childMap.iterator();
        if (!getLogger() && (*LoggerInterface logger = conn.getLogger())) {
            setLogger(logger);
        }
    }

    #! Returns the data provider name
    string getName() {
        return name;
    }

    #! Register a new child data provider for Discord guilds
    registerChild(string pathname, DataProvider::AbstractDataProvider prov) {
        if (childMap{pathname}) {
            throw "TYPESCRIPT-CHILD-ERROR", sprintf("child %y already registered", pathname);
        }

        childMap{pathname} = prov;
    }

    #! Return data provider summary info
    *list<hash<DataProviderSummaryInfo>> getChildProviderSummaryInfo() {
        return map cast<hash<DataProviderSummaryInfo>>($1.getInfo(){DataProviderSummaryInfoKeys}),
            childMap.iterator();
    }

    #! Returns a list of child data provider names, if any
    /** @return a list of child data provider names, if any
    */
    private *list<string> getChildProviderNamesImpl() {
        return keys childMap;
    }

    #! Returns the given child provider or @ref nothing if the given child is unknown
    /** @return the given child provider or @ref nothing if the given child is unknown

        @see getChildProviderEx()
    */
    private *AbstractDataProvider getChildProviderImpl(string name) {
        if (*TypeScriptActionDataProviderBase prov = childMap{name}) {
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
        return rv;
    }
}
}