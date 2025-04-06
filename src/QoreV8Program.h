/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8Program.h

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

#ifndef _QORE_QOREV8PROGRAM

#define _QORE_QOREV8PROGRAM

#include "v8-module.h"

#include <set>
#include <map>
#include <memory>

class QoreV8Program : public AbstractQoreProgramExternalData {
    friend class QoreV8ProgramHelper;
    friend class QoreV8ProgramOperationHelper;
    friend class QoreV8Object;
public:
    DLLLOCAL QoreV8Program(const QoreString& source_code, const QoreString& source_label, ExceptionSink* xsink);

    DLLLOCAL QoreV8Program(const QoreV8Program& old, QoreProgram* qpgm);

    DLLLOCAL QoreV8Program(ExceptionSink* xsink, const QoreV8Program& old, QoreObject* self);

    DLLLOCAL ~QoreV8Program();

    DLLLOCAL virtual void doDeref() {
        printd(5, "QoreV8Program::doDeref() this: %p\n", this);
        ExceptionSink xsink;
        deleteIntern(&xsink);
        if (xsink) {
            throw QoreXSinkException(xsink);
        }
        weakDeref();
    }

    DLLLOCAL void destructor(ExceptionSink* xsink) {
        deleteIntern(xsink);
    }

    DLLLOCAL virtual AbstractQoreProgramExternalData* copy(QoreProgram* pgm) const {
        return new QoreV8Program(*this, pgm);
    }

    //! Returns a Qore value for the given V8 value
    DLLLOCAL QoreValue getQoreValue(ExceptionSink* xsink, v8::Local<v8::Value> val);

    //! Returns a V8 value for the given Qore value
    DLLLOCAL v8::Local<v8::Value> getV8Value(const QoreValue val, ExceptionSink* xsink);

    //! Returns a callable function object for the given Qore callable data
    DLLLOCAL v8::MaybeLocal<v8::Function> getV8Function(ExceptionSink* xsink, const ResolvedCallReferenceNode* call,
            const v8::TryCatch& tryCatch, v8::EscapableHandleScope& handle_scope);

    //! Checks if a JavaScript exception has been thrown and throws the corresponding Qore exception
    DLLLOCAL int checkException(ExceptionSink* xsink, const v8::TryCatch& tryCatch) const;

    //! Returns the global proxy object
    DLLLOCAL QoreObject* getGlobal(ExceptionSink* xsink);

    //! Returns the pointer to the isolate
    DLLLOCAL v8::Isolate* getIsolate() const {
        return isolate;
    }

    //! Sets the "save object callback" for %Qore values managed by JavaScript objects
    DLLLOCAL void setSaveReferenceCallback(const ResolvedCallReferenceNode* save_ref_callback) {
        //printd(5, "QorePythonProgram::setSaveObjectCallback() this: %p old: %p new: %p\n", this,
        //  *this->save_object_callback, save_object_callback);
        this->save_ref_callback = save_ref_callback ? save_ref_callback->refRefSelf() : nullptr;
    }

    //! Returns the "save object callback" for %Qore values managed by JavaScript objects
    DLLLOCAL ResolvedCallReferenceNode* getSaveReferenceCallback() const {
        return *save_ref_callback;
    }

    DLLLOCAL int spinOnce();

    DLLLOCAL int spinEventLoop();

    DLLLOCAL void setObject(QoreObject* self) {
        assert(!this->self);
        this->self = self;
    }

    DLLLOCAL QoreObject* getReferencedObject() {
        assert(self);
        return self->objectRefSelf();
    }

    DLLLOCAL void weakRef() {
        weakRefs.ROreference();
        //printd(5, "QoreV8Program::weakRef() this %p %d -> %d\n", this, weakRefs.reference_count() - 1,
        //    weakRefs.reference_count());
    }

    DLLLOCAL bool weakDeref() {
        //printd(5, "QoreV8Program::weakDeref() this %p %d -> %d\n", this, weakRefs.reference_count(),
        //    weakRefs.reference_count() - 1);
        if (weakRefs.ROdereference()) {
            delete this;
            return true;
        }
        return false;
    }

#if 0
    //! Returns a binary snapshot of the program
    DLLLOCAL static BinaryNode* createSnapshot(ExceptionSink* xsink, const QoreString& source_code,
            const QoreString& source_label);
#endif

    //! Raises an exception in the given isolate from the Qore exception
    DLLLOCAL static void raiseV8Exception(ExceptionSink& xsink, v8::Isolate* isolate);

    DLLLOCAL static void shutdown();

    DLLLOCAL int saveQoreReference(const QoreValue& rv, ExceptionSink& xsink);

protected:
    std::unique_ptr<node::CommonEnvironmentSetup> setup;
    v8::Isolate* isolate = nullptr;
    node::Environment* env = nullptr;

    QoreString source;
    QoreString label;

    v8::Global<v8::Object> global;

    QoreObject* self = nullptr;
    QoreProgram* qpgm = getProgram();
    QoreReferenceCounter weakRefs;
    QoreThreadLock m;

    // call reference for saving Qore references
    mutable ReferenceHolder<ResolvedCallReferenceNode> save_ref_callback;

    unsigned opcount = 0;
    bool to_destroy = false;
    bool valid = true;
    bool heap_limit = false;

    static QoreThreadLock global_lock;
    typedef std::set<QoreV8Program*> pset_t;
    static pset_t pset;

    static QoreString scont;

    //! protected constructor
    DLLLOCAL QoreV8Program();

