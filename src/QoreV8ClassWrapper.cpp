/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8ClassWrapper.cpp wraps Qore classes as V8 constructor functions */
/*
    QoreV8ClassWrapper.cpp

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

#include "QoreV8ClassWrapper.h"
#include "QoreV8Program.h"

#include <vector>

void QoreV8ClassWrapper::addAncestorMethods(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, v8::Local<v8::FunctionTemplate> tmpl, const QoreClass& cls,
        std::set<std::string>& instance_methods, std::set<std::string>& static_methods,
        std::set<std::string>& constants) {
    // Add instance methods from this class
    {
        QoreMethodIterator it(cls);
        while (it.next()) {
            const QoreMethod* m = it.getMethod();
            method_type_e mt = m->getMethodType();
            if (mt == MT_Constructor || mt == MT_Destructor || mt == MT_Copy) {
                continue;
            }
            if (m->getAccess() > Public) {
                continue;
            }

            const char* mname = m->getName();
            if (!instance_methods.insert(mname).second) {
                continue;  // already added
            }

            v8::MaybeLocal<v8::String> method_name = v8::String::NewFromUtf8(isolate, mname);
            if (method_name.IsEmpty()) {
                continue;
            }

            QoreV8MethodData* mdata = new QoreV8MethodData(pgm, mname, &cls);
            pgm->trackMethodData(mdata);
            v8::Local<v8::External> mext = v8::External::New(isolate, mdata);

            v8::Local<v8::FunctionTemplate> method_tmpl = v8::FunctionTemplate::New(
                isolate, method_callback, mext);
            tmpl->PrototypeTemplate()->Set(method_name.ToLocalChecked(), method_tmpl);
        }
    }

    // Add static methods from this class
    {
        QoreStaticMethodIterator it(cls);
        while (it.next()) {
            const QoreMethod* m = it.getMethod();
            if (m->getAccess() > Public) {
                continue;
            }

            const char* mname = m->getName();
            if (!static_methods.insert(mname).second) {
                continue;  // already added
            }

            v8::MaybeLocal<v8::String> method_name = v8::String::NewFromUtf8(isolate, mname);
            if (method_name.IsEmpty()) {
                continue;
            }

            QoreV8MethodData* mdata = new QoreV8MethodData(pgm, mname, &cls);
            pgm->trackMethodData(mdata);
            v8::Local<v8::External> mext = v8::External::New(isolate, mdata);

            v8::Local<v8::FunctionTemplate> method_tmpl = v8::FunctionTemplate::New(
                isolate, static_method_callback, mext);
            tmpl->Set(method_name.ToLocalChecked(), method_tmpl);
        }
    }

    // Add constants from this class
    {
        QoreClassConstantIterator it(cls);
        while (it.next()) {
            const QoreExternalConstant& c = it.get();
            if (c.getAccess() > Public) {
                continue;
            }

            const char* cname = c.getName();
            if (!constants.insert(cname).second) {
                continue;  // already added
            }

            v8::MaybeLocal<v8::String> const_name = v8::String::NewFromUtf8(isolate, cname);
            if (const_name.IsEmpty()) {
                continue;
            }

            ExceptionSink xsink;
            QoreValue val = c.getReferencedValue();
            v8::Local<v8::Value> v8val = pgm->getV8Value(val, &xsink);
            val.discard(&xsink);
            if (xsink) {
                continue;
            }

            tmpl->Set(const_name.ToLocalChecked(), v8val, static_cast<v8::PropertyAttribute>(v8::ReadOnly));
        }
    }

    // Recurse into this class's parents
    QoreParentClassIterator pit(cls);
    while (pit.next()) {
        if (pit.getAccess() > Private) {
            continue;
        }
        addAncestorMethods(isolate, context, pgm, tmpl, pit.getParentClass(),
            instance_methods, static_methods, constants);
    }
}

v8::Local<v8::Value> QoreV8ClassWrapper::create(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreClass& cls) {
    v8::Local<v8::FunctionTemplate> tmpl = getOrCreateTemplate(isolate, context, pgm, cls);
    v8::MaybeLocal<v8::Function> func = tmpl->GetFunction(context);
    if (func.IsEmpty()) {
        return v8::Null(isolate);
    }
    return func.ToLocalChecked();
}

v8::Local<v8::FunctionTemplate> QoreV8ClassWrapper::getOrCreateTemplate(v8::Isolate* isolate,
        v8::Local<v8::Context> context, QoreV8Program* pgm, const QoreClass& cls) {
    // Check cache
    v8::Local<v8::FunctionTemplate> cached = pgm->getClassTemplate(cls);
    if (!cached.IsEmpty()) {
        return cached;
    }

    // Create class data for the constructor callback
    QoreV8ClassData* cls_data = new QoreV8ClassData(pgm, &cls);
    pgm->trackClassData(cls_data);
    v8::Local<v8::External> ext = v8::External::New(isolate, cls_data);

    // Create the FunctionTemplate for the constructor
    v8::Local<v8::FunctionTemplate> tmpl = v8::FunctionTemplate::New(isolate, constructor_callback, ext);

    // Set the class name for debugging/toString
    v8::MaybeLocal<v8::String> class_name = v8::String::NewFromUtf8(isolate, cls.getName());
    if (!class_name.IsEmpty()) {
        tmpl->SetClassName(class_name.ToLocalChecked());
    }

    // Set internal field count for storing QoreObject*
    tmpl->InstanceTemplate()->SetInternalFieldCount(1);

    // Track method/constant names to avoid duplicates across inheritance
    std::set<std::string> instance_methods;
    std::set<std::string> static_methods;
    std::set<std::string> constant_names;

    // Set up parent class inheritance: use Inherit() for first parent, collect additional parents
    std::vector<const QoreClass*> additional_parents;
    {
        bool first_parent = true;
        QoreParentClassIterator pit(cls);
        while (pit.next()) {
            if (pit.getAccess() > Private) {
                continue;
            }
            if (first_parent) {
                // Use V8's Inherit() for the first accessible parent (for instanceof + prototype chain)
                v8::Local<v8::FunctionTemplate> parent_tmpl = getOrCreateTemplate(isolate, context, pgm,
                    pit.getParentClass());
                tmpl->Inherit(parent_tmpl);
                first_parent = false;
            } else {
                additional_parents.push_back(&pit.getParentClass());
            }
        }
    }

    // Add instance methods to prototype
    {
        QoreMethodIterator it(cls);
        while (it.next()) {
            const QoreMethod* m = it.getMethod();
            // Skip constructors, destructors, copy methods, and non-public methods
            method_type_e mt = m->getMethodType();
            if (mt == MT_Constructor || mt == MT_Destructor || mt == MT_Copy) {
                continue;
            }
            if (m->getAccess() > Public) {
                continue;
            }

            const char* mname = m->getName();
            // Track own methods to prevent duplicates from ancestor traversal
            instance_methods.insert(mname);

            v8::MaybeLocal<v8::String> method_name = v8::String::NewFromUtf8(isolate, mname);
            if (method_name.IsEmpty()) {
                continue;
            }

            QoreV8MethodData* mdata = new QoreV8MethodData(pgm, mname, &cls);
            pgm->trackMethodData(mdata);
            v8::Local<v8::External> mext = v8::External::New(isolate, mdata);

            v8::Local<v8::FunctionTemplate> method_tmpl = v8::FunctionTemplate::New(
                isolate, method_callback, mext);
            tmpl->PrototypeTemplate()->Set(method_name.ToLocalChecked(), method_tmpl);
        }
    }

    // Add static methods as properties on the function itself
    {
        QoreStaticMethodIterator it(cls);
        while (it.next()) {
            const QoreMethod* m = it.getMethod();
            if (m->getAccess() > Public) {
                continue;
            }

            const char* mname = m->getName();
            // Track own static methods to prevent duplicates from ancestor traversal
            static_methods.insert(mname);

            v8::MaybeLocal<v8::String> method_name = v8::String::NewFromUtf8(isolate, mname);
            if (method_name.IsEmpty()) {
                continue;
            }

            QoreV8MethodData* mdata = new QoreV8MethodData(pgm, mname, &cls);
            pgm->trackMethodData(mdata);
            v8::Local<v8::External> mext = v8::External::New(isolate, mdata);

            v8::Local<v8::FunctionTemplate> method_tmpl = v8::FunctionTemplate::New(
                isolate, static_method_callback, mext);

            // Static methods go on the function template itself, not the prototype
            tmpl->Set(method_name.ToLocalChecked(), method_tmpl);
        }
    }

    // Add class constants as properties on the constructor
    {
        QoreClassConstantIterator it(cls);
        while (it.next()) {
            const QoreExternalConstant& c = it.get();
            if (c.getAccess() > Public) {
                continue;
            }

            const char* cname = c.getName();
            // Track own constants to prevent duplicates from ancestor traversal
            constant_names.insert(cname);

            v8::MaybeLocal<v8::String> const_name = v8::String::NewFromUtf8(isolate, cname);
            if (const_name.IsEmpty()) {
                continue;
            }

            ExceptionSink xsink;
            QoreValue val = c.getReferencedValue();
            v8::Local<v8::Value> v8val = pgm->getV8Value(val, &xsink);
            val.discard(&xsink);
            if (xsink) {
                continue;
            }

            tmpl->Set(const_name.ToLocalChecked(), v8val, static_cast<v8::PropertyAttribute>(v8::ReadOnly));
        }
    }

    // Add methods from additional parent hierarchies (multiple inheritance)
    for (const QoreClass* parent : additional_parents) {
        addAncestorMethods(isolate, context, pgm, tmpl, *parent,
            instance_methods, static_methods, constant_names);
    }

    // Build the member cache once per class template (avoids O(n) iterator scan per access)
    QoreV8MemberHandlerData* mhdata = new QoreV8MemberHandlerData(pgm, cls);
    pgm->trackMemberHandlerData(mhdata);

    // Add named property handler for instance member access (get/set public members)
    v8::Local<v8::External> mh_ext = v8::External::New(isolate, mhdata);
    v8::NamedPropertyHandlerConfiguration member_config(
        member_getter,
        member_setter,
        member_query,
        nullptr,                                  // no deleter
        member_enumerator,
        mh_ext,
        v8::PropertyHandlerFlags::kNonMasking     // don't shadow prototype methods
    );
    tmpl->InstanceTemplate()->SetHandler(member_config);

    // Cache the template
    pgm->cacheClassTemplate(cls, isolate, tmpl);

    return tmpl;
}

void QoreV8ClassWrapper::constructor_callback(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();

    // Must be called with 'new'
    if (!info.IsConstructCall()) {
        ExceptionSink xsink;
        xsink.raiseException("JAVASCRIPT-CONSTRUCTOR-ERROR", "Class constructor must be called with 'new'");
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    v8::Local<v8::Value> v = info.Data();
    assert(v->IsExternal());
    QoreV8ClassData* cls_data = reinterpret_cast<QoreV8ClassData*>(
        v8::Local<v8::External>::Cast(v)->Value());

    ExceptionSink xsink;
    QoreV8Program* pgm = cls_data->pgm;
    const QoreClass* cls = cls_data->cls;

    // Marshal arguments
    ReferenceHolder<QoreListNode> args(&xsink);
    int len = info.Length();
    if (len) {
        args = new QoreListNode(autoTypeInfo);
        for (int i = 0; i < len; ++i) {
            ValueHolder arg(pgm->getQoreValue(&xsink, info[i]), &xsink);
            if (xsink) {
                QoreV8Program::raiseV8Exception(xsink, isolate);
                return;
            }
            args->push(arg.release(), &xsink);
            assert(!xsink);
        }
    }

    // Create the Qore object
    QoreObject* qobj = cls->execConstructor(*args, &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }
    if (!qobj) {
        xsink.raiseException("JAVASCRIPT-CONSTRUCTOR-ERROR", "Failed to create object of class '%s'",
            cls->getName());
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    // Store the QoreObject in the JS object's internal field
    v8::Local<v8::Object> js_obj = info.This();
    qobj->tRef();
    js_obj->SetAlignedPointerInInternalField(0, qobj);

    // Set up weak reference so the QoreObject is dereferenced when the JS object is GC'd
    QoreV8ObjectRef* obj_ref = new QoreV8ObjectRef(isolate, js_obj, qobj, pgm);
    obj_ref->persistent.SetWeak(obj_ref, weak_callback, v8::WeakCallbackType::kParameter);
    pgm->trackObjectRef(obj_ref);

    // Save the Qore reference so it's not collected prematurely (takes its own reference)
    pgm->saveQoreReference(qobj, xsink);
    // Release the original constructor reference; the save list holds its own ref,
    // and tRef() keeps the C++ memory alive for V8
    qobj->deref(&xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    info.GetReturnValue().Set(js_obj);
}

void QoreV8ClassWrapper::method_callback(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    v8::Local<v8::Value> v = info.Data();
    assert(v->IsExternal());

    QoreV8MethodData* mdata = reinterpret_cast<QoreV8MethodData*>(
        v8::Local<v8::External>::Cast(v)->Value());

    ExceptionSink xsink;
    QoreV8Program* pgm = mdata->pgm;

    // Extract QoreObject from 'this'
    v8::Local<v8::Object> js_this = info.This();

    // Get the QoreObject from the internal field
    QoreObject* qobj = nullptr;
    if (js_this->InternalFieldCount() > 0) {
        qobj = reinterpret_cast<QoreObject*>(js_this->GetAlignedPointerFromInternalField(0));
    }

    if (!qobj) {
        xsink.raiseException("JAVASCRIPT-METHOD-ERROR",
            "Cannot call method '%s': no Qore object associated with this JavaScript object",
            mdata->method_name.c_str());
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    // Marshal arguments
    ReferenceHolder<QoreListNode> args(&xsink);
    int len = info.Length();
    if (len) {
        args = new QoreListNode(autoTypeInfo);
        for (int i = 0; i < len; ++i) {
            ValueHolder arg(pgm->getQoreValue(&xsink, info[i]), &xsink);
            if (xsink) {
                QoreV8Program::raiseV8Exception(xsink, isolate);
                return;
            }
            args->push(arg.release(), &xsink);
            assert(!xsink);
        }
    }

    // Call the method
    ValueHolder rv(qobj->evalMethod(mdata->method_name.c_str(), *args, &xsink), &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    // Marshal return value
    v8::Local<v8::Value> v8rv = pgm->getV8Value(*rv, &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }
    info.GetReturnValue().Set(v8rv);
}

void QoreV8ClassWrapper::static_method_callback(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    v8::Local<v8::Value> v = info.Data();
    assert(v->IsExternal());

    QoreV8MethodData* mdata = reinterpret_cast<QoreV8MethodData*>(
        v8::Local<v8::External>::Cast(v)->Value());

    ExceptionSink xsink;
    QoreV8Program* pgm = mdata->pgm;
    const QoreClass* cls = mdata->cls;

    // Find the static method
    const QoreMethod* m = cls->findStaticMethod(mdata->method_name.c_str());
    if (!m) {
        xsink.raiseException("JAVASCRIPT-METHOD-ERROR", "Static method '%s' not found in class '%s'",
            mdata->method_name.c_str(), cls->getName());
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    // Marshal arguments
    ReferenceHolder<QoreListNode> args(&xsink);
    int len = info.Length();
    if (len) {
        args = new QoreListNode(autoTypeInfo);
        for (int i = 0; i < len; ++i) {
            ValueHolder arg(pgm->getQoreValue(&xsink, info[i]), &xsink);
            if (xsink) {
                QoreV8Program::raiseV8Exception(xsink, isolate);
                return;
            }
            args->push(arg.release(), &xsink);
            assert(!xsink);
        }
    }

    // Call the static method
    ValueHolder rv(QoreObject::evalStaticMethod(*m, *args, &xsink), &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    // Marshal return value
    v8::Local<v8::Value> v8rv = pgm->getV8Value(*rv, &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }
    info.GetReturnValue().Set(v8rv);
}

v8::Local<v8::Object> QoreV8ClassWrapper::wrapExistingObject(v8::Isolate* isolate,
        v8::Local<v8::Context> context, QoreV8Program* pgm, QoreObject* qobj) {
    const QoreClass* cls = qobj->getClass();

    // Get or create the FunctionTemplate for this class
    v8::Local<v8::FunctionTemplate> tmpl = getOrCreateTemplate(isolate, context, pgm, *cls);

    // Create an instance from the template without calling the constructor
    v8::MaybeLocal<v8::Object> maybe_obj = tmpl->InstanceTemplate()->NewInstance(context);
    if (maybe_obj.IsEmpty()) {
        return v8::Local<v8::Object>();
    }

    v8::Local<v8::Object> js_obj = maybe_obj.ToLocalChecked();

    // Store the QoreObject in the internal field
    qobj->tRef();
    js_obj->SetAlignedPointerInInternalField(0, qobj);

    // Set up weak reference for GC cleanup
    QoreV8ObjectRef* obj_ref = new QoreV8ObjectRef(isolate, js_obj, qobj, pgm);
    obj_ref->persistent.SetWeak(obj_ref, weak_callback, v8::WeakCallbackType::kParameter);
    pgm->trackObjectRef(obj_ref);

    // Save the Qore reference
    ExceptionSink xsink;
    pgm->saveQoreReference(qobj, xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return v8::Local<v8::Object>();
    }

    return js_obj;
}

void QoreV8ClassWrapper::weak_callback(const v8::WeakCallbackInfo<QoreV8ObjectRef>& data) {
    QoreV8ObjectRef* ref = data.GetParameter();
    if (ref->qobj) {
        ref->qobj->tDeref();
    }
    ref->pgm->untrackObjectRef(ref);
    ref->persistent.Reset();
    delete ref;
}

#if V8_MAJOR_VERSION >= 12
v8::Intercepted QoreV8ClassWrapper::member_getter(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Value>& info) {
#else
void QoreV8ClassWrapper::member_getter(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Value>& info) {
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
    if (holder->InternalFieldCount() < 1) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    QoreObject* qobj = reinterpret_cast<QoreObject*>(
        holder->GetAlignedPointerFromInternalField(0));
    if (!qobj) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    // Get cached member metadata from the handler data (O(1) lookup)
    v8::Local<v8::Value> data = info.Data();
    assert(data->IsExternal());
    QoreV8MemberHandlerData* mhdata = reinterpret_cast<QoreV8MemberHandlerData*>(
        v8::Local<v8::External>::Cast(data)->Value());
    assert(mhdata);

    auto it = mhdata->members.find(name);
    if (it == mhdata->members.end()) {
        // Not a declared member — let V8 handle normally
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    if (it->second != Public) {
        ExceptionSink xsink;
        xsink.raiseException("JAVASCRIPT-MEMBER-ACCESS-ERROR",
            "cannot access private/internal member '%s' of class '%s'", name,
            qobj->getClassName());
        QoreV8Program::raiseV8Exception(xsink, isolate);
#if V8_MAJOR_VERSION >= 12
        // V8 12+ requires a return value when returning kYes; set placeholder since exception is pending
        info.GetReturnValue().Set(v8::Null(isolate));
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // Get the member value
    ExceptionSink xsink;
    ValueHolder val(qobj->getReferencedMemberNoMethod(name, &xsink), &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
#if V8_MAJOR_VERSION >= 12
        info.GetReturnValue().Set(v8::Null(isolate));
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    v8::Local<v8::Value> v8val = mhdata->pgm->getV8Value(*val, &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
#if V8_MAJOR_VERSION >= 12
        info.GetReturnValue().Set(v8::Null(isolate));
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    info.GetReturnValue().Set(v8val);
#if V8_MAJOR_VERSION >= 12
    return v8::Intercepted::kYes;
#endif
}

#if V8_MAJOR_VERSION >= 12
v8::Intercepted QoreV8ClassWrapper::member_setter(v8::Local<v8::Name> property,
        v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<void>& info) {
#else
void QoreV8ClassWrapper::member_setter(v8::Local<v8::Name> property,
        v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<v8::Value>& info) {
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
    if (holder->InternalFieldCount() < 1) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    QoreObject* qobj = reinterpret_cast<QoreObject*>(
        holder->GetAlignedPointerFromInternalField(0));
    if (!qobj) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    // Get cached member metadata from the handler data (O(1) lookup)
    v8::Local<v8::Value> data = info.Data();
    assert(data->IsExternal());
    QoreV8MemberHandlerData* mhdata = reinterpret_cast<QoreV8MemberHandlerData*>(
        v8::Local<v8::External>::Cast(data)->Value());
    assert(mhdata);

    auto it = mhdata->members.find(name);
    if (it == mhdata->members.end()) {
        // Not a declared member — let V8 handle normally (allows JS-only properties)
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    if (it->second != Public) {
        ExceptionSink xsink;
        xsink.raiseException("JAVASCRIPT-MEMBER-ACCESS-ERROR",
            "cannot set private/internal member '%s' of class '%s'", name,
            qobj->getClassName());
        QoreV8Program::raiseV8Exception(xsink, isolate);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // Convert V8 value to QoreValue
    ExceptionSink xsink;
    ValueHolder qval(mhdata->pgm->getQoreValue(&xsink, value), &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

    // Set the member value
    qobj->setValue(name, qval.release(), &xsink);
    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kYes;
#else
        return;
#endif
    }

#if V8_MAJOR_VERSION >= 12
    return v8::Intercepted::kYes;
#endif
}

#if V8_MAJOR_VERSION >= 12
v8::Intercepted QoreV8ClassWrapper::member_query(v8::Local<v8::Name> property,
        const v8::PropertyCallbackInfo<v8::Integer>& info) {
#else
void QoreV8ClassWrapper::member_query(v8::Local<v8::Name> property,
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
    if (holder->InternalFieldCount() < 1) {
#if V8_MAJOR_VERSION >= 12
        return v8::Intercepted::kNo;
#else
        return;
#endif
    }

    // Get cached member metadata from the handler data (O(1) lookup)
    v8::Local<v8::Value> data = info.Data();
    assert(data->IsExternal());
    QoreV8MemberHandlerData* mhdata = reinterpret_cast<QoreV8MemberHandlerData*>(
        v8::Local<v8::External>::Cast(data)->Value());
    assert(mhdata);

    auto it = mhdata->members.find(name);
    if (it != mhdata->members.end() && it->second == Public) {
        // Public member: writable, enumerable, non-deletable
        info.GetReturnValue().Set(v8::Integer::New(isolate, v8::DontDelete));
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

void QoreV8ClassWrapper::member_enumerator(const v8::PropertyCallbackInfo<v8::Array>& info) {
    v8::Isolate* isolate = info.GetIsolate();

    // Get cached member metadata from the handler data
    v8::Local<v8::Value> data = info.Data();
    assert(data->IsExternal());
    QoreV8MemberHandlerData* mhdata = reinterpret_cast<QoreV8MemberHandlerData*>(
        v8::Local<v8::External>::Cast(data)->Value());
    assert(mhdata);

    std::vector<v8::Local<v8::Value>> names;
    names.reserve(mhdata->public_member_names.size());
    for (const std::string& mname : mhdata->public_member_names) {
        v8::MaybeLocal<v8::String> s = v8::String::NewFromUtf8(isolate, mname.c_str());
        if (!s.IsEmpty()) {
            names.push_back(s.ToLocalChecked());
        }
    }

    v8::Local<v8::Array> result = v8::Array::New(isolate, names.data(), names.size());
    info.GetReturnValue().Set(result);
}
