/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8ClassWrapper.h

    Qore Programming Language

    Copyright (C) 2026 Qore Technologies, s.r.o.

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

    Note that the Qore library is released under a choice of three open-source
    licenses: MIT (as above), LGPL 2+, or GPL 2+; see README-LICENSE for more
    information.
*/

#ifndef _QORE_V8_CLASS_WRAPPER_H
#define _QORE_V8_CLASS_WRAPPER_H

#include "v8-module.h"

#include <set>
#include <string>

// forward declarations
class QoreV8Program;

//! Reference tracking for V8 objects wrapping QoreObjects
struct QoreV8ObjectRef {
    v8::Global<v8::Object> persistent;
    QoreObject* qobj;
    QoreV8Program* pgm;

    DLLLOCAL QoreV8ObjectRef(v8::Isolate* isolate, v8::Local<v8::Object> obj,
            QoreObject* qobj, QoreV8Program* pgm)
        : qobj(qobj), pgm(pgm) {
        persistent.Reset(isolate, obj);
    }
};

//! Wraps a Qore class as a V8 constructor function with prototype methods
class QoreV8ClassWrapper {
public:
    //! Creates a V8 constructor function for the given Qore class
    /** Returns the constructor function (callable with 'new')
    */
    DLLLOCAL static v8::Local<v8::Value> create(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreClass& cls);

    //! Wraps an existing QoreObject as a V8 object with the class's methods on its prototype
    DLLLOCAL static v8::Local<v8::Object> wrapExistingObject(v8::Isolate* isolate,
        v8::Local<v8::Context> context, QoreV8Program* pgm, QoreObject* qobj);

private:
    //! Creates or retrieves the FunctionTemplate for a class
    static v8::Local<v8::FunctionTemplate> getOrCreateTemplate(v8::Isolate* isolate,
        v8::Local<v8::Context> context, QoreV8Program* pgm, const QoreClass& cls);

    //! Constructor callback - called when JS does "new ClassName(...)"
    static void constructor_callback(const v8::FunctionCallbackInfo<v8::Value>& info);

    //! Normal (instance) method callback
    static void method_callback(const v8::FunctionCallbackInfo<v8::Value>& info);

    //! Static method callback
    static void static_method_callback(const v8::FunctionCallbackInfo<v8::Value>& info);

    //! Recursively adds methods, static methods, and constants from a class and its ancestors
    static void addAncestorMethods(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, v8::Local<v8::FunctionTemplate> tmpl, const QoreClass& cls,
        std::set<std::string>& instance_methods, std::set<std::string>& static_methods,
        std::set<std::string>& constants);

    //! Weak callback to clean up QoreObject ref when JS object is GC'd
    static void weak_callback(const v8::WeakCallbackInfo<QoreV8ObjectRef>& data);
};

//! Data associated with a class constructor callback
struct QoreV8ClassData {
    QoreV8Program* pgm;
    const QoreClass* cls;

    DLLLOCAL QoreV8ClassData(QoreV8Program* pgm, const QoreClass* cls) : pgm(pgm), cls(cls) {
    }
};

//! Data associated with a method callback
struct QoreV8MethodData {
    QoreV8Program* pgm;
    std::string method_name;
    const QoreClass* cls;

    DLLLOCAL QoreV8MethodData(QoreV8Program* pgm, const char* name, const QoreClass* cls)
        : pgm(pgm), method_name(name), cls(cls) {
    }
};

#endif
