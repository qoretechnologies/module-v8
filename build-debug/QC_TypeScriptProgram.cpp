/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QC_TypeScriptProgram.cpp defines the %Qore TypeScriptProgram class */
/*
    QC_TypeScriptProgram.cpp

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

#include "QC_TypeScriptProgram.h"
/* Qore class V8::TypeScriptProgram */

qore_classid_t CID_TYPESCRIPTPROGRAM;
QoreClass* QC_TYPESCRIPTPROGRAM;

// TypeScriptProgram::constructor(string source_code, string source_label) {}
static void TypeScriptProgram_constructor_VsVs(QoreObject* self, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    QoreStringNodeValueHelper qpp_string_helper_0(get_hard_value_param(args, 0));
    const QoreStringNode* source_code = *qpp_string_helper_0;
    QoreStringNodeValueHelper qpp_string_helper_1(get_hard_value_param(args, 1));
    const QoreStringNode* source_label = *qpp_string_helper_1;
# 46 "/home/david/src/qore/git/module-v8/src/QC_TypeScriptProgram.qpp"
ReferenceHolder<QoreV8ProgramData> jsp(
        new QoreV8ProgramData(*source_code, *source_label, true, xsink), xsink);
    if (*xsink) {
        return;
    }

    jsp->setObject(self);

    self->setPrivate(CID_TYPESCRIPTPROGRAM, jsp.release());
}

// TypeScriptProgram::copy() {}
static void TypeScriptProgram_copy(QoreObject* self, QoreObject* old, QoreV8ProgramData* jsp, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 69 "/home/david/src/qore/git/module-v8/src/QC_TypeScriptProgram.qpp"
self->setPrivate(CID_TYPESCRIPTPROGRAM, new QoreV8ProgramData(xsink, *jsp, self));
}

// TypeScriptProgram::destructor() {}
static void TypeScriptProgram_destructor(QoreObject* self, QoreV8ProgramData* jsp, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 61 "/home/david/src/qore/git/module-v8/src/QC_TypeScriptProgram.qpp"
jsp->destructor(xsink);
    jsp->deref(xsink);
}

DLLLOCAL void preinitTypeScriptProgramClass() {
    QC_TYPESCRIPTPROGRAM = new QoreBuiltinClass("TypeScriptProgram", "::V8::TypeScriptProgram", QDOM_EMBEDDED_LOGIC);
    CID_TYPESCRIPTPROGRAM = QC_TYPESCRIPTPROGRAM->getID();
    QC_TYPESCRIPTPROGRAM->setSystem();
}

DLLLOCAL QoreClass* initTypeScriptProgramClass(QoreNamespace& ns) {
    if (!QC_TYPESCRIPTPROGRAM)
        preinitTypeScriptProgramClass();

    // set parent class
    assert(QC_JAVASCRIPTPROGRAM);
    QC_TYPESCRIPTPROGRAM->addBuiltinVirtualBaseClass(QC_JAVASCRIPTPROGRAM);

    // TypeScriptProgram::constructor(string source_code, string source_label) {}
    {
        QoreBuiltinSrcLocHelper _qpp_src_loc_h("/home/david/src/qore/git/module-v8/src/QC_TypeScriptProgram.qpp", 46);
        QC_TYPESCRIPTPROGRAM->addConstructor(TypeScriptProgram_constructor_VsVs, Public, QCF_NAMED_ARGS, QDOM_DEFAULT, 2, stringTypeInfo, QORE_PARAM_NO_ARG, "source_code", stringTypeInfo, QORE_PARAM_NO_ARG, "source_label");
    }

    // TypeScriptProgram::copy() {}
    QC_TYPESCRIPTPROGRAM->setCopy((q_copy_t)TypeScriptProgram_copy);

    // TypeScriptProgram::destructor() {}
    QC_TYPESCRIPTPROGRAM->setDestructor((q_destructor_t)TypeScriptProgram_destructor);

    return QC_TYPESCRIPTPROGRAM;
}
