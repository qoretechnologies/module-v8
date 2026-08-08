/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QC_JavaScriptObject.cpp defines the %Qore JavaScriptObject class */
/*
    QC_JavaScriptObject.cpp

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

#include "QC_JavaScriptObject.h"
#include "QC_JavaScriptProgram.h"
/* Qore class V8::JavaScriptObject */

qore_classid_t CID_JAVASCRIPTOBJECT;
QoreClass* QC_JAVASCRIPTOBJECT;

// auto JavaScriptObject::callAsFunction(auto js_this, ...){}
static QoreValue JavaScriptObject_callAsFunction_VAVV(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    QoreValue js_this = get_param_value(args, 0);
# 63 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->callAsFunction(v8h, js_this, 1, args);
}

// auto JavaScriptObject::callAsFunctionArgs(auto js_this, *softlist<auto> argv){}
static QoreValue JavaScriptObject_callAsFunctionArgs_VAC15_softlist_auto_(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    QoreValue js_this = get_param_value(args, 0);
    const QoreListNode* argv = get_param_value(args, 1).get<const QoreListNode>();
# 80 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->callAsFunction(v8h, js_this, 0, argv);
}

// JavaScriptObject::constructor(JavaScriptProgram pgm) {}
static void JavaScriptObject_constructor_C17JavaScriptProgram(QoreObject* self, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    HARD_QORE_VALUE_OBJ_DATA(pgm, QoreV8ProgramData, args, 0, CID_JAVASCRIPTPROGRAM, "JavaScriptObject::constructor()", "JavaScriptProgram", xsink);
    if (*xsink)
        return;
# 37 "/module-v8/src/QC_JavaScriptObject.qpp"
ReferenceHolder<QoreV8ProgramData> holder(pgm, xsink);

    QoreV8ProgramHelper v8h(xsink, pgm);
    if (*xsink) {
        return;
    }

    v8::Isolate* isolate = pgm->getIsolate();

    //printd(5, "JavaScriptObject::constructor() pgm: %p isolate: %p\n", pgm, isolate);

    v8::Local<v8::Object> obj = v8::Object::New(isolate);
    //printd(5, "JavaScriptObject::constructor() created %p\n", *obj);
    self->setPrivate(CID_JAVASCRIPTOBJECT, new QoreV8Object(pgm, obj));
}

// auto JavaScriptObject::getIndexValue(int i){}
static QoreValue JavaScriptObject_getIndexValue_Vi(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    int64 i = HARD_QORE_VALUE_INT(args, 0);
# 180 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->getIndexValue(v8h, i);
}

// JavaScriptProgram JavaScriptObject::getProgram(){}
static QoreValue JavaScriptObject_getProgram(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 210 "/module-v8/src/QC_JavaScriptObject.qpp"
    return o->getReferencedProgram();
}

// auto JavaScriptObject::getProperty(string property){}
static QoreValue JavaScriptObject_getProperty_Vs(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const QoreStringNode* property = HARD_QORE_VALUE_STRING(args, 0);
# 149 "/module-v8/src/QC_JavaScriptObject.qpp"
    TempEncodingHelper str(property, QCS_UTF8, xsink);
    if (*xsink) {
        return QoreValue();
    }
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->getProperty(v8h, str->c_str());
}

// *list<string> JavaScriptObject::getPropertyList(){}
static QoreValue JavaScriptObject_getPropertyList(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 138 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->getPropertyList(v8h);
}

// bool JavaScriptObject::isCallable(){}
static QoreValue JavaScriptObject_isCallable(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 91 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->isCallable(v8h);
}

// bool JavaScriptObject::isConstructor(){}
static QoreValue JavaScriptObject_isConstructor(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 102 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->isConstructor(v8h);
}

// auto JavaScriptObject::memberGate(string m){}
static QoreValue JavaScriptObject_memberGate_Vs(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const QoreStringNode* m = HARD_QORE_VALUE_STRING(args, 0);
# 203 "/module-v8/src/QC_JavaScriptObject.qpp"
    return o->memberGate(xsink, m);
}

// auto JavaScriptObject::methodGate(string m, ...){}
static QoreValue JavaScriptObject_methodGate_VsVV(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const QoreStringNode* m = HARD_QORE_VALUE_STRING(args, 0);
# 194 "/module-v8/src/QC_JavaScriptObject.qpp"
    return o->methodGate(xsink, self, m, args);
}

// nothing JavaScriptObject::setProperty(string property, auto value){}
static QoreValue JavaScriptObject_setProperty_VsVA(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
    const QoreStringNode* property = HARD_QORE_VALUE_STRING(args, 0);
    QoreValue value = get_param_value(args, 1);
# 165 "/module-v8/src/QC_JavaScriptObject.qpp"
    TempEncodingHelper str(property, QCS_UTF8, xsink);
    if (*xsink) {
        return QoreValue();
    }
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    o->setProperty(v8h, str->c_str(), value);
    return QoreValue();
}

// auto JavaScriptObject::toData(){}
static QoreValue JavaScriptObject_toData(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 127 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->toData(v8h);
}

// string JavaScriptObject::toString(){}
static QoreValue JavaScriptObject_toString(QoreObject* self, QoreV8Object* o, const QoreListNode* args, RuntimeConfig& runtime_cfg, ExceptionSink* xsink) {
# 113 "/module-v8/src/QC_JavaScriptObject.qpp"
    QoreV8ProgramHelper v8h(xsink, o->getProgram());
    if (*xsink) {
        return QoreValue();
    }
    return o->toString(v8h);
}

