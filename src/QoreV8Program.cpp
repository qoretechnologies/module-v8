/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Program.cpp defines the QoreV8Program class */
/*
    QoreV8Program.qpp

    Qore Programming Language

    Copyright 2024 - 2026 Qore Technologies, s.r.o.

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
#include "QoreV8NamespaceWrapper.h"
#include "QoreV8ClassWrapper.h"
#include "QoreV8Environment.h"
#include "QoreV8Stdio.h"

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
    if (qore_v8_forked_child()) {
        // no environment can be created in a child process created with fork(); the platform's threads do not
        // exist in it; init() raises the exception
        valid = false;
        return;
    }
    // Setup up a libuv event loop, v8::Isolate, and Node.js Environment.
    // setup common environment
    std::vector<std::string> errors;
    {
        // Node.js reads the environment while it creates the environment and runs its own bootstrap code, which
        // runs no code of the program
        QoreEnvironmentReadLock env_lock;
        setup = node::CommonEnvironmentSetup::Create(platform.get(), &errors, init_result->args(),
            init_result->exec_args(), node::EnvironmentFlags::kNoCreateInspector);
    }
    if (!setup) {
        for (const std::string& err : errors) {
            fprintf(stderr, "v8 module init error: %s: %s\n", init_result->args()[0].c_str(), err.c_str());
        }
        valid = false;  // Mark as invalid so init() will fail gracefully
        return;
    }

    isolate = setup->isolate();
#if 0
    isolate->SetPromiseHook(qore_promise_hook);
#endif

    isolate->AddNearHeapLimitCallback(heapLimitCallback, this);
    isolate->SetFatalErrorHandler(fatalErrorCallback);
    isolate->SetOOMErrorHandler(oomErrorCallback);
    isolate->SetAbortOnUncaughtExceptionCallback(shouldAbortOnUncaughtException);
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

QoreV8Program::QoreV8Program(const QoreString& source_code, const QoreString& source_label,
        bool transpile_ts, ExceptionSink* xsink) : QoreV8Program() {
    assert(source_code.getEncoding() == QCS_UTF8);
    assert(source_label.getEncoding() == QCS_UTF8);

    source = source_code;
    label = source_label;
    this->transpile_ts = transpile_ts;

    init(xsink);
}

QoreV8Program::QoreV8Program(ExceptionSink* xsink, const QoreV8Program& old, QoreObject* self) : QoreV8Program() {
    source = old.source;
    label = old.label;
    transpile_ts = old.transpile_ts;

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

    if (qore_v8_forked_child()) {
        // nothing is destroyed in a child process created with fork(), and the global lock is not acquired: a
        // thread that does not exist in the child could have held it when the process was copied; the program set
        // is not used in the child
        abandonInForkedChild();
        return;
    }

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

void QoreV8Program::fatalErrorCallback(const char* location, const char* message) {
    printd(0, "V8 fatal error at %s: %s\n", location ? location : "<unknown>", message ? message : "<unknown>");
    v8::Isolate* isolate = v8::Isolate::GetCurrent();
    if (!isolate) {
        printd(0, "V8 fatal error: no current isolate; cannot mark program invalid\n");
        return;
    }
    AutoLocker al(global_lock);
    for (auto& pgm : pset) {
        if (pgm->isolate == isolate) {
            AutoLocker al2(pgm->m);
            pgm->fatal_error = true;
            pgm->valid = false;
            return;
        }
    }
    printd(0, "V8 fatal error: no matching program found for isolate %p\n", isolate);
}

void QoreV8Program::oomErrorCallback(const char* location, const v8::OOMDetails& details) {
    printd(0, "V8 OOM error at %s: %s\n", location ? location : "<unknown>",
        details.detail ? details.detail : "<unknown>");
    v8::Isolate* isolate = v8::Isolate::GetCurrent();
    if (!isolate) {
        printd(0, "V8 OOM error: no current isolate; cannot mark program invalid\n");
        return;
    }
    AutoLocker al(global_lock);
    for (auto& pgm : pset) {
        if (pgm->isolate == isolate) {
            AutoLocker al2(pgm->m);
            pgm->fatal_error = true;
            pgm->heap_limit = true;
            pgm->valid = false;
            return;
        }
    }
    printd(0, "V8 OOM error: no matching program found for isolate %p\n", isolate);
}

bool QoreV8Program::shouldAbortOnUncaughtException(v8::Isolate* isolate) {
    return false;
}

//! Name of the registered symbol of the global property that passes a program's source and label to its bootstrap code
#define QORE_V8_BOOTSTRAP_KEY "qore.v8.bootstrap"

//! Bootstrap code that replaces process.env with a proxy that reads and changes the environment under Qore's lock
/** Every operation is performed on Node's original process.env object by a function of the environment bridge (see
    qore_v8_create_env_bridge()) with the lock held.  The proxy keeps the behavior of Node's object: a symbol
    property is undefined, a name that is not a variable is looked up in the prototype chain (Object.prototype),
    names and values are converted to strings (a symbol raises TypeError), delete always returns true, and
    util.inspect() shows the variables.  Names and values are converted before the bridge is called, so that no
    JavaScript code runs while the lock is held.

    It is a proxy rather than an object with interceptors, as Node's own process.env is, because V8's serializer
    refuses a proxy at once ("#<Object> could not be cloned."), while it passes an object with interceptors to the
    serializer's delegate as a host object, and Node's v8.serialize() reports a host object that it cannot serialize
    with util.inspect() of it, which put every variable of the environment in the error message.  The program
    remembers the proxy (envCreated()), so that a JavaScript exception that contains it is converted without it (see
    QoreV8Program::isRedactedEnv()).
*/
#define QORE_V8_PROCESS_ENV_BOOTSTRAP \
    "{\n" \
    "  const store = process.env;\n" \
    "  const bridge = _qoreBoot.env;\n" \
    "  const target = {};\n" \
    "  Object.defineProperty(target, Symbol.for('nodejs.util.inspect.custom'), {\n" \
    "    configurable: true,\n" \
    "    value(depth, options, inspect) {\n" \
    "      const vars = {};\n" \
    "      for (const name of bridge.keys(store)) {\n" \
    "        const value = bridge.get(store, name);\n" \
    "        if (value !== undefined) { vars[name] = value; }\n" \
    "      }\n" \
    "      return inspect(vars, options);\n" \
    "    },\n" \
    "  });\n" \
    "  const env = new Proxy(target, {\n" \
    "      get(target, name, receiver) {\n" \
    "        if (typeof name === 'symbol') { return undefined; }\n" \
    "        const value = bridge.get(store, name);\n" \
    "        return value !== undefined ? value : Reflect.get(target, name, receiver);\n" \
    "      },\n" \
    "      set(target, name, value) { bridge.set(store, `${name}`, `${value}`); return true; },\n" \
    "      has(target, name) {\n" \
    "        return (typeof name === 'string' && bridge.has(store, name)) || Reflect.has(target, name);\n" \
    "      },\n" \
    "      deleteProperty(target, name) {\n" \
    "        if (typeof name === 'string') { bridge.delete(store, name); } else { Reflect.deleteProperty(target, name); }\n" \
    "        return true;\n" \
    "      },\n" \
    "      ownKeys(target) { return [...new Set(bridge.keys(store))]; },\n" \
    "      getOwnPropertyDescriptor(target, name) {\n" \
    "        if (typeof name === 'string') {\n" \
    "          const desc = bridge.descriptor(store, name);\n" \
    "          if (desc !== undefined) { return desc; }\n" \
    "        }\n" \
    "        return Reflect.getOwnPropertyDescriptor(target, name);\n" \
    "      },\n" \
    "      defineProperty(target, name, desc) { bridge.define(store, name, desc); return true; },\n" \
    "  });\n" \
    "  Object.defineProperty(process, 'env', { configurable: true, enumerable: true, writable: true, value: env });\n" \
    "  _qoreBoot.envCreated(env);\n" \
    "}\n"

