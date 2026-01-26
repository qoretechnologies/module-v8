/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8Object.cpp

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

#include "QoreV8Object.h"
#include "QoreV8CallReference.h"

#include <climits>

QoreV8Object::QoreV8Object(QoreV8Program* pgm, v8::Local<v8::Object> obj) : pgm(pgm) {
    pgm->weakRef();
    this->obj.Reset(pgm->getIsolate(), obj);
}

QoreV8Object::~QoreV8Object() {
    obj.Reset();
    pgm->weakDeref();
}

QoreObject* QoreV8Object::getReferencedProgram() {
    return pgm->getReferencedObject();
}

AbstractQoreNode* QoreV8Object::toData(QoreV8ProgramHelper& v8h) const {
    // check for valid helper to avoid crashes with null isolate
    if (!v8h) {
        return nullptr;
    }
    // the set is to ensure that we only report each object once
    v8::Local<v8::Set> objset = v8::Set::New(v8h.getIsolate());
    return toData(v8h, v8::Null(v8h.getIsolate()), **objset);
}

AbstractQoreNode* QoreV8Object::toData(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> parent,
        v8::Set& objset) const {
    // check for valid helper to avoid crashes with null isolate
    if (!v8h) {
        return nullptr;
    }
    v8::Local<v8::Object> obj = get();
    {
        v8::Maybe<bool> b = objset.Has(v8h.getContext(), obj);
        if (b.IsNothing()) {
            v8h.checkException();
            return nullptr;
        }
        if (b.ToChecked()) {
            return nullptr;
        }
    }
    if (obj->IsCallable()) {
        return new QoreV8CallReference(this, parent);
    }

    v8::Isolate* isolate = v8h.getIsolate();
    v8::EscapableHandleScope handle_scope(isolate);

    v8::MaybeLocal<v8::Array> maybe_props = obj->GetPropertyNames(v8h.getContext());
    if (maybe_props.IsEmpty()) {
        if (v8h.checkException()) {
            return nullptr;
        }
        return new QoreHashNode(autoTypeInfo);
    }

    v8::Local<v8::Array> props = maybe_props.ToLocalChecked();
    // check the first prop; if it's an integer, then it's an array
    uint32_t len = props->Length();
    if (!len) {
        if (obj->IsArray()) {
            return new QoreListNode(autoTypeInfo);
        } else {
            return new QoreHashNode(autoTypeInfo);
        }
    }

    {
        v8::MaybeLocal<v8::Set> v = objset.Add(v8h.getContext(), obj);
        if (v.IsEmpty()) {
            v8h.checkException();
            return nullptr;
        }
    }

    ReferenceHolder<AbstractQoreNode> rv(v8h.getExceptionSink());

    if (obj->IsArray()) {
        rv = toList(v8h, parent, objset, handle_scope.Escape(props), len);
    } else {
        rv = toHash(v8h, parent, objset, handle_scope.Escape(props), len);
    }

    {
        v8::Maybe<bool> v = objset.Delete(v8h.getContext(), obj);
        if (v.IsNothing()) {
            v8h.checkException();
            return nullptr;
        }
    }

    return rv.release();
}

QoreStringNode* QoreV8Object::toString(QoreV8ProgramHelper& v8h) const {
    v8::Local<v8::Object> obj = get();
    v8::MaybeLocal<v8::String> s = obj->ToString(v8h.getContext());
    if (s.IsEmpty()) {
        if (!v8h.checkException()) {
            v8h.getExceptionSink()->raiseException("OBJECT-TOSTRING-ERROR", "Unknown error retrieving string value "
                "of object");
        }
        return nullptr;
    }
    v8::String::Utf8Value str(v8h.getIsolate(), s.ToLocalChecked());
    return new QoreStringNode(*str, QCS_UTF8);
}

