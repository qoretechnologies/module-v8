/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8NamespaceWrapper.h

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

#ifndef _QORE_V8_NAMESPACE_WRAPPER_H
#define _QORE_V8_NAMESPACE_WRAPPER_H

#include "v8-module.h"

#include <map>
#include <string>

// forward declarations
class QoreV8Program;

//! Data associated with a namespace wrapper V8 object
struct QoreV8NamespaceData {
    const QoreNamespace* ns;
    QoreV8Program* pgm;
    //! Persistent handle for the V8 wrapper object (prevents premature GC and allows cleanup)
    v8::Global<v8::Object> persistent;
    //! Cache of wrapped children to avoid re-creating on repeated access
    std::map<std::string, v8::Global<v8::Value>> cache;

    DLLLOCAL QoreV8NamespaceData(const QoreNamespace* ns, QoreV8Program* pgm) : ns(ns), pgm(pgm) {
    }
};

//! Data associated with a function callback
struct QoreV8FunctionData {
    QoreV8Program* pgm;
    std::string func_path;  //!< fully qualified function path for callFunction()

    DLLLOCAL QoreV8FunctionData(QoreV8Program* pgm, const std::string& func_path)
        : pgm(pgm), func_path(func_path) {
    }
};

//! Wraps a Qore namespace as a V8 object with named property interceptors
class QoreV8NamespaceWrapper {
public:
    //! Creates a V8 object representing the given Qore namespace
    DLLLOCAL static v8::Local<v8::Object> create(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreNamespace& ns);

private:
    //! Named property getter interceptor
    static void getter(v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value>& info);

    //! Named property enumerator interceptor
    static void enumerator(const v8::PropertyCallbackInfo<v8::Array>& info);

    //! Named property query interceptor
    static void query(v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Integer>& info);

    //! Weak callback to clean up namespace data when the V8 object is garbage collected
    static void weak_callback(const v8::WeakCallbackInfo<QoreV8NamespaceData>& data);

    //! Creates a V8 function wrapper for a Qore namespace function
    static v8::Local<v8::Value> wrapFunction(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreNamespace& ns, const char* name);

    //! Callback for wrapped namespace functions
    static void call_function(const v8::FunctionCallbackInfo<v8::Value>& info);

    //! Creates a V8 object wrapper for a Qore enum
    static v8::Local<v8::Value> wrapEnum(v8::Isolate* isolate, v8::Local<v8::Context> context,
        QoreV8Program* pgm, const QoreEnumDecl& ed);
};

#endif
