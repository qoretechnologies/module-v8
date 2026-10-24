Copyright 2026 Qore Technologies, s.r.o.

# Qore-JavaScript Integration Design

## Overview

The Qore-JavaScript integration allows JavaScript code running in a `JavaScriptProgram` to
transparently access all Qore APIs — namespaces, classes, functions, constants, and enums — through
a global `qore` object. This is modeled after the Python module's `from qore import` mechanism,
providing seamless interoperability between JavaScript and Qore.

## Architecture

A `qore` global object is injected into every `JavaScriptProgram` V8 context before user code
executes. This object wraps the Qore root namespace and uses V8's named property interceptor
mechanism for lazy, on-demand resolution of Qore symbols. Class wrapping uses V8 `FunctionTemplate`
objects to create proper JavaScript constructor functions with prototype-based method dispatch.

### Injection Point

In `QoreV8Program::init()`, after the V8 context is created but before `LoadEnvironment()` executes
user code, the root namespace is wrapped and set as `globalThis.qore`:

```cpp
const QoreNamespace* rootNS = qpgm->getRootNS();
v8::Local<v8::Object> qoreGlobal = QoreV8NamespaceWrapper::create(isolate, context, this, *rootNS);
global.Get(isolate)->Set(context, v8::String::NewFromUtf8(isolate, "qore"), qoreGlobal);
```

### Program Source

`init()` passes the program's source and its label to the bootstrap script that `LoadEnvironment()`
runs in the program's own context: `setBootstrapData()` defines a non-enumerable global property,
keyed by the registered symbol `Symbol.for('qore.v8.bootstrap')`, holding `{source, filename}`. The
bootstrap script reads the property and deletes it before it runs any other code, then runs the
source (stripping or transpiling it first for a `TypeScriptProgram`) with `vm.runInThisContext()`
under the label.

The source must never be passed in the process environment. The environment is shared by every
program in the process, so a program created in another thread at the same time ran the other
program's source. On musl, `setenv()` is not thread-safe and frees the value it replaces, and Qore's
`SystemEnvironment` did not serialize it on Linux then, so concurrent program creation also corrupted the
heap (a double free of the replaced value) and crashed the process later at random.
`test/js-program-concurrent-init.qtest` creates programs in 8 threads at the same time.

The `TypeScriptActionInterface` module gives each action script's programs the script's own
`__filename` and `__dirname` as literals in their default code, for the same reason.

### Process Environment

