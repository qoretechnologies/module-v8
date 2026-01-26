# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptDataField.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
#! The TypeScript data field class
public class TypeScriptDataField inherits DataProvider::QoreDataField {
    #! Creates the field from the argument
    constructor(hash<auto> h, *ActionFunctionContext fctx) : QoreDataField(h) {
    }

    #! Returns the type of the field
    AbstractDataProviderType getType() {
        if (attr.dynamic_type) {
            hash<AsyncCallInfo> call = TypeScriptActionInterface::getCall(attr.dynamic_type);
            try {
                auto res;
                *TypeScriptActionApiWithSchemaDataProvider prov = ActionProviderContextHelper::get();
                if (prov) {
                    res = prov.getAsyncValueWithCache(call, {
                        "prov": prov.uniqueHash(),
                        "key": sprintf("dynamic-type-%s", attr.dynamic_type),
                    }, prov.getCallContextInfo(DataProviderDataContextHelper::get()));
                } else {
                    res = TypeScriptActionDataProviderBase::getAsyncValueArgs(NOTHING, call, NOTHING, {
                        "key": sprintf("dynamic-type-%s", attr.dynamic_type),
                    });
                }
                if (res) {
                    return TypeScriptActionInterface::getType(name, res, attr.required, NOTHING, prov);
                }
            } catch (hash<ExceptionInfo> ex) {
                TSAI::error("Failed to retrieve dynamic type for field %y: %y: %s", name, call.label,
                    get_exception_string(ex));
            }
        }
        return QoreDataField::getType();
    }

    #! Get default value, if any
    auto getDefaultValue() {
        if (attr.get_default_value.val()) {
            hash<AsyncCallInfo> call = TypeScriptActionInterface::getCall(attr.get_default_value);
            try {
                *TypeScriptActionApiWithSchemaDataProvider prov = ActionProviderContextHelper::get();
                if (prov) {
                    return prov.getAsyncValueWithCache(call, {
                        "prov": prov.uniqueHash(),
                        "key": sprintf("default-value-%s", attr.get_default_value),
                    }, prov.getCallContextInfo(DataProviderDataContextHelper::get()));
                } else {
                    return TypeScriptActionDataProviderBase::getAsyncValueArgs(NOTHING, call, NOTHING, {
                        "key": sprintf("default-value-%s", attr.get_default_value),
                    });
                }
            } catch (hash<ExceptionInfo> ex) {
                TSAI::error("Failed to retrieve default value for field %y: %y: %s", name, call.label,
                    get_exception_string(ex));
            }
        }
        return QoreDataField::getDefaultValue();
    }
}
}
