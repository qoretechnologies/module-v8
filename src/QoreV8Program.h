/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8Program.h

    Qore Programming Language

    Copyright (C) 2024 - 2026 Qore Technologies, s.r.o.

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
#include <vector>
#include <string>
#include <memory>
#include <optional>

// Forward declarations for tracking wrapper data
struct QoreV8NamespaceData;
struct QoreV8ObjectRef;
struct QoreV8ClassData;
struct QoreV8MethodData;
struct QoreV8FunctionData;
struct QoreV8MemberHandlerData;

class QoreV8Program : public AbstractQoreProgramExternalData {
    friend class QoreV8ProgramHelper;
    friend class QoreV8ProgramOperationHelper;
    friend class QoreV8Object;
public:
    DLLLOCAL QoreV8Program(const QoreString& source_code, const QoreString& source_label, ExceptionSink* xsink);

    DLLLOCAL QoreV8Program(const QoreString& source_code, const QoreString& source_label,
        bool transpile_ts, ExceptionSink* xsink);

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

    DLLLOCAL int spinOnce(ExceptionSink* xsink = nullptr);

    DLLLOCAL int spinEventLoop(ExceptionSink* xsink = nullptr);

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

    //! Calls a Qore function by fully-qualified name
    DLLLOCAL QoreValue callFunction(const char* name, const QoreListNode* args, ExceptionSink* xsink);

    //! Returns a cached class template for the given class, or an empty handle if not cached
    DLLLOCAL v8::Local<v8::FunctionTemplate> getClassTemplate(const QoreClass& cls);

    //! Caches a class template for the given class
    DLLLOCAL void cacheClassTemplate(const QoreClass& cls, v8::Isolate* isolate,
        v8::Local<v8::FunctionTemplate> tmpl);

    //! Track a namespace data object for cleanup on program destruction
    DLLLOCAL void trackNamespaceData(QoreV8NamespaceData* d) { nsDataRefs.insert(d); }
    //! Untrack a namespace data object (called from weak callback when GC'd normally)
    DLLLOCAL void untrackNamespaceData(QoreV8NamespaceData* d) { nsDataRefs.erase(d); }

    //! Track an object reference for cleanup on program destruction
    DLLLOCAL void trackObjectRef(QoreV8ObjectRef* r) { objectRefs.insert(r); }
    //! Untrack an object reference (called from weak callback when GC'd normally)
    DLLLOCAL void untrackObjectRef(QoreV8ObjectRef* r) { objectRefs.erase(r); }

    //! Track callback data objects for cleanup on program destruction
    DLLLOCAL void trackClassData(QoreV8ClassData* d) { classDataRefs.push_back(d); }
    DLLLOCAL void trackMethodData(QoreV8MethodData* d) { methodDataRefs.push_back(d); }
    DLLLOCAL void trackFunctionData(QoreV8FunctionData* d) { funcDataRefs.push_back(d); }
    DLLLOCAL void trackMemberHandlerData(QoreV8MemberHandlerData* d) { memberHandlerDataRefs.push_back(d); }

    DLLLOCAL void resetObject(v8::Global<v8::Object>& obj) {
        {
            AutoLocker al(m);
            if (valid) {
                obj.Reset();
            } else {
                // Forget the persistent slot without touching the (possibly
                // already-disposed) isolate. V8 renamed PersistentBase::Empty()
                // to IndirectHandleBase::Clear() mid-v8-11.x; v8-handle-base.h
                // exists only in the new API.
#if defined(__has_include) && __has_include(<v8-handle-base.h>)
                obj.Clear();
#else
                obj.Empty();
#endif
            }
        }
        weakDeref();
    }

protected:
    std::unique_ptr<node::CommonEnvironmentSetup> setup;
    v8::Isolate* isolate = nullptr;
    node::Environment* env = nullptr;

    QoreString source;
    QoreString label;

    v8::Global<v8::Object> global;
    v8::Global<v8::Context> ctx;

    QoreObject* self = nullptr;
    QoreProgram* qpgm = getProgram();
    QoreReferenceCounter weakRefs;
    QoreThreadLock m;

    // call reference for saving Qore references
    mutable ReferenceHolder<ResolvedCallReferenceNode> save_ref_callback;

    //! Cache of V8 FunctionTemplates for Qore classes (for class wrapping)
    std::map<const QoreClass*, v8::Global<v8::FunctionTemplate>> classTemplateCache;

    //! Tracked namespace data objects for deterministic cleanup
    std::set<QoreV8NamespaceData*> nsDataRefs;
    //! Tracked object references (QoreObject wrappers) for deterministic cleanup
    std::set<QoreV8ObjectRef*> objectRefs;
    //! Tracked class callback data for cleanup
    std::vector<QoreV8ClassData*> classDataRefs;
    //! Tracked method callback data for cleanup
    std::vector<QoreV8MethodData*> methodDataRefs;
    //! Tracked function callback data for cleanup
    std::vector<QoreV8FunctionData*> funcDataRefs;
    //! Tracked member handler data for cleanup
    std::vector<QoreV8MemberHandlerData*> memberHandlerDataRefs;

    unsigned opcount = 0;
    bool to_destroy = false;
    bool valid = true;
    bool heap_limit = false;
    bool fatal_error = false;
    bool transpile_ts = false;

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