//! Bootstrap code that gives process.stdin, process.stdout and process.stderr streams that never change a terminal,
//! a pipe or a socket, or the signal handling of the process
/** For a pipe or a stream socket, Node.js creates process.stdin, process.stdout and process.stderr as net.Socket
    streams, and libuv puts the descriptor in non-blocking mode (O_NONBLOCK) when it opens it.  The flag belongs to the
    open file description, which is shared with Qore's own I/O and with every other process that has the pipe, so
    their writes to a full pipe and their reads of an empty one failed with EAGAIN; and data that libuv had not
    written yet when a program was destroyed was lost.  For a terminal, Node's process.stdout and process.stderr
    (tty.WriteStream) install a SIGWINCH handler to follow the window size, while Qore owns the signal handling of
    the process: it blocks signals and handles them in its signal thread.

    For such a descriptor (see qore_v8_create_stdio_bridge()), the streams are created here on first use:
    - process.stdout and process.stderr are Writables whose writes are synchronous and complete: they wait while the
      pipe is full, as Qore's own writes to it do
    - process.stdin is a Readable whose reads wait in the calling thread until there is input, as Qore's own reads of
      stdin do; the wait is cancellable.  Its highWaterMark is 0, so that it reads only what its consumer asks for:
      a consumer that pauses after a chunk is not left waiting for input that it did not ask for
    and all of them leave the descriptor as it is.  For a terminal, the streams have the members that code commonly
    reads: isTTY (true), the columns and rows of process.stdout and process.stderr, read when the stream is created,
    and the methods of tty.WriteStream that do not need its handle (getWindowSize(), getColorDepth(), hasColors() and
    the cursor functions); the size does not follow a resize ("resize" is never emitted), and process.stdin has
    isRaw (false) but no setRawMode(), as raw mode would change the terminal for every process that uses it.  Node's
    own streams are kept for a file and any other descriptor.  As with Node's streams, ending or destroying a stream
    never closes the descriptor, which belongs to the process.
*/
#define QORE_V8_PROCESS_STDIO_BOOTSTRAP \
    "{\n" \
    "  const bridge = _qoreBoot.stdio;\n" \
    "  const { Readable, Writable } = require('stream');\n" \
    "  const ttyProto = require('tty').WriteStream.prototype;\n" \
    "  const createWritable = (fd) => {\n" \
    "    const stream = new Writable({\n" \
    "      write(chunk, encoding, callback) {\n" \
    "        try { bridge.write(fd, chunk); } catch (err) { callback(err); return; }\n" \
    "        callback();\n" \
    "      },\n" \
    "      writev(chunks, callback) {\n" \
    "        try { for (const c of chunks) { bridge.write(fd, c.chunk); } } catch (err) { callback(err); return; }\n" \
    "        callback();\n" \
    "      },\n" \
    "    });\n" \
    "    stream._isStdio = true;\n" \
    "    stream.destroySoon = stream.destroy;\n" \
    "    return stream;\n" \
    "  };\n" \
    "  const createReadable = (fd) => {\n" \
    "    const stream = new Readable({\n" \
    "      highWaterMark: 0,\n" \
    "      read(size) {\n" \
    "        let data;\n" \
    "        try { data = bridge.read(fd, size > 0 && size < 65536 ? size : 65536); } catch (err) {\n" \
    "          this.destroy(err);\n" \
    "          return;\n" \
    "        }\n" \
    "        this.push(data === null ? null : Buffer.from(data.buffer, data.byteOffset, data.byteLength));\n" \
    "      },\n" \
    "    });\n" \
    "    return stream;\n" \
    "  };\n" \
    "  for (const [name, fd, create] of [['stdin', 0, createReadable], ['stdout', 1, createWritable],\n" \
    "      ['stderr', 2, createWritable]]) {\n" \
    "    const desc = Object.getOwnPropertyDescriptor(process, name);\n" \
    "    if (desc === undefined || !desc.configurable || typeof desc.get !== 'function') { continue; }\n" \
    "    const nodeGet = desc.get;\n" \
    "    let stream;\n" \
    "    Object.defineProperty(process, name, {\n" \
    "      configurable: true,\n" \
    "      enumerable: desc.enumerable,\n" \
    "      get() {\n" \
    "        if (stream !== undefined) { return stream; }\n" \
    "        const kind = bridge.kind(fd);\n" \
    "        if (kind === undefined) {\n" \
    "          stream = nodeGet.call(process);\n" \
    "          return stream;\n" \
    "        }\n" \
    "        stream = create(fd);\n" \
    "        stream.fd = fd;\n" \
    "        stream._type = kind;\n" \
    "        if (kind === 'tty') {\n" \
    "          stream.isTTY = true;\n" \
    "          if (fd) {\n" \
    "            const size = bridge.windowSize(fd);\n" \
    "            if (size !== undefined) { stream.columns = size[0]; stream.rows = size[1]; }\n" \
    "            for (const m of ['getWindowSize', 'getColorDepth', 'hasColors', 'cursorTo', 'moveCursor',\n" \
    "                'clearLine', 'clearScreenDown']) {\n" \
    "              stream[m] = ttyProto[m];\n" \
    "            }\n" \
    "          } else {\n" \
    "            stream.isRaw = false;\n" \
    "          }\n" \
    "        }\n" \
    "        return stream;\n" \
    "      },\n" \
    "    });\n" \
    "  }\n" \
    "}\n"