Node reads and changes the environment for `process.env` with a lock of its own
(`per_process::env_var_mutex`, `RealEnvStore` in `node_env_var.cc`), not with Qore's environment lock
(`SystemEnvironment`, `QoreEnvironmentReadLock`, `AtomicEnvironmentSetter`), so the two did not exclude
each other: a variable that Qore code replaced in another thread while JavaScript code read it could be
read after it was freed (musl's `setenv()` frees the value it replaces), and a change made by JavaScript
code could do the same to Qore code reading the environment, or copying it for a new process.

The bootstrap script therefore replaces `process.env`, before any code of the program runs, with a
proxy (`QORE_V8_PROCESS_ENV_BOOTSTRAP` in `QoreV8Program.cpp`) whose traps call the functions of the
environment bridge (`qore_v8_create_env_bridge()` in `QoreV8Environment.cpp`, passed in the bootstrap
data as `env`). Each function performs the operation on Node's original `process.env` object with Qore's
lock held: shared for `get`, `has`, `keys` and `descriptor`, exclusively for `set`, `delete` and
`define`. Node's own handling is kept: the conversion of names and values to strings and its errors
(`ERR_INVALID_OBJECT_DEFINE_PROPERTY` for a descriptor it refuses), and the time zone change that a
change of `TZ` causes (`tzset()` and V8's time zone detection, which run inside the exclusive lock).

- **Lock order:** Qore's lock is acquired first and Node's inside it, by Node's store; Node never waits
  for Qore's lock while it holds its own.
- **No JavaScript runs while the lock is held:** the operations of the original object are Node's C++
  interceptors; the proxy converts names and values to strings before it calls a function; a variable is
  looked up with `HasOwnProperty()` before `Get()`, so that a name that is not set is not looked up in the
  prototype chain under the lock; the descriptor of `define` is read, and its value converted, before the
  lock is acquired.
- **`define` applies Node's rules itself** (`EnvDefiner()`): a configurable, writable and enumerable data
  descriptor sets the variable as an assignment does, and any other descriptor raises Node's
  `ERR_INVALID_OBJECT_DEFINE_PROPERTY` error. Node's definer is not called through
  `v8::Object::DefineProperty()`: V8 11 (Node 20) does not raise the definer's error there, so a refused
  descriptor was silently ignored.
- **Node's behavior is kept:** a symbol property is `undefined`; a name that is not a variable is looked
  up in `Object.prototype` (`process.env.hasOwnProperty()`); a symbol name or value raises `TypeError`;
  `delete` always returns `true`; `Object.keys()`, the spread operator and `JSON.stringify()` see the
  variables. `util.inspect()` shows the target of a proxy, so the target has a `util.inspect.custom`
  function that shows the variables.
- **Differences:** `util.types.isProxy(process.env)` is `true`; `structuredClone(process.env)`, and
  passing `process.env` itself to `postMessage()` or `v8.serialize()`, raise an error (Node's serializer
  converts only its own `process.env` object to a plain object); a copy made with `{...process.env}` can
  be cloned.

#### Error messages and exceptions never contain the environment

The proxy is a proxy rather than an object with interceptors, as Node's own `process.env` is, because
V8's serializer refuses a proxy at once (`#<Object> could not be cloned.`), while it passes an object with
interceptors to the serializer's delegate as a host object, and Node's `v8.serialize()`
(`DefaultSerializer._writeHostObject()` in `lib/v8.js`) reports a host object that it cannot serialize as
`Unserializable host object: ${inspect(object)}`, which listed every variable of the environment in the
error message (and in the description of the `JAVASCRIPT-EXCEPTION`, and so in logs). Node's own
`process.env` does this as well.

The bootstrap script passes the proxy to the program (`envCreated()`), and the conversion of a JavaScript
exception to a Qore value (`QoreV8Program::checkException()`, `ExceptionConversionHelper`) puts the
string `"<process.env>"` in place of the proxy (`QoreV8Object::toData()`, `isRedactedEnv()`), so that an
exception value that is or contains `process.env` does not carry the variables into the exception
argument. Other conversions are not affected: Qore code that asks for `process.env` gets the variables.

Node also reads the environment when it initializes the process (`node::InitializeOncePerProcess()`) and
when it creates a program's environment (`node::CommonEnvironmentSetup::Create()`); no code of a program
runs in either, and both are called with a `QoreEnvironmentReadLock`.

Not covered, since no lock can be held around them: the variables that Node reads in `LoadEnvironment()`
before the bootstrap script runs (its pre-execution code, which also runs code preloaded with
`NODE_OPTIONS=--require`), reads made by libuv and by third-party libraries inside other calls (for
example `os.homedir()`, OpenSSL and c-ares configuration variables), and `Worker` threads: a worker's
`process.env` is a copy of the environment that Node makes without Qore's lock, or, with `SHARE_ENV`,
Node's original store.

`test/js-process-env.qtest` checks that the proxy behaves as Node's `process.env`, that exceptions do not
contain the environment, and changes the environment in several threads while JavaScript code reads it.

### Property Resolution Flow

When JavaScript accesses `qore.Qore.Thread.Mutex`, resolution proceeds:

1. `qore.Qore` → namespace getter finds `Qore` child namespace → creates wrapper, caches it
2. `.Thread` → namespace getter finds `Thread` child namespace → creates wrapper, caches it
3. `.Mutex` → namespace getter finds `Mutex` class → creates class wrapper via `QoreV8ClassWrapper`

## Namespace Wrapper (`QoreV8NamespaceWrapper`)

### V8 Interceptor Configuration

Each namespace wrapper is a V8 object with an `ObjectTemplate` using
`NamedPropertyHandlerConfiguration`:

- **getter**: Resolves names against the Qore namespace in priority order:
  child namespace → class → function → constant → enum
- **setter**: `nullptr` (read-only — existing properties cannot be overwritten)
- **query**: Returns `ReadOnly | DontDelete` for names that exist in the namespace
- **deleter**: `nullptr` (properties cannot be deleted)
- **enumerator**: Iterates all child namespaces, classes, functions, constants, and enums
- **flags**: `kNonMasking` (V8 checks own properties first, then falls through to interceptor)

### Caching

Each `QoreV8NamespaceData` struct holds a `std::map<std::string, v8::Global<v8::Value>>` cache.
Once a name is resolved, the result is stored in the cache and subsequent accesses return the
cached value directly. This is critical for performance since namespace/class lookups involve
Qore API calls.

### Function Wrapping

Namespace functions are wrapped as V8 `Function` objects via `v8::Function::New()` with a
`call_function` callback. Each function stores a `QoreV8FunctionData` struct containing the
fully qualified function path (e.g., `"Qore::type"`) used for `QoreV8Program::callFunction()`.

Arguments are marshalled from V8 values to Qore values via `getQoreValue()`, the function is
called via `qpgm->callFunction()`, and the return value is marshalled back via `getV8Value()`.

### Enum Wrapping

Enums are wrapped as plain V8 objects with `ReadOnly | DontDelete` properties, one per enum
member. Values are converted to V8 values at wrap time.

## Class Wrapper (`QoreV8ClassWrapper`)

### FunctionTemplate Structure

Each Qore class is represented by a V8 `FunctionTemplate`:

- **Constructor callback** (`constructor_callback`): Called when JS does `new ClassName(...)`.
  Marshals arguments, calls `cls->execConstructor()`, stores the `QoreObject*` in the V8 object's
  internal field (slot 0).
- **Instance methods**: Added to `PrototypeTemplate()` as `FunctionTemplate` entries. Each has a
  `method_callback` that extracts the `QoreObject*` from `info.This()` internal field and calls
  `qobj->evalMethod()`.
- **Static methods**: Added directly to the `FunctionTemplate` (not the prototype) with a
  `static_method_callback` that calls `QoreObject::evalStaticMethod()`.
- **Class constants**: Added as `ReadOnly` properties on the `FunctionTemplate`.
- **Inheritance**: `QoreParentClassIterator` is used to find parent classes, and
  `FunctionTemplate::Inherit()` establishes the prototype chain. V8 only supports single
  inheritance, so only the first accessible parent is linked.

### Template Caching

`QoreV8Program` maintains a `std::map<const QoreClass*, v8::Global<v8::FunctionTemplate>>`
cache (`classTemplateCache`). `getOrCreateTemplate()` checks this cache first, ensuring each
class is only wrapped once per program instance. This is essential when multiple instances of the
same class are created.

### Wrapping Existing Objects

`wrapExistingObject()` handles QoreObjects returned from Qore functions/methods to JavaScript.
It reuses the cached `FunctionTemplate` to create a new V8 instance (via
`InstanceTemplate()->NewInstance()`) without calling the constructor, then stores the existing
`QoreObject*` in the internal field with a `tRef()` for reference counting.

### Member Interceptor (Public Data Members)

Instance templates have a `NamedPropertyHandlerConfiguration` that provides transparent
read/write access to public Qore data members from JavaScript.

#### Configuration

```cpp
v8::NamedPropertyHandlerConfiguration config(
    member_getter,       // getter - reads public members via getReferencedMemberNoMethod()
    member_setter,       // setter - writes public members via setValue()
    member_query,        // query  - reports public members as DontDelete
    nullptr,             // deleter (not supported)
    member_enumerator,   // enumerator - lists public member names
    ext,                 // data: v8::External wrapping QoreV8MemberHandlerData*
    v8::PropertyHandlerFlags::kNonMasking  // prototype methods take precedence
);
tmpl->InstanceTemplate()->SetHandler(config);
```

The `kNonMasking` flag is critical: it ensures that prototype methods (e.g., `lock()`,
`getCount()`) are resolved before the interceptor fires. Without this flag, a member named
the same as a method would shadow the method.

#### QoreV8MemberHandlerData (O(1) Member Lookup Cache)

Rather than iterating `QoreClassMemberIterator` on every property access (O(n) per access),
member metadata is cached once per class template in `QoreV8MemberHandlerData`:

```cpp
struct QoreV8MemberHandlerData {
    QoreV8Program* pgm;
    std::unordered_map<std::string, ClassAccess> members;  // O(1) lookup
    std::vector<std::string> public_member_names;           // for enumerator
};
```

The struct is built in `getOrCreateTemplate()` by iterating `QoreClassMemberIterator` once,
collecting all member names and their access levels. It is passed to all four interceptor
callbacks via a `v8::External` data parameter.

#### Getter Flow

1. Extract `QoreV8MemberHandlerData*` from the callback's `Data()` external.
2. Look up the property name in `mhdata->members` (O(1) hash lookup).
3. If not found → return `kNo` (V8 falls through to prototype chain / undefined).
4. If found but not `Public` → raise V8 exception ("JAVASCRIPT-MEMBER-ACCESS-ERROR: cannot access
   private/internal member").
5. Get `QoreObject*` from internal field 0.
6. Call `qobj->getReferencedMemberNoMethod(name, &xsink)` (access-controlled, no
   memberGate trigger).
7. Convert result to V8 value via `pgm->getV8Value()`.

#### Setter Flow

1. Look up property name in `mhdata->members`.
2. If not found → return `kNo` (allows setting JavaScript-only properties on the object).
3. If found but not `Public` → raise V8 exception.
4. Convert V8 value to Qore value via `pgm->getQoreValue()`.
5. Call `qobj->setValue(name, val, &xsink)`.

#### V8 12+ Intercepted Return Type

V8 12+ changed the interceptor signature to return `v8::Intercepted` (`kYes` or `kNo`)
instead of `void`. When returning `kYes`, V8 **requires** a return value to be set via
`info.GetReturnValue().Set()` — even if an exception is pending. Failure to set a return
value causes a fatal `Check failed: !IsTheHole(*slot, isolate)` crash. All error paths that
return `kYes` set `v8::Null(isolate)` as a placeholder.

### Constructor Guard

If a class constructor function is called without `new` (i.e., `info.IsConstructCall()` is
`false`), a `JAVASCRIPT-CONSTRUCTOR-ERROR` exception is raised.

## Memory Management

### QoreV8ObjectRef (Object Lifecycle)

When a `QoreObject*` is stored in a V8 object's internal field:

1. A `QoreV8ObjectRef` struct is created holding the `QoreObject*` pointer, a persistent V8
   handle, and the owning `QoreV8Program*`.
2. The persistent handle is set as a weak reference with `weak_callback`.
3. When V8's GC collects the JS object, `weak_callback` calls `qobj->tDeref()` to release the
   Qore object reference, then deletes the `QoreV8ObjectRef`.

### QoreV8NamespaceData (Namespace Lifecycle)

Similarly, each namespace wrapper has a `QoreV8NamespaceData` with a weak persistent handle. When
GC collects the wrapper, `weak_callback` cleans up the data and its cache.

### Qore Reference Saving

Qore objects created in JavaScript (via `new`) are saved via `saveQoreReference()` to prevent
premature garbage collection. By default, references are stored in thread-local data under the
`_v8_save` key. Alternatively, a custom save callback can be set via
`JavaScriptProgram::setSaveReferenceCallback()`.

### Deterministic Cleanup (deleteIntern)

When a `QoreV8Program` is destroyed, `deleteIntern()` performs deterministic cleanup of all
tracked resources:

0. **Platform tasks**: the node environment is stopped with `node::Stop()`, then
   `drainPlatformTasks()` calls `MultiIsolatePlatform::DrainTasks()` (under the isolate's
   `Locker`, with JavaScript execution disallowed and no context entered). This waits for all
   concurrent platform tasks, such as an async `WebAssembly.compile()`, and runs the foreground
   tasks they post. It has to happen while the isolate is still registered with the platform.
   The `node::CommonEnvironmentSetup` destructor calls `UnregisterIsolate()` before
   `Isolate::Dispose()`, and only `Dispose()` cancels and joins concurrent tasks. A task that
   finishes in between posts to a per-isolate task runner whose async handle is being torn down
   without synchronization, and crashes in `uv_async_send()`. Node's `FreeEnvironment()` stopped
   draining the platform itself in nodejs/node#51290.
1. **objectRefs**: All tracked `QoreV8ObjectRef` objects are iterated — each `QoreObject*` is
   `tDeref()`'d, the persistent handle is reset, and the struct is deleted.
2. **nsDataRefs**: All tracked `QoreV8NamespaceData` objects are cleaned up (persistent handles
   reset, cache entries destroyed).
3. **classTemplateCache**: Cleared (v8::Global destructors reset handles).
4. **Callback data**: All `QoreV8ClassData`, `QoreV8MethodData`, `QoreV8FunctionData`, and
   `QoreV8MemberHandlerData` structs are deleted.

This ensures no leaks even if V8's GC hasn't run before program destruction.

### Handles That Outlive the Program

The isolate is disposed only when the last weak program reference is released
(`QoreV8Program::weakRef()` / `weakDeref()`). Any Qore-side object that holds a `v8::Global` and
can outlive the program therefore holds a weak program reference, and releases the handle with
`QoreV8Program::resetObject()` before releasing that reference. Examples are `QoreV8Object` (the
private data of `JavaScriptObject` and `JavaScriptPromise`) and `QoreV8PromiseCallbackInfo`
(stored as a hidden member of `JavaScriptPromise` objects, and cleaned up after the object's
private data). Once the program is invalid, `resetObject()` forgets the handle instead of
resetting it.

## Process Initialization

`node::InitializeOncePerProcess()` is called with `kEnableStdioInheritance`. Without it, node
marks the embedding process's stdio file descriptors close-on-exec. Every child process Qore
started afterwards (`system()`, `backquote()`, and so on) then ran without stdin, stdout and
stderr unless they were explicitly redirected.

### process.stdout and process.stderr

For a stdout or stderr that is a pipe or a stream socket, Node.js creates `process.stdout` and
`process.stderr` on first use as `net.Socket` streams (`createWritableStdioStream()` in
`lib/internal/bootstrap/switches/is_main_thread.js`), and libuv's `uv_pipe_open()` /
`uv_tcp_open()` put the descriptor in non-blocking mode (`O_NONBLOCK`). That flag belongs to the
open file description, which the descriptor shares with Qore's own output and with every other
process that has the pipe (the parent shell, a CI runner, Qorus's process tree): their writes to
a full pipe failed with `EAGAIN` (Qore's `FILE-WRITE-ERROR: ... Resource temporarily
unavailable` in module-v8 pipeline 61462), and data that libuv had queued when a program was
destroyed was lost. Node.js restores the flag only when the process exits. No process
initialization flag prevents it: `kNoStdioInitialization` only skips Node's checks of the stdio
descriptors at startup and their restoration at exit.

The bootstrap code of every program (`QORE_V8_PROCESS_STDIO_BOOTSTRAP` in `QoreV8Program.cpp`)
therefore replaces the `process.stdout` and `process.stderr` getters. On first use, for a pipe
or a stream socket (`isStream()` of the bridge in `QoreV8Stdio.cpp`), the stream is a `Writable`
whose writes call `write()` of the bridge: synchronous and complete, waiting while the pipe is
full as Qore's own writes do. If another process made the description non-blocking, the bridge
waits for the descriptor with `qore_cancellable_poll()` instead of changing the flag; the wait
ends with an exception when the thread is cancelled or its program is interrupted. Write errors
are Node's errno exceptions (`EPIPE`, and so on). For a terminal and a file, Node's own streams
are used: libuv reopens a terminal (or writes it in blocking mode), and a file is written
synchronously, so neither changes the shared description. `process.stdin` is not replaced (test:
`test/v8-stdio-inheritance.qtest`).

The process arguments include `--unhandled-rejections=warn`, and every program's environment is
created from them (`QoreV8Program::QoreV8Program()` passes `init_result->args()` and
`exec_args()`). An embedded program has no process of its own to end: Node's default mode raises an
unhandled rejection as an uncaught exception, which reaches the process-exit handler installed by
`QoreV8Program::init()`, and that handler marks the program invalid for good. One promise nobody
waited for - a background network write that timed out - therefore left a long-lived program, and
every TypeScript app loaded into it by `ts-proxy`, failing with "has been destroyed" until the host
process was restarted. In `warn` mode the rejection is reported on stderr as an
`UnhandledPromiseRejectionWarning` with its stack and the program stays usable; handlers a program
registers for `unhandledRejection` still run. Uncaught exceptions and `process.exit()` still end
the program (test: `test/v8.qtest` "unhandled rejection keeps the program usable").

### Child Processes Created With fork()

A child process created with `fork()` runs only the thread that called `fork()`: the platform's worker threads,
the threads that run JavaScript code and the threads that hold the locks of V8, Node.js and the module exist only
in the parent, and on Linux the epoll descriptors of the programs' event loops refer to the parent's event loops.
The module's fork handler (`v8_fork_child()`, registered at `QFR_MODULE_LEAF` in `v8_module_init()`) marks the
child (`qore_v8_forked_child()`) and releases the static platform pointer without destroying the platform. In the
child:

- nothing of V8 or Node.js is torn down: the platform's destructor joined the worker threads at exit (a hang with
  glibc and musl, an abort on macOS); `v8_module_shutdown()` returns at once; `QoreV8Program::deleteIntern()` only
  releases the Qore references of the program (`deleteInForkedChild()`), since stopping the environment waited for
  the parent's platform tasks and freeing it ran the event loop on the parent's descriptors; the environment, the
  isolate and the persistent handles are abandoned (`abandonInForkedChild()`)
- no lock of the module is acquired: the global program set and the program locks could be held by a thread of the
  parent; persistent handles are forgotten (`forgetHandle()`) rather than reset
- no JavaScript code can be run: `QoreV8ProgramHelper`, the event loop calls and `init()` raise
  `JAVASCRIPT-PROGRAM-ERROR`; V8 crashed in `v8::Context::Enter()` when the parent's program was used

The exit-time code of libnode itself is not safe in the child either: libuv's `uv_library_shutdown()` destructor
joins the threads of libuv's thread pool, which the parent starts with asynchronous file system, DNS, crypto and zlib
calls (a hang on Linux, an abort on macOS), and on macOS the destructor of Node's static `SigintWatchdogHelper`
destroys a Mach semaphore of the parent (an abort in every child). The fork handler therefore requests that the child
ends without running exit-time handlers with `qore_fork_child_exit_quickly()` (Qore 3.0,
`_QORE_HAS_FORK_CHILD_QUICK_EXIT`): the child ends with `_exit()` and its exit status after Qore's own cleanup, from
`exit()` and at the end of its main program. With an older Qore, the platform is still not destroyed, but libnode's
exit-time code runs (test: `test/v8-fork.qtest`).

### Tracking Sets

`QoreV8Program` maintains tracking sets for all allocated wrapper data:

- `std::set<QoreV8NamespaceData*> nsDataRefs`
- `std::set<QoreV8ObjectRef*> objectRefs`
- `std::vector<QoreV8ClassData*> classDataRefs`
- `std::vector<QoreV8MethodData*> methodDataRefs`
- `std::vector<QoreV8FunctionData*> funcDataRefs`
- `std::vector<QoreV8MemberHandlerData*> memberHandlerDataRefs`

Objects are added to tracking when created (`trackXxx()`) and removed when GC'd normally
(`untrackXxx()`). On program destruction, remaining tracked objects are cleaned up deterministically.

## Exception Propagation

Qore exceptions raised during function calls, method calls, or constructor execution are
converted to V8 exceptions via `QoreV8Program::raiseV8Exception()`. The error string and
description are formatted as `"ERR_CODE: description"` and thrown as a V8 string exception.
JavaScript code can catch these with standard `try/catch`.

## Thread Safety

All calls into a single `JavaScriptProgram` are serialized via V8's `Locker` mechanism and the
`QoreV8Program::m` mutex. The V8 `Locker` is reentrant within the same thread, which allows
callback chains (Qore → JS → Qore → JS) to work correctly.

## Files

| File | Description |
|------|-------------|
| `src/QoreV8NamespaceWrapper.h` | Namespace wrapper declarations and data structs |
| `src/QoreV8NamespaceWrapper.cpp` | Namespace wrapper implementation (interceptors, function/enum wrapping) |
| `src/QoreV8ClassWrapper.h` | Class wrapper declarations and data structs |
| `src/QoreV8ClassWrapper.cpp` | Class wrapper implementation (constructor, methods, inheritance) |
| `src/QoreV8Program.h` | Program class with template cache and tracking sets |
| `src/QoreV8Program.cpp` | Program init (qore global injection), cleanup, value conversion |
| `src/QoreV8Environment.h` | Access to the process environment under Qore's environment lock |
| `src/QoreV8Environment.cpp` | Atomic copy of the environment (`JavaScriptProgram::getEnvironment()`), environment bridge of `process.env` |
| `src/QoreV8Stdio.h` | Output of programs to the stdout and stderr of the process |
| `src/QoreV8Stdio.cpp` | Stdio bridge of `process.stdout` and `process.stderr` for pipes and sockets (`isStream()`, `write()`) |
| `CMakeLists.txt` | Build configuration (new source files added) |