QoreListNode* QoreV8Object::getPropertyList(QoreV8ProgramHelper& v8h) {
    v8::Local<v8::Object> obj = get();

    v8::Isolate* isolate = v8h.getIsolate();
    v8::EscapableHandleScope handle_scope(isolate);

    v8::MaybeLocal<v8::Array> maybe_props = obj->GetPropertyNames(v8h.getContext());
    if (maybe_props.IsEmpty()) {
        v8h.checkException();
        return nullptr;
    }

    v8::Local<v8::Array> props = maybe_props.ToLocalChecked();
    // check the first prop; if it's an integer, then it's an array
    uint32_t len = props->Length();
    if (!len) {
        return nullptr;
    }
    ExceptionSink* xsink = v8h.getExceptionSink();
    v8::MaybeLocal<v8::Value> first_prop = props->Get(v8h.getContext(), 0);
    if (first_prop.IsEmpty()) {
        if (v8h.checkException()) {
            return nullptr;
        }
        xsink->raiseException("OBJECT-GET-PROPERTIES-ERROR", "Initial property value is missing");
        return nullptr;
    }
    v8::Local<v8::Value> first = first_prop.ToLocalChecked();
    if (!first->IsString()) {
        return nullptr;
    }

    ReferenceHolder<QoreListNode> rv(new QoreListNode(stringTypeInfo), xsink);

    for (uint32_t i = 0, e = len; i < e; ++i) {
        v8::MaybeLocal<v8::Value> key = props->Get(v8h.getContext(), i);
        if (key.IsEmpty()) {
            if (v8h.checkException()) {
                return nullptr;
            }
            continue;
        }
        v8::Local<v8::Value> k = key.ToLocalChecked();
        ValueHolder qk(v8h.getProgram()->getQoreValue(xsink, k), xsink);
        if (*xsink) {
            if (v8h.checkException()) {
                return nullptr;
            }
            continue;
        }
        QoreStringNodeValueHelper kstr(*qk);
        rv->push(kstr.getReferencedValue(), xsink);
        assert(!*xsink);
    }

    return rv.release();
}

QoreValue QoreV8Object::methodGate(ExceptionSink* xsink, QoreObject* self, const QoreStringNode* m,
        const QoreListNode* args) {
    QoreV8ProgramHelper v8h(xsink, getProgram());
    if (*xsink) {
        return QoreValue();
    }

    v8::Local<v8::Value> attr = getV8KeyValue(v8h, m->c_str());
    if (*xsink) {
        return QoreValue();
    }

    if (!attr->IsObject()) {
        v8::Local<v8::String> str = attr->TypeOf(v8h.getIsolate());
        // Convert the result to an UTF8 string
        v8::String::Utf8Value utf8(v8h.getIsolate(), str);
        xsink->raiseException("JAVASCRIPT-METHODCALL-ERROR", "Object key '%s' is v8 type '%s'; must be a callable "
            "object to make a method call", m->c_str(), *utf8);
        return QoreValue();
    }

    v8::MaybeLocal<v8::Object> maybe_attrobj = attr->ToObject(v8h.getContext());
    if (maybe_attrobj.IsEmpty()) {
        v8h.checkException();
        return QoreValue();
    }

    ReferenceHolder<QoreV8Object> meth(new QoreV8Object(getProgram(), maybe_attrobj.ToLocalChecked()), xsink);
    return meth->callAsFunction(v8h, self, 1, args);
}

QoreValue QoreV8Object::memberGate(ExceptionSink* xsink, const QoreStringNode* m) {
    QoreV8ProgramHelper v8h(xsink, getProgram());
    if (*xsink) {
        return QoreValue();
    }

    v8::Local<v8::Value> attr = getV8KeyValue(v8h, m->c_str());
    if (*xsink) {
        return QoreValue();
    }

    return v8h.getProgram()->getQoreValue(xsink, attr);
}

QoreHashNode* QoreV8Object::toHash(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> parent, v8::Set& objset,
        v8::Local<v8::Array> props, uint32_t len) const {
    ExceptionSink* xsink = v8h.getExceptionSink();
    v8::Local<v8::Object> obj = get();

    ReferenceHolder<QoreHashNode> h(new QoreHashNode(autoTypeInfo), xsink);

    for (uint32_t i = 0, e = len; i < e; ++i) {
        v8::MaybeLocal<v8::Value> key = props->Get(v8h.getContext(), i);
        if (key.IsEmpty()) {
            if (v8h.checkException()) {
                return nullptr;
            }
            continue;
        }
        v8::Local<v8::Value> k = key.ToLocalChecked();
        ValueHolder qk(v8h.getProgram()->getQoreValue(xsink, k), xsink);
        if (*xsink) {
            if (v8h.checkException()) {
                return nullptr;
            }
            continue;
        }
        QoreStringValueHelper kstr(*qk);
        v8::MaybeLocal<v8::Value> value = obj->Get(v8h.getContext(), k);
        if (value.IsEmpty()) {
            if (v8h.checkException()) {
                return nullptr;
            }
            h->setKeyValue(kstr->c_str(), QoreValue(), xsink);
            assert(!*xsink);
            continue;
        }
        v8::Local<v8::Value> v = value.ToLocalChecked();
        if (v->IsObject()) {
            v8::MaybeLocal<v8::Object> o = v->ToObject(v8h.getContext());
            if (o.IsEmpty()) {
                if (v8h.checkException()) {
                    return nullptr;
                }
                continue;
            }
            v8::Local<v8::Object> obj = o.ToLocalChecked();
            ReferenceHolder<QoreV8Object> tmp(new QoreV8Object(v8h.getProgram(), obj), xsink);
            ReferenceHolder<AbstractQoreNode> h0(tmp->toData(v8h, obj, objset), xsink);
            if (*xsink) {
                return nullptr;
            }
            h->setKeyValue(kstr->c_str(), h0.release(), xsink);
            continue;
        }
        ValueHolder qv(v8h.getProgram()->getQoreValue(xsink, v), xsink);
        if (*xsink) {
            return nullptr;
        }
        h->setKeyValue(kstr->c_str(), qv.release(), xsink);
        assert(!*xsink);
    }
    return h.release();
}

