# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  JavaScriptInProcessPool.qc Copyright 2026 Qore Technologies, s.r.o.

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
*/

#! Main namespace for the TypeScriptActionInterface module
public namespace TypeScriptActionInterface {
#! Information about an in-process program instance in the pool
public hashdecl InProcessProgramInfo {
    #! The JavaScript program instance
    JavaScriptProgram pgm;

    #! Map from original acmap keys to this program's closures
    hash<string, code> call_map;

    #! Unique ID for this program
    string id;

    #! Assigned thread ID (NOTHING when idle)
    *int tid;

    #! Last access time (NOTHING when active)
    *date atime;

    #! Event source count
    int ecount = 0;
}

#! In-process pool of JavaScriptProgram instances for concurrent access
/** This class manages a pool of identical JavaScriptProgram instances that allows concurrent thread access
    without IPC overhead. Programs are created on demand when all existing programs are busy, up to an
    optional maximum size. When the maximum is reached, threads wait for a program to become available.
*/
public class JavaScriptInProcessPool {
    public {
        #! Minimum number of pre-allocated programs
        const MinPrograms = 1;
    }

    private {
        #! Pool mutex
        Mutex m();

        #! Condition variable for threads waiting when pool is at max size
        Condition cond();

        #! Thread map: TID -> program unique ID
        hash<string, string> tmap;

        #! Active programs: unique ID -> InProcessProgramInfo
        hash<string, hash<InProcessProgramInfo>> amap;

        #! Idle programs: unique ID -> InProcessProgramInfo
        hash<string, hash<InProcessProgramInfo>> imap;

        #! Number of threads waiting for a program to become available
        int waiting = 0;

        #! Number of programs currently being created (to enforce max_size during concurrent creation)
        int creating = 0;

        #! The JavaScriptProgramPool used to create new programs
        JavaScriptProgramPool pool;

        #! Maximum pool size (NOTHING = unlimited)
        *int max_size;

        #! Shutdown flag
        bool shutdown_flag = False;
    }

    #! Creates the pool with at least MinPrograms pre-allocated
    /** @param pool the JavaScriptProgramPool used to create new programs
        @param max_size optional maximum number of programs in the pool; NOTHING = unlimited
    */
    constructor(JavaScriptProgramPool pool, *int max_size) {
        self.pool = pool;
        self.max_size = max_size;

        # pre-allocate minimum number of programs
        for (int i = 0; i < MinPrograms; ++i) {
            hash<InProcessProgramInfo> info = createProgramIntern();
            imap{info.id} = info;
        }
        TSAI::info("JavaScriptInProcessPool: created with %d pre-allocated program(s), max_size: %y",
            MinPrograms, max_size);
    }

    #! Shuts down the pool and deletes all programs
    destructor() {
        shutdown();
    }

    #! Signals shutdown and wakes all waiting threads
    /** Can be called while threads are still executing methods on this object.
        After calling shutdown(), any thread blocked in get() will throw POOL-SHUTDOWN,
        and new calls to get() will also throw POOL-SHUTDOWN.
    */
    shutdown() {
        m.lock();
        on_exit m.unlock();

        shutdown_flag = True;
        if (amap) {
            TSAI::error("JavaScriptInProcessPool: shutting down with %d active program(s)", amap.size());
        }
        # delete all idle programs
        remove imap;
        # delete all active programs
        remove amap;
        remove tmap;

        if (waiting) {
            cond.broadcast();
        }
    }

    #! Returns a unique hash for the pool (for DataProvider shutdown handler registration)
    string uniqueHash() {
        return pool.uniqueHash() + "-inprocess";
    }

