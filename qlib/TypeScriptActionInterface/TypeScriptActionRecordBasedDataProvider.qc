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
        *hash<AsyncCallInfo> get_record_type;

        *hash<AsyncCallInfo> begin_transaction;
        *hash<AsyncCallInfo> commit;
        *hash<AsyncCallInfo> rollback;
        *hash<AsyncCallInfo> get_expressions;

        hash<string, hash<DataProviderExpressionInfo>> expressions;

        const DataProviderArgInfoTypedHash = TypedHash::forName("DataProviderArgInfo");
        const ArgInfoMembers = map $1.getName(), DataProviderArgInfoTypedHash.getMembers();
    }

    #! Creates the object from the arguments
    constructor(string name, ActionFunctionContext fctx) : TypeScriptActionDataProviderBase(name, fctx) {
        hash<AppInfo> info = TypeScriptActionInterface::getInitializedRecordBasedAppInfo(fctx.app);
        get_record_type = info.get_record_type;
        begin_transaction = info.begin_transaction;
        commit = info.commit;
        rollback = info.rollback;
        get_expressions = info.get_expressions;
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

    private synchronized checkRecordTypeIntern() {
        if (record_type) {
            return;
        }
        auto v = getAsyncValue(get_record_type, getCallContextInfo());
        record_type = TypeScriptActionInterface::getType(v).getFields();
    }

    private *hash<string, hash<DataProviderExpressionInfo>> getExpressions() {
        if (!expressions) {
            checkExpressionsIntern();
        }
        return expressions;
    }

    private synchronized checkExpressionsIntern() {
        if (expressions) {
            return;
        }
        if (!get_expressions) {
            expressions = GenericExpressions;
            return;
        }
        auto v = getAsyncValue(get_expressions, getCallContextInfo());
        if (!exists v) {
            expressions = GenericExpressions;
            return;
        }
        if (v.typeCode() != NT_HASH) {
            throw "EXPRESSION-TYPE-ERROR", sprintf("The 'get_expressions' function for app %y returned type %y; "
                "expecting \"hash\"", app.name, v.fullType());
        }
        expressions = map {$1.key: getExpression($1.key, $1.value)}, v.pairIterator();
    }

    private hash<DataProviderExpressionInfo> getExpression(string name, auto v) {
        if (v.typeCode() != NT_HASH) {
            throw "EXPRESSION-TYPE-ERROR", sprintf("The 'get_expressions' function for app %y expression %y returned "
                "type %y; expecting \"hash\"", app.name, name, v.fullType());
        }
        *int type = ExpressionTypeDescMap{v.type};
        if (!type) {
            throw "EXPRESSION-TYPE-ERROR", sprintf("The 'get_expressions' function for app %y expression %y returned "
                "invalid type %y; known types: %y", app.name, name, v.type, keys ExpressionTypeDescMap);
        }
        remove v.type;
        *int subtype;
        if (v.hasKey("subtype")) {
            subtype = ExpressionSubtypeDescMap{remove v.subtype};
            if (!subtype) {
                throw "EXPRESSION-SUBTYPE-ERROR", sprintf("The 'get_expressions' function for app %y expression %y "
                    "returned invalid subtype %y; known subtypes: %y", app.name, name, v.subtype,
                    keys ExpressionSubtypeDescMap);
            }
        } else {
            subtype = DES_Generic;
        }
        if (v.roles.typeCode() != NT_LIST) {
            throw "EXPRESSION-ROLES-ERROR", sprintf("The 'get_expressions' function for app %y expression %y returned "
                "invalid roles value of type %y; expecting \"list\"", app.name, name, v.roles.fullType());
        }
        int role = foldl $1 | $2, (map getRole(name, name, $1), remove v.roles);
        softlist<hash<DataProviderSignatureTypeInfo>> args;
        *softlist<hash<DataProviderArgInfo>> arg_info;
        if (v.hasKey("args")) {
            if (v.args.typeCode() != NT_LIST) {
                throw "EXPRESSION-ARGS-ERROR", sprintf("The 'get_expressions' function for app %y expression %y "
                    "returned invalid args value of type %y; expecting \"list\"", app.name, name, v.args.fullType());
            }
            list<auto> arg_list = remove v.args;
            foreach auto a in (arg_list) {
                if (a.typeCode() != NT_HASH) {
                    throw "EXPRESSION-ARG-TYPE-ERROR", sprintf("The 'get_expressions' function for app %y "
                        "expression %y returned an invalid arg value of type %y; expecting \"hash\"", app.name, name,
                        a.fullType());
                }

                *hash<auto> this_arg_info = remove a{ArgInfoMembers};
                if ($#) {
                    if (this_arg_info && !arg_info) {
                        throw "EXPRESSION-ARG-INFO-ERROR", sprintf("The 'get_expressions' function for app %y "
                            "expression %y returned arg info with argument %d / %d; arg info must be either included "
                            "with all arguments or with none", app.name, name, $# + 1, arg_list.size());
                    }
                    if (!this_arg_info && arg_info) {
                        throw "EXPRESSION-ARG-INFO-ERROR", sprintf("The 'get_expressions' function for app %y "
                            "expression %y did not return arg info with argument %d / %d; arg info must be either "
                            "included with all arguments or with none", app.name, name, $# + 1, arg_list.size());
                    }
                }
                *int type_code = SignatureTypeDescMap{a.type_code};
                if (!type_code) {
                    throw "EXPRESSION-TYPE-ERROR", sprintf("The 'get_expressions' function for app %y expression %y "
                        "returned invalid type_code %y for argument %d; known type-codes: %y", app.name, name,
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

    private int getRole(string app, string exp, auto v) {
        if (v.typeCode() != NT_STRING) {
            throw "EXPRESSION-ROLE-ERROR", sprintf("The 'get_expressions' function for app %y expression %y returned "
                "invalid role %y with type %y; expecting \"string\"", app, exp, v, v.fullType());
        }
        *int role = RoleDescMap{v};
        if (!role) {
            throw "EXPRESSION-ROLE-ERROR", sprintf("The 'get_expressions' function for app %y expression %y returned "
                "invalid role %y; known roles: %y", app.name, v, keys RoleDescMap);
        }
        return role;
    }
}
}