constexpr int max_array_element = 50000000;

QoreListNode* QoreV8Object::toList(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> parent, v8::Set& objset,
        v8::Local<v8::Array> props, uint32_t len) const {
    ExceptionSink* xsink = v8h.getExceptionSink();
    v8::Local<v8::Object> obj = get();

    ReferenceHolder<QoreListNode> l(new QoreListNode(autoTypeInfo), xsink);

    for (uint32_t i = 0, e = len; i < e; ++i) {
        v8::MaybeLocal<v8::Value> key = props->Get(v8h.getContext(), i);
        if (key.IsEmpty()) {
            if (v8h.checkException()) {
                return nullptr;
            }
            continue;
        }
        v8::Local<v8::Value> k = key.ToLocalChecked();
        ValueHolder qk(v8h.getProgram()->getQoreValue(xsink, k), xsink);
        if (*xsink) {
            if (v8h.checkException()) {
                return nullptr;
            }
            continue;
        }
        int64 ix = qk->getAsBigInt();
        if (ix > max_array_element) {
            xsink->raiseException("JAVASCRIPT-ARRAY-ERROR", "The JavaScript object references array element "
                "%d which is above the max element limit (%d) supported in Qore", ix, max_array_element);
            return nullptr;
        }
        QoreValue& elem = l->getEntryReference(ix);

        v8::MaybeLocal<v8::Value> value = obj->Get(v8h.getContext(), k);
        if (value.IsEmpty()) {
            if (v8h.checkException()) {
                return nullptr;
            }
            elem = QoreValue();
            assert(!*xsink);
            continue;
        }
        v8::Local<v8::Value> v = value.ToLocalChecked();
        if (v->IsObject()) {
            v8::MaybeLocal<v8::Object> o = v->ToObject(v8h.getContext());
            if (o.IsEmpty()) {
                if (v8h.checkException()) {
                    return nullptr;
                }
                continue;
            }
            v8::Local<v8::Object> obj = o.ToLocalChecked();
            ReferenceHolder<QoreV8Object> tmp(new QoreV8Object(v8h.getProgram(), obj), xsink);
            ReferenceHolder<AbstractQoreNode> h0(tmp->toData(v8h, parent, objset), xsink);
            if (*xsink) {
                return nullptr;
            }
            elem = h0.release();
            continue;
        }
        ValueHolder qv(v8h.getProgram()->getQoreValue(xsink, v), xsink);
        if (*xsink) {
            return nullptr;
        }
        elem = qv.release();
    }
    return l.release();
}

bool QoreV8Object::isCallable(QoreV8ProgramHelper& v8h) const {
    return get()->IsCallable();
}

bool QoreV8Object::isConstructor(QoreV8ProgramHelper& v8h) const {
    return get()->IsConstructor();
}

v8::Local<v8::Object> QoreV8Object::get() const {
    return obj.Get(pgm->getIsolate());
}

v8::Local<v8::Value> QoreV8Object::get(ExceptionSink* xsink, v8::Isolate* isolate) const {
    QoreV8ProgramHelper ph(xsink, pgm);
    if (!ph) {
        return v8::Null(isolate);
    }
    return obj.Get(pgm->getIsolate());
}

v8::Local<v8::Value> QoreV8Object::getV8KeyValue(QoreV8ProgramHelper& v8h, const char* key) const {
    v8::Isolate* isolate = pgm->getIsolate();

    v8::MaybeLocal<v8::String> m_prop = v8::String::NewFromUtf8(isolate, key, v8::NewStringType::kNormal);
    if (m_prop.IsEmpty()) {
        v8h.checkException();
        return v8::Null(isolate);
    }

    v8::EscapableHandleScope handle_scope(isolate);

    v8::MaybeLocal<v8::Value> m_val = get()->Get(v8h.getContext(), m_prop.ToLocalChecked());
    if (m_val.IsEmpty()) {
        v8h.checkException();
        return v8::Null(isolate);
    }

    return handle_scope.Escape(m_val.ToLocalChecked());
}

