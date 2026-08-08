/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QC_JavaScriptPromise.cpp defines the %Qore JavaScriptPromise class */
/*
    QC_JavaScriptPromise.cpp

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

#include "QC_JavaScriptPromise.h"
#include "QC_JavaScriptObject.h"
#include "QC_JavaScriptProgram.h"

void copy_refs(ExceptionSink* xsink, QoreObject* source, QoreObject* target) {
    ValueHolder v0(source->getReferencedMemberNoMethod("promise_refs", QC_JAVASCRIPTPROMISE, xsink), xsink);
    if (!v0) {
        return;
    }
    QoreListNode* tl;
    ValueHolder v1(target->getReferencedMemberNoMethod("promise_refs", QC_JAVASCRIPTPROMISE, xsink), xsink);
    if (!v1) {
        ReferenceHolder<QoreListNode> rh(new QoreListNode(autoTypeInfo), xsink);
        tl = *rh;
        target->setMemberValue("promise_refs", QC_JAVASCRIPTPROMISE, rh.release(), xsink);
    } else {
        tl = v1->get<QoreListNode>();
    }
    tl->push(v0->refSelf(), xsink);
}

void save_ref(ExceptionSink* xsink, ReferenceHolder<QoreListNode>& ref, QoreObject* obj) {
    assert(*ref);
    // add call reference to parent object's "promise_refs" member
    ValueHolder v(obj->getReferencedMemberNoMethod("promise_refs", QC_JAVASCRIPTPROMISE, xsink), xsink);
    if (v) {
        v->get<QoreListNode>()->push(ref->refSelf(), xsink);
        //printd(5, "save_ref() obj %p added reference: %p\n", obj, *ref);
    } else {
        obj->setMemberValue("promise_refs", QC_JAVASCRIPTPROMISE, ref.release(), xsink);
        //printd(5, "save_ref() obj %p set reference: %p\n", obj, *ref);
    }
}
/* Qore class V8::JavaScriptPromise */

qore_classid_t CID_JAVASCRIPTPROMISE;
QoreClass* QC_JAVASCRIPTPROMISE;

// JavaScriptPromise JavaScriptPromise::doCatch(code catch_code){}
static QoreValue JavaScriptPromise_doCatch_Vc(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const ResolvedCallReferenceNode* catch_code = get_param_value(args, 0).get<const ResolvedCallReferenceNode>();
# 115 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    QoreV8ProgramHelper v8h(xsink, p->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    v8::EscapableHandleScope handle_scope(v8h.getIsolate());
    ReferenceHolder<QoreListNode> ref(new QoreListNode(autoTypeInfo), xsink);
    v8::MaybeLocal<v8::Promise> rv = p->doCatch(v8h, ref, catch_code);
    if (*xsink) {
        return QoreValue();
    }
    v8::Local<v8::Promise> np = rv.ToLocalChecked();
    ReferenceHolder<QoreV8Promise> pd(new QoreV8Promise(xsink, p->getProgram(), np), xsink);
    if (*xsink) {
        return QoreValue();
    }
    ReferenceHolder<QoreObject> qrv(new QoreObject(QC_JAVASCRIPTPROMISE, getProgram(), pd.release()), xsink);
    save_ref(xsink, ref, self);
    copy_refs(xsink, self, *qrv);
    return qrv.release();
}

