/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Environment.cpp access to the process environment under Qore's environment lock */
/*
    QoreV8Environment.cpp

    Qore Programming Language

    Copyright 2026 Qore Technologies, s.r.o.

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

#include "QoreV8Environment.h"

#include <cstring>
#include <mutex>
#include <unordered_set>

#ifdef __APPLE__
// a shared library cannot refer to environ directly on macOS
#include <crt_externs.h>
#define environ (*_NSGetEnviron())
#else
extern char** environ;
#endif

std::vector<std::pair<std::string, std::string>> qore_v8_get_environment() {
    std::vector<std::pair<std::string, std::string>> rv;
    std::unordered_set<std::string> names;

    // the environment array and its strings stay unchanged while the lock is held; only copies are kept
    QoreEnvironmentReadLock env_lock;
    for (char** e = environ; e && *e; ++e) {
        const char* eq = strchr(*e, '=');
        if (!eq || eq == *e) {
            continue;
        }
        std::string name(*e, eq - *e);
        if (!names.insert(name).second) {
            continue;
        }
        rv.emplace_back(std::move(name), std::string(eq + 1));
    }
    return rv;
}

QoreHashNode* qore_v8_get_environment_hash(ExceptionSink* xsink) {
    // the hash is built after the lock is released
    std::vector<std::pair<std::string, std::string>> env = qore_v8_get_environment();
    ReferenceHolder<QoreHashNode> rv(new QoreHashNode(stringTypeInfo), xsink);
    for (auto& i : env) {
        rv->setKeyValue(i.first.c_str(), new QoreStringNode(i.second.c_str(), i.second.size(), QCS_DEFAULT),
            xsink);
        if (*xsink) {
            return nullptr;
        }
    }
    return rv.release();
}

#ifdef DEBUG
namespace {
//! guards env_write_hook
std::mutex env_write_hook_lock;
//! the code that a change of the environment made through the bridge calls; see qore_v8_dbg_set_env_write_hook()
ResolvedCallReferenceNode* env_write_hook = nullptr;

//! Calls the hook of qore_v8_dbg_set_env_write_hook(), if any
void qore_v8_dbg_env_write() {
    ExceptionSink xsink;
    {
        ReferenceHolder<ResolvedCallReferenceNode> hook(&xsink);
        {
            std::lock_guard<std::mutex> l(env_write_hook_lock);
            if (!env_write_hook) {
                return;
            }
            hook = env_write_hook->refRefSelf();
        }
        ValueHolder rv(hook->execValue(nullptr, &xsink), &xsink);
    }
    if (xsink) {
        printd(0, "qore_v8_dbg_env_write(): the hook raised %s\n", xsink.getExceptionErr().getTypeName());
        xsink.clear();
    }
}
}

void qore_v8_dbg_set_env_write_hook(const ResolvedCallReferenceNode* hook, ExceptionSink* xsink) {
    ReferenceHolder<ResolvedCallReferenceNode> old(xsink);
    std::lock_guard<std::mutex> l(env_write_hook_lock);
    old = env_write_hook;
    env_write_hook = hook ? hook->refRefSelf() : nullptr;
}
#endif

namespace {
//! Returns Node's original process.env object, the first argument of every bridge function
bool qore_v8_env_store(const v8::FunctionCallbackInfo<v8::Value>& info, v8::Local<v8::Object>& store) {
    if (info.Length() < 1 || !info[0]->IsObject()) {
        info.GetIsolate()->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(info.GetIsolate(),
            "the process environment bridge requires the original process.env object")));
        return false;
    }
    store = info[0].As<v8::Object>();
    return true;
}

//! Returns the property name, the second argument of every bridge function but keys()
bool qore_v8_env_name(const v8::FunctionCallbackInfo<v8::Value>& info, v8::Local<v8::Name>& name) {
    if (info.Length() < 2 || !info[1]->IsName()) {
        info.GetIsolate()->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(info.GetIsolate(),
            "the process environment bridge requires a property name")));
        return false;
    }
    name = info[1].As<v8::Name>();
    return true;
}

//! get(store, name): the value of the variable, or undefined if it is not set
void qore_v8_env_get(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Object> store;
    v8::Local<v8::Name> name;
    if (!qore_v8_env_store(info, store) || !qore_v8_env_name(info, name)) {
        return;
    }
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    QoreEnvironmentReadLock env_lock;
    // the variable is looked up first, so that a name that is not set is not looked up in the prototype chain,
    // where JavaScript code could run with the lock held
    bool exists;
    if (!store->HasOwnProperty(context, name).To(&exists) || !exists) {
        return;
    }
    v8::Local<v8::Value> value;
    if (store->Get(context, name).ToLocal(&value)) {
        info.GetReturnValue().Set(value);
    }
}

//! has(store, name): true if the variable is set
void qore_v8_env_has(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Object> store;
    v8::Local<v8::Name> name;
    if (!qore_v8_env_store(info, store) || !qore_v8_env_name(info, name)) {
        return;
    }
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    QoreEnvironmentReadLock env_lock;
    bool exists;
    if (store->HasOwnProperty(context, name).To(&exists)) {
        info.GetReturnValue().Set(exists);
    }
}

//! keys(store): the names of the variables, as strings
void qore_v8_env_keys(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Object> store;
    if (!qore_v8_env_store(info, store)) {
        return;
    }
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    QoreEnvironmentReadLock env_lock;
    v8::Local<v8::Array> names;
    // a proxy's own keys must be strings or symbols: a name that looks like an index stays a string
    if (store->GetOwnPropertyNames(context,
            static_cast<v8::PropertyFilter>(v8::PropertyFilter::ONLY_ENUMERABLE | v8::PropertyFilter::SKIP_SYMBOLS),
            v8::KeyConversionMode::kConvertToString).ToLocal(&names)) {
        info.GetReturnValue().Set(names);
    }
}

//! descriptor(store, name): the property descriptor of the variable, or undefined if it is not set
void qore_v8_env_descriptor(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Object> store;
    v8::Local<v8::Name> name;
    if (!qore_v8_env_store(info, store) || !qore_v8_env_name(info, name)) {
        return;
    }
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    QoreEnvironmentReadLock env_lock;
    bool exists;
    if (!store->HasOwnProperty(context, name).To(&exists) || !exists) {
        return;
    }
    v8::Local<v8::Value> desc;
    if (store->GetOwnPropertyDescriptor(context, name).ToLocal(&desc)) {
        info.GetReturnValue().Set(desc);
    }
}

//! set(store, name, value): sets the variable; the name and value are strings
void qore_v8_env_set(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Object> store;
    v8::Local<v8::Name> name;
    if (!qore_v8_env_store(info, store) || !qore_v8_env_name(info, name)) {
        return;
    }
    if (info.Length() < 3 || !info[2]->IsString()) {
        info.GetIsolate()->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(info.GetIsolate(),
            "the process environment bridge requires a string value")));
        return;
    }
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    AtomicEnvironmentSetter env_lock;
    // Node's setter changes the environment and, for TZ, makes V8 detect the time zone again
    bool rv;
    if (store->Set(context, name, info[2]).To(&rv)) {
        info.GetReturnValue().Set(rv);
    }
#ifdef DEBUG
    if (name->IsString()) {
        v8::String::Utf8Value key(info.GetIsolate(), name);
        if (*key && !strcmp(*key, "TZ")) {
            qore_v8_dbg_env_write();
        }
    }
#endif
}

//! delete(store, name): removes the variable
void qore_v8_env_delete(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Object> store;
    v8::Local<v8::Name> name;
    if (!qore_v8_env_store(info, store) || !qore_v8_env_name(info, name)) {
        return;
    }
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    AtomicEnvironmentSetter env_lock;
    bool rv;
    if (store->Delete(context, name).To(&rv)) {
        info.GetReturnValue().Set(rv);
    }
}

//! Reads a field of a property descriptor object created by V8 for a proxy trap (a plain object of data properties)
bool qore_v8_env_desc_field(v8::Local<v8::Context> context, v8::Local<v8::Object> desc, const char* field,
        v8::Local<v8::Value>& value, bool& found) {
    v8::Isolate* isolate = context->GetIsolate();
    v8::Local<v8::String> key;
    if (!v8::String::NewFromUtf8(isolate, field).ToLocal(&key) || !desc->HasOwnProperty(context, key).To(&found)) {
        return false;
    }
    if (found && !desc->Get(context, key).ToLocal(&value)) {
        return false;
    }
    return true;
}

//! Raises Node's ERR_INVALID_OBJECT_DEFINE_PROPERTY error for a descriptor that process.env does not accept
void qore_v8_env_throw_define_error(v8::Isolate* isolate, v8::Local<v8::Context> context, const char* msg) {
    v8::Local<v8::String> str;
    if (!v8::String::NewFromUtf8(isolate, msg).ToLocal(&str)) {
        return;
    }
    v8::Local<v8::Value> err = v8::Exception::TypeError(str);
    v8::Local<v8::String> code;
    if (err->IsObject() && v8::String::NewFromUtf8(isolate, "ERR_INVALID_OBJECT_DEFINE_PROPERTY").ToLocal(&code)) {
        // a data property: no setter runs
        err.As<v8::Object>()->CreateDataProperty(context, v8::String::NewFromUtf8Literal(isolate, "code"),
            code).IsJust();
    }
    isolate->ThrowException(err);
}

//! define(store, name, descriptor): defines the variable as Node's process.env does: only a configurable, writable and
//! enumerable data descriptor is accepted
void qore_v8_env_define(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Object> store;
    v8::Local<v8::Name> name;
    if (!qore_v8_env_store(info, store) || !qore_v8_env_name(info, name)) {
        return;
    }
    v8::Isolate* isolate = info.GetIsolate();
    if (info.Length() < 3 || !info[2]->IsObject()) {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(isolate,
            "the process environment bridge requires a property descriptor")));
        return;
    }
    v8::Local<v8::Context> context = isolate->GetCurrentContext();
    v8::Local<v8::Object> d = info[2].As<v8::Object>();

    // the descriptor is read before the lock is acquired
    v8::Local<v8::Value> value, writable, enumerable, configurable, get, set;
    bool has_value = false, has_writable = false, has_enumerable = false, has_configurable = false, has_get = false,
        has_set = false;
    if (!qore_v8_env_desc_field(context, d, "value", value, has_value)
        || !qore_v8_env_desc_field(context, d, "writable", writable, has_writable)
        || !qore_v8_env_desc_field(context, d, "enumerable", enumerable, has_enumerable)
        || !qore_v8_env_desc_field(context, d, "configurable", configurable, has_configurable)
        || !qore_v8_env_desc_field(context, d, "get", get, has_get)
        || !qore_v8_env_desc_field(context, d, "set", set, has_set)) {
        return;
    }
    // Node's rules (EnvDefiner() in node_env_var.cc) are applied here, and Node's error is raised: V8 11 (Node 20)
    // does not raise the error of an interceptor's definer called through v8::Object::DefineProperty(), so the
    // descriptor was accepted and ignored there
    if (has_value) {
        if (!has_writable || !has_enumerable || !has_configurable || !writable->BooleanValue(isolate)
            || !enumerable->BooleanValue(isolate) || !configurable->BooleanValue(isolate)) {
            qore_v8_env_throw_define_error(isolate, context,
                "'process.env' only accepts a configurable, writable, and enumerable data descriptor");
            return;
        }
        // the only descriptor that Node accepts: it sets the variable as an assignment does; the name and value are
        // converted to strings before the lock is acquired (a symbol raises TypeError, as in Node)
        v8::Local<v8::String> key, str;
        if (!name->ToString(context).ToLocal(&key) || !value->ToString(context).ToLocal(&str)) {
            return;
        }
        AtomicEnvironmentSetter env_lock;
        if (store->Set(context, key, str).IsJust()) {
            info.GetReturnValue().Set(true);
        }
        return;
    }
    if (has_get || has_set) {
        qore_v8_env_throw_define_error(isolate, context,
            "'process.env' does not accept an accessor(getter/setter) descriptor");
        return;
    }
    qore_v8_env_throw_define_error(isolate, context,
        "'process.env' only accepts a configurable, writable, and enumerable data descriptor");
}
}

v8::MaybeLocal<v8::Object> qore_v8_create_env_bridge(v8::Isolate* isolate, v8::Local<v8::Context> context) {
    static const struct {
        const char* name;
        v8::FunctionCallback callback;
    } functions[] = {
        {"get", qore_v8_env_get},
        {"has", qore_v8_env_has},
        {"keys", qore_v8_env_keys},
        {"descriptor", qore_v8_env_descriptor},
        {"set", qore_v8_env_set},
        {"delete", qore_v8_env_delete},
        {"define", qore_v8_env_define},
    };

    v8::Local<v8::Object> bridge = v8::Object::New(isolate);
    for (const auto& i : functions) {
        v8::Local<v8::Function> func;
        v8::Local<v8::String> key;
        if (!v8::Function::New(context, i.callback).ToLocal(&func)
            || !v8::String::NewFromUtf8(isolate, i.name).ToLocal(&key)
            || !bridge->CreateDataProperty(context, key, func).FromMaybe(false)) {
            return v8::MaybeLocal<v8::Object>();
        }
    }
    return bridge;
}
