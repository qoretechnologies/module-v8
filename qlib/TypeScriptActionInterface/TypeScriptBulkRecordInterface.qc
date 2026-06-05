# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptBulkRecordInterface.qc Copyright 2024 - 2025 Qore Technologies, s.r.o.

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
#! Interface for bulk record operations for TypeScript app search actions
public class TypeScriptBulkRecordInterface inherits AbstractDataProviderBulkRecordInterface {
    public {
    }

    private {
        TypeScriptActionRecordBasedDataProvider prov;
        *code get_records_code;
        *hash<AsyncCallInfo> get_records;
        *hash<DataContextInfo> cctx;
        *hash<DataProviderExpression> where_exp;
    }

    #! Creates the object from the arguments
    constructor(int block_size, TypeScriptActionRecordBasedDataProvider prov, *code get_records,
            *hash<DataContextInfo> cctx, *hash<DataProviderExpression> where_exp, *hash<auto> search_options)
            : AbstractDataProviderBulkRecordInterface(block_size, search_options.requires_result,
                search_options.max_records, search_options.limit) {
        self.prov = prov;
        if (get_records) {
            get_records_code = get_records;
            self.get_records = <AsyncCallInfo>{
                "key": UUID::get(),
                "app": prov.app,
                "action": prov.action,
                "type": "get_records",
                "label": sprintf("get_records() for @%s/%s", prov.app, prov.action),
                "pool": prov.pool,
                "async_call": get_records_code,
                "to": seconds(TypeScriptActionInterface::DefaultIoTimeoutSecs),
            };
        } else {
            valid = False;
        }
        self.cctx = cctx;
        # only provided when the provider does not support native search
        self.where_exp = where_exp;
    }

    #! Returns the record description, if available
    *hash<string, AbstractDataField> getRecordType() {
        return prov.getRecordType();
    }

    #! Returns a hash of lists (or constant values) according to the block size or @ref nothing if no more data is available
    /** @return a hash of lists (or constant values) according to the block size or @ref nothing if no more data is
        available

        @throw INVALID-ITERATOR the iterator is not pointing at a valid element

        @note
        - This call moves the internal record pointer forward, therefore multiple calls of this methods will
          return different results as long as data is available
        - The first hash key must be assigned to a list and cannot be assigned to a constant value
    */
    hash<auto> getValueImpl() {
        while (True) {
            auto results = TypeScriptActionDataProviderBase::execAsyncValueArgs(prov.getLogger(), get_records,
                (cctx, block_size));
            if (!results || !results.firstValue().size()) {
                return {};
            }
            # apply generic filter if necessary
            if (!where_exp) {
                return results;
            }
            # apply generic filtering
            hash<auto> new_results;
            int count;
            foreach hash<auto> record in (results.contextIterator()) {
                if (AbstractDataProvider::evalGenericExpression(record, where_exp)) {
                    if (!new_results) {
                        new_results = map {$1: ()}, keys record;
                    }
                    map new_results{$1.key} += $1.value, record.pairIterator();
                }
            }
            if (!new_results.firstValue()) {
                continue;
            }
            return new_results;
        }
    }
}
}