// auto JavaScriptPromise::getResult(){}
static QoreValue JavaScriptPromise_getResult(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 176 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    QoreV8ProgramHelper v8h(xsink, p->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return p->getResult(v8h);
}

// int JavaScriptPromise::getState(){}
static QoreValue JavaScriptPromise_getState(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 151 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    QoreV8ProgramHelper v8h(xsink, p->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return p->getState(v8h);
}

// bool JavaScriptPromise::hasHandler(){}
static QoreValue JavaScriptPromise_hasHandler(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 140 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    QoreV8ProgramHelper v8h(xsink, p->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return p->hasHandler(v8h);
}

// auto JavaScriptPromise::memberGate(string m){}
static QoreValue JavaScriptPromise_memberGate_Vs(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    QoreStringNodeValueHelper qpp_string_helper_0(get_hard_value_param(args, 0));
    const QoreStringNode* m = *qpp_string_helper_0;
# 199 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    return p->memberGate(xsink, m);
}

// auto JavaScriptPromise::methodGate(string m, ...){}
static QoreValue JavaScriptPromise_methodGate_VsVV(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    QoreStringNodeValueHelper qpp_string_helper_0(get_hard_value_param(args, 0));
    const QoreStringNode* m = *qpp_string_helper_0;
# 190 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    return p->methodGate(xsink, self, m, args);
}

// JavaScriptPromise JavaScriptPromise::then(code then_code, *code reject_code){}
static QoreValue JavaScriptPromise_then_VcNc(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const ResolvedCallReferenceNode* then_code = get_param_value(args, 0).get<const ResolvedCallReferenceNode>();
    const ResolvedCallReferenceNode* reject_code = get_param_value(args, 1).get<const ResolvedCallReferenceNode>();
# 90 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    QoreV8ProgramHelper v8h(xsink, p->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    v8::EscapableHandleScope handle_scope(v8h.getIsolate());
    ReferenceHolder<QoreListNode> ref(new QoreListNode(autoTypeInfo), xsink);
    v8::MaybeLocal<v8::Promise> rv = p->then(v8h, ref, then_code, reject_code);
    if (*xsink) {
        return QoreValue();
    }
    v8::Local<v8::Promise> np = rv.ToLocalChecked();
    ReferenceHolder<QoreV8Promise> pd(new QoreV8Promise(xsink, p->getProgram(), np), xsink);
    if (*xsink) {
        return QoreValue();
    }
    ReferenceHolder<QoreObject> qrv(new QoreObject(QC_JAVASCRIPTPROMISE, getProgram(), pd.release()), xsink);
    save_ref(xsink, ref, self);
    copy_refs(xsink, self, *qrv);
    return qrv.release();
}

// nothing JavaScriptPromise::wait(){}
static QoreValue JavaScriptPromise_wait(QoreObject* self, QoreV8Promise* p, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 163 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    QoreV8ProgramHelper v8h(xsink, p->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    p->wait(v8h);
    return QoreValue();
}

DLLLOCAL void preinitJavaScriptPromiseClass() {
    QC_JAVASCRIPTPROMISE = new QoreBuiltinClass("JavaScriptPromise", "::V8::JavaScriptPromise", QDOM_DEFAULT);
    CID_JAVASCRIPTPROMISE = QC_JAVASCRIPTPROMISE->getID();
    QC_JAVASCRIPTPROMISE->setSystem();
}

DLLLOCAL QoreClass* initJavaScriptPromiseClass(QoreNamespace& ns) {
    if (!QC_JAVASCRIPTPROMISE)
        preinitJavaScriptPromiseClass();

    // set parent class
    assert(QC_JAVASCRIPTOBJECT);
    QC_JAVASCRIPTPROMISE->addBuiltinVirtualBaseClass(QC_JAVASCRIPTOBJECT);

    // private:internal members
    QC_JAVASCRIPTPROMISE->addMember("promise_refs", Internal, autoTypeInfo);

    // JavaScriptPromise JavaScriptPromise::doCatch(code catch_code){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 115);
        QC_JAVASCRIPTPROMISE->addMethod("doCatch", (q_method_t)JavaScriptPromise_doCatch_Vc, Public, QCF_NO_FLAGS, QDOM_DEFAULT, QC_JAVASCRIPTPROMISE->getTypeInfo(), 1, codeTypeInfo, QORE_PARAM_NO_ARG, "catch_code");
    }

    // auto JavaScriptPromise::getResult(){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 176);
        QC_JAVASCRIPTPROMISE->addMethod("getResult", (q_method_t)JavaScriptPromise_getResult, Public, QCF_NO_FLAGS, QDOM_DEFAULT, autoTypeInfo);
    }

    // int JavaScriptPromise::getState(){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 151);
        QC_JAVASCRIPTPROMISE->addMethod("getState", (q_method_t)JavaScriptPromise_getState, Public, QCF_NO_FLAGS, QDOM_DEFAULT, bigIntTypeInfo);
    }

    // bool JavaScriptPromise::hasHandler(){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 140);
        QC_JAVASCRIPTPROMISE->addMethod("hasHandler", (q_method_t)JavaScriptPromise_hasHandler, Public, QCF_NO_FLAGS, QDOM_DEFAULT, boolTypeInfo);
    }

    // auto JavaScriptPromise::memberGate(string m){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 199);
        QC_JAVASCRIPTPROMISE->addMethod("memberGate", (q_method_t)JavaScriptPromise_memberGate_Vs, Public, QCF_NO_FLAGS, QDOM_DEFAULT, autoTypeInfo, 1, stringTypeInfo, QORE_PARAM_NO_ARG, "m");
    }

    // auto JavaScriptPromise::methodGate(string m, ...){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 190);
        QC_JAVASCRIPTPROMISE->addMethod("methodGate", (q_method_t)JavaScriptPromise_methodGate_VsVV, Public, QCF_USES_EXTRA_ARGS, QDOM_DEFAULT, autoTypeInfo, 1, stringTypeInfo, QORE_PARAM_NO_ARG, "m");
    }

    // JavaScriptPromise JavaScriptPromise::then(code then_code, *code reject_code){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 90);
        QC_JAVASCRIPTPROMISE->addMethod("then", (q_method_t)JavaScriptPromise_then_VcNc, Public, QCF_NO_FLAGS, QDOM_DEFAULT, QC_JAVASCRIPTPROMISE->getTypeInfo(), 2, codeTypeInfo, QORE_PARAM_NO_ARG, "then_code", codeOrNothingTypeInfo, QORE_PARAM_NO_ARG, "reject_code");
    }

    // nothing JavaScriptPromise::wait(){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp", 163);
        QC_JAVASCRIPTPROMISE->addMethod("wait", (q_method_t)JavaScriptPromise_wait, Public, QCF_NO_FLAGS, QDOM_DEFAULT, nothingTypeInfo);
    }
# 60 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
# 65 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
# 68 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptPromise.qpp"
    ns.addConstant("Fulfilled", (QoreValue(v8::Promise::PromiseState::kFulfilled)));
    ns.addConstant("Pending", (QoreValue(v8::Promise::PromiseState::kPending)));
    ns.addConstant("Rejected", (QoreValue(v8::Promise::PromiseState::kRejected)));

    return QC_JAVASCRIPTPROMISE;
}
