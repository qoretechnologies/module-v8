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
`QoreObject*` in the internal field with a `realRef()` for reference counting.

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
4. If found but not `Public` → raise V8 exception ("JAVASCRIPT-ERROR: cannot access
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
3. When V8's GC collects the JS object, `weak_callback` calls `qobj->realDeref()` to release the
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

1. **objectRefs**: All tracked `QoreV8ObjectRef` objects are iterated — each `QoreObject*` is
   `realDeref()`'d, the persistent handle is reset, and the struct is deleted.
2. **nsDataRefs**: All tracked `QoreV8NamespaceData` objects are cleaned up (persistent handles
   reset, cache entries destroyed).
3. **classTemplateCache**: Cleared (v8::Global destructors reset handles).
4. **Callback data**: All `QoreV8ClassData`, `QoreV8MethodData`, `QoreV8FunctionData`, and
   `QoreV8MemberHandlerData` structs are deleted.

This ensures no leaks even if V8's GC hasn't run before program destruction.

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
| `CMakeLists.txt` | Build configuration (new source files added) |
