/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QC_JavaScriptProgram.cpp defines the %Qore JavaScriptProgram class */
/*
    QC_JavaScriptProgram.cpp

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

#include "QC_JavaScriptProgram.h"
#include "QC_JavaScriptObject.h"
/* Qore class V8::JavaScriptProgram */

qore_classid_t CID_JAVASCRIPTPROGRAM;
QoreClass* QC_JAVASCRIPTPROGRAM;

// JavaScriptProgram::constructor(string source_code, string source_label) {}
static void JavaScriptProgram_constructor_VsVs(QoreObject* self, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const QoreStringNode* source_code = HARD_QORE_VALUE_STRING(args, 0);
    const QoreStringNode* source_label = HARD_QORE_VALUE_STRING(args, 1);
# 38 "/module-v8/src/QC_JavaScriptProgram.qpp"
ReferenceHolder<QoreV8ProgramData> jsp(new QoreV8ProgramData(*source_code, *source_label, xsink),
        xsink);
    if (*xsink) {
        return;
    }

    jsp->setObject(self);

    //printd(5, "JavaScriptProgram::constructor() created %p\n", *jsp);
    self->setPrivate(CID_JAVASCRIPTPROGRAM, jsp.release());
}

// JavaScriptProgram::copy() {}
static void JavaScriptProgram_copy(QoreObject* self, QoreObject* old, QoreV8ProgramData* jsp, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 63 "/module-v8/src/QC_JavaScriptProgram.qpp"
self->setPrivate(CID_JAVASCRIPTPROGRAM, new QoreV8ProgramData(xsink, *jsp, self));
}

// JavaScriptProgram::destructor() {}
static void JavaScriptProgram_destructor(QoreObject* self, QoreV8ProgramData* jsp, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 54 "/module-v8/src/QC_JavaScriptProgram.qpp"
//printd(5, "Qore JavaScriptProgram::destructor() this: %p\n", jsp);
    jsp->destructor(xsink);
    jsp->deref(xsink);
}

// JavaScriptObject JavaScriptProgram::getGlobal(){}
static QoreValue JavaScriptProgram_getGlobal(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 71 "/module-v8/src/QC_JavaScriptProgram.qpp"
    return jsp->getGlobal(xsink);
}

// nothing JavaScriptProgram::setSaveReferenceCallback(*code save_ref_callback){}
static QoreValue JavaScriptProgram_setSaveReferenceCallback_Nc(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const ResolvedCallReferenceNode* save_ref_callback = get_param_value(args, 0).get<const ResolvedCallReferenceNode>();
# 99 "/module-v8/src/QC_JavaScriptProgram.qpp"
    jsp->setSaveReferenceCallback(save_ref_callback);
    return QoreValue();
}

// int JavaScriptProgram::spinEventLoop(){}
static QoreValue JavaScriptProgram_spinEventLoop(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 113 "/module-v8/src/QC_JavaScriptProgram.qpp"
    return jsp->spinEventLoop();
}

// int JavaScriptProgram::spinOnce(){}
static QoreValue JavaScriptProgram_spinOnce(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 106 "/module-v8/src/QC_JavaScriptProgram.qpp"
    return jsp->spinOnce();
}

DLLLOCAL void preinitJavaScriptProgramClass() {
    QC_JAVASCRIPTPROGRAM = new QoreBuiltinClass("JavaScriptProgram", "::V8::JavaScriptProgram", QDOM_EMBEDDED_LOGIC);
    CID_JAVASCRIPTPROGRAM = QC_JAVASCRIPTPROGRAM->getID();
    QC_JAVASCRIPTPROGRAM->setSystem();
}

DLLLOCAL QoreClass* initJavaScriptProgramClass(QoreNamespace& ns) {
    if (!QC_JAVASCRIPTPROGRAM)
        preinitJavaScriptProgramClass();

    // JavaScriptProgram::constructor(string source_code, string source_label) {}
    QC_JAVASCRIPTPROGRAM->addConstructor(JavaScriptProgram_constructor_VsVs, Public, QCF_NO_FLAGS, QDOM_DEFAULT, 2, stringTypeInfo, QORE_PARAM_NO_ARG, "source_code", stringTypeInfo, QORE_PARAM_NO_ARG, "source_label");

    // JavaScriptProgram::copy() {}
    QC_JAVASCRIPTPROGRAM->setCopy((q_copy_t)JavaScriptProgram_copy);

    // JavaScriptProgram::destructor() {}
    QC_JAVASCRIPTPROGRAM->setDestructor((q_destructor_t)JavaScriptProgram_destructor);

    // JavaScriptObject JavaScriptProgram::getGlobal(){}
    QC_JAVASCRIPTPROGRAM->addMethod("getGlobal", (q_method_t)JavaScriptProgram_getGlobal, Public, QCF_NO_FLAGS, QDOM_DEFAULT, QC_JAVASCRIPTOBJECT->getTypeInfo());

    // nothing JavaScriptProgram::setSaveReferenceCallback(*code save_ref_callback){}
    QC_JAVASCRIPTPROGRAM->addMethod("setSaveReferenceCallback", (q_method_t)JavaScriptProgram_setSaveReferenceCallback_Nc, Public, QCF_NO_FLAGS, QDOM_PROCESS, nothingTypeInfo, 1, codeOrNothingTypeInfo, QORE_PARAM_NO_ARG, "save_ref_callback");

    // int JavaScriptProgram::spinEventLoop(){}
    QC_JAVASCRIPTPROGRAM->addMethod("spinEventLoop", (q_method_t)JavaScriptProgram_spinEventLoop, Public, QCF_NO_FLAGS, QDOM_DEFAULT, bigIntTypeInfo);

    // int JavaScriptProgram::spinOnce(){}
    QC_JAVASCRIPTPROGRAM->addMethod("spinOnce", (q_method_t)JavaScriptProgram_spinOnce, Public, QCF_NO_FLAGS, QDOM_DEFAULT, bigIntTypeInfo);

    return QC_JAVASCRIPTPROGRAM;
}