//! Returns a JavaScript string for the given UTF-8 string, or an empty handle if it is too long or cannot be created
static v8::MaybeLocal<v8::String> qore_v8_utf8_string(v8::Isolate* isolate, const QoreString& str) {
    assert(str.getEncoding() == QCS_UTF8);
    if (str.size() > static_cast<size_t>(v8::String::kMaxLength)) {
        return v8::MaybeLocal<v8::String>();
    }
    return v8::String::NewFromUtf8(isolate, str.c_str(), v8::NewStringType::kNormal, static_cast<int>(str.size()));
}

//! envCreated(env): passes the program's new process.env object to the program (the data of the function)
static void qore_v8_env_created(const v8::FunctionCallbackInfo<v8::Value>& info) {
    if (info.Length() < 1 || !info[0]->IsObject() || !info.Data()->IsExternal()) {
        return;
    }
    static_cast<QoreV8Program*>(info.Data().As<v8::External>()->Value())->setEnvObject(info[0].As<v8::Object>());
}

int QoreV8Program::setBootstrapData(ExceptionSink* xsink, const v8::TryCatch& tryCatch) {
    v8::Local<v8::Context> context = setup->context();

    v8::Local<v8::String> source_str;
    if (!qore_v8_utf8_string(isolate, source).ToLocal(&source_str)) {
        if (!checkException(xsink, tryCatch)) {
            xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "the JavaScript source of " QLLD " bytes is too long; "
                "the maximum is %d bytes", static_cast<int64>(source.size()), v8::String::kMaxLength);
        }
        return -1;
    }
    v8::Local<v8::String> label_str;
    if (!qore_v8_utf8_string(isolate, label).ToLocal(&label_str)) {
        if (!checkException(xsink, tryCatch)) {
            xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "the JavaScript source label of " QLLD " bytes is too "
                "long; the maximum is %d bytes", static_cast<int64>(label.size()), v8::String::kMaxLength);
        }
        return -1;
    }

    v8::Local<v8::Object> data = v8::Object::New(isolate);
    v8::Local<v8::Symbol> key = v8::Symbol::For(isolate,
        v8::String::NewFromUtf8Literal(isolate, QORE_V8_BOOTSTRAP_KEY));
    // the functions with which the bootstrap code makes process.env use Qore's environment lock, and the function
    // with which it passes the new process.env object to the program
    v8::Local<v8::Object> env_bridge;
    v8::Local<v8::Function> env_created;
    // the functions with which the bootstrap code writes process.stdout and process.stderr to a pipe or socket
    v8::Local<v8::Object> stdio_bridge;
    if (!qore_v8_create_env_bridge(isolate, context).ToLocal(&env_bridge)
        || !qore_v8_create_stdio_bridge(isolate, context).ToLocal(&stdio_bridge)
        || !v8::Function::New(context, qore_v8_env_created, v8::External::New(isolate, this)).ToLocal(&env_created)
        || !data->CreateDataProperty(context, v8::String::NewFromUtf8Literal(isolate, "source"),
            source_str).FromMaybe(false)
        || !data->CreateDataProperty(context, v8::String::NewFromUtf8Literal(isolate, "filename"),
            label_str).FromMaybe(false)
        || !data->CreateDataProperty(context, v8::String::NewFromUtf8Literal(isolate, "env"),
            env_bridge).FromMaybe(false)
        || !data->CreateDataProperty(context, v8::String::NewFromUtf8Literal(isolate, "envCreated"),
            env_created).FromMaybe(false)
        || !data->CreateDataProperty(context, v8::String::NewFromUtf8Literal(isolate, "stdio"),
            stdio_bridge).FromMaybe(false)
        || !context->Global()->DefineOwnProperty(context, key, data, v8::DontEnum).FromMaybe(false)) {
        if (!checkException(xsink, tryCatch)) {
            xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "cannot pass the source to the JavaScript program");
        }
        return -1;
    }
    return 0;
}

