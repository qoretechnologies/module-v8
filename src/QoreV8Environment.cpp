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

// the result of a named property interceptor: V8 12 and later return whether the operation was intercepted
#if V8_MAJOR_VERSION >= 12
#define QORE_V8_ENV_INTERCEPTED v8::Intercepted
#define QORE_V8_ENV_YES return v8::Intercepted::kYes
#define QORE_V8_ENV_NO return v8::Intercepted::kNo
// the setter and definer of V8 12 and later have no return value
#define QORE_V8_ENV_SET_INFO v8::PropertyCallbackInfo<void>
#else
#define QORE_V8_ENV_INTERCEPTED void
#define QORE_V8_ENV_YES return
#define QORE_V8_ENV_NO return
#define QORE_V8_ENV_SET_INFO v8::PropertyCallbackInfo<v8::Value>
#endif

namespace {
//! Returns Node's original process.env object, the data of the interceptors
template <typename T>
v8::Local<v8::Object> qore_v8_env_store(const v8::PropertyCallbackInfo<T>& info) {
    return info.Data().template As<v8::Object>();
}

//! Returns true if the given variable is set; the caller holds the environment lock
/** Node's query interceptor answers, so no JavaScript code runs; false is also returned if an exception is pending
*/
bool qore_v8_env_exists(v8::Local<v8::Context> context, v8::Local<v8::Object> store, v8::Local<v8::Name> name) {
    bool exists;
    return store->HasOwnProperty(context, name).To(&exists) && exists;
}

//! Sets a variable as Node's process.env setter does; returns false if an exception is pending
/** The name and the value are converted to strings before the lock is acquired, so that no JavaScript code (such as
    a toString() method) runs while it is held; a symbol raises TypeError, as in Node
*/
bool qore_v8_env_set(v8::Isolate* isolate, v8::Local<v8::Object> store, v8::Local<v8::Name> property,
        v8::Local<v8::Value> value) {
    v8::Local<v8::Context> context = isolate->GetCurrentContext();
    v8::Local<v8::String> name, str;
    if (!property->ToString(context).ToLocal(&name) || !value->ToString(context).ToLocal(&str)) {
        return false;
    }
    // Node's setter changes the environment and, for TZ, calls tzset() and makes V8 detect the time zone again
    AtomicEnvironmentSetter env_lock;
    return store->Set(context, name, str).IsJust();
}

QORE_V8_ENV_INTERCEPTED qore_v8_env_getter(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Value>& info) {
    // a symbol is never a variable, and Node does not look it up any further
    if (property->IsSymbol()) {
        info.GetReturnValue().SetUndefined();
        QORE_V8_ENV_YES;
    }
    v8::Local<v8::Object> store = qore_v8_env_store(info);
    v8::Isolate* isolate = info.GetIsolate();
    v8::Local<v8::Context> context = isolate->GetCurrentContext();
    QoreEnvironmentReadLock env_lock;
    // a name that is not a variable is looked up in the prototype chain, after the lock is released
    if (!qore_v8_env_exists(context, store, property)) {
        QORE_V8_ENV_NO;
    }
    v8::Local<v8::Value> value;
    if (store->Get(context, property).ToLocal(&value)) {
        info.GetReturnValue().Set(value);
    }
    QORE_V8_ENV_YES;
}

QORE_V8_ENV_INTERCEPTED qore_v8_env_setter(v8::Local<v8::Name> property, v8::Local<v8::Value> value,
        const QORE_V8_ENV_SET_INFO& info) {
    if (qore_v8_env_set(info.GetIsolate(), qore_v8_env_store(info), property, value)) {
#if V8_MAJOR_VERSION < 12
        // the return value makes the assignment intercepted, as in Node's setter
        info.GetReturnValue().Set(value);
#endif
    }
    QORE_V8_ENV_YES;
}

QORE_V8_ENV_INTERCEPTED qore_v8_env_query(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Integer>& info) {
    if (!property->IsString()) {
        QORE_V8_ENV_NO;
    }
    v8::Local<v8::Object> store = qore_v8_env_store(info);
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    QoreEnvironmentReadLock env_lock;
    if (!qore_v8_env_exists(context, store, property)) {
        QORE_V8_ENV_NO;
    }
    // a variable is writable, enumerable and configurable
    info.GetReturnValue().Set(static_cast<int32_t>(v8::None));
    QORE_V8_ENV_YES;
}

QORE_V8_ENV_INTERCEPTED qore_v8_env_deleter(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Boolean>& info) {
    if (property->IsString()) {
        v8::Local<v8::Object> store = qore_v8_env_store(info);
        v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
        AtomicEnvironmentSetter env_lock;
        if (store->Delete(context, property).IsNothing()) {
            QORE_V8_ENV_YES;
        }
    }
    // process.env has no non-configurable properties, so delete always succeeds, as in Node
    info.GetReturnValue().Set(true);
    QORE_V8_ENV_YES;
}

void qore_v8_env_enumerator(const v8::PropertyCallbackInfo<v8::Array>& info) {
    v8::Local<v8::Object> store = qore_v8_env_store(info);
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    QoreEnvironmentReadLock env_lock;
    v8::Local<v8::Array> names;
    if (store->GetOwnPropertyNames(context,
            static_cast<v8::PropertyFilter>(v8::PropertyFilter::ONLY_ENUMERABLE | v8::PropertyFilter::SKIP_SYMBOLS),
            v8::KeyConversionMode::kConvertToString).ToLocal(&names)) {
        info.GetReturnValue().Set(names);
    }
}

QORE_V8_ENV_INTERCEPTED qore_v8_env_definer(v8::Local<v8::Name> property, const v8::PropertyDescriptor& desc,
        const QORE_V8_ENV_SET_INFO& info) {
    v8::Local<v8::Object> store = qore_v8_env_store(info);
    if (desc.has_value() && desc.has_writable() && desc.has_enumerable() && desc.has_configurable()
        && desc.writable() && desc.enumerable() && desc.configurable()) {
        // the only descriptor that Node accepts: it sets the variable
        if (qore_v8_env_set(info.GetIsolate(), store, property, desc.value())) {
#if V8_MAJOR_VERSION < 12
            // the return value makes the definition intercepted, so that no own property is defined on the object
            info.GetReturnValue().Set(desc.value());
#endif
        }
        QORE_V8_ENV_YES;
    }
    // Node refuses any other descriptor with ERR_INVALID_OBJECT_DEFINE_PROPERTY without using the environment, so the
    // descriptor is passed to it without the lock
    store->DefineProperty(info.GetIsolate()->GetCurrentContext(), property,
        const_cast<v8::PropertyDescriptor&>(desc)).IsJust();
    QORE_V8_ENV_YES;
}

//! wrap(store): returns a new process.env object for Node's original process.env object
void qore_v8_env_wrap(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    if (info.Length() < 1 || !info[0]->IsObject()) {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(isolate,
            "the process environment requires the original process.env object")));
        return;
    }
    v8::Local<v8::Context> context = isolate->GetCurrentContext();
    // created like Node's process.env template, with a constructor template, so that the object is an ordinary API
    // object that can be cloned and serialized as Node's can
    v8::Local<v8::ObjectTemplate> tmpl = v8::ObjectTemplate::New(isolate, v8::FunctionTemplate::New(isolate));
    // the interceptors read and change nothing but the environment, as Node's
    tmpl->SetHandler(v8::NamedPropertyHandlerConfiguration(qore_v8_env_getter, qore_v8_env_setter,
        qore_v8_env_query, qore_v8_env_deleter, qore_v8_env_enumerator, qore_v8_env_definer, nullptr, info[0],
        v8::PropertyHandlerFlags::kHasNoSideEffect));
    v8::Local<v8::Object> env;
    if (tmpl->NewInstance(context).ToLocal(&env)) {
        info.GetReturnValue().Set(env);
    }
}
}

v8::MaybeLocal<v8::Function> qore_v8_create_env_factory(v8::Local<v8::Context> context) {
    return v8::Function::New(context, qore_v8_env_wrap);
}
