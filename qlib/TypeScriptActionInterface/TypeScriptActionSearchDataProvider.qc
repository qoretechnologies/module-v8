# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionSearchDataProvider.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
public class TypeScriptActionSearchDataProvider inherits TypeScriptActionRecordBasedDataProvider {
    public {
        #! Provider info
        const ProviderInfo = TypeScriptActionRecordBasedDataProvider::ProviderInfo + <DataProviderInfo>{
            "supports_read": True,
        };
    }

    private {
        *hash<AsyncCallInfo> search_records;
        *hash<string, hash<DataProviderOptionInfo>> search_options;
        *hash<string, hash<DataProviderExpressionInfo>> expressions;
        bool supports_native_search;
    }

    #! Creates the object from the arguments
    constructor(string name, hash<AsyncCallInfo> get_record_type,
            *hash<AsyncCallInfo> begin_transaction,
            *hash<AsyncCallInfo> commit,
            *hash<AsyncCallInfo> rollback,
            hash<AsyncCallInfo> search_records,
            *hash<string, hash<DataProviderOptionInfo>> search_options,
            *hash<string, hash<DataProviderExpressionInfo>> expressions,
            bool supports_native_search,
            ActionFunctionContext fctx)
            : TypeScriptActionRecordBasedDataProvider(name, get_record_type, begin_transaction, commit, rollback,
                fctx) {
        self.search_records = search_records;
        self.search_options = search_options;
        self.expressions = expressions;
        self.supports_native_search = supports_native_search;
    }

    #! Returns an iterator for zero or more records matching the search options
    /** @param where_cond the search criteria; after processing by processSearchParameters()
        @param search_options the search options after processing by validateSearchOptions()
    */
    private AbstractDataProviderRecordIterator searchRecordsImpl(*hash<auto> where_cond,
            *hash<auto> search_options) {
        *list<hash<auto>> v = cast<*list<hash<auto>>>(getAsyncValue(search_records, getCallContextInfo(options),
            where_cond, search_options));
        return new DefaultRecordIterator(new ListIterator(v), where_cond, search_options, record_type);
    }

    private hash<DataProviderInfo> getStaticInfoImpl() {
        hash<DataProviderInfo> rv = ProviderInfo;
        if (search_options) {
            rv.search_options = search_options;
        }
        if (supports_native_search) {
            rv.supports_native_search = True;
        }
        if (expressions) {
            rv.expressions = expressions;
            rv.supports_search_expressions = True;
        }
        return rv;
    }
}
}
