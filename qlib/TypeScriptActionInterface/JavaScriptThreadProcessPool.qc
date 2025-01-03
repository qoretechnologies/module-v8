# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  JavaScriptThreadProcessPool.qc Copyright 2024 Qore Technologies, s.r.o.

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
#! JavaScript thread process pool class
public class JavaScriptThreadProcessPool {
    public {
        const MinProcesses = 1;
    }

    private {
        # atomic lock
        static Mutex m();

        # thread map: TID -> proxy unique ID
        hash<string, string> tmap;

        # active proxy cache: proxy unique ID -> cache info
        hash<string, hash<ProxyCacheInfo>> amap;

        # inactive proxy cache: proxy unique ID -> cache info
        hash<string, hash<ProxyCacheInfo>> imap;

        int max;
        int waiting;
        Condition cond();
    }

    #! Creates the object
    constructor() {
        JavaScriptProgramProxy::init(m);

        # start 3 processes in parallel
        Counter cnt();
        {
            cnt.inc();
            on_error cnt.dec();
            map background preallocate(cnt), xrange(MinProcesses);
        }
        cnt.waitForZero();
    }

    #! Destroys the object
    destructor() {
        if (amap) {
            TSAI::error("Shutting down the process thread pool with active processes: %y; expect further errors",
                keys amap);
        }
        JavaScriptProgramProxy::shutdown();
    }

    #! Acquires a proxy for an API call
    JavaScriptProgramProxy get() {
        int tid = gettid();
        # the unique proxy key
        *string pkey;
        if (pkey = tmap{tid}) {
            return amap{pkey}.p;
        }

        hash<ProxyCacheInfo> info;

        m.lock();
        on_exit m.unlock();
        if (imap) {
            # get proxy key
            pkey = imap.firstKey();
            # remove from inactive map
            info = remove imap{pkey};
            remove info.atime;
            info.tid = tid;
            # add to active map
            amap{pkey} = info;
        } else {
            # do not create the proxy object with the lock locked; each thread will need its own object in any case
            info = getProxyIntern(tid, \pkey);
            amap{pkey} = info;
        }
        tmap{tid} = pkey;
        return info.p;
    }

    #! Releases a proxy for an API call
    release(JavaScriptProgramProxy p) {
        string pkey = p.uniqueHash();

        m.lock();
        on_exit m.unlock();

        hash<ProxyCacheInfo> info = remove amap{pkey};
        remove tmap{info.tid};
        remove info.tid;
        info.atime = now_us();
        imap{pkey} = info;
    }

    #! Sets up a proxy as an event data source
    JavaScriptProgramProxy setupEventSource(Observable observable, string app, string action, string key,
            *hash<auto> options) {
        AutoLock al(m);

        reference<hash<ProxyCacheInfo>> info;
        bool exact;
        code check = *bool sub (reference<hash<ProxyCacheInfo>> i0) {
            if (i0.p.supportsEvent(key)) {
                on_success ++i0.ecount;
                i0.p.addEventSourceLocked(observable, key);
                return True;
            }
            if (!exists info || (info.low > i0.ecount)) {
                info = \i0;
            }
        };

        # find an exact match or the lowest count
        foreach string key in (keys imap) {
            if (check(\imap{key})) {
                return imap{key}.p;
            }
        }
        foreach string key in (keys amap) {
            if (check(\amap{key})) {
                return amap{key}.p;
            }
        }

        on_success ++info.ecount;
        info.p.setupEventSourceLocked(observable, app, action, key, options);
        return info.p;
    }

    #! Releases a proxy as an event source
    releaseEventSource(JavaScriptProgramProxy proxy, Observable observable, string key) {
        AutoLock al(m);

        on_exit {
            string pkey = proxy.uniqueHash();
            if (imap{pkey}) {
                --imap{pkey}.ecount;
            } else {
                --amap{pkey}.ecount;
            }
        }
        proxy.releaseEventSourceLocked(m, observable, key);
    }

    private preallocate(Counter cnt) {
        on_exit cnt.dec();
        int tid = gettid();
        string pkey;

        m.lock();
        on_exit m.unlock();
        hash<ProxyCacheInfo> info = getProxyIntern(tid, \pkey);
        imap{pkey} = info;
    }

    private hash<ProxyCacheInfo> getProxyIntern(int tid, reference<string> pkey) {
        m.unlock();
        on_exit m.lock();

        hash<ProxyCacheInfo> info = <ProxyCacheInfo>{
            "p": new JavaScriptProgramProxy(),
            "tid": tid,
        };
        pkey = info.p.uniqueHash();
        return info;
    }
}
}

namespace Priv {
hashdecl ProxyCacheInfo {
    #! Assigned TID; NOTHING when inactive
    int tid;

    #! Last access time; NOTHING when active
    date atime;

    #! The proxy object
    JavaScriptProgramProxy p;

    #! Event source count
    int ecount = 0;
}
}