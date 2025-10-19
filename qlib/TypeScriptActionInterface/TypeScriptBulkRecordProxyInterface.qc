# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  TypeScriptBulkRecordProxyInterface.qc Copyright 2024 - 2025 Qore Technologies, s.r.o.

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
#! Interface for proxued bulk record operations for TypeScript app search actions
public class TypeScriptBulkRecordProxyInterface inherits AbstractDataProviderBulkRecordInterface {
    public {
    }

    private {
        TypeScriptActionRecordBasedDataProvider prov;
        string id;
        *JavaScriptProgramProxy proxy;
        *hash<auto> first_block;
        bool have_first_block;
    }

    #! Creates the object from the arguments
    constructor(int block_size, TypeScriptActionRecordBasedDataProvider prov,
            *hash<DataProviderExpression> where_cond, hash<auto> search_options, *hash<DataContextInfo> options)
            : AbstractDataProviderBulkRecordInterface(block_size) {
        self.prov = prov;
        # generate unique request ID
        id = UUID::get();
        hash<auto> rv = TSAI::server.searchRecords(prov.app, id, block_size, where_cond, search_options, options);
        first_block = rv.rv;
        proxy = rv.proxy;
        have_first_block = True;
    }

    destructor() {
        if (proxy) {
            TSAI::info("Releasing search %y", id);
            TSAI::server.releaseSearch(proxy, id);
        }
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
    *hash<auto> getValueImpl() {
        if (have_first_block) {
            remove have_first_block;
            return remove first_block;
        }
        if (!proxy) {
            return;
        }
        *hash<auto> rv = proxy.getRecords(id);
        if (!rv.firstValue().lsize()) {
            TSAI::info("Search %y complete", id);
            remove proxy;
        }
        return rv;
    }
}
}