QoreValue QoreV8Object::getProperty(QoreV8ProgramHelper& v8h, const char* property) {
    v8::MaybeLocal<v8::String> m_prop = v8::String::NewFromUtf8(pgm->getIsolate(), property,
        v8::NewStringType::kNormal);
    if (m_prop.IsEmpty()) {
        v8h.checkException();
        return QoreValue();
    }
    v8::MaybeLocal<v8::Value> m_val = get()->Get(v8h.getContext(), m_prop.ToLocalChecked());
    if (m_val.IsEmpty()) {
        v8h.checkException();
        return QoreValue();
    }
    return pgm->getQoreValue(v8h.getExceptionSink(), m_val.ToLocalChecked());
}

int QoreV8Object::setProperty(QoreV8ProgramHelper& v8h, const char* property, const QoreValue value) {
    v8::MaybeLocal<v8::String> m_prop = v8::String::NewFromUtf8(pgm->getIsolate(), property,
        v8::NewStringType::kNormal);
    ExceptionSink* xsink = v8h.getExceptionSink();
    if (m_prop.IsEmpty()) {
        if (!v8h.checkException()) {
            xsink->raiseException("JAVASCRIPT-SET-PROPERTY-ERROR", "Unknown error processing property string");
        }
        return -1;
    }
    v8::Local<v8::Value> v = v8h.getProgram()->getV8Value(value, xsink);
    if (*xsink) {
        return -1;
    }
    v8::Maybe<bool> b = get()->Set(v8h.getContext(), m_prop.ToLocalChecked(), v);
    if (b.IsNothing()) {
        if (!v8h.checkException()) {
            xsink->raiseException("JAVASCRIPT-SET-PROPERTY-ERROR", "Unknown error setting property '%s'", property);
        }
        return -1;
    }
    return 0;
}

QoreValue QoreV8Object::getIndexValue(QoreV8ProgramHelper& v8h, int64 i) {
    ExceptionSink* xsink = v8h.getExceptionSink();
    if (i < 0 || i >= UINT_MAX) {
        xsink->raiseException("JAVASCRIPT-ERROR", "Invalid array offset passed: " QLLD, i);
        return QoreValue();
    }
    v8::MaybeLocal<v8::Value> m_val = get()->Get(v8h.getContext(), (uint32_t)i);
    if (m_val.IsEmpty()) {
        v8h.checkException();
        return QoreValue();
    }
    return pgm->getQoreValue(xsink, m_val.ToLocalChecked());
}

QoreValue QoreV8Object::callAsFunction(QoreV8ProgramHelper& v8h, const QoreValue js_this, size_t offset,
        const QoreListNode* args) {
    ExceptionSink* xsink = v8h.getExceptionSink();
    QoreV8Program* pgm = v8h.getProgram();

    v8::Local<v8::Value> recv = pgm->getV8Value(js_this, xsink);
    if (*xsink) {
        return QoreValue();
    }
    return callAsFunction(v8h, recv, offset, args);
}

QoreValue QoreV8Object::callAsFunction(QoreV8ProgramHelper& v8h, v8::Local<v8::Value> recv, size_t offset,
        const QoreListNode* args) {
    ExceptionSink* xsink = v8h.getExceptionSink();
    QoreV8Program* pgm = v8h.getProgram();

    // JavaScript "this" object
    v8::Local<v8::Object> self = get();
    if (!self->IsFunction()) {
        xsink->raiseException("JAVASCRIPT-ERROR", "This object cannot be called as a function");
        return QoreValue();
    }

    ssize_t size = (args ? args->size() : 0) - offset;
    if (size < 0) {
        size = 0;
    }
    std::unique_ptr<v8::Local<v8::Value>[]> argv(new v8::Local<v8::Value>[size]);
    v8::Local<v8::Value> v0;
    if (size) {
        ConstListIterator i(args, offset - 1);
        while (i.next()) {
            v0 = pgm->getV8Value(i.getValue(), xsink);
            if (*xsink) {
                return QoreValue();
            }
            argv[i.index() - offset] = v0;
            //printd(5, "QoreV8Object::callAsFunction() arg %d/%d: %s\n", (int)(i.index() - offset), (int)size,
            //    i.getValue().getFullTypeName());
        }
    }
    //printd(5, "QoreV8Object::callAsFunction() input args: %d offset: %d argc: %d recv: '%s'\n", (int)args->size(),
    //    (int)offset, (int)size, js_this.getFullTypeName());

    v8::Local<v8::Context> ctxt = v8h.getContext();

    v8::MaybeLocal<v8::Value> rv = self->CallAsFunction(ctxt, recv, (int)size, argv.get());
    if (rv.IsEmpty()) {
        v8h.checkException();
        return QoreValue();
    }
    return pgm->getQoreValue(xsink, rv.ToLocalChecked());
}