DLLLOCAL void preinitJavaScriptObjectClass() {
    QC_JAVASCRIPTOBJECT = new QoreBuiltinClass("JavaScriptObject", "::V8::JavaScriptObject", QDOM_DEFAULT);
    CID_JAVASCRIPTOBJECT = QC_JAVASCRIPTOBJECT->getID();
    QC_JAVASCRIPTOBJECT->setSystem();
}

DLLLOCAL QoreClass* initJavaScriptObjectClass(QoreNamespace& ns) {
    if (!QC_JAVASCRIPTOBJECT)
        preinitJavaScriptObjectClass();

    // auto JavaScriptObject::callAsFunction(auto js_this, ...){}
    QC_JAVASCRIPTOBJECT->addMethod("callAsFunction", (q_method_t)JavaScriptObject_callAsFunction_VAVV, Public, QCF_USES_EXTRA_ARGS, QDOM_DEFAULT, autoTypeInfo, 1, autoTypeInfo, QORE_PARAM_NO_ARG, "js_this");

    // auto JavaScriptObject::callAsFunctionArgs(auto js_this, *softlist<auto> argv){}
    QC_JAVASCRIPTOBJECT->addMethod("callAsFunctionArgs", (q_method_t)JavaScriptObject_callAsFunctionArgs_VAC15_softlist_auto_, Public, QCF_NO_FLAGS, QDOM_DEFAULT, autoTypeInfo, 2, autoTypeInfo, QORE_PARAM_NO_ARG, "js_this", softAutoListOrNothingTypeInfo, QORE_PARAM_NO_ARG, "argv");

    // JavaScriptObject::constructor(JavaScriptProgram pgm) {}
    QC_JAVASCRIPTOBJECT->addConstructor(JavaScriptObject_constructor_C17JavaScriptProgram, Public, QCF_NO_FLAGS, QDOM_DEFAULT, 1, QC_JAVASCRIPTPROGRAM->getTypeInfo(), QORE_PARAM_NO_ARG, "pgm");

    // auto JavaScriptObject::getIndexValue(int i){}
    QC_JAVASCRIPTOBJECT->addMethod("getIndexValue", (q_method_t)JavaScriptObject_getIndexValue_Vi, Public, QCF_NO_FLAGS, QDOM_DEFAULT, autoTypeInfo, 1, bigIntTypeInfo, QORE_PARAM_NO_ARG, "i");

    // JavaScriptProgram JavaScriptObject::getProgram(){}
    QC_JAVASCRIPTOBJECT->addMethod("getProgram", (q_method_t)JavaScriptObject_getProgram, Public, QCF_NO_FLAGS, QDOM_DEFAULT, QC_JAVASCRIPTPROGRAM->getTypeInfo());

    // auto JavaScriptObject::getProperty(string property){}
    QC_JAVASCRIPTOBJECT->addMethod("getProperty", (q_method_t)JavaScriptObject_getProperty_Vs, Public, QCF_NO_FLAGS, QDOM_DEFAULT, autoTypeInfo, 1, stringTypeInfo, QORE_PARAM_NO_ARG, "property");

    // *list<string> JavaScriptObject::getPropertyList(){}
    QC_JAVASCRIPTOBJECT->addMethod("getPropertyList", (q_method_t)JavaScriptObject_getPropertyList, Public, QCF_NO_FLAGS, QDOM_DEFAULT, qore_get_complex_list_or_nothing_type(stringTypeInfo));

    // bool JavaScriptObject::isCallable(){}
    QC_JAVASCRIPTOBJECT->addMethod("isCallable", (q_method_t)JavaScriptObject_isCallable, Public, QCF_NO_FLAGS, QDOM_DEFAULT, boolTypeInfo);

    // bool JavaScriptObject::isConstructor(){}
    QC_JAVASCRIPTOBJECT->addMethod("isConstructor", (q_method_t)JavaScriptObject_isConstructor, Public, QCF_NO_FLAGS, QDOM_DEFAULT, boolTypeInfo);

    // auto JavaScriptObject::memberGate(string m){}
    QC_JAVASCRIPTOBJECT->addMethod("memberGate", (q_method_t)JavaScriptObject_memberGate_Vs, Public, QCF_NO_FLAGS, QDOM_DEFAULT, autoTypeInfo, 1, stringTypeInfo, QORE_PARAM_NO_ARG, "m");

    // auto JavaScriptObject::methodGate(string m, ...){}
    QC_JAVASCRIPTOBJECT->addMethod("methodGate", (q_method_t)JavaScriptObject_methodGate_VsVV, Public, QCF_USES_EXTRA_ARGS, QDOM_DEFAULT, autoTypeInfo, 1, stringTypeInfo, QORE_PARAM_NO_ARG, "m");

    // nothing JavaScriptObject::setProperty(string property, auto value){}
    QC_JAVASCRIPTOBJECT->addMethod("setProperty", (q_method_t)JavaScriptObject_setProperty_VsVA, Public, QCF_NO_FLAGS, QDOM_DEFAULT, nothingTypeInfo, 2, stringTypeInfo, QORE_PARAM_NO_ARG, "property", autoTypeInfo, QORE_PARAM_NO_ARG, "value");

    // auto JavaScriptObject::toData(){}
    QC_JAVASCRIPTOBJECT->addMethod("toData", (q_method_t)JavaScriptObject_toData, Public, QCF_NO_FLAGS, QDOM_DEFAULT, autoTypeInfo);

    // string JavaScriptObject::toString(){}
    QC_JAVASCRIPTOBJECT->addMethod("toString", (q_method_t)JavaScriptObject_toString, Public, QCF_NO_FLAGS, QDOM_DEFAULT, stringTypeInfo);

    return QC_JAVASCRIPTOBJECT;
}
