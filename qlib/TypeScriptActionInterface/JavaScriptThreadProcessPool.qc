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
        Queue q();
        background preallocate(q, MinProcesses);
        if (*hash<ExceptionInfo> ex = q.get()) {
            throw ex.err, ex.desc, ex.arg;
        }
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
    JavaScriptProgramProxy get(*code setup) {
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
        } else {
            info = getProxyIntern(tid, \pkey);
        }
        # add to active map
        amap{pkey} = info;
        tmap{tid} = pkey;
        return info.p;
    }

    #! Releases a proxy for an API call
    release(JavaScriptProgramProxy p) {
        m.lock();
        on_exit m.unlock();

        releaseIntern(p);
    }

    private releaseIntern(JavaScriptProgramProxy p) {
        string pkey = p.uniqueHash();
        hash<ProxyCacheInfo> info = remove amap{pkey};
        remove tmap{info.tid};
        remove info.tid;
        info.atime = now_us();
        imap{pkey} = info;
    }

    *hash<auto> searchRecords(string app, string id, string conn_name, hash<auto> conn_opts, int block_size,
            *hash<DataProviderExpression> where_cond, hash<auto> search_options, *hash<DataContextInfo> options) {
        JavaScriptProgramProxy proxy;
        {
            AutoLock al(m);
            # unique proxy key
            string pkey;
            hash<ProxyCacheInfo> info;
            # take a proxy from the idle map, if any
            if (imap) {
                # get proxy key
                pkey = imap.firstKey();
                # remove from inactive map
                info = remove imap{pkey};
                remove info.atime;
            } else {
                info = getProxyIntern(gettid(), \pkey);
                # this proxy is not dedicated to any TID; it's only for bulk searches
                remove info.tid;
                pkey = info.p.uniqueHash();
            }
            # add to active map
            amap{pkey} = info;
            proxy = info.p;
        }
        on_error {
            release(remove proxy);
        }
        *hash<auto> rv = proxy.searchRecords(app, id, conn_name, conn_opts, block_size, where_cond, search_options,
            options);
        if (!rv.firstValue().lsize()) {
            release(remove proxy);
        }
        return {
            "rv": rv,
            "proxy": proxy,
        };
    }

    #! Releases a search
    releaseSearch(JavaScriptProgramProxy proxy, string id) {
        proxy.releaseSearch(id);
        AutoLock al(m);
        string pkey = proxy.uniqueHash();
        hash<ProxyCacheInfo> info = remove amap{pkey};
        info.atime = now_us();
        imap{pkey} = info;
    }

    #! Sets up a proxy as an event data source
    JavaScriptProgramProxy setupEventSource(Observable observable, string app, string action, string key,
            *hash<DataContextInfo> options) {
        JavaScriptProgramProxy proxy;
        string pkey;
        {
            AutoLock al(m);

            # look for a proxy already handling this exact event
            foreach string pkey in (keys amap) {
                if (amap{pkey}.p.supportsEvent(key)) {
                    on_success ++amap{pkey}.ecount;
                    amap{pkey}.p.addEventSourceLocked(observable, key);
                    return amap{pkey}.p;
                }
            }

            # unique proxy key
            hash<ProxyCacheInfo> info;
            # take a proxy from the idle map, if any
            if (imap) {
                # get proxy key
                pkey = imap.firstKey();
                # remove from inactive map
                info = remove imap{pkey};
                remove info.atime;
            } else {
                info = getProxyIntern(gettid(), \pkey);
                # this proxy is not dedicated to any TID; it's only for events
                remove info.tid;
                pkey = info.p.uniqueHash();
            }
            # add to active map
            amap{pkey} = info;
            ++amap{pkey}.ecount;
            proxy = info.p;
        }
        on_error {
            AutoLock al(m);
            if (!--amap{pkey}.ecount) {
                releaseIntern(proxy);
            }
        }
        proxy.setupEventSource(observable, app, action, key, options);
        return proxy;
    }

    #! Releases a proxy as an event source
    releaseEventSource(JavaScriptProgramProxy proxy, Observable observable, string key, *bool in_listener) {
        AutoLock al(m);

        on_exit {
            string pkey = proxy.uniqueHash();
            if (!--amap{pkey}.ecount) {
                hash<ProxyCacheInfo> info = remove amap{pkey};
                info.atime = now_us();
                imap{pkey} = info;
            }
        }
        proxy.releaseEventSourceLocked(observable, key, in_listener);
    }

    private preallocate(Queue q, int num) {
        try {
            int tid = gettid();
            m.lock();
            on_exit m.unlock();
            for (int i = 0; i < num; ++i ){
                string pkey;
                hash<ProxyCacheInfo> info = getProxyIntern(tid, \pkey);
                imap{pkey} = info;
            }
        } catch (hash<ExceptionInfo> ex) {
            q.push(ex);
        }
        q.push();
    }

    private hash<ProxyCacheInfo> getProxyIntern(int tid, reference<string> pkey) {
        # do not create the proxy object with the lock locked; each thread will need its own object in any case
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