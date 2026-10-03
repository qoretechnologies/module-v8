# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptDataCache.qc Copyright (C) 2023 - 2026 Qore Technologies s.r.o.

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

#! Main module namespace
public namespace TypeScriptActionInterface {
class CacheEntry {
    public {
    }

    private {
        Mutex m();
        Condition c();
        bool ready;
        hash<ExceptionInfo> ex;
        int waiting;

        auto val;
        date cached;
    }

    #! Waits for completion and returns the value or raises the recorded error for every reader
    auto getValue() {
        m.lock();
        on_exit m.unlock();

        while (!ready) {
            ++waiting;
            on_exit --waiting;
            c.wait(m);
        }

        if (ex) {
            throw ex.err, ex.desc, ex.arg;
        }
        return val;
    }

    setValue(auto val) {
        m.lock();
        on_exit m.unlock();

        self.val = val;
        cached = now_us();
        ready = True;
        if (waiting) {
            c.broadcast();
        }
    }

    cancel(hash<ExceptionInfo> ex) {
        m.lock();
        on_exit m.unlock();

        self.ex = ex;
        cached = now_us();
        ready = True;
        if (waiting) {
            c.broadcast();
        }
    }

    #! Returns True for a failed lookup or a successful result older than the cutoff; pending work does not expire
    bool isExpired(date cutoff) {
        m.lock();
        on_exit m.unlock();

        # Failed lookups are never reusable; existing readers still receive the stored exception.
        return ex ? True : (cached ? (cached < cutoff) : False);
    }
}

#! Data cache class
public class TypeScriptDataCache {
    public {
        const MaxAge = 10m;
    }

    private {
        Mutex global();
        hash<string, CacheEntry> cache;
    }

    #! Returns a shared pending or successful cache entry, replacing failed or expired entries
    /** @param key cache key identifying the lookup and its connection/options
        @param new_entry set to True if the caller must perform the lookup, otherwise False
        @return the entry whose value all callers for this lookup share

        @par Example
        @code{.py}
bool created;
CacheEntry entry = cache.get("workspace-channel-choices", \created);
if (created) {
    on_error entry.cancel($1);
    entry.setValue(fetchChannelChoices());
}
return entry.getValue();
        @endcode
    */
    CacheEntry get(string key, reference<bool> new_entry) {
        global.lock();
        on_exit global.unlock();

        *CacheEntry entry = getIntern(key);
        new_entry = !entry;
        if (entry) {
            return entry;
        }
        return cache{key} = new CacheEntry();
    }

    private *CacheEntry getIntern(string key) {
        # expire all outdated entries
        {
            date cutoff = now_us() - MaxAge;
            map remove cache{$1.key}, cache.pairIterator(), $1.value.isExpired(cutoff);
        }

        *CacheEntry entry = cache{key};
        if (!entry) {
            return;
        }
        return entry;
    }
}
}