int QoreV8Program::init(ExceptionSink* xsink) {
    if (qore_v8_forked_child()) {
        xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "a JavaScript program cannot be created in a child process "
            "created with fork(): the V8 and Node.js threads of the parent process do not exist in the child");
        return -1;
    }
    if (!valid || !isolate) {
        xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "Could not initialize JavaScript program");
        return -1;
    }

    {
        v8::Locker locker(isolate);

        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        // The v8::Context needs to be entered when node::CreateEnvironment() and
        // node::LoadEnvironment() are being called.
        v8::Context::Scope context_scope(setup->context());
        v8::TryCatch tryCatch(isolate);

        // Set ctx and global early so checkException() can use them if LoadEnvironment fails
        ctx.Reset(isolate, setup->context());
        global.Reset(isolate, setup->context()->Global());

        // Pass the source and its label to the bootstrap code below in this program's own context.  They must never
        // be passed in the process environment: it is shared by all programs, so a program constructed in another
        // thread at the same time would run this program's source, and on musl (whose setenv() is not thread-safe
        // and frees the value it replaces) concurrent updates corrupt the heap
        if (setBootstrapData(xsink, tryCatch)) {
            valid = false;
            ctx.Reset();
            global.Reset();
            env_object.Reset();
            return -1;
        }

        // Intercept Node.js exit() to mark the program invalid instead of terminating the Qore process
        node::SetProcessExitHandler(env, [this](node::Environment* env, int exit_code) {
            printd(5, "Node.js requested process exit with code %d; marking program invalid\n", exit_code);
            AutoLocker al(m);
            valid = false;
        });

        // Inject the 'qore' global object for accessing Qore namespaces, classes, functions, and constants
        // This must happen before LoadEnvironment() which executes the user's code
        {
            v8::Local<v8::Context> context = setup->context();
            const QoreNamespace* rootNS = qpgm->getRootNS();
            if (rootNS) {
                v8::Local<v8::Object> qoreGlobal = QoreV8NamespaceWrapper::create(
                    isolate, context, this, *rootNS);
                v8::MaybeLocal<v8::String> key = v8::String::NewFromUtf8(isolate, "qore");
                if (!key.IsEmpty()) {
                    global.Get(isolate)->Set(context, key.ToLocalChecked(), qoreGlobal).Check();
                }
            }
        }

        // Set up the Node.js instance for execution, and run code inside of it.
        // There is also a variant that takes a callback and provides it with
        // the `require` and `process` objects, so that it can manually compile
        // and run scripts as needed.
        // The `require` function inside this script does *not* access the file
        // system, and can only load built-in Node.js modules.
        // `module.createRequire()` is being used to create one that is able to
        // load files from the disk, and uses the standard CommonJS file loader
        // instead of the internal-only `require` function.

        // the bootstrap data is removed from the global object before any other code is run
        QoreStringMaker envstr("const _qoreBootKey = Symbol.for('" QORE_V8_BOOTSTRAP_KEY "');\n"
            "const _qoreBoot = globalThis[_qoreBootKey];\n"
            "delete globalThis[_qoreBootKey];\n"
            QORE_V8_PROCESS_ENV_BOOTSTRAP
            QORE_V8_PROCESS_STDIO_BOOTSTRAP
            "const publicRequire = require('module').createRequire("
            "process.cwd() + '/');\nglobalThis.require = publicRequire;\n");
        if (transpile_ts) {
            v8::Local<v8::String> compiler_name, compiler_json;
            if (!v8::String::NewFromUtf8(isolate, QORE_TYPESCRIPT_MODULE).ToLocal(&compiler_name)
                    || !v8::JSON::Stringify(setup->context(), compiler_name).ToLocal(&compiler_json)) {
                if (!checkException(xsink, tryCatch)) {
                    xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "Cannot encode the TypeScript compiler path");
                }
                valid = false;
                ctx.Reset();
                global.Reset();
                env_object.Reset();
                return -1;
            }
            v8::String::Utf8Value compiler_source(isolate, compiler_json);
            if (!*compiler_source) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "Cannot convert the TypeScript compiler path");
                valid = false;
                ctx.Reset();
                global.Reset();
                env_object.Reset();
                return -1;
            }
            envstr.concat("const _tsModule = ");
            envstr.concat(*compiler_source);
            envstr.concat(";\n");
            envstr.concat(
                "const _tsStrip = require('module').stripTypeScriptTypes;\n"
                "let _tsSource;\n"
                "if (typeof _tsStrip === 'function' && process.features.typescript !== false) {\n"
                "  _tsSource = _tsStrip(_qoreBoot.source, { mode: 'transform' });\n"
                "} else {\n"
                // Debian/Ubuntu build Node without Amaro. Use their separately packaged compiler;
                // preserve script/module semantics and report syntax errors before executing any code.
                "  let _ts;\n"
                "  try { _ts = publicRequire(_tsModule); } catch (err) {\n"
                "    if (err.code !== 'MODULE_NOT_FOUND' || "
                    "!err.message.startsWith(\"Cannot find module '\" + _tsModule + \"'\")) throw err;\n"
                "    throw new Error('QORE_TYPESCRIPT_UNAVAILABLE: install the typescript package "
                    "or use Node.js with built-in TypeScript support');\n"
                "  }\n"
                "  const result = _ts.transpileModule(_qoreBoot.source, {\n"
                // The source label belongs to the VM stack trace; it must not select TypeScript's
                // JSON, declaration-file, or JavaScript parser modes based on a filename suffix.
                "    fileName: 'qore-typescript-input.ts', reportDiagnostics: true,\n"
                "    compilerOptions: { target: _ts.ScriptTarget.ESNext, module: _ts.ModuleKind.ESNext }\n"
                "  });\n"
                "  const errors = (result.diagnostics || []).filter(d => d.category === _ts.DiagnosticCategory.Error);\n"
                "  if (errors.length) {\n"
                "    throw new SyntaxError(errors.map(d => _ts.flattenDiagnosticMessageText(d.messageText, '\\n'))"
                    ".join('\\n'));\n"
                "  }\n"
                "  _tsSource = result.outputText;\n"
                "}\n"
                "publicRequire('node:vm').runInThisContext(_tsSource, {\n"
                "  'filename': _qoreBoot.filename\n"
                "});"
            );
        } else {
            envstr.concat(
                "publicRequire('node:vm').runInThisContext(_qoreBoot.source, {\n"
                "  'filename': _qoreBoot.filename\n"
                "});"
            );
        }
        v8::MaybeLocal<v8::Value> loadenv_ret = node::LoadEnvironment(env, envstr.c_str());
        if (loadenv_ret.IsEmpty()) {
            // Call checkException() while valid is still true so we can properly convert the exception
            if (!checkException(xsink, tryCatch)) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "Unknown error initializing program");
            }
            // Now mark as invalid after exception handling is complete
            valid = false;
            // Reset ctx and global since init failed
            ctx.Reset();
            global.Reset();
            env_object.Reset();
            return -1;
        }

        // Check if process.exit() was called during LoadEnvironment(), which would have marked
        // the program invalid via SetProcessExitHandler
        if (!valid) {
            if (!checkException(xsink, tryCatch)) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                    "JavaScript program called process.exit() during initialization");
            }
            ctx.Reset();
            global.Reset();
            env_object.Reset();
            return -1;
        }

    }

    AutoLocker al(global_lock);
    pset.insert(this);

    return 0;
}

