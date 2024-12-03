# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptDataCache.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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

    auto getValue() {
        if (!ready) {
            m.lock();
            on_exit m.unlock();

            while (!ready) {
                ++waiting;
                c.wait(m);
                --waiting;
            }

            if (ex) {
                throw ex.err, ex.desc, ex.arg;
            }
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

    bool isExpired(date cutoff) {
        return cached ? (cached < cutoff) : False;
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

    CacheEntry get(string key, reference<bool> new_entry) {
        global.lock();
        on_exit global.unlock();

        *CacheEntry entry = getIntern(key);
        if (entry) {
            return entry;
        }
        new_entry = True;
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
