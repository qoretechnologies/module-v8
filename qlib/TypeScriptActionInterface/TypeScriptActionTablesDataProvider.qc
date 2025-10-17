# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionTablesDataProvider.qc Copyright (C) 2023 - 2025 Qore Technologies s.r.o.

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
public class TypeScriptActionTablesDataProvider inherits TypeScriptActionRecordBasedDataProvider {
    public {
        #! Provider info
        const ProviderInfo = TypeScriptActionRecordBasedDataProvider::ProviderInfo + <DataProviderInfo>{
            "name": "tables",
            "type": "TypeScriptActionTablesDataProvider",
            "supports_children": True,
            "children_can_support_records": True,
            "children_can_support_transactions": True,
            "children_identical": True,
        };
    }

    #! Creates the object from the arguments
    constructor(ActionFunctionContext fctx) : TypeScriptActionRecordBasedDataProvider("tables", fctx) {
    }

    #! Return data provider summary info
    *list<hash<DataProviderSummaryInfo>> getChildProviderSummaryInfo() {
        return map cast<hash<DataProviderSummaryInfo>>(
            TypeScriptActionRecordBasedDataProvider::ProviderInfo{DataProviderSummaryInfoKeys}
                + {
                "name": $1,
                "desc": sprintf("Record-based data provider for app `%s` table `%s`", app.name, $1),
                "type": "TypeScriptActionTableDataProvider",
                "supports_children": False,
                "children_can_support_records": False,
            }
        ), getChildProviderNames();
    }

    #! Returns a list of child data provider names, if any
    /** @return a list of child data provider names, if any
    */
    private *list<string> getChildProviderNamesImpl() {
        auto rv = getAsyncValue(get_table_list, getCallContextInfo());
        if (!rv) {
            return;
        }
        if (rv[0].typeCode() == NT_STRING) {
            return cast<list<string>>(rv);
        }
        return map $1.value, rv;
    }

    #! Returns the given child provider or @ref nothing if the given child is unknown
    /** @return the given child provider or @ref nothing if the given child is unknown

        @throw CHILD-PROVIDER-ERROR error acquiring child provider

        @see getChildProviderEx()
    */
    private *AbstractDataProvider getChildProviderImpl(string name) {
        try {
            return new TypeScriptActionRecordBasedDataProvider(name, self);
        } catch (hash<ExceptionInfo> ex) {
            rethrow "CHILD-PROVIDER-ERROR", sprintf("Table %y cannot be acquired from %y: %s: %s", name, getName(),
                ex.err, ex.desc), ex.arg;
        }
    }

    #! Returns static info about the data provider
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}