bool QoreV8Program::shutdown() {
    // NOTE: a snapshot of the program set is taken under the global lock rather than iterating the set
    // directly; other threads insert entries in init() and erase them in the destructor, and iterating the
    // set while another thread modifies it invalidates the iterator.  The global lock cannot be held across
    // deleteIntern(), because the program destructor acquires the global lock with the program lock held
    pset_t progs;
    {
        AutoLocker al(global_lock);
        progs = pset;
    }

    bool rv = true;
    ExceptionSink xsink;
    for (auto& i : progs) {
        i->deleteIntern(&xsink);
        if (i->hasPendingOps()) {
            // JavaScript code is still being executed in this program in another thread; deleteIntern() has
            // flagged the program for destruction when the operation in progress completes.  The node
            // environment must not be torn down here, as it is still in use
            rv = false;
            continue;
        }
        i->setup = nullptr;
    }
    return rv;
}

void QoreV8Program::drainPlatformTasks() {
    assert(isolate);
    // NOTE: the node::CommonEnvironmentSetup destructor unregisters the isolate from the platform before disposing
    // of the isolate, and only Isolate::Dispose() cancels and joins the isolate's concurrent tasks (ex: an async
    // WebAssembly compilation started with WebAssembly.compile()).  A concurrent task that completes in between
    // posts a foreground task to the per-isolate task runner, which unregistering the isolate is concurrently
    // tearing down; the unsynchronized access to its async handle crashes the process in uv_async_send().  Node
    // no longer drains the platform when the environment is freed (nodejs/node#51290), so all concurrent tasks
    // are waited for here, and the foreground tasks they post are run, while the isolate is still registered.
    // JavaScript execution is disallowed, as the environment has been stopped; no context is entered, so
    // foreground tasks are run outside of a node callback scope, which would otherwise drain the tick queue
    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);
    v8::Isolate::DisallowJavascriptExecutionScope disallow_js(isolate,
        v8::Isolate::DisallowJavascriptExecutionScope::THROW_ON_FAILURE);
    v8::HandleScope handle_scope(isolate);
    platform->DrainTasks(isolate);
}

