# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionRecordBasedDataProvider.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
public class TypeScriptActionRecordBasedDataProvider inherits TypeScriptActionDataProviderBase {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "has_record": True,
        };
    }

    private {
        hash<string, AbstractDataField> record_type;
        *hash<AsyncCallInfo> get_record_type;
        *hash<auto> options;

        *hash<AsyncCallInfo> begin_transaction;
        *hash<AsyncCallInfo> commit;
        *hash<AsyncCallInfo> rollback;

        hash<string, hash<DataProviderExpressionInfo>> expressions;
    }

    #! Creates the object from the arguments
    constructor(string app, string name, ActionFunctionContext fctx) : TypeScriptActionDataProviderBase(name, fctx) {
        hash<AppInfo> info = TypeScriptActionInterface::getInitializedRecordBasedAppInfo(app);
        get_record_type = info.get_record_type;
        begin_transaction = info.begin_transaction;
        commit = info.commit;
        rollback = info.rollback;
        expressions = info.expressions;
        options = DataProviderDataContextHelper::getHash();
    }

    #! Begins a transaction with a data provider
    /** Has no effect if the data provider does not require transaction management

        @see:
        - commit()
        - rollback()
    */
    beginTransaction() {
        if (!begin_transaction) {
            return;
        }
        getAsyncValue(begin_transaction, getCallContextInfo(options));
    }

    #! Commits data written to the data provider
    /** Has no effect if the data provider does not support transaction management

        @see:
        - beginTransaction()
        - rollback()
    */
    commit() {
        if (!commit) {
            return;
        }
        getAsyncValue(commit, getCallContextInfo(options));
    }

    #! Rolls back data written to the data provider
    /** Has no effect if the data provider does not support transaction management

        @see:
        - beginTransaction()
        - commit()
    */
    rollback() {
        if (!rollback) {
            return;
        }
        getAsyncValue(rollback, getCallContextInfo(options));
    }

    #! Returns the description of the record type, if any
    /** @param search_options to be included and processed by validateSearchOptions() if
        \a recordRequiresSearchOptions() is @ref True for this provider, otherwise any value provided in this argument
        is ignored
    */
    private *hash<string, AbstractDataField> getRecordTypeImpl(*hash<auto> search_options) {
        if (!record_type) {
            checkRecordTypeIntern();
        }
        return record_type;
    }

    private synchronized checkRecordTypeIntern() {
        if (record_type) {
            return;
        }
        auto v = getAsyncValue(get_record_type, getCallContextInfo(options));
        record_type = TypeScriptActionInterface::getType(v).getFields();
    }
}
}
