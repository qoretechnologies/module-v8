# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  JavaScriptProgramPool.qc Copyright 2024 Qore Technologies, s.r.o.

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
#! JavaScript program pool class
public class JavaScriptProgramPool {
    public {}

    private {
        # JavaScript source
        string source;
        # JavaScript source path
        string path;

        # atomic lock
        Mutex m();
        # program cache
        hash<string, JavaScriptProgram> cache;
        # free map
        hash<string, bool> fmap;
        # current working directory of program, so require() calls can work when cloning the code
        string cwd = getcwd();
        # initialization code
        code init;

        # maps program unique hashes to pools
        static hash<string, JavaScriptProgramPool> pmap;

        # indicates the first program unique hash for each pool
        static hash<string, bool> firstmap;

        int max;
        int waiting;
        Condition cond();
    }

    #! Creates the object and the initial template program
    constructor(string source, string path, code init, int max = 1) {
        self.source = source;
        self.path = path;
        self.init = init;
        self.max = max;
        getNewIntern(True);
    }

    JavaScriptProgram get() {
        m.lock();
        on_exit m.unlock();

        while (True) {
            if (fmap) {
                string k = fmap.firstKey();
                remove fmap{k};
                return cache{k};
            }
            if (cache.size() == max) {
                do {
                    ++waiting;
                    cond.wait(m);
                    --waiting;
                } while (!fmap);
                continue;
            }
            return getNewIntern();
        }
    }

    release(JavaScriptProgram pgm) {
        string k = pgm.uniqueHash();
        if (!cache{k}) {
            throw "INVALID-PROGRAM", sprintf("The JavaScriptProgram passed (%y) was not provided from the pool", k);
        }

        m.lock();
        on_exit m.unlock();
        if (fmap{k}) {
            throw "INVALID-PROGRAM", sprintf("The JavaScriptProgram passed (%y) was not allocated from the pool", k);
        }
        fmap{k} = True;
        if (waiting) {
            cond.signal();
        }
    }

    int size() {
        return cache.size();
    }

    registerAppActions(object obj) {
        obj.registerAppActions(TypeScriptActionInterface::Api);
    }

    info(string fmt, ...) {
        if (*LoggerInterface logger = DataProvider::getGlobalLogger()) {
            logger.logArgs(Qore::Logger::LoggerLevel::LevelInfo, fmt, argv);
        }
    }

    static bool isFirst(JavaScriptProgram pgm) {
        return firstmap{pgm.uniqueHash()} ?? False;
    }

    static JavaScriptProgramPool getPool(JavaScriptProgram pgm, reference<bool> first) {
        string h0 = pgm.uniqueHash();
        *JavaScriptProgramPool pool = pmap{h0};
        if (!pool) {
            throw "ACTION-ERROR", sprintf("Cannot map unknown program %y to a pool", pgm.uniqueHash());
        }
        first = firstmap{h0} ?? False;
        return pool;
    }

    private JavaScriptProgram getNewIntern(*bool first) {
        string olddir = getcwd();
        chdir(cwd);
        on_exit chdir(olddir);

        date start = now_us();
        on_exit info("perf: JavaScriptProgramPool new pool for %y: %y", path, now_us() - start);

        JavaScriptProgram pgm(source, path);
        string h0 = pgm.uniqueHash();
        pmap{h0} = self;
        cache{h0} = pgm;
        if (first) {
            firstmap{h0} = True;
            fmap{h0} = True;
        }
        on_error {
            remove pmap{h0};
            remove cache{h0};
            if (first) {
                remove firstmap{h0};
                remove fmap{h0};
            }
        }
        init(pgm);
        return pgm;
    }
}
}