void QoreV8Program::deleteInForkedChild(ExceptionSink* xsink) {
    assert(qore_v8_forked_child());
    // the child runs only the thread that called fork(); no lock is acquired, since another thread of the parent
    // could have held it when the process was copied
    if (opcount) {
        // JavaScript code was being executed when the process was copied: by a thread that does not exist in the
        // child, or by the thread that called fork() from Qore code called by JavaScript, which destroys the program
        // when the call returns
        to_destroy = true;
        return;
    }
    valid = false;
    to_destroy = false;
    if (save_ref_callback) {
        save_ref_callback.release()->deref(xsink);
    }
    // the Qore objects referenced by JavaScript are released; the persistent handles of the references are not
    // accessed, so the references themselves are never freed
    for (auto* ref : objectRefs) {
        if (ref->qobj) {
            QoreObject* qobj = ref->qobj;
            ref->qobj = nullptr;
            qobj->tDeref();
        }
    }
    objectRefs.clear();
    nsDataRefs.clear();
    abandonInForkedChild();
}

void QoreV8Program::abandonInForkedChild() {
    assert(qore_v8_forked_child());
    // the environment, its event loop and the isolate are never freed in the child
    node::CommonEnvironmentSetup* abandoned = setup.release();
    (void)abandoned;
    env = nullptr;
    forgetHandle(ctx);
    forgetHandle(global);
    forgetHandle(env_object);
    for (auto& i : classTemplateCache) {
        forgetHandle(i.second);
    }
}

