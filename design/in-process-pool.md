Copyright 2026 Qore Technologies, s.r.o.

# In-Process JavaScript Program Pool

## Overview
`JavaScriptInProcessPool` manages a pool of identical `JavaScriptProgram` instances
for concurrent thread access **without IPC overhead**. Unlike the out-of-process
`JavaScriptThreadProcessPool` (which spawns `ts-proxy` child processes and
communicates over UNIX sockets with YAML serialization), the in-process pool runs
JavaScript directly in the Qore process via V8 isolates.

Each pool program is a full clone of the original: same source, same init code,
same closures. The pool creates programs on demand when all existing ones are busy,
up to an optional maximum size. When the maximum is reached, requesting threads
block until a program becomes available.

## Architecture

```
                    ┌─────────────────────────┐
                    │ TypeScriptActionInterface│
                    │                         │
                    │  checkInProcessServer()──┼──► returns JavaScriptInProcessPool
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────▼───────────┐
                    │ JavaScriptInProcessPool  │
                    │                         │
                    │  get() ──► InProcessProgramInfo (per-thread)
                    │  release()              │
                    │  execCall() ── get/call/release
                    │  shutdown()             │
                    │                         │
                    │  imap: idle programs    │
                    │  amap: active programs  │
                    │  tmap: thread→program   │
                    └─────────────────────────┘
                                  │
                    ┌─────────────▼───────────┐
                    │ JavaScriptProgramPool    │
                    │  createProgramForPool()  │
                    │  (clone source + init)   │
                    └─────────────────────────┘
```

### Dispatch Priority
When a data provider executes an async call, the dispatch order is:
1. **In-process pool** (`checkInProcessServer()`) — lowest latency
2. **Out-of-process pool** (`checkServer()`) — IPC via ts-proxy
3. **Single-program direct** — serialized on one program

## Usage

### On-Demand Pool (Recommended)
The simplest approach: configure on-demand creation and let the pool be lazily
created on first use.

```qore
# Enable on-demand with a pool size limit of 8 programs
TypeScriptActionInterface::startInProcessServerOnDemand(NOTHING, 8);

# The pool is created automatically on first checkInProcessServer() call.
# All data provider dispatch (execAsyncValueArgs, getDynamicDataType, etc.)
# will use the in-process pool transparently.

# To shut down:
TypeScriptActionInterface::shutdownInProcessServer();
TypeScriptActionInterface::disableInProcessServerOnDemand();
```

### On-Demand with Specific Pool
If you have a specific `JavaScriptProgramPool` to use (e.g., from a particular
script), pass it explicitly:

```qore
JavaScriptProgramPool my_pool(source, path, init_callback);

# Use this specific pool for in-process server creation
TypeScriptActionInterface::startInProcessServerOnDemand(my_pool, 4);
```

### Direct Pool Injection
For full control, create the pool yourself and inject it:

```qore
JavaScriptProgramPool pool(source, path, init_callback);
JavaScriptInProcessPool ip(pool, 16);  # max 16 concurrent programs

TypeScriptActionInterface::setInProcessServer(ip);

# Later:
TypeScriptActionInterface::shutdownInProcessServer();
```

### Via DataProvider Options
In a server environment, set the `DPO_EnableInProcessServers` option before
initialization:

```qore
DataProvider::addOptions(DPO_EnableInProcessServers);
```

This causes `TypeScriptActionInterface::init()` to set `in_process_on_demand = True`,
so the pool is lazily created on first use.

### Direct Pool API
You can also use the pool directly without the `TypeScriptActionInterface` wrapper:

```qore
JavaScriptProgramPool pool(source, path, init_callback);
JavaScriptInProcessPool ip(pool, 4);

# Acquire a program for this thread
hash<InProcessProgramInfo> info = ip.get();
on_exit ip.release(info);

# Use info.pgm (the JavaScriptProgram) directly
# Or use info.call_map to look up closures by key

# For dispatching via the standard async call path:
auto result = ip.execCall(api_info, args);
```

## Pool Sizing

- **`NOTHING` (unlimited)**: Pool grows without bound. Each program is a V8
  isolate with its own heap, so unbounded growth can consume significant memory.
  Use only when the number of concurrent threads is naturally limited.

- **Fixed `max_size`**: Threads beyond the limit block in `get()` until a program
  is released. Choose based on expected concurrency and available memory.
  A reasonable starting point is the number of CPU cores.

## Clone Mode (Internals)

When the pool creates a new program, it must capture the JavaScript closures
(API functions, option resolvers, event handlers, etc.) that get registered
during `init()`. These closures are program-specific — each V8 isolate has its
own function objects.

The **clone mode** mechanism uses thread-local state to capture closures without
modifying the global `acmap`:

1. `PoolCloneModeHelper` sets `_pool_clone_mode = True` (thread-local)
2. `JavaScriptProgramPool::createProgramForPool()` creates the program and
   runs `init(pgm)`
3. During init, `registerAppActions()` triggers the normal registration path
4. `registerAsyncCall()` checks `_pool_clone_mode` and writes to
   `_pool_clone_closures` instead of `acmap`
5. `captureAppClosures()` and `captureActionClosures()` handle app-level and
   action-level closures respectively, including REST modifier closures
   (`post_auth`, `conn_update`) and dependent option closures
6. `PoolCloneModeHelper`'s destructor restores the thread-local state
7. The captured closures become the program's `call_map`

At dispatch time, `execCall()` looks up the original `acmap` key in the
program's `call_map` to find the equivalent closure for that program.

## Thread Safety

- **Pool mutex**: All pool state (imap, amap, tmap) is protected by a single
  mutex. The mutex is released during program creation to avoid blocking other
  threads.

- **Creating counter**: Tracks in-flight program creations so `max_size` is
  enforced even when multiple threads are creating programs concurrently.

- **Condition variable**: Threads waiting for a program at `max_size` block on
  a condition variable. They are woken by `release()`, failed creation
  (`cond.signal()`), or `shutdown()` (`cond.broadcast()`).

- **chdir mutex**: `JavaScriptProgramPool::createProgramForPool()` uses a
  static mutex to serialize `chdir()` calls, since `chdir()` is process-global.

- **Shutdown**: `shutdown()` sets a flag and broadcasts to all waiters. It can
  be called while threads are still executing methods on the pool. After
  shutdown, `get()` throws `POOL-SHUTDOWN`.
