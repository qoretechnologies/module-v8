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
#! The TypeScript data field
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
                TypeScriptActionDataProviderBase ts_prov_ctx;
                if ((*AbstractDataProvider p = DataProviderContextHelper::get())
                    && (p instanceof TypeScriptActionDataProviderBase)) {
                    ts_prov_ctx = cast<TypeScriptActionDataProviderBase>(p);
                    res = ts_prov_ctx.getAsyncValue(call, ts_prov_ctx.getCallContextInfo());
                } else {
                    res = TypeScriptActionDataProviderBase::getAsyncValueArgs(NOTHING, call);
                }
                if (res) {
                    return TypeScriptActionInterface::getType(name, res, attr.required, NOTHING, ts_prov_ctx, True);
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
                TypeScriptActionDataProviderBase ts_prov_ctx;
                if ((*AbstractDataProvider p = DataProviderContextHelper::get())
                    && (p instanceof TypeScriptActionDataProviderBase)) {
                    ts_prov_ctx = cast<TypeScriptActionDataProviderBase>(p);
                    return ts_prov_ctx.getAsyncValue(call, ts_prov_ctx.getCallContextInfo());
                } else {
                    return TypeScriptActionDataProviderBase::getAsyncValueArgs(NOTHING, call);
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