    #! Acquires a program for the calling thread
    /** If the calling thread already has a program assigned, returns it.
        Otherwise, takes an idle program, waits for one to become available (if at max size),
        or creates a new one.

        @return the program info for the calling thread
    */
    hash<InProcessProgramInfo> get() {
        int tid = gettid();

        m.lock();
        on_exit m.unlock();

        if (shutdown_flag) {
            throw "POOL-SHUTDOWN", "In-process pool is shutting down";
        }

        # check if this thread already has a program
        if (*string pkey = tmap{tid}) {
            return amap{pkey};
        }

        hash<InProcessProgramInfo> info;
        string pkey;

        if (imap) {
            # take from idle map
            pkey = imap.firstKey();
            info = remove imap{pkey};
            remove info.atime;
        } else if (exists max_size && (amap.size() + creating >= max_size)) {
            # at max size (including in-flight creations); wait for a program to be released
            ++waiting;
            on_exit --waiting;
            while (!imap && !shutdown_flag) {
                cond.wait(m);
            }
            if (shutdown_flag) {
                throw "POOL-SHUTDOWN", "In-process pool shut down while waiting for program";
            }
            pkey = imap.firstKey();
            info = remove imap{pkey};
            remove info.atime;
        } else {
            # create a new program (release mutex during creation)
            # track in-flight creations so max_size is enforced across concurrent creators
            ++creating;
            try {
                {
                    m.unlock();
                    on_exit m.lock();
                    info = createProgramIntern();
                }
            } catch () {
                # on_exit m.lock() has already re-acquired the mutex
                --creating;
                # wake a waiter so it can retry creation now that creating has dropped
                if (waiting) {
                    cond.signal();
                }
                rethrow;
            }
            --creating;
            # mutex is re-acquired here
            if (shutdown_flag) {
                throw "POOL-SHUTDOWN", "In-process pool shut down during program creation";
            }
            pkey = info.id;
        }

        info.tid = tid;
        amap{pkey} = info;
        tmap{tid} = pkey;
        return info;
    }

    #! Releases a program back to the idle pool
    /** Must be called after get() when the caller is done with the program.
        Safe to call after shutdown() — the call is a no-op if the program is no longer in the active map.

        @param info the program info returned by get()
    */
    release(hash<InProcessProgramInfo> info) {
        m.lock();
        on_exit m.unlock();

        releaseIntern(info);
    }

    #! Releases a program back to the idle pool (must be called with mutex locked)
    private releaseIntern(hash<InProcessProgramInfo> info) {
        string pkey = info.id;
        if (!amap{pkey}) {
            return;
        }
        remove amap{pkey};
        if (info.tid) {
            remove tmap{info.tid};
        }
        remove info.tid;
        info.atime = now_us();
        imap{pkey} = info;

        if (waiting) {
            cond.signal();
        }
    }

    #! Core dispatch method: acquires a program, executes the call, and releases
    /** @param api the async call info (from the global acmap)
        @param args optional arguments to pass to the call

        @return the result of the call
    */
    auto execCall(hash<AsyncCallInfo> api, *softlist<auto> args) {
        hash<InProcessProgramInfo> info = get();
        on_exit release(info);

        # look up the equivalent closure for this pooled program
        *code pooled_call = info.call_map{api.key};
        if (!pooled_call) {
            throw "POOL-CALL-ERROR", sprintf("No pooled closure for key %y in program %y; known keys: %y",
                api.key, info.id, keys info.call_map);
        }

        # build a modified AsyncCallInfo with the pooled closure
        hash<AsyncCallInfo> pooled_api = api;
        pooled_api.async_call = pooled_call;

        return TypeScriptActionDataProviderBase::execAsyncValueDirect(DataProvider::getGlobalLogger(),
            pooled_api, args);
    }

    #! Creates a new program with closures captured via clone mode
    private hash<InProcessProgramInfo> createProgramIntern() {
        TSAI::info("JavaScriptInProcessPool: creating new program");
        date start = now_us();

        # Set clone mode to capture closures
        PoolCloneModeHelper clone_helper();
        JavaScriptProgram new_pgm = pool.createProgramForPool();
        *hash<string, code> closures = PoolCloneModeHelper::getClosures();

        TSAI::info("JavaScriptInProcessPool: created new program in %y with %d closure(s)",
            now_us() - start, closures.size());

        string id = new_pgm.uniqueHash();
        return <InProcessProgramInfo>{
            "pgm": new_pgm,
            "call_map": closures ?? {},
            "id": id,
        };
    }
}
}