void QoreV8Program::deleteIntern(ExceptionSink* xsink) {
    printd(5, "QoreV8Program::deleteIntern() this: %p\n", this);
    if (qore_v8_forked_child()) {
        deleteInForkedChild(xsink);
        return;
    }
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
        drainPlatformTasks();
        env = nullptr;
    }

    // Clean up tracked object references (deref QoreObjects wrapped by JS)
    for (auto* ref : objectRefs) {
        if (ref->qobj) {
            ref->qobj->tDeref();
        }
        ref->persistent.Reset();
        delete ref;
    }
    objectRefs.clear();

    // Clean up tracked namespace data (persistent handles + cache entries)
    for (auto* d : nsDataRefs) {
        d->persistent.Reset();
        // cache entries are v8::Global<v8::Value> - destroyed by map destructor
        delete d;
    }
    nsDataRefs.clear();

    // Clean up class template cache
    classTemplateCache.clear();

    // Clean up callback data structs
    for (auto* d : classDataRefs) {
        delete d;
    }
    classDataRefs.clear();
    for (auto* d : methodDataRefs) {
        delete d;
    }
    methodDataRefs.clear();
    for (auto* d : funcDataRefs) {
        delete d;
    }
    funcDataRefs.clear();
    for (auto* d : memberHandlerDataRefs) {
        delete d;
    }
    memberHandlerDataRefs.clear();

    ctx.Reset();
    global.Reset();
    env_object.Reset();
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
        // Check if isolate is valid before creating helper
        // (isolate can be nullptr if program initialization failed)
        if (!isolate) {
            xsink.raiseException("JAVASCRIPT-PROGRAM-ERROR", "The JavaScript program was not properly initialized");
            return -1;
        }

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
    std::string domain_storage;
    // get key name where to save the data if possible
    QoreValue v = data->getKeyValue("_v8_save");
    if (v.getType() != NT_STRING) {
        domain_name = "_v8_save";
    } else {
        QoreStringValueHelper domain(v);
        domain_storage.assign(domain->c_str(), domain->size());
        domain_name = domain_storage.c_str();
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

        // convert to a Qore value; the program's process.env object is left out (see isRedactedEnv())
        ValueHolder arg(xsink);
        ExceptionConversionHelper ech(*this);
        if (ex->IsObject()) {
            v8::MaybeLocal<v8::Object> o = ex->ToObject(context);
            assert(!o.IsEmpty());
            ReferenceHolder<QoreV8Object> arg_obj(new QoreV8Object(const_cast<QoreV8Program*>(this),
                o.ToLocalChecked()), xsink);
            QoreV8ProgramHelper ph(xsink, const_cast<QoreV8Program*>(this));
            if (ph) {
                arg = arg_obj->toData(ph);
            }
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
        QoreStringValueHelper str(errv);
        err.set(*str);
        errstr = &err;
    } else {
        if (errv.getAsString(err, 0, &xsink)) {
            xsink.clear();
            err.set("UNKNOWN-EXCEPTION");
        }
        errstr = &err;
    }
    if (descv.getType() == NT_STRING) {
        QoreStringValueHelper str(descv);
        desc.set(*str);
        descstr = &desc;
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

int QoreV8Program::checkSpinValid(ExceptionSink* xsink) {
    if (qore_v8_forked_child()) {
        if (xsink) {
            raiseForkedChildError(xsink);
        }
        return -1;
    }
    if (!isolate || !setup || !env) {
        if (xsink) {
            xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "The JavaScript program was not properly initialized");
        }
        return -1;
    }

    AutoLocker al(m);
    if (!valid || fatal_error || heap_limit || to_destroy) {
        if (xsink) {
            if (fatal_error) {
                xsink->raiseException("JAVASCRIPT-FATAL-ERROR",
                    "The given JavaScriptProgram has encountered a fatal V8 error and can no longer be accessed");
            } else if (heap_limit) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                    "The given JavaScriptProgram has exceeded its heap memory limit and can no longer be accessed");
            } else if (to_destroy) {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                    "The given JavaScriptProgram has been marked for destruction and can no longer be accessed");
            } else {
                xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR",
                    "The given JavaScriptProgram has been destroyed and can no longer be accessed");
            }
        }
        return -1;
    }
    ++opcount;
    return 0;
}

void QoreV8Program::decrementOpcount(ExceptionSink* xsink) {
    bool destroy;
    {
        AutoLocker al(m);
        destroy = !--opcount && to_destroy;
    }
    // NOTE: the deferred destructor must be run with the program lock released; destructor() ->
    // deleteIntern() acquires the same (non-recursive) lock, and the program destructor acquires the global
    // lock, which must never be acquired while the program lock is held
    if (destroy) {
        destructor(xsink);
    }
}

