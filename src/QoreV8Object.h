/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8Object.h

    Qore Programming Language

    Copyright (C) 2024 Qore Technologies, s.r.o.

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

#ifndef _QORE_CLASS_V8OBJECT

#define _QORE_CLASS_V8OBJECT

#include "v8-module.h"

#include <set>

// forward references
class QoreV8Program;
class QoreV8ProgramHelper;

class QoreV8Object : public AbstractPrivateData {
friend class QoreV8CallReference;
public:
    DLLLOCAL QoreV8Object(QoreV8Program* pgm, v8::Local<v8::Object> obj);

    DLLLOCAL virtual ~QoreV8Object();

    DLLLOCAL QoreV8Program* getProgram() {
        return pgm;
    }

    DLLLOCAL const QoreV8Program* getProgram() const {
        return pgm;
    }

    DLLLOCAL AbstractQoreNode* toData(QoreV8ProgramHelper& v8h) const;

    DLLLOCAL QoreStringNode* toString(QoreV8ProgramHelper& v8h) const;

    DLLLOCAL bool isCallable(QoreV8ProgramHelper& v8h) const;

    DLLLOCAL bool isConstructor(QoreV8ProgramHelper& v8h) const;

    DLLLOCAL QoreValue callAsFunction(QoreV8ProgramHelper& v8h, const QoreValue js_this, size_t offset = 0,
            const QoreListNode* args = nullptr);

    DLLLOCAL QoreValue callAsFunction(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> recv, size_t offset = 0,
        const QoreListNode* args = nullptr);

    DLLLOCAL v8::Local<v8::Object> get() const;

    DLLLOCAL v8::Local<v8::Value> get(ExceptionSink* xsink, v8::Isolate* isolate) const;

    DLLLOCAL v8::Local<v8::Value> getV8KeyValue(QoreV8ProgramHelper& v8h, const char* key) const;

    DLLLOCAL QoreValue getProperty(QoreV8ProgramHelper& v8h, const char* property);

    DLLLOCAL int setProperty(QoreV8ProgramHelper& v8h, const char* property, const QoreValue value);

    DLLLOCAL QoreValue getIndexValue(QoreV8ProgramHelper& v8h, int64 i);

    DLLLOCAL QoreListNode* getPropertyList(QoreV8ProgramHelper& v8h);

    DLLLOCAL QoreValue methodGate(ExceptionSink* xsink, QoreObject* self, const QoreStringNode* m,
            const QoreListNode* args);

    DLLLOCAL QoreValue memberGate(ExceptionSink* xsink, const QoreStringNode* m);

    DLLLOCAL QoreV8Object* refSelf() const {
        ref();
        return const_cast<QoreV8Object*>(this);
    }

    DLLLOCAL QoreObject* getReferencedProgram();

protected:
    DLLLOCAL AbstractQoreNode* toData(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> parent, v8::Set& objset) const;

    DLLLOCAL QoreHashNode* toHash(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> parent, v8::Set& objset,
            v8::Local<v8::Array> props, uint32_t len) const;

    DLLLOCAL QoreListNode* toList(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> parent, v8::Set& objset,
            v8::Local<v8::Array> props, uint32_t len) const;

    QoreV8Program* pgm;
    v8::Global<v8::Object> obj;
};

#endif