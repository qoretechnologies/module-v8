/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8Promise.cpp

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

#include "QoreV8Promise.h"
#include "QoreV8Program.h"

#include <uv.h>

QoreV8Promise::QoreV8Promise(ExceptionSink* xsink, QoreV8Program* pgm, v8::Local<v8::Promise> obj)
        : QoreV8Object(pgm, obj) {
}

v8::Local<v8::Promise> QoreV8Promise::get() const {
    return v8::Local<v8::Promise>::Cast(obj.Get(pgm->getIsolate()));
}

int QoreV8Promise::wait(QoreV8ProgramHelper& v8h) {
    v8::Isolate* isolate = v8h.getIsolate();
    v8::Local<v8::Promise> p = get();
    while (p->State() == v8::Promise::kPending) {
        v8h.getProgram()->spinOnce();
        isolate->PerformMicrotaskCheckpoint();
    }
    return 0;
}

QoreValue QoreV8Promise::getResult(QoreV8ProgramHelper& v8h) {
    v8::Local<v8::Promise> p = get();
    ExceptionSink* xsink = v8h.getExceptionSink();
    if (p->State() == v8::Promise::kPending) {
        xsink->raiseException("PROMISE-PENDING", "The Promise has not yet been resolved");
        return QoreValue();
    }
    return v8h.getProgram()->getQoreValue(v8h.getExceptionSink(), p->Result());
}

