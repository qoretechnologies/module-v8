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

#ifndef _QORE_CLASS_V8PROMISE

#define _QORE_CLASS_V8PROMISE

#include "QoreV8Object.h"

class QoreV8Promise : public QoreV8Object {
public:
    DLLLOCAL QoreV8Promise(ExceptionSink* xsink, QoreV8Program* pgm, v8::Local<v8::Promise> obj);

    DLLLOCAL virtual ~QoreV8Promise() {
    }

    DLLLOCAL v8::Local<v8::Promise> get() const;

    DLLLOCAL int wait(QoreV8ProgramHelper& v8h);

    DLLLOCAL v8::MaybeLocal<v8::Promise> then(QoreV8ProgramHelper& v8h, const ResolvedCallReferenceNode* code,
            const ResolvedCallReferenceNode* rejected);
    DLLLOCAL v8::MaybeLocal<v8::Promise> doCatch(QoreV8ProgramHelper& v8h, const ResolvedCallReferenceNode* code);

    DLLLOCAL bool hasHandler(QoreV8ProgramHelper& v8h) const;

    DLLLOCAL v8::Promise::PromiseState getState(QoreV8ProgramHelper& v8h);

    DLLLOCAL QoreValue getResult(QoreV8ProgramHelper& v8h);

protected:
    DLLLOCAL v8::MaybeLocal<v8::Function> getPromiseFunction(QoreV8ProgramHelper& v8h,
            void (*call_wrapper)(const v8::FunctionCallbackInfo<v8::Value>& info),
            const ResolvedCallReferenceNode* call);
};

struct QoreV8PromiseCallbackInfo {
    ResolvedCallReferenceNode* ref;
    QoreV8Program* pgm;
    v8::Global<v8::Promise> promise;

    DLLLOCAL QoreV8PromiseCallbackInfo(const ResolvedCallReferenceNode* ref, QoreV8Program* pgm,
            v8::Local<v8::Promise> promise);

    DLLLOCAL ~QoreV8PromiseCallbackInfo() {
        ref->weakDeref();
    }
};

#endif