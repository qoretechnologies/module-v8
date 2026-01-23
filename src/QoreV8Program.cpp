/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Program.cpp defines the QoreV8Program class */
/*
    QoreV8Program.qpp

    Qore Programming Language

    Copyright 2024 Qore Technologies, s.r.o.

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
#include "QC_JavaScriptPromise.h"
#include "QoreV8Program.h"
#include "QoreV8StackLocationHelper.h"

#include <uv.h>

#include <vector>
#include <string>
#include <memory>
#include <climits>
#include <cmath>

QoreThreadLock QoreV8Program::global_lock;
QoreV8Program::pset_t QoreV8Program::pset;
QoreString QoreV8Program::scont("\\n");

#if 0
static void qore_promise_hook(v8::PromiseHookType type, v8::Local<v8::Promise> promise,
            v8::Local<v8::Value> parent_promise) {
    switch(type) {
        case v8::PromiseHookType::kAfter:
            printd(0, "qore_promise_hook() after p: %p pp: %p\n", promise, parent_promise);
            break;
    }
}
#endif

QoreV8Program::QoreV8Program() : save_ref_callback(nullptr) {
    //printd(5, "QoreV8Program::QoreV8Program() this: %p\n", this);
    // Setup up a libuv event loop, v8::Isolate, and Node.js Environment.
    // setup common environment
    std::vector<std::string> errors;
    setup = node::CommonEnvironmentSetup::Create(platform.get(), &errors, init_result->args(),
        init_result->exec_args(), node::EnvironmentFlags::kNoCreateInspector);
    if (!setup) {
        for (const std::string& err : errors) {
            fprintf(stderr, "v8 module init error: %s: %s\n", init_result->args()[0].c_str(), err.c_str());
        }
        return;
    }

    isolate = setup->isolate();
#if 0
    isolate->SetPromiseHook(qore_promise_hook);
#endif

    isolate->AddNearHeapLimitCallback(heapLimitCallback, this);
    //isolate->SetMicrotasksPolicy(v8::MicrotasksPolicy::kAuto);
    assert(isolate);
    env = setup->env();
    assert(env);
}

QoreV8Program::QoreV8Program(const QoreString& source_code, const QoreString& source_label, ExceptionSink* xsink)
        : QoreV8Program() {
    assert(source_code.getEncoding() == QCS_UTF8);
    assert(source_label.getEncoding() == QCS_UTF8);

    source = source_code;
    label = source_label;

    init(xsink);
}

QoreV8Program::QoreV8Program(ExceptionSink* xsink, const QoreV8Program& old, QoreObject* self) : QoreV8Program() {
    source = old.source;
    label = old.label;

    if (!init(xsink)) {
        this->self = self;
    }
}

QoreV8Program::QoreV8Program(const QoreV8Program& old, QoreProgram* qpgm) : QoreV8Program() {
    self = old.self;
}

QoreV8Program::~QoreV8Program() {
    //printd(5, "QoreV8Program::~QoreV8Program() this: %p\n", this);
    assert(!weakRefs.reference_count());

    AutoLocker al(global_lock);
    pset_t::iterator i = pset.find(this);
    if (i != pset.end()) {
        pset.erase(i);
    }
}

class ScopedIsolate {
public:
    DLLLOCAL ScopedIsolate() : isolate(v8::Isolate::Allocate()) {
    }

    DLLLOCAL ~ScopedIsolate() {
        isolate->Dispose();
    }

    DLLLOCAL v8::Isolate* operator*() {
        return isolate;
    }

    DLLLOCAL v8::Isolate* operator->() {
        return isolate;
    }

private:
    v8::Isolate* isolate;
};

#if 0
BinaryNode* QoreV8Program::createSnapshot(ExceptionSink* xsink, const QoreString& source_code,
        const QoreString& source_label) {

    ScopedIsolate isolate;
    v8::Isolate::CreateParams params;
    std::unique_ptr<v8::ArrayBuffer::Allocator> array_buffer_allocator(
        v8::ArrayBuffer::Allocator::NewDefaultAllocator());
    v8::Isolate::CreateParams create_params;
    params.array_buffer_allocator = array_buffer_allocator.get();
    v8::SnapshotCreator creator(*isolate, params);

    QoreString source = source_code;
    QoreString label = source_label;

    //creator.SetDefaultContext(setup->context());
    v8::StartupData data = creator.CreateBlob(v8::SnapshotCreator::FunctionCodeHandling::kKeep);
    SimpleRefHolder<BinaryNode> rv(new BinaryNode);
    rv->append(data.data, data.raw_size);
    return rv.release();
}
#endif

static void js_oom(v8::Isolate* isolate, void* data) {
    size_t current_heap_limit = reinterpret_cast<size_t>(data);
    ExceptionSink xsink;
    xsink.raiseException("JAVASCRIPT-OUT-OF-MEMORY", "JavaScript heap limit (" QLLD ") exceeded", current_heap_limit);
    QoreV8Program::raiseV8Exception(xsink, isolate);
}

size_t QoreV8Program::heapLimitCallback(void* ptr, size_t current_heap_limit, size_t initial_heap_limit) {
    QoreV8Program* pgm = reinterpret_cast<QoreV8Program*>(ptr);
    pgm->heap_limit = true;
    // throw an OOM exception ASAP in the program
    pgm->isolate->RequestInterrupt(js_oom, reinterpret_cast<void*>(current_heap_limit));
    return current_heap_limit + 1024 * 1024 * 50;
}

int QoreV8Program::init(ExceptionSink* xsink) {
    if (!valid) {
        xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "Could not initialize JavaScript program");
        return -1;
    }

    SystemEnvironment::set("_qore_v8_source", source.c_str());
    SystemEnvironment::set("_qore_v8_filename", label.c_str());
    char* dn = q_dirname(label.c_str());
    ON_BLOCK_EXIT(free, dn);
    SystemEnvironment::set("_qore_v8_dirname", dn);

    {
        v8::Locker locker(isolate);

        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        // The v8::Context needs to be entered when node::CreateEnvironment() and
        // node::LoadEnvironment() are being called.
        v8::Context::Scope context_scope(setup->context());
        v8::TryCatch tryCatch(isolate);

        // Set up the Node.js instance for execution, and run code inside of it.
        // There is also a variant that takes a callback and provides it with
        // the `require` and `process` objects, so that it can manually compile
        // and run scripts as needed.
        // The `require` function inside this script does *not* access the file
        // system, and can only load built-in Node.js modules.
        // `module.createRequire()` is being used to create one that is able to
        // load files from the disk, and uses the standard CommonJS file loader
        // instead of the internal-only `require` function.

        QoreStringMaker envstr("const publicRequire = require('module').createRequire(process.cwd() + '/');\n"
            "globalThis.require = publicRequire;\n"
            "publicRequire('node:vm').runInThisContext(process.env._qore_v8_source, {\n"
            "  'filename': process.env._qore_v8_filename\n"
            "});");
        v8::MaybeLocal<v8::Value> loadenv_ret = node::LoadEnvironment(env, envstr.c_str());
        valid = !loadenv_ret.IsEmpty();
        if (!valid) {
            if (!checkException(xsink, tryCatch)) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "Unknown error initializing program");
            }
            return -1;
        }

        ctx.Reset(isolate, setup->context());
        global.Reset(isolate, setup->context()->Global());
    }

    AutoLocker al(global_lock);
    pset.insert(this);

    return 0;
}

void QoreV8Program::shutdown() {
    ExceptionSink xsink;
    for (auto& i : pset) {
        i->deleteIntern(&xsink);
        i->setup = nullptr;
    }
}

void QoreV8Program::deleteIntern(ExceptionSink* xsink) {
    printd(5, "QoreV8Program::deleteIntern() this: %p\n", this);
    {
        AutoLocker al(m);
        if (opcount) {
            if (!to_destroy) {
                to_destroy = true;
            }
            return;
        }
        if (valid) {
            valid = false;
            if (to_destroy) {
                to_destroy = false;
            }
        }
        if (save_ref_callback) {
            save_ref_callback.release()->deref(xsink);
        }
    }
    if (env) {
        node::Stop(env);
        env = nullptr;
    }
    ctx.Reset();
    global.Reset();
}

int QoreV8Program::saveQoreReference(const QoreValue& rv, ExceptionSink& xsink) {
    {
        qore_type_t t = rv.getType();
        if (t != NT_OBJECT && t != NT_RUNTIME_CLOSURE && t != NT_FUNCREF
            && (!(rv.getType() == NT_BINARY && dynamic_cast<const QoreV8Dereferencer*>(rv.getInternalNode())))) {
            return 0;
        }
    }

    //printd(5, "QorePythonProgram::saveQoreReference() this: %p val: %s soc: %p\n", this,
    //    rv.getFullTypeName(), *save_ref_callback);

    if (save_ref_callback) {
        ReferenceHolder<QoreListNode> args(new QoreListNode(autoTypeInfo), &xsink);
        args->push(rv.refSelf(), &xsink);

        QoreV8ProgramHelper v8h(&xsink, this);
        if (!v8h) {
            return -1;  // Exception already raised in v8h constructor
        }
        QoreV8StackLocationHelper slh(v8h);

        save_ref_callback->execValue(*args, &xsink);
        if (xsink) {
            raiseV8Exception(xsink, isolate);
            return -1;
        }
        return 0;
    }

    return saveQoreReferenceDefault(rv, xsink);
}

int QoreV8Program::saveQoreReferenceDefault(const QoreValue& rv, ExceptionSink& xsink) {
    QoreHashNode* data = qpgm->getThreadData();
    assert(data);
    const char* domain_name;
    // get key name where to save the data if possible
    QoreValue v = data->getKeyValue("_v8_save");
    if (v.getType() != NT_STRING) {
        domain_name = "_v8_save";
    } else {
        domain_name = v.get<const QoreStringNode>()->c_str();
    }

    QoreValue kv = data->getKeyValue(domain_name);
    // ignore operation if domain exists but is not a list
    if (!kv || kv.getType() == NT_LIST) {
        QoreListNode* list;
        ReferenceHolder<QoreListNode> list_holder(&xsink);
        if (!kv) {
            // we need to assign list in data *after* we prepend the object to the list
            // in order to manage object counts
            list = new QoreListNode(autoTypeInfo);
            list_holder = list;
        } else {
            list = kv.get<QoreListNode>();
        }

        // prepend to list to ensure FILO destruction order
        list->splice(0, 0, rv, &xsink);
        if (!xsink && list_holder) {
            data->setKeyValue(domain_name, list_holder.release(), &xsink);
        }
        if (xsink) {
            raiseV8Exception(xsink, isolate);
            return -1;
        }
        //printd(5, "saveQoreReferenceDefault() domain: '%s' obj: %p %s\n", domain_name, rv.get<QoreObject>(),
        //    rv.get<QoreObject>()->getClassName());
    } else {
        //printd(5, "saveQoreReferenceDefault() NOT SAVING domain: '%s' HAS KEY v: %s (kv: %s)\n", domain_name,
        //    rv.getFullTypeName(), kv.getFullTypeName());
    }
    return 0;
}

int QoreV8Program::checkException(ExceptionSink* xsink, const v8::TryCatch& tryCatch) const {
    if (tryCatch.HasCaught()) {
        v8::Local<v8::Value> ex = tryCatch.Exception();
        if (!*ex) {
            xsink->raiseException("JAVASCRIPT-EXCEPTION", "empty exception thrown at unknown source location");
            return -1;
        }

        // convert to a string
        v8::String::Utf8Value exception(isolate, ex);

        v8::Local<v8::Context> context(isolate->GetCurrentContext());

        // convert to a Qore value
        ValueHolder arg(xsink);
        if (ex->IsObject()) {
            v8::MaybeLocal<v8::Object> o = ex->ToObject(context);
            assert(!o.IsEmpty());
            ReferenceHolder<QoreV8Object> arg_obj(new QoreV8Object(const_cast<QoreV8Program*>(this),
                o.ToLocalChecked()), xsink);
            QoreV8ProgramHelper ph(xsink, const_cast<QoreV8Program*>(this));
            arg = arg_obj->toData(ph);
        } else {
            arg = const_cast<QoreV8Program*>(this)->getQoreValue(xsink, ex);
        }

        v8::Local<v8::Message> msg = tryCatch.Message();
        if (msg.IsEmpty()) {
            xsink->raiseException("JAVASCRIPT-EXCEPTION", new QoreStringNode(*exception));
            return -1;
        }

        SimpleRefHolder<QoreStringNode> desc(new QoreStringNode(*exception));

        // add Java call stack to Qore call stack
        QoreExternalProgramLocationWrapper loc;
        std::string code_line;
        QoreV8CallStack stack(isolate, tryCatch, context, msg, loc, code_line);

        if (!code_line.empty()) {
            if (!desc->empty()) {
                desc->concat('\n');
            }
            desc->concat(code_line);
        }

        xsink->raiseExceptionArg(loc.get(), "JAVASCRIPT-EXCEPTION", arg.release(), desc.release(), stack);
        return -1;
    }
    return 0;
}

QoreValue QoreV8Program::getQoreValue(ExceptionSink* xsink, v8::Local<v8::Value> val) {
    v8::Local<v8::Context> context = ctx.Get(isolate);

    const v8::TryCatch tryCatch(isolate);
    if (val->IsInt32() || val->IsUint32()) {
        v8::MaybeLocal<v8::Integer> i = val->ToInteger(context);
        if (i.IsEmpty()) {
            checkException(xsink, tryCatch);
            return QoreValue();
        }
        int64 v = i.ToLocalChecked()->Value();
        //printd(5, "int: %d", (int)v);
        return v;
    }

    if (val->IsBigInt()) {
        v8::MaybeLocal<v8::BigInt> i = val->ToBigInt(context);
        if (i.IsEmpty()) {
            checkException(xsink, tryCatch);
            return QoreValue();
        }
        v8::Local<v8::BigInt> bi = i.ToLocalChecked();
        bool lossless = false;
        int64_t v = bi->Int64Value(&lossless);
        if (lossless) {
            return v;
        }
        // Convert the result to a UTF8 string
        v8::String::Utf8Value utf8(isolate, val);
        return new QoreNumberNode(*utf8);
    }

    if (val->IsBoolean()) {
        v8::Local<v8::Boolean> b = val->ToBoolean(isolate);
        return QoreValue(b->Value());
    }

    if (val->IsString()) {
        v8::String::Utf8Value str(isolate, val);
        return new QoreStringNode(*str, QCS_UTF8);
    }

    if (val->IsNumber()) {
        v8::MaybeLocal<v8::Number> n = val->ToNumber(context);
        if (n.IsEmpty()) {
            checkException(xsink, tryCatch);
            return QoreValue();
        }
        // returns a double
        double v = n.ToLocalChecked()->Value();
        //printd(5, "QoreV8Program::getQoreValue() Number: %g\n", v);
        double intpart;
        if (modf(v, &intpart) == 0.0) {
            return QoreValue((int64)v);
        }
        return QoreValue(v);
    }

    if (val->IsArray()) {
        v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(val);
        ReferenceHolder<QoreListNode> rv(new QoreListNode(autoTypeInfo), xsink);
        for (uint32_t i = 0, e = array->Length(); i < e; ++i) {
            v8::MaybeLocal<v8::Value> val = array->Get(context, i);
            if (val.IsEmpty()) {
                rv->push(QoreValue(), xsink);
                continue;
            }
            v8::Local<v8::Value> v = val.ToLocalChecked();
            ValueHolder qv(getQoreValue(xsink, v), xsink);
            if (*xsink) {
                return QoreValue();
            }
            rv->push(qv.release(), xsink);
        }
        return rv.release();
    }

    if (val->IsPromise()) {
        v8::Local<v8::Promise> p = v8::Local<v8::Promise>::Cast(val);
        ReferenceHolder<QoreV8Promise> pd(new QoreV8Promise(xsink, this, p), xsink);
        if (*xsink) {
            return QoreValue();
        }
        return new QoreObject(QC_JAVASCRIPTPROMISE, getProgram(), pd.release());
    }

    if (val->IsObject()) {
        v8::MaybeLocal<v8::Object> o = val->ToObject(context);
        if (o.IsEmpty()) {
            checkException(xsink, tryCatch);
            return QoreValue();
        }
        return new QoreObject(QC_JAVASCRIPTOBJECT, getProgram(), new QoreV8Object(this, o.ToLocalChecked()));
    }

    if (val->IsNullOrUndefined()) {
        return QoreValue();
    }

    v8::Local<v8::String> str = val->TypeOf(isolate);
    // Convert the result to an UTF8 string
    v8::String::Utf8Value utf8(isolate, str);
    xsink->raiseException("JAVASCRIPT-TYPE-ERROR", "Cannot convert v8 '%s' value to a Qore value", *utf8);
    return QoreValue();
}

void QoreV8Program::raiseV8Exception(ExceptionSink& xsink, v8::Isolate* isolate) {
    assert(xsink);
    QoreString err;
    QoreString desc;
    const QoreString* errstr = nullptr;
    const QoreString* descstr = nullptr;
    const QoreValue errv = xsink.getExceptionErr();
    const QoreValue descv = xsink.getExceptionDesc();
    if (errv.getType() == NT_STRING) {
        errstr = errv.get<const QoreStringNode>();
    } else {
        if (errv.getAsString(err, 0, &xsink)) {
            xsink.clear();
            err.set("UNKNOWN-EXCEPTION");
        }
        errstr = &err;
    }
    if (descv.getType() == NT_STRING) {
        descstr = descv.get<const QoreStringNode>();
    } else {
        if (descv.getAsString(desc, 0, &xsink)) {
            xsink.clear();
            desc.set("Unknown reason");
        }
        descstr = &desc;
    }

    QoreStringMaker str("%s: %s", errstr->c_str(), descstr->c_str());

    v8::MaybeLocal<v8::String> exstr = v8::String::NewFromUtf8(isolate, str.c_str(), v8::NewStringType::kNormal);
    if (!exstr.IsEmpty()) {
        isolate->ThrowException(exstr.ToLocalChecked());
    }
    xsink.clear();
}

int QoreV8Program::spinOnce() {
    uv_loop_t* loop = setup->event_loop();

    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);

    uv_run(loop, UV_RUN_DEFAULT);

    return 0;
}

int QoreV8Program::spinEventLoop() {
    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);
    return node::SpinEventLoop(env).FromMaybe(1);
}

// use a simple value to dereference callbacks
struct QoreV8CallbackInfo : public QoreV8Dereferencable {
public:
    ResolvedCallReferenceNode* ref;
    QoreV8Program* pgm;

    DLLLOCAL QoreV8CallbackInfo(const ResolvedCallReferenceNode* ref, QoreV8Program* pgm)
            : ref(const_cast<ResolvedCallReferenceNode*>(ref)), pgm(pgm) {
        this->ref->weakRef();
    }

    DLLLOCAL virtual ~QoreV8CallbackInfo() {
    }

    DLLLOCAL virtual void destroy() {
        assert(ref);
        ref->weakDeref();
        ref = nullptr;
        pgm = nullptr;
        d = nullptr;
        delete this;
    }
};

static void call_callref(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::Value> v = info.Data();
    assert(v->IsExternal());

    v8::Local<v8::External> ext = v8::Local<v8::External>::Cast(v);
    QoreV8CallbackInfo* cbinfo = reinterpret_cast<QoreV8CallbackInfo*>(ext->Value());
    ExceptionSink xsink;
    v8::Isolate* isolate = info.GetIsolate();
    if (!cbinfo || !cbinfo->ref) {
        xsink.raiseException("CALLBACK-ERROR", "Cannot call a callback that has already gone out of scope");
        // raise JS exception
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    OptionalCallReferenceAccessHelper rh(&xsink, cbinfo->ref);
    if (!rh) {
        assert(xsink);
        // raise JS exception
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    ReferenceHolder<QoreListNode> args(&xsink);
    int len = info.Length();
    if (len) {
        args = new QoreListNode(autoTypeInfo);
        for (int i = 0; i < len; ++i) {
            ValueHolder arg(cbinfo->pgm->getQoreValue(&xsink, info[i]), &xsink);
            if (xsink) {
                // raise JS exception
                QoreV8Program::raiseV8Exception(xsink, isolate);
                return;
            }
            args->push(arg.release(), &xsink);
            assert(!xsink);
        }
    }

    //QoreV8ProgramHelper v8h(&xsink, cbinfo->pgm);
    //QoreV8StackLocationHelper slh(v8h);

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

#if 0
static void deref_callref(const v8::WeakCallbackInfo<QoreV8CallbackInfo>& data) {
    delete data.GetParameter();
}
#endif

v8::Local<v8::Value> QoreV8Program::getV8Value(const QoreValue val, ExceptionSink* xsink) {
    //printd(5, "QoreV8Program::getV8Value() type '%s'\n", val.getFullTypeName());

    v8::Isolate::Scope isolate_scope(isolate);
    v8::EscapableHandleScope handle_scope(isolate);

    const v8::TryCatch tryCatch(isolate);

    switch (val.getType()) {
        case NT_NOTHING:
        case NT_NULL:
            return v8::Null(isolate);

        case NT_INT: {
            int64 v = val.getAsBigInt();
            // see if it's an int32_t
            if (v >= INT_MIN && v < INT_MAX) {
                return handle_scope.Escape(v8::Integer::New(isolate, (int32_t)v));
            }
            if (v >=0 && v < UINT_MAX) {
                return handle_scope.Escape(v8::Integer::NewFromUnsigned(isolate, (int32_t)v));
            }
            return handle_scope.Escape(v8::BigInt::New(isolate, v));
        }

        case NT_STRING: {
            v8::MaybeLocal<v8::String> rv = v8::String::NewFromUtf8(isolate, val.get<const QoreStringNode>()->c_str(),
                v8::NewStringType::kNormal);
            if (rv.IsEmpty()) {
                checkException(xsink, tryCatch);
                return v8::Null(isolate);
            }
            return handle_scope.Escape(rv.ToLocalChecked());
        }

        case NT_DATE: {
            // format the date as an ISO-8601 string
            QoreString str;
            val.get<const DateTimeNode>()->format(str, "IF");
            v8::MaybeLocal<v8::String> rv = v8::String::NewFromUtf8(isolate, str.c_str(), v8::NewStringType::kNormal);
            if (rv.IsEmpty()) {
                checkException(xsink, tryCatch);
                return v8::Null(isolate);
            }
            return handle_scope.Escape(rv.ToLocalChecked());
        }

        case NT_BOOLEAN: {
            return handle_scope.Escape(v8::Boolean::New(isolate, val.getAsBool()));
        }

        case NT_FLOAT: {
            return handle_scope.Escape(v8::Number::New(isolate, val.getAsFloat()));
        }

        case NT_NUMBER: {
            return handle_scope.Escape(v8::Number::New(isolate, val.get<const QoreNumberNode>()->getAsFloat()));
        }

        case NT_BINARY: {
            QoreString str(val.get<const BinaryNode>());
            v8::MaybeLocal<v8::String> rv = v8::String::NewFromUtf8(isolate, str.c_str(), v8::NewStringType::kNormal);
            if (rv.IsEmpty()) {
                checkException(xsink, tryCatch);
                return v8::Null(isolate);
            }
            return handle_scope.Escape(rv.ToLocalChecked());
        }

        case NT_LIST: {
            const QoreListNode* l = val.get<const QoreListNode>();
            std::vector<v8::Local<v8::Value>> vec;
            vec.reserve(l->size());
            ConstListIterator i(l);
            v8::Local<v8::Value> v;
            while (i.next()) {
                v = getV8Value(i.getValue(), xsink);
                if (*xsink) {
                    return v8::Null(isolate);
                }
                vec.push_back(v);
            }
            return handle_scope.Escape(v8::Array::New(isolate, vec.data(), l->size()));
        }

        case NT_HASH: {
            const QoreHashNode* h = val.get<const QoreHashNode>();
            v8::Local<v8::Context> context = ctx.Get(isolate);
            v8::Local<v8::Object> obj = v8::Object::New(isolate);
            ConstHashIterator i(h);
            while (i.next()) {
                v8::Local<v8::Value> v = getV8Value(i.get(), xsink);
                if (*xsink) {
                    return v8::Null(isolate);
                }
                v8::MaybeLocal<v8::String> key = v8::String::NewFromUtf8(isolate, i.getKey(),
                    v8::NewStringType::kNormal);
                if (key.IsEmpty()) {
                    checkException(xsink, tryCatch);
                    return v8::Null(isolate);
                }
                v8::Maybe<bool> ok = obj->CreateDataProperty(context, key.ToLocalChecked(), v);
                if (ok.IsNothing()) {
                    checkException(xsink, tryCatch);
                    return v8::Null(isolate);
                }
                //printd(5, "object %p set \"%s\" -> %s\n", h, i.getKey(), i.get().getFullTypeName());
            }
            return handle_scope.Escape(obj);
        }

        case NT_OBJECT: {
            QoreObject* obj = const_cast<QoreObject*>(val.get<const QoreObject>());
            ReferenceHolder<QoreV8Object> pd(obj->tryGetReferencedPrivateData<QoreV8Object>(CID_JAVASCRIPTOBJECT,
                xsink), xsink);
            if (*xsink) {
                return v8::Null(isolate);
            }
            if (!pd) {
                xsink->raiseException("JAVASCRIPT-TYPE-ERROR", "Cannot convert Qore values of type '%s' to a V8 "
                    "value", val.getFullTypeName());
                return v8::Null(isolate);
            }
            return handle_scope.Escape(pd->get(xsink, isolate));
        }

        case NT_RUNTIME_CLOSURE:
        case NT_FUNCREF: {
            const ResolvedCallReferenceNode* ref = val.get<const ResolvedCallReferenceNode>();
            v8::MaybeLocal<v8::Function> rv = getV8Function(xsink, ref, tryCatch, handle_scope);
            if (rv.IsEmpty()) {
                return v8::Null(isolate);
            }
            return rv.ToLocalChecked();
        }

        default:
            xsink->raiseException("JAVASCRIPT-TYPE-ERROR", "Cannot convert Qore values of type '%s' to a V8 value",
                val.getFullTypeName());
    }


    return v8::Null(isolate);
}

v8::MaybeLocal<v8::Function> QoreV8Program::getV8Function(ExceptionSink* xsink, const ResolvedCallReferenceNode* call,
        const v8::TryCatch& tryCatch, v8::EscapableHandleScope& handle_scope) {
    QoreV8CallbackInfo* cbinfo = new QoreV8CallbackInfo(call, this);
    v8::Local<v8::External> ext = v8::External::New(isolate, (void*)cbinfo);

#if 0
    // add callback to external object
    v8::Global<v8::External> gext;
    gext.Reset(isolate, ext);
    gext.SetWeak(cbinfo, deref_callref, v8::WeakCallbackType::kParameter);
#endif

    v8::Local<v8::Context> context = ctx.Get(isolate);
    v8::MaybeLocal<v8::Function> func = v8::Function::New(context, call_callref, ext);
    if (func.IsEmpty()) {
        //printd(5, "call: %p -> func empty\n", call);
        checkException(xsink, tryCatch);
        return v8::MaybeLocal<v8::Function>();
    }
    ReferenceHolder<QoreV8Dereferencer> rh(new QoreV8Dereferencer(cbinfo), xsink);
    if (saveQoreReference(*rh, *xsink)) {
        //printd(5, "call: %p -> cannot save Qore reference\n", call);
        assert(*xsink);
        return v8::MaybeLocal<v8::Function>();
    }
    //printd(5, "call: %p -> returning JS function object\n", call);
    return v8::MaybeLocal<v8::Function>(handle_scope.Escape(func.ToLocalChecked()));
}

QoreObject* QoreV8Program::getGlobal(ExceptionSink* xsink) {
    QoreV8ProgramHelper v8h(xsink, this);
    if (*xsink) {
        return nullptr;
    }

    v8::Local<v8::Object> g = global.Get(isolate);
    return new QoreObject(QC_JAVASCRIPTOBJECT, getProgram(), new QoreV8Object(this, g));
}