static void resolve_promise(const v8::FunctionCallbackInfo<v8::Value>& info) {
    //printd(5, "resolve_promise() len: %d\n", info.Length());

    // NOTE: we ignore arguments in info in these callbacks
    v8::Local<v8::Value> v = info.Data();
    assert(v->IsExternal());

    v8::Local<v8::External> ext = v8::Local<v8::External>::Cast(v);
    QoreV8PromiseCallbackInfo* cbinfo = reinterpret_cast<QoreV8PromiseCallbackInfo*>(ext->Value());

    v8::Isolate* isolate = info.GetIsolate();

    ExceptionSink xsink;
    OptionalCallReferenceAccessHelper rh(&xsink, cbinfo->ref);
    if (!rh) {
        assert(xsink);
        // raise JS exception
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    ValueHolder arg(&xsink);

    // resolve Promise
    v8::Local<v8::Promise> p = cbinfo->promise.Get(isolate);

    v8::Local<v8::Value> result = p->Result();
    if (!result.IsEmpty()) {
        //printd(5, "resolve_promise() setting result\n");
        arg = cbinfo->pgm->getQoreValue(&xsink, p->Result());
    } else if (info.Length()) {
        //printd(5, "resolve_promise() setting info[0]\n");
        arg = cbinfo->pgm->getQoreValue(&xsink, info[0]);
    }

    if (xsink) {
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    /*
    {
        QoreNodeAsStringHelper str(*arg, FMT_NORMAL, &xsink);
        printd(5, "Promise callback arg: %s\n", str->c_str());
    }
    */

    ReferenceHolder<QoreListNode> args(new QoreListNode(autoTypeInfo), &xsink);
    args->push(arg.release(), &xsink);

    ValueHolder rv(cbinfo->ref->execValue(*args, &xsink), &xsink);
    if (xsink) {
        // raise JS exception
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }
    v8::Local<v8::Value> v8rv = cbinfo->pgm->getV8Value(*rv, &xsink);
    if (xsink) {
        // raise JS exception
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }
    info.GetReturnValue().Set(v8rv);
}

v8::MaybeLocal<v8::Promise> QoreV8Promise::then(QoreV8ProgramHelper& v8h, const ResolvedCallReferenceNode* code,
        const ResolvedCallReferenceNode* rejected) {
    ExceptionSink* xsink = v8h.getExceptionSink();

    v8::MaybeLocal<v8::Function> func = getPromiseFunction(v8h, resolve_promise, code);
    if (func.IsEmpty()) {
        assert(*xsink);
        return v8::MaybeLocal<v8::Promise>();
    }

    v8::MaybeLocal<v8::Function> reject_func;
    if (rejected) {
        reject_func = getPromiseFunction(v8h, resolve_promise, rejected);
        if (reject_func.IsEmpty()) {
            assert(*xsink);
            return v8::MaybeLocal<v8::Promise>();
        }
    }

    v8::EscapableHandleScope handle_scope(v8h.getIsolate());
    v8::Local<v8::Promise> p = get();
    v8::MaybeLocal<v8::Promise> rv = reject_func.IsEmpty()
        ? p->Then(v8h.getContext(), func.ToLocalChecked())
        : p->Then(v8h.getContext(), func.ToLocalChecked(), reject_func.ToLocalChecked());
    if (rv.IsEmpty()) {
        if (!v8h.checkException()) {
            xsink->raiseException("PROMISE-THEN-ERROR", "Unknown error running Promise.then()");
        }
    }
    return handle_scope.EscapeMaybe(rv);
}

v8::MaybeLocal<v8::Promise> QoreV8Promise::doCatch(QoreV8ProgramHelper& v8h, const ResolvedCallReferenceNode* code) {
    ExceptionSink* xsink = v8h.getExceptionSink();

    v8::MaybeLocal<v8::Function> func = getPromiseFunction(v8h, resolve_promise, code);
    if (func.IsEmpty()) {
        assert(*xsink);
        return v8::MaybeLocal<v8::Promise>();
    }

    v8::EscapableHandleScope handle_scope(v8h.getIsolate());
    v8::Local<v8::Promise> p = get();
    v8::MaybeLocal<v8::Promise> rv = p->Catch(v8h.getContext(), func.ToLocalChecked());
    if (rv.IsEmpty()) {
        if (!v8h.checkException()) {
            xsink->raiseException("PROMISE-CATCH-ERROR", "Unknown error running Promise.catch()");
        }
    }
    return handle_scope.EscapeMaybe(rv);
}

bool QoreV8Promise::hasHandler(QoreV8ProgramHelper& v8h) const {
    v8::Isolate* isolate = v8h.getIsolate();
    //v8::Isolate::Scope isolate_scope(isolate);
    v8::EscapableHandleScope handle_scope(isolate);
    return get()->HasHandler();
}

v8::Promise::PromiseState QoreV8Promise::getState(QoreV8ProgramHelper& v8h) {
    v8::Isolate* isolate = v8h.getIsolate();
    //v8::Isolate::Scope isolate_scope(isolate);
    v8::EscapableHandleScope handle_scope(isolate);
    return get()->State();
}

static void deref_callref(const v8::WeakCallbackInfo<QoreV8PromiseCallbackInfo>& data) {
    delete data.GetParameter();
}

v8::MaybeLocal<v8::Function> QoreV8Promise::getPromiseFunction(QoreV8ProgramHelper& v8h,
        void (*call_wrapper)(const v8::FunctionCallbackInfo<v8::Value>& info),
        const ResolvedCallReferenceNode* call) {
    ExceptionSink* xsink = v8h.getExceptionSink();

    v8::Isolate* isolate = v8h.getIsolate();
    v8::Isolate::Scope isolate_scope(isolate);
    v8::EscapableHandleScope handle_scope(isolate);
    const v8::TryCatch tryCatch(isolate);

    QoreV8PromiseCallbackInfo* cbinfo = new QoreV8PromiseCallbackInfo(call, v8h.getProgram(), get());
    v8::Local<v8::External> ext = v8::External::New(isolate, (void*)cbinfo);

    // add callback to external object
    v8::Global<v8::External> gext;
    gext.Reset(isolate, ext);
    gext.SetWeak(cbinfo, deref_callref, v8::WeakCallbackType::kParameter);

    v8::Local<v8::Context> context = v8h.getContext();
    v8::MaybeLocal<v8::Function> func = v8::Function::New(context, call_wrapper, ext);
    if (func.IsEmpty()) {
        //printd(5, "call: %p -> func empty\n", call);
        if (!v8h.checkException()) {
            xsink->raiseException("PROMISE-FUNCTION-ERROR", "Unknown error creating async Promise callback function");
        }
        return v8::MaybeLocal<v8::Function>();
    }
    if (v8h.getProgram()->saveQoreReference(call->refSelf(), *xsink)) {
        //printd(5, "call: %p -> cannot save Qore reference\n", call);
        assert(*xsink);
        return v8::MaybeLocal<v8::Function>();
    }
    //printd(5, "call: %p -> returning JS function object\n", call);
    return v8::MaybeLocal<v8::Function>(handle_scope.Escape(func.ToLocalChecked()));
}

QoreV8PromiseCallbackInfo::QoreV8PromiseCallbackInfo(const ResolvedCallReferenceNode* ref, QoreV8Program* pgm,
        v8::Local<v8::Promise> promise) : ref(const_cast<ResolvedCallReferenceNode*>(ref)), pgm(pgm),
        promise(pgm->getIsolate(), promise) {
    this->ref->weakRef();
}
