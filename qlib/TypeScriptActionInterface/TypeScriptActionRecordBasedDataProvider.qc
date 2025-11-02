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
        hash<DataProviderInfo> info;

        #! Requires expression keys
        const RequiredExpressionKeys = (
            "display_name",
            "short_desc",
            "desc",
            "symbol",
        );
    }

    private {
        hash<string, AbstractDataField> record_type;
        hash<AsyncCallInfo> get_table_list;
        hash<AsyncCallInfo> get_record_type;

        *hash<AsyncCallInfo> begin_transaction;
        *hash<AsyncCallInfo> commit;
        *hash<AsyncCallInfo> rollback;
        *hash<AsyncCallInfo> search_records;
        *hash<AsyncCallInfo> create_records;
        *hash<AsyncCallInfo> update_records;
        *hash<AsyncCallInfo> upsert_records;
        *hash<AsyncCallInfo> delete_records;

        *hash<string, *hash<string, hash<DataProviderOptionInfo>>> option_map;

        const DataProviderArgInfoTypedHash = TypedHash::forName("DataProviderArgInfo");
        const ArgInfoMembers = map $1.getName(), DataProviderArgInfoTypedHash.getMembers();
    }

    #! Creates the object from the arguments
    constructor(string name, hash<DataProviderInfo> info, ActionFunctionContext fctx, *RestConnection conn)
            : TypeScriptActionDataProviderBase(name, fctx) {
        info.name = name;
        info.desc = sprintf("Record-based data provider for app `%s` table `%s`", app, name);
        self.info = info;
        hash<AppInfo> appinfo = TypeScriptActionInterface::getInitializedRecordBasedAppInfo(fctx.app);
        get_table_list = appinfo.get_table_list;
        get_record_type = appinfo.get_record_type;
        begin_transaction = appinfo.begin_transaction;
        omap.tables = appinfo.get_table_list;
        commit = appinfo.commit;
        rollback = appinfo.rollback;
        search_records = appinfo.search_records;

        create_records = appinfo.create_records;
        update_records = appinfo.update_records;
        upsert_records = appinfo.upsert_records;
        delete_records = appinfo.delete_records;

        if (conn) {
            setConnection(conn);
        }
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
        getAsyncValue(begin_transaction, getCallContextInfo());
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
        getAsyncValue(commit, getCallContextInfo());
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
        getAsyncValue(rollback, getCallContextInfo());
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

    #! Returns the description of the record type in the context of the given options
    private *hash<string, AbstractDataField> getRecordTypeWithOptionsImpl(*hash<auto> options,
            *hash<auto> search_options) {
        if (!record_type) {
            checkRecordTypeIntern(options);
        }
        return record_type;
    }

    #! Returns the description of the record type for creating records in the context of the given options
    private *hash<string, AbstractDataField> getCreateRecordTypeWithOptionsImpl(*hash<auto> options,
            *hash<auto> create_options) {
        if (!record_type) {
            checkRecordTypeIntern(options);
        }
        return record_type;
    }

    #! Returns the description of the record type for updating records in the context of the given options
    private *hash<string, AbstractDataField> getUpdateRecordTypeWithOptionsImpl(*hash<auto> options,
            *hash<auto> search_options) {
        if (!record_type) {
            checkRecordTypeIntern(options);
        }
        return record_type;
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
            *hash<auto> where_cond, *hash<auto> search_options) {
        search_options.table = name;
        hash<DataContextInfo> cctx = getCallContextInfo({
            "table": name,
        });
        where_cond = cast<*hash<DataProviderExpression>>(getSearchExpression(where_cond, search_options));
        if (TSAI::checkServer()) {
            return new TypeScriptBulkRecordProxyInterface(block_size, self, conn.name, conn.getRealOptions(),
                where_cond, search_options, cctx);
        } else {
            *code get_records = getAsyncValue(search_records, cctx,
                info.expressions ? convertExpression(where_cond) : NOTHING,
                info.expressions ? search_options : NOTHING);
            return new TypeScriptBulkRecordInterface(block_size, self, get_records, cctx,
                info.expressions ? NOTHING : where_cond);
        }
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
        search_options.table = name;
        hash<DataContextInfo> cctx = getCallContextInfo({
            "table": name,
        });
        where_cond = processSearchParameters(where_cond, search_options);
        if (TSAI::checkServer()) {
            return new TypeScriptBulkRecordProxyInterface(block_size, self, conn.name, conn.getRealOptions(),
                where_cond, search_options, cctx);
        } else {
            *code get_records = getAsyncValue(search_records, cctx,
                info.expressions ? convertExpression(where_cond) : NOTHING,
                info.expressions ? search_options : NOTHING);
            return new TypeScriptBulkRecordInterface(block_size, self, get_records, cctx,
                info.expressions ? NOTHING : where_cond);
        }
    }

    static hash<DataProviderInfo> getDataProviderInfo(hash<AppInfo> appinfo) {
        hash<DataProviderInfo> rv = <DataProviderInfo>{
            "type": "TypeScriptActionRecordBasedDataProvider",
        };
        if (appinfo.commit) {
            rv.transaction_management = True;
        }
        if (appinfo.search_records) {
            rv.supports_read = True,
            rv.supports_bulk_read = True;
            rv.supports_search_expressions = True;
            rv.has_record = True;
        }
        if (appinfo.search_options) {
            rv.search_options = map {$1.key: getDataProviderOption(appinfo.app.name, "search", $1.key, $1.value)},
                appinfo.search_options.pairIterator();
            # add in search options that are always supported
            map rv.search_options{$1.key} = $1.value,
                GenericRecordSearchOptions{"requires_result", "max_records"}.pairIterator(), !rv.search_options{$1.key};
        }

        if (appinfo.expressions) {
            rv.expressions = map {$1.key: getExpression(appinfo.app.name, $1.key, $1.value)},
                appinfo.expressions.pairIterator();
            rv.supports_native_search = True;
        }
        if (appinfo.create_records) {
            rv.supports_create = True;
            rv.supports_bulk_create = True;
            if (appinfo.create_options) {
                rv.create_options = map {$1.key: getDataProviderOption(appinfo.app.name, "create", $1.key, $1.value)},
                    appinfo.create_options.pairIterator();
            }
        }
        if (appinfo.update_records) {
            rv.supports_update = True;
        }
        if (appinfo.upsert_records) {
            rv.supports_upsert = True;
            rv.supports_bulk_upsert = True;
            if (appinfo.upsert_options) {
                rv.upsert_options = map {$1.key: getDataProviderOption(appinfo.app.name, "upsert", $1.key, $1.value)},
                    appinfo.upsert_options.pairIterator();
            }
        }
        if (appinfo.delete_records) {
            rv.supports_delete = True;
        }
        return rv;
    }

    #! Converts expressions to the format required by the JS / TS code
    private *hash<auto> convertExpression(auto exp) {
        return exists exp ? {
            "value": exp,
        } : NOTHING;
    }

    #! Converts expressions to the format required by the JS / TS code
    private *hash<auto> convertExpression(hash<auto> exp) {
        if (exp.hasKey("args")) {
            exp.args = map convertExpression($1), exp.args;
        }
        return exp;
    }

    #! Returns an iterator for zero or more records matching the search options
    /** @param where_cond the search criteria; after processing by processSearchParameters()
        @param search_options the search options after processing by validateSearchOptions()
    */
    private AbstractDataProviderRecordIterator searchRecordsImpl(*hash<auto> where_cond,
            *hash<auto> search_options) {
        return searchRecordsBulk(1000, where_cond, search_options).getRecordIterator();
    }

    #! Returns a single record matching the search options
    /** @param where_cond the search criteria
        @param search_options the search options after processing by validateSearchOptions()

        @throw MULTIPLE-RECORDS-ERROR multiple records found
    */
    private *hash<auto> searchSingleRecordImpl(*hash<auto> where_cond, *hash<auto> search_options) {
        AbstractDataProviderRecordIterator i = searchRecordsBulk(2, where_cond, search_options).getRecordIterator();
        if (!i.next()) {
            return;
        }
        hash<auto> rv = i.getValue();
        if (i.next()) {
            error("MULTIPLE-RECORDS-ERROR", "More than one record found for single-record search: %y", where_cond);
        }
        return rv;
    }

    private *hash<auto> createRecordImpl(hash<auto> rec, *hash<auto> create_options) {
        if (!create_records) {
            throw "INVALID-OPERATION", sprintf("Data provider %y does not support record creation", getName());
        }
        create_options.table = name;
        rec = makeBulk(rec);
        *hash<auto> rv = getAsyncValue(create_records, getCallContextInfo(), rec, create_options);
        foreach hash<auto> h in ((rec + rv).contextIterator()) {
            # return the first record + any output data
            return h;
        }
    }

    #! Creates the given records in the data provider
    /** @param recs a hash representing multiple input records, where the keys are record names and values are either
        lists of record values or a single value that applies to all records
        @param create_options the create options after processing by validateCreateOptions()

        @return the data written to the data provider for each record
    */
    private *hash<auto> createRecordsBulkImpl(hash<auto> recs, *hash<auto> create_options) {
        if (!create_records) {
            throw "INVALID-OPERATION", sprintf("Data provider %y does not support record creation", getName());
        }
        create_options.table = name;
        recs = makeBulk(recs);
        *hash<auto> rv = getAsyncValue(create_records, getCallContextInfo(), recs, create_options);
        return recs + rv;
    }

    private int updateRecordsImpl(hash<auto> set, *hash<auto> where_cond, *hash<auto> search_options) {
        if (!update_records) {
            throw "INVALID-OPERATION", sprintf("Data provider %y does not support record updating", getName());
        }
        search_options.table = name;
        return getAsyncValue(update_records, getCallContextInfo(), set, getSearchExpression(where_cond),
            search_options);
    }

    private string upsertRecordImpl(hash<auto> rec, *hash<auto> upsert_options) {
        if (!upsert_records) {
            throw "INVALID-OPERATION", sprintf("Data provider %y does not support record upserting", getName());
        }
        upsert_options.table = name;
        rec = makeBulk(rec);
        *list<auto> rv = getAsyncValue(upsert_records, getCallContextInfo(), rec, upsert_options);
        return rv[0] ?? UpsertResultVerified;
    }

    private *list<string> upsertRecordsBulkImpl(hash<auto> recs, *hash<auto> upsert_options) {
        if (!upsert_records) {
            throw "INVALID-OPERATION", sprintf("Data provider %y does not support record upserting", getName());
        }
        upsert_options.table = name;
        recs = makeBulk(recs);
        *list<auto> rv = getAsyncValue(upsert_records, getCallContextInfo(), recs, upsert_options);
        return rv ?? map UpsertResultVerified, xrange(recs.firstValue().size());
    }

    private int deleteRecordsImpl(*hash<auto> where_cond, *hash<auto> search_options) {
        if (!delete_records) {
            throw "INVALID-OPERATION", sprintf("Data provider %y does not support record deletion", getName());
        }
        search_options.table = name;
        return getAsyncValue(delete_records, getCallContextInfo(), getSearchExpression(where_cond), search_options);
    }

    private static hash<auto> makeBulk(hash<auto> rec) {
        hash<auto> rv;
        # get list size
        int lsize;
        foreach auto v in (rec.iterator()) {
            if (v.typeCode() == NT_LIST) {
                lsize = v.size();
                break;
            }
        }
        if (!exists lsize) {
            return map {$1.key: ($1.value,)}, rec.pairIterator();
        }
        if (!lsize) {
            return map {$1: ()}, keys rec;
        }
        foreach hash<auto> i in (rec.pairIterator()) {
            if (i.value.typeCode() == NT_LIST) {
                rv{i.key} = i.value;
            } else {
                rv{i.key} = map i.value, xrange(lsize);
            }
        }
        return rv;
    }

    #! Returns static info about the data provider
    private hash<DataProviderInfo> getStaticInfoImpl() {
        return info;
    }

    private synchronized checkRecordTypeIntern(*hash<auto> options = DataProviderDataContextHelper::getHash()) {
        if (record_type || !options.table.val()) {
            return;
        }
        auto v = getAsyncValue(get_record_type, getCallContextInfo(options));
        record_type = TypeScriptActionInterface::getType("record_type", v).getFields();
    }

    private static hash<DataProviderOptionInfo> getDataProviderOption(string app, string type, string name, auto v) {
        if (v.typeCode() != NT_HASH) {
            throw "SEARCH-OPTION-TYPE-ERROR", sprintf("The '%s_options' function for app %y search option %y "
                "returned type %y; expecting \"hash\"", type, app, name, v.fullType());
        }
        v.type = TypeScriptActionInterface::getType(type + " option " + name + " type", remove v.type);
        return cast<hash<DataProviderOptionInfo>>(v);
    }

    private static hash<DataProviderExpressionInfo> getExpression(string app, string name, auto v) {
        if (v.typeCode() != NT_HASH) {
            throw "EXPRESSION-TYPE-ERROR", sprintf("The 'expressions' object for app %y expression %y is of invalid "
                "type %y; expecting \"hash\"", app, name, v.fullType());
        }
        *int type = ExpressionTypeDescMap{v.type};
        if (!type) {
            throw "EXPRESSION-TYPE-ERROR", sprintf("The 'expressions' object for app %y expression %y defines "
                "invalid type %y; known types: %y", app, name, v.type, keys ExpressionTypeDescMap);
        }
        remove v.type;
        *int subtype;
        if (v.hasKey("subtype")) {
            subtype = ExpressionSubtypeDescMap{remove v.subtype};
            if (!subtype) {
                throw "EXPRESSION-SUBTYPE-ERROR", sprintf("The 'expressions' object for app %y expression %y "
                    "defines invalid subtype %y; known subtypes: %y", app, name, v.subtype,
                    keys ExpressionSubtypeDescMap);
            }
        } else {
            subtype = DES_Generic;
        }
        if (v.roles.typeCode() != NT_LIST) {
            throw "EXPRESSION-ROLES-ERROR", sprintf("The 'expressions' object for app %y expression %y defines "
                "invalid roles value of type %y; expecting \"list\"", app, name, v.roles.fullType());
        }
        int role = foldl $1 | $2, (map getRole(name, name, $1), remove v.roles);
        softlist<hash<DataProviderSignatureTypeInfo>> args;
        *softlist<hash<DataProviderArgInfo>> arg_info;
        if (v.hasKey("args")) {
            if (v.args.typeCode() != NT_LIST) {
                throw "EXPRESSION-ARGS-ERROR", sprintf("The 'expressions' object for app %y expression %y "
                    "defines invalid args value of type %y; expecting \"list\"", app, name, v.args.fullType());
            }
            list<auto> arg_list = remove v.args;
            foreach auto a in (arg_list) {
                if (a.typeCode() != NT_HASH) {
                    throw "EXPRESSION-ARG-TYPE-ERROR", sprintf("The 'expressions' object for app %y "
                        "expression %y defines an invalid arg value of type %y; expecting \"hash\"", app, name,
                        a.fullType());
                }

                *hash<auto> this_arg_info = remove a{ArgInfoMembers};
                if ($#) {
                    if (this_arg_info && !arg_info) {
                        throw "EXPRESSION-ARG-INFO-ERROR", sprintf("The 'expressions' object for app %y "
                            "expression %y defines arg info with argument %d / %d; arg info must be either included "
                            "with all arguments or with none", app, name, $# + 1, arg_list.size());
                    }
                    if (!this_arg_info && arg_info) {
                        throw "EXPRESSION-ARG-INFO-ERROR", sprintf("The 'expressions' object for app %y "
                            "expression %y did not define arg info with argument %d / %d; arg info must be either "
                            "included with all arguments or with none", app, name, $# + 1, arg_list.size());
                    }
                }
                *int type_code = SignatureTypeDescMap{a.type_code};
                if (!type_code) {
                    throw "EXPRESSION-TYPE-ERROR", sprintf("The 'expressions' object for app %y expression %y "
                        "defines invalid type_code %y for argument %d; known type-codes: %y", app, name,
                        a.type_code, $# + 1, keys SignatureTypeDescMap);
                }
                AbstractDataProviderType arg_type = TypeScriptActionInterface::getType("arg-" + ($# + 1), a.type);
                args += <DataProviderSignatureTypeInfo>{
                    "type_code": type_code,
                    "type": arg_type,
                };
                if (this_arg_info) {
                    arg_info += cast<hash<DataProviderArgInfo>>(this_arg_info);
                }
            }
        }

        AbstractDataProviderType return_type = TypeScriptActionInterface::getType("expression " + name +
            " return type", remove v.return_type);

        return <DataProviderExpressionInfo>{
            "name": name,
            "type": type,
            "subtype": subtype,
            "role": role,
            "args": args,
            "arg_info": arg_info,
            "return_type": return_type,
        } + cast<hash<DataProviderExpressionInfo>>(v);
    }

    private static int getRole(string app, string exp, auto v) {
        if (v.typeCode() != NT_STRING) {
            throw "EXPRESSION-ROLE-ERROR", sprintf("The 'expressions' object for app %y expression %y defines "
                "invalid role %y with type %y; expecting \"string\"", app, exp, v, v.fullType());
        }
        *int role = RoleDescMap{v};
        if (!role) {
            throw "EXPRESSION-ROLE-ERROR", sprintf("The 'expressions' object for app %y expression %y defines "
                "invalid role %y; known roles: %y", app, v, keys RoleDescMap);
        }
        return role;
    }
}
}
