/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8CallReference.cpp

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

#include "QoreV8CallReference.h"
#include "QoreV8Object.h"
#include "QoreV8Program.h"

QoreV8CallReference::QoreV8CallReference(const QoreV8Object* callable, v8::Local<v8::Value> parent)
        : callable(callable->refSelf()) {
    this->parent.Reset(callable->pgm->getIsolate(), parent);
}

QoreV8CallReference::~QoreV8CallReference() {
    assert(!callable);
}

QoreValue QoreV8CallReference::execValue(const QoreListNode* args, ExceptionSink* xsink) const {
    ValueEvalRefHolder erh(xsink);
    if (args) {
        if (erh.eval(args)) {
            return QoreValue();
        }
        args = erh->get<const QoreListNode>();
    }
    QoreV8ProgramHelper v8h(xsink, callable->pgm);
    if (!v8h) {
        return QoreValue();
    }
    return callable->callAsFunction(v8h, this->parent.Get(v8h.getIsolate()), 0, args);
}

bool QoreV8CallReference::derefImpl(ExceptionSink* xsink) {
    parent.Reset();
    callable->deref(xsink);
    callable = nullptr;
    return ResolvedCallReferenceNode::derefImpl(xsink);
}
