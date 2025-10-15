# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionSearchDataProvider.qc Copyright (C) 2023 - 2025 Qore Technologies s.r.o.

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
            "supports_search_expressions": True,
        };
    }

    private {
        bool supports_native_search;
        *hash<AsyncCallInfo> search_records;
        *hash<string, hash<DataProviderOptionInfo>> search_options;
        bool single;
    }

    #! Creates the object from the arguments
    constructor(string name,
            hash<AsyncCallInfo> search_records,
            *hash<string, hash<DataProviderOptionInfo>> search_options,
            bool single,
            ActionFunctionContext fctx)
            : TypeScriptActionRecordBasedDataProvider(name, fctx) {
        self.search_records = search_records;
        self.search_options = search_options;
    }

    #! Returns an iterator for zero or more records matching the search options
    /** @param block_size the number of records in a read block; must be a positive number
        @param where_cond the search criteria; will be processed by processSearchParameters()
        @param search_options the search options; will be processed by validateSearchOptions()

        @return a bulk record interface object that will return the records in bulk format

        @throw INVALID-BLOCK-SIZE the block size must be a positive number
        @throw INVALID-OPERATION the data provider does not support reading

        @since DataProvider 2.3
    */
    AbstractDataProviderBulkRecordInterface searchRecordsBulk(int block_size = 1000,
            *hash<DataProviderExpression> where_cond, *hash<auto> search_options) {
        *hash<DataContextInfo> cctx = getCallContextInfo();
        *code get_records = getAsyncValue(search_records, cctx,
            get_expressions ? where_cond : NOTHING, get_expressions ? search_options : NOTHING);
        return new TypeScriptBulkRecordInterface(block_size, self, get_records, cctx,
            get_expressions ? NOTHING : where_cond);
    }

    #! Returns an iterator for zero or more records matching the search options
    /** @param where_cond the search criteria; after processing by processSearchParameters()
        @param search_options the search options after processing by validateSearchOptions()
    */
    private AbstractDataProviderRecordIterator searchRecordsImpl(*hash<auto> where_cond,
            *hash<auto> search_options) {
        return searchRecordsBulk(1000, getSearchExpression(where_cond), search_options).getRecordIterator();
    }

    #! Returns a single record matching the search options
    /** @param where_cond the search criteria
        @param search_options the search options after processing by validateSearchOptions()

        @throw MULTIPLE-RECORDS-ERROR multiple records found
    */
    private *hash<auto> searchSingleRecordImpl(*hash<auto> where_cond, *hash<auto> search_options) {
        AbstractDataProviderRecordIterator i = searchRecordsBulk(2, getSearchExpression(where_cond), search_options)
            .getRecordIterator();
        if (!i.next()) {
            return;
        }
        hash<auto> rv = i.getValue();
        if (i.next()) {
            error("MULTIPLE-RECORDS-ERROR", "More than one record found for single-record search: %y", where_cond);
        }
        return rv;
    }

    #! Returns static info about the data provider
    private hash<DataProviderInfo> getStaticInfoImpl() {
        hash<DataProviderInfo> rv = ProviderInfo;
        if (search_options) {
            rv.search_options = search_options;
        }
        if (get_expressions) {
            rv.supports_native_search = True;
        }
        rv.expressions = getExpressions();
        return rv;
    }

    #! Returns a search expression from a "where" hash
    private hash<DataProviderExpression> getSearchExpression(hash<auto> where_cond) {
        if (where_cond instanceof hash<DataProviderExpression>) {
            return cast<hash<DataProviderExpression>>(where_cond);
        }
        # convert to an expression
        return hash<DataProviderExpression>{
            "exp": DP_OP_AND,
            "args": map <DataProviderExpression>{
                "exp": DP_SEARCH_OP_EQ,
                "args": (
                    <DataProviderFieldReference>{
                        "field": $1.key,
                    },
                    $1.value,
                ),
            }, where_cond.pairIterator(),
        };
    }
}
}
