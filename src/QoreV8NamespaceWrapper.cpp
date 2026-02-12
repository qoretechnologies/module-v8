/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8NamespaceWrapper.cpp wraps Qore namespaces as V8 objects */
/*
    QoreV8NamespaceWrapper.cpp

    Qore Programming Language

    Copyright (C) 2026 Qore Technologies, s.r.o.

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 2.1 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

#include "QoreV8NamespaceWrapper.h"
#include "QoreV8ClassWrapper.h"
#include "QoreV8Program.h"

#include <vector>

v8::Local<v8::Object> QoreV8NamespaceWrapper::create(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreNamespace& ns) {
    // Create namespace data
    QoreV8NamespaceData* ns_data = new QoreV8NamespaceData(&ns, pgm);

    // Create the object template with named property handler
    v8::Local<v8::ObjectTemplate> tmpl = v8::ObjectTemplate::New(isolate);
    tmpl->SetInternalFieldCount(1);

    v8::NamedPropertyHandlerConfiguration config(
        getter,         // getter
        nullptr,        // setter (read-only)
        query,          // query
        nullptr,        // deleter
        enumerator,     // enumerator
        v8::Local<v8::Value>(),  // data (unused, we use internal field)
        v8::PropertyHandlerFlags::kNonMasking
    );
    tmpl->SetHandler(config);

    v8::Local<v8::Object> obj = tmpl->NewInstance(context).ToLocalChecked();
    obj->SetAlignedPointerInInternalField(0, ns_data);

    // Set up weak reference to clean up ns_data; persistent is embedded in the struct
    ns_data->persistent.Reset(isolate, obj);
    ns_data->persistent.SetWeak(ns_data, weak_callback, v8::WeakCallbackType::kParameter);

    // Track for deterministic cleanup in deleteIntern()
    pgm->trackNamespaceData(ns_data);

    return obj;
}

void QoreV8NamespaceWrapper::weak_callback(const v8::WeakCallbackInfo<QoreV8NamespaceData>& data) {
    QoreV8NamespaceData* ns_data = data.GetParameter();
    ns_data->pgm->untrackNamespaceData(ns_data);
    ns_data->persistent.Reset();
    delete ns_data;
}

#if V8_MAJOR_VERSION >= 12
v8::Intercepted QoreV8NamespaceWrapper::getter(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Value>& info) {
#else
void QoreV8NamespaceWrapper::getter(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Value>& info) {
#endif
    // Only handle string properties
    if (!property->IsString()) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    v8::Isolate* isolate = info.GetIsolate();
    v8::Local<v8::Context> context = isolate->GetCurrentContext();

    v8::String::Utf8Value prop_name(isolate, property);
    const char* name = *prop_name;

    // Get namespace data from internal field
    v8::Local<v8::Object> holder = info.Holder();
    QoreV8NamespaceData* ns_data = reinterpret_cast<QoreV8NamespaceData*>(
        holder->GetAlignedPointerFromInternalField(0));
    if (!ns_data) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    // Check cache first
    auto it = ns_data->cache.find(name);
    if (it != ns_data->cache.end()) {
        info.GetReturnValue().Set(it->second.Get(isolate));
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    const QoreNamespace* ns = ns_data->ns;
    QoreV8Program* pgm = ns_data->pgm;
    v8::Local<v8::Value> result;

    // 1. Look up as child namespace
    QoreNamespace* child_ns = ns->findLocalNamespace(name);
    if (child_ns) {
        result = create(isolate, context, pgm, *child_ns);
        ns_data->cache[name].Reset(isolate, result);
        info.GetReturnValue().Set(result);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // 2. Look up as class
    QoreClass* cls = ns->findLocalClass(name);
    if (cls) {
        result = QoreV8ClassWrapper::create(isolate, context, pgm, *cls);
        ns_data->cache[name].Reset(isolate, result);
        info.GetReturnValue().Set(result);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // 3. Look up as function
    const QoreExternalFunction* func = ns->findLocalFunction(name);
    if (func) {
        result = wrapFunction(isolate, context, pgm, *ns, name);
        ns_data->cache[name].Reset(isolate, result);
        info.GetReturnValue().Set(result);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // 4. Look up as constant
    const QoreExternalConstant* constant = ns->findLocalConstant(name);
    if (constant) {
        ExceptionSink xsink;
        QoreValue val = constant->getReferencedValue();
        result = pgm->getV8Value(val, &xsink);
        val.discard(&xsink);
        if (xsink) {
            QoreV8Program::raiseV8Exception(xsink, isolate);
#if V8_MAJOR_VERSION >= 12
            // V8 12+ requires a return value when returning kYes; set placeholder since exception is pending
            info.GetReturnValue().Set(v8::Null(isolate));
            return v8::Intercepted::kYes;
#else
            return;
#endif
        }
        ns_data->cache[name].Reset(isolate, result);
        info.GetReturnValue().Set(result);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // 5. Look up as enum
    const QoreEnumDecl* ed = ns->findLocalEnum(name);
    if (ed) {
        result = wrapEnum(isolate, context, pgm, *ed);
        ns_data->cache[name].Reset(isolate, result);
        info.GetReturnValue().Set(result);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // Not found - return undefined (default behavior)
#if V8_MAJOR_VERSION >= 12
    return v8::Intercepted::kNo;
#endif
}

#if V8_MAJOR_VERSION >= 12
v8::Intercepted QoreV8NamespaceWrapper::query(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Integer>& info) {
#else
void QoreV8NamespaceWrapper::query(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Integer>& info) {
#endif
    if (!property->IsString()) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    v8::Isolate* isolate = info.GetIsolate();
    v8::String::Utf8Value prop_name(isolate, property);
    const char* name = *prop_name;

    v8::Local<v8::Object> holder = info.Holder();
    QoreV8NamespaceData* ns_data = reinterpret_cast<QoreV8NamespaceData*>(
        holder->GetAlignedPointerFromInternalField(0));
    if (!ns_data) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    // Check cache first
    auto it = ns_data->cache.find(name);
    if (it != ns_data->cache.end()) {
        info.GetReturnValue().Set(v8::Integer::New(isolate, v8::ReadOnly | v8::DontDelete));
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    const QoreNamespace* ns = ns_data->ns;

    // Check if the name exists in any of the categories
    if (ns->findLocalNamespace(name) || ns->findLocalClass(name) || ns->findLocalFunction(name)
        || ns->findLocalConstant(name) || ns->findLocalEnum(name)) {
        info.GetReturnValue().Set(v8::Integer::New(isolate, v8::ReadOnly | v8::DontDelete));
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

#if V8_MAJOR_VERSION >= 12
    return v8::Intercepted::kNo;
#endif
}

void QoreV8NamespaceWrapper::enumerator(const v8::PropertyCallbackInfo<v8::Array>& info) {
    v8::Isolate* isolate = info.GetIsolate();

    v8::Local<v8::Object> holder = info.Holder();
    QoreV8NamespaceData* ns_data = reinterpret_cast<QoreV8NamespaceData*>(
        holder->GetAlignedPointerFromInternalField(0));
    if (!ns_data) {
        return;
    }

    const QoreNamespace* ns = ns_data->ns;
    std::vector<v8::Local<v8::Value>> names;

    // Collect child namespace names
    {
        QoreNamespaceNamespaceIterator it(*ns);
        while (it.next()) {
            v8::MaybeLocal<v8::String> s = v8::String::NewFromUtf8(isolate, it.get().getName());
            if (!s.IsEmpty()) {
                names.push_back(s.ToLocalChecked());
            }
        }
    }

    // Collect class names
    {
        QoreNamespaceClassIterator it(*ns);
        while (it.next()) {
            v8::MaybeLocal<v8::String> s = v8::String::NewFromUtf8(isolate, it.get().getName());
            if (!s.IsEmpty()) {
                names.push_back(s.ToLocalChecked());
            }
        }
    }

    // Collect function names
    {
        QoreNamespaceFunctionIterator it(*ns);
        while (it.next()) {
            v8::MaybeLocal<v8::String> s = v8::String::NewFromUtf8(isolate, it.get().getName());
            if (!s.IsEmpty()) {
                names.push_back(s.ToLocalChecked());
            }
        }
    }

    // Collect constant names
    {
        QoreNamespaceConstantIterator it(*ns);
        while (it.next()) {
            v8::MaybeLocal<v8::String> s = v8::String::NewFromUtf8(isolate, it.get().getName());
            if (!s.IsEmpty()) {
                names.push_back(s.ToLocalChecked());
            }
        }
    }

    // Collect enum names
    {
        QoreNamespaceEnumIterator it(*ns);
        while (it.next()) {
            v8::MaybeLocal<v8::String> s = v8::String::NewFromUtf8(isolate, it.get().getName());
            if (!s.IsEmpty()) {
                names.push_back(s.ToLocalChecked());
            }
        }
    }

    v8::Local<v8::Array> result = v8::Array::New(isolate, names.data(), names.size());
    info.GetReturnValue().Set(result);
}

v8::Local<v8::Value> QoreV8NamespaceWrapper::wrapFunction(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreNamespace& ns, const char* name) {
    // Build the fully qualified function path for callFunction()
    std::string ns_path = ns.getPath(false);
    std::string func_path;
    if (!ns_path.empty() && ns_path != "::") {
        // ns.getPath() returns something like "Qore" for the Qore namespace
        func_path = ns_path + "::" + name;
    } else {
        func_path = name;
    }

    QoreV8FunctionData* func_data = new QoreV8FunctionData(pgm, func_path);
    v8::Local<v8::External> ext = v8::External::New(isolate, func_data);
    v8::MaybeLocal<v8::Function> func = v8::Function::New(context, call_function, ext);
    if (func.IsEmpty()) {
        delete func_data;
        return v8::Null(isolate);
    }
    pgm->trackFunctionData(func_data);

    // Set function name for debugging
    v8::MaybeLocal<v8::String> func_name = v8::String::NewFromUtf8(isolate, name);
    if (!func_name.IsEmpty()) {
        func.ToLocalChecked()->SetName(func_name.ToLocalChecked());
    }

    return func.ToLocalChecked();
}

void QoreV8NamespaceWrapper::call_function(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Value> v = info.Data();
    assert(v->IsExternal());

    v8::Local<v8::External> ext = v8::Local<v8::External>::Cast(v);
    QoreV8FunctionData* func_data = reinterpret_cast<QoreV8FunctionData*>(ext->Value());
    v8::Isolate* isolate = info.GetIsolate();

    ExceptionSink xsink;

    // Marshal arguments
    ReferenceHolder<QoreListNode> args(&xsink);
    int len = info.Length();
    if (len) {
        args = new QoreListNode(autoTypeInfo);
        for (int i = 0; i < len; ++i) {
            ValueHolder arg(func_data->pgm->getQoreValue(&xsink, info[i]), &xsink);
            if (xsink) {
                QoreV8Program::raiseV8Exception(xsink, isolate);
                return;
            }
            args->push(arg.release(), &xsink);
            assert(!xsink);
        }
    }

    // Call the function
    ValueHolder rv(func_data->pgm->callFunction(func_data->func_path.c_str(), *args, &xsink), &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    // Marshal return value
    v8::Local<v8::Value> v8rv = func_data->pgm->getV8Value(*rv, &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }
    info.GetReturnValue().Set(v8rv);
}

v8::Local<v8::Value> QoreV8NamespaceWrapper::wrapEnum(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreEnumDecl& ed) {
    v8::Local<v8::Object> obj = v8::Object::New(isolate);
    ExceptionSink xsink;

    QoreEnumMemberIterator it(ed);
    while (it.next()) {
        const char* name = it.getName();
        QoreValue val = it.getValue();
        v8::Local<v8::Value> v8val = pgm->getV8Value(val, &xsink);
        if (xsink) {
            QoreV8Program::raiseV8Exception(xsink, isolate);
            return v8::Null(isolate);
        }
        v8::MaybeLocal<v8::String> key = v8::String::NewFromUtf8(isolate, name);
        if (!key.IsEmpty()) {
            obj->DefineOwnProperty(context, key.ToLocalChecked(), v8val,
                static_cast<v8::PropertyAttribute>(v8::ReadOnly | v8::DontDelete)).Check();
        }
    }

    return obj;
}