    //! Checks if the program is valid for spin operations; raises exception and returns -1 on error
    DLLLOCAL int checkSpinValid(ExceptionSink* xsink);

    //! Decrements opcount and triggers deferred destruction if needed
    DLLLOCAL void decrementOpcount(ExceptionSink* xsink);

    DLLLOCAL static void fatalErrorCallback(const char* location, const char* message);
    DLLLOCAL static void oomErrorCallback(const char* location, const v8::OOMDetails& details);
    DLLLOCAL static bool shouldAbortOnUncaughtException(v8::Isolate* isolate);
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

    DLLLOCAL QoreV8ProgramData(const QoreString& source_code, const QoreString& source_label,
            bool transpile_ts, ExceptionSink* xsink)
            : QoreV8Program(source_code, source_label, transpile_ts, xsink) {
    }

    DLLLOCAL QoreV8ProgramData(ExceptionSink* xsink, const QoreV8ProgramData& old, QoreObject* self)
            : QoreV8Program(xsink, old, self) {
        //printd(5, "QoreV8ProgramData::QoreV8ProgramData() this: %p\n", this);
    }

    DLLLOCAL virtual void deref(ExceptionSink* xsink) {
        if (ROdereference()) {
            // ensure V8 resources are cleaned up even if destructor() was not called
            // (e.g., when the constructor fails and the object is destroyed via deref)
            deleteIntern(xsink);
            weakDeref();
        }
    }

    DLLLOCAL virtual void deref() {
        if (ROdereference()) {
            ExceptionSink xsink;
            deleteIntern(&xsink);
            weakDeref();
        }
    }

private:
    DLLLOCAL virtual ~QoreV8ProgramData() {
    }
};

class QoreV8ProgramHelper {
public:
    DLLLOCAL QoreV8ProgramHelper(ExceptionSink* xsink, QoreV8Program* pgm, bool silent = false) {
        // Acquire the mutex FIRST to check validity and increment opcount atomically.
        // This prevents deleteIntern() from destroying the isolate between our validity
        // check and V8 object creation (race condition that caused intermittent SIGSEGV
        // in CI when loading many TypeScript data providers concurrently).
        {
            AutoLocker al(pgm->m);
            if (!pgm->isolate) {
                if (!silent) {
                    xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                        "The JavaScript program was not properly initialized");
                }
                return;
            }
            if (!pgm->valid) {
                if (!silent) {
                    xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                        "The given JavaScriptProgram has been destroyed "
                        "and can no longer be accessed");
                }
                return;
            }
            if (pgm->fatal_error) {
                if (!silent) {
                    xsink->raiseException("JAVASCRIPT-FATAL-ERROR",
                        "The given JavaScriptProgram has encountered a fatal V8 error "
                        "and can no longer be accessed");
                }
                return;
            }
            if (pgm->heap_limit) {
                if (!silent) {
                    xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                        "The given JavaScriptProgram has exceeded its heap "
                        "memory limit and can no longer be accessed");
                }
                return;
            }
            if (pgm->to_destroy) {
                if (!silent) {
                    xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                        "The given JavaScriptProgram has been marked for "
                        "destruction and can no longer be accessed");
                }
                return;
            }
            // Increment opcount while holding the lock; this prevents deleteIntern()
            // from proceeding with destruction while we create V8 objects below.
            // Set this->pgm and this->xsink immediately so that the destructor will
            // decrement opcount even if V8 object creation below throws.
            ++pgm->opcount;
            this->pgm = pgm;
            this->xsink = xsink;
        }

        // Now opcount > 0, so deleteIntern() will defer destruction — safe to create
        // V8 objects without the Qore mutex (V8 Locker provides its own synchronization)
        locker.emplace(pgm->isolate);
        isolate_scope.emplace(pgm->isolate);
        handle_scope.emplace(pgm->isolate);
        tryCatch.emplace(pgm->isolate);

        {
            AutoLocker al(pgm->m);
            if (pgm->ctx.IsEmpty()) {
                if (!silent) {
                    xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                        "The JavaScript program context is not available");
                }
                return;
            }
            context = pgm->ctx.Get(pgm->isolate);
            context_scope.emplace(context);
            initialized = true;
        }
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
        assert(tryCatch);
        return pgm->checkException(xsink, *tryCatch);
    }

    DLLLOCAL operator bool() const {
        return initialized;
    }

    DLLLOCAL QoreV8Program* getProgram() {
        return pgm;
    }

    DLLLOCAL v8::Local<v8::Context> getContext() {
        return context;
    }

    DLLLOCAL v8::Isolate* getIsolate() {
        return pgm ? pgm->isolate : nullptr;
    }

    DLLLOCAL ExceptionSink* getExceptionSink() {
        return xsink;
    }

    DLLLOCAL const v8::TryCatch& getTryCatch() const {
        assert(tryCatch);
        return *tryCatch;
    }

private:
    QoreV8Program* pgm = nullptr;
    ExceptionSink* xsink = nullptr;
    bool initialized = false;

    std::optional<v8::Locker> locker;
    std::optional<v8::Isolate::Scope> isolate_scope;
    std::optional<v8::HandleScope> handle_scope;
    std::optional<v8::TryCatch> tryCatch;
    v8::Local<v8::Context> context;
    std::optional<v8::Context::Scope> context_scope;
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