int QoreV8Program::spinOnce(ExceptionSink* xsink, bool wait) {
    if (checkSpinValid(xsink)) {
        return -1;
    }

    int rv;
    {
        v8::Locker locker(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Context::Scope context_scope(ctx.Get(isolate));
        v8::TryCatch tryCatch(isolate);

        uv_loop_t* loop = setup->event_loop();
        // NOTE: do not use UV_RUN_DEFAULT here; it runs the loop until no active handles remain, which over-runs
        // when an upstream keeps the connection open after the response (keep-alive socket / persistent HTTP-2
        // session - ex: slack.com, googleapis.com): the lingering socket handle stays active, so the loop will not
        // return until the socket idles out (~15s) even though the response already arrived.  In waiting (polling)
        // contexts use UV_RUN_ONCE, which blocks until at least one event is processed and then returns so the
        // caller can re-check Promise state and flush microtasks; otherwise use UV_RUN_NOWAIT to drain any ready
        // I/O without blocking (best-effort pump that must never re-introduce the keep-alive stall).
        uv_run(loop, wait ? UV_RUN_ONCE : UV_RUN_NOWAIT);

        rv = 0;
        if (xsink && tryCatch.HasCaught()) {
            checkException(xsink, tryCatch);
            rv = -1;
        }
    }

    decrementOpcount(xsink);
    return rv;
}

int QoreV8Program::spinEventLoop(ExceptionSink* xsink) {
    if (checkSpinValid(xsink)) {
        return -1;
    }

    int rv;
    {
        v8::Locker locker(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Context::Scope context_scope(ctx.Get(isolate));
        v8::TryCatch tryCatch(isolate);

        rv = node::SpinEventLoop(env).FromMaybe(1);

        if (xsink && tryCatch.HasCaught()) {
            checkException(xsink, tryCatch);
            rv = -1;
        }
    }

    decrementOpcount(xsink);
    return rv;
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
    v8::Isolate* isolate = info.GetIsolate();
    v8::Local<v8::Value> v = info.Data();
    if (!v->IsExternal()) {
        printd(0, "call_callref: invalid callback data (not External)\n");
        ExceptionSink xsink;
        xsink.raiseException("JAVASCRIPT-INTERNAL-ERROR", "Invalid callref callback data");
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }

    v8::Local<v8::External> ext = v8::Local<v8::External>::Cast(v);
    QoreV8CallbackInfo* cbinfo = reinterpret_cast<QoreV8CallbackInfo*>(ext->Value());
    ExceptionSink xsink;
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

v8::Local<v8::Value> QoreV8Program::getV8Value(const QoreValue val_arg, ExceptionSink* xsink) {
    // A member assigned with the weak reference operator ":=" or the opaque reference operator
    // "@=" is stored in its container as the reference itself, and the list and hash cases
    // below pass what the container holds straight back here.  Resolve it, or an ordinary
    // convertible hash or list reaches the default case and is rejected.
    const QoreValue val = val_arg.resolveIndirect();
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
            QoreStringValueHelper str(val);
            v8::MaybeLocal<v8::String> rv = v8::String::NewFromUtf8(isolate, str->c_str(),
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
            if (pd) {
                return handle_scope.Escape(pd->get(xsink, isolate));
            }
            // Wrap non-JavaScript Qore objects using the class wrapper
            v8::Local<v8::Context> context = ctx.Get(isolate);
            v8::Local<v8::Object> wrapped = QoreV8ClassWrapper::wrapExistingObject(
                isolate, context, this, obj);
            if (wrapped.IsEmpty()) {
                xsink->raiseException("JAVASCRIPT-TYPE-ERROR", "Cannot convert Qore values of type '%s' to a V8 "
                    "value", val.getFullTypeName());
                return v8::Null(isolate);
            }
            return handle_scope.Escape(wrapped);
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
    // Check if isolate is valid before creating helper
    if (!isolate) {
        xsink->raiseException("JAVASCRIPT-PROGRAM-ERROR", "The JavaScript program was not properly initialized");
        return nullptr;
    }

    QoreV8ProgramHelper v8h(xsink, this);
    if (*xsink) {
        return nullptr;
    }

    v8::Local<v8::Object> g = global.Get(isolate);
    return new QoreObject(QC_JAVASCRIPTOBJECT, getProgram(), new QoreV8Object(this, g));
}

QoreValue QoreV8Program::callFunction(const char* name, const QoreListNode* args, ExceptionSink* xsink) {
    return qpgm->callFunction(name, args, xsink);
}

v8::Local<v8::FunctionTemplate> QoreV8Program::getClassTemplate(const QoreClass& cls) {
    auto it = classTemplateCache.find(&cls);
    if (it != classTemplateCache.end()) {
        return it->second.Get(isolate);
    }
    return v8::Local<v8::FunctionTemplate>();
}

void QoreV8Program::cacheClassTemplate(const QoreClass& cls, v8::Isolate* isolate,
        v8::Local<v8::FunctionTemplate> tmpl) {
    classTemplateCache[&cls].Reset(isolate, tmpl);
}