    DLLLOCAL int init(ExceptionSink* xsink);

    DLLLOCAL void deleteIntern(ExceptionSink* xsink);

    DLLLOCAL int saveQoreReferenceDefault(const QoreValue& rv, ExceptionSink& xsink);

    DLLLOCAL static void escapeSingle(QoreString& str);

    DLLLOCAL static size_t heapLimitCallback(void* ptr, size_t current_heap_limit,
            size_t initial_heap_limit);
};

class QoreV8CallStack : public QoreCallStack {
public:
    DLLLOCAL QoreV8CallStack(v8::Isolate* isolate, const v8::TryCatch& tryCatch,
            v8::Local<v8::Context> context, v8::Local<v8::Message> msg,
            QoreExternalProgramLocationWrapper& loc, std::string& code_line);
};

class QoreV8ProgramData : public AbstractPrivateData, public QoreV8Program {
public:
    DLLLOCAL QoreV8ProgramData(const QoreString& source_code, const QoreString& source_label, ExceptionSink* xsink)
            : QoreV8Program(source_code, source_label, xsink) {
        //printd(5, "QoreV8ProgramData::QoreV8ProgramData() this: %p\n", this);
    }

    DLLLOCAL QoreV8ProgramData(ExceptionSink* xsink, const QoreV8ProgramData& old, QoreObject* self)
            : QoreV8Program(xsink, old, self) {
        //printd(5, "QoreV8ProgramData::QoreV8ProgramData() this: %p\n", this);
    }

    DLLLOCAL virtual void deref(ExceptionSink* xsink) {
        if (ROdereference()) {
            weakDeref();
        }
    }

    DLLLOCAL virtual void deref() {
        if (ROdereference()) {
            weakDeref();
        }
    }

private:
    DLLLOCAL virtual ~QoreV8ProgramData() {
    }
};

class QoreV8ProgramHelper {
public:
    DLLLOCAL QoreV8ProgramHelper(ExceptionSink* xsink, QoreV8Program* pgm, bool silent = false) :
            locker(pgm->isolate),
            isolate_scope(pgm->isolate),
            handle_scope(pgm->isolate),
            tryCatch(pgm->isolate),
            //origin(pgm->isolate, pgm->label.Get(pgm->isolate)),
            context(pgm->setup->context()),
            context_scope(context) {
        AutoLocker al(pgm->m);
        if (!pgm->valid) {
            if (!silent) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "The given JavaScriptProgram has been destroyed "
                    "and can no longer be accessed");
            }
            return;
        }
        if (pgm->heap_limit) {
            if (!silent) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "The given JavaScriptProgram has exceeded its heap "
                    "memory limit and can no longer be accessed");
            }
            return;
        }
        if (pgm->to_destroy) {
            if (!silent) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "The given JavaScriptProgram has been marked for "
                    "destruction and can no longer be accessed");
            }
            return;
        }
        ++pgm->opcount;
        this->xsink = xsink;
        this->pgm = pgm;
    }

    DLLLOCAL ~QoreV8ProgramHelper() {
        if (pgm) {
            AutoLocker al(pgm->m);
            if (!--pgm->opcount && pgm->to_destroy) {
                pgm->destructor(xsink);
            }
        }
    }

    //! Checks if a JavaScript exception has been thrown and throws the corresponding Qore exception
    DLLLOCAL int checkException() const {
        return pgm->checkException(xsink, tryCatch);
    }

    DLLLOCAL operator bool() const {
        return (bool) pgm;
    }

    DLLLOCAL QoreV8Program* getProgram() {
        return pgm;
    }

    DLLLOCAL v8::Local<v8::Context> getContext() {
        return context;
    }

    DLLLOCAL v8::Isolate* getIsolate() {
        return pgm->isolate;
    }

    DLLLOCAL ExceptionSink* getExceptionSink() {
        return xsink;
    }

private:
    QoreV8Program* pgm = nullptr;
    ExceptionSink* xsink = nullptr;

    v8::Locker locker;
    v8::Isolate::Scope isolate_scope;
    v8::HandleScope handle_scope;
    v8::TryCatch tryCatch;
    //v8::ScriptOrigin origin;
    v8::Local<v8::Context> context;
    v8::Context::Scope context_scope;
};

class QoreV8Dereferencer;

class QoreV8Dereferencable {
public:
    DLLLOCAL virtual ~QoreV8Dereferencable() {
    }

    virtual void destroy() = 0;

    DLLLOCAL void setDereferencer(QoreV8Dereferencer* d) {
        assert(!this->d);
        this->d = d;
    }

protected:
    QoreV8Dereferencer* d = nullptr;
};

// use a simple value to dereference objects
class QoreV8Dereferencer : public BinaryNode {
public:
    DLLLOCAL QoreV8Dereferencer(QoreV8Dereferencable* i) : i(i) {
        i->setDereferencer(this);
    }

    DLLLOCAL virtual ~QoreV8Dereferencer() {
        if (i) {
            i->destroy();
            i = nullptr;
        }
    }

    DLLLOCAL void remove() {
        i = nullptr;
    }

    DLLLOCAL bool derefImpl(ExceptionSink* xsink) {
        if (i) {
            i->destroy();
            i = nullptr;
        }
        return true;
    }

    DLLLOCAL virtual int parseInit(QoreValue& val, QoreParseContext& parse_context) {
        assert(false);
        return 0;
    }

private:
    QoreV8Dereferencable* i;
};

#endif