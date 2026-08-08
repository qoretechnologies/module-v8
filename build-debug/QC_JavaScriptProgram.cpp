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
    QoreStringNodeValueHelper qpp_string_helper_0(get_hard_value_param(args, 0));
    const QoreStringNode* source_code = *qpp_string_helper_0;
    QoreStringNodeValueHelper qpp_string_helper_1(get_hard_value_param(args, 1));
    const QoreStringNode* source_label = *qpp_string_helper_1;
# 38 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp"
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
# 63 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp"
self->setPrivate(CID_JAVASCRIPTPROGRAM, new QoreV8ProgramData(xsink, *jsp, self));
}

// JavaScriptProgram::destructor() {}
static void JavaScriptProgram_destructor(QoreObject* self, QoreV8ProgramData* jsp, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 54 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp"
//printd(5, "Qore JavaScriptProgram::destructor() this: %p\n", jsp);
    jsp->destructor(xsink);
    jsp->deref(xsink);
}

// JavaScriptObject JavaScriptProgram::getGlobal(){}
static QoreValue JavaScriptProgram_getGlobal(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 71 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp"
    return jsp->getGlobal(xsink);
}

// nothing JavaScriptProgram::setSaveReferenceCallback(*code save_reference_callback){}
static QoreValue JavaScriptProgram_setSaveReferenceCallback_Nc(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const ResolvedCallReferenceNode* save_reference_callback = get_param_value(args, 0).get<const ResolvedCallReferenceNode>();
# 99 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp"
    jsp->setSaveReferenceCallback(save_reference_callback);
    return QoreValue();
}

// int JavaScriptProgram::spinEventLoop(){}
static QoreValue JavaScriptProgram_spinEventLoop(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 117 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp"
    return jsp->spinEventLoop(xsink);
}

// int JavaScriptProgram::spinOnce(){}
static QoreValue JavaScriptProgram_spinOnce(QoreObject* self, QoreV8ProgramData* jsp, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 110 "/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp"
    return jsp->spinOnce(xsink);
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
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp", 38);
        QC_JAVASCRIPTPROGRAM->addConstructor(JavaScriptProgram_constructor_VsVs, Public, QCF_NAMED_ARGS, QDOM_DEFAULT, 2, stringTypeInfo, QORE_PARAM_NO_ARG, "source_code", stringTypeInfo, QORE_PARAM_NO_ARG, "source_label");
    }

    // JavaScriptProgram::copy() {}
    QC_JAVASCRIPTPROGRAM->setCopy((q_copy_t)JavaScriptProgram_copy);

    // JavaScriptProgram::destructor() {}
    QC_JAVASCRIPTPROGRAM->setDestructor((q_destructor_t)JavaScriptProgram_destructor);

    // JavaScriptObject JavaScriptProgram::getGlobal(){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp", 71);
        QC_JAVASCRIPTPROGRAM->addMethod("getGlobal", (q_method_t)JavaScriptProgram_getGlobal, Public, QCF_NO_FLAGS, QDOM_DEFAULT, QC_JAVASCRIPTOBJECT->getTypeInfo());
    }

    // nothing JavaScriptProgram::setSaveReferenceCallback(*code save_reference_callback){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp", 99);
        QC_JAVASCRIPTPROGRAM->addMethod("setSaveReferenceCallback", (q_method_t)JavaScriptProgram_setSaveReferenceCallback_Nc, Public, QCF_NAMED_ARGS, QDOM_PROCESS, nothingTypeInfo, 1, codeOrNothingTypeInfo, QORE_PARAM_NO_ARG, "save_reference_callback");
    }

    // int JavaScriptProgram::spinEventLoop(){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp", 117);
        QC_JAVASCRIPTPROGRAM->addMethod("spinEventLoop", (q_method_t)JavaScriptProgram_spinEventLoop, Public, QCF_NO_FLAGS, QDOM_DEFAULT, bigIntTypeInfo);
    }

    // int JavaScriptProgram::spinOnce(){}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_JavaScriptProgram.qpp", 110);
        QC_JAVASCRIPTPROGRAM->addMethod("spinOnce", (q_method_t)JavaScriptProgram_spinOnce, Public, QCF_NO_FLAGS, QDOM_DEFAULT, bigIntTypeInfo);
    }

    return QC_JAVASCRIPTPROGRAM;
}
