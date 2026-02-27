# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  JavaScriptProgramPool.qc Copyright 2024 - 2026 Qore Technologies, s.r.o.

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
#! JavaScript program holder class
/** JavaScript is single-threaded, so there is no need for a pool mechanism.
    This class holds a single JavaScriptProgram instance and provides static
    methods to look up the holder for a given program.
*/
public class JavaScriptProgramPool {
    public {}

    private {
        # JavaScript source
        string source;
        # JavaScript source path
        string path;

        # The single JavaScript program instance
        JavaScriptProgram pgm;

        # current working directory of program, so require() calls can work when cloning the code
        string cwd = getcwd();
        # initialization code
        code init;

        # maps program unique hashes to holders
        static hash<string, JavaScriptProgramPool> pmap;

        # indicates the first program unique hash for each holder
        static hash<string, bool> firstmap;

        #! Mutex to serialize chdir() calls during program creation (chdir is process-global)
        static Mutex chdir_mutex();
    }

    #! Creates the object and the JavaScript program
    constructor(string source, string path, code init) {
        self.source = source;
        self.path = path;
        self.init = init;
        createProgram(True);
    }

    #! Returns the JavaScript program
    JavaScriptProgram getProgram() {
        return pgm;
    }

    #! Returns the unique hash of the program
    string uniqueHash() {
        return pgm.uniqueHash();
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

    #! Returns the JavaScript source code
    string getSource() {
        return source;
    }

    #! Returns the JavaScript source path
    string getPath() {
        return path;
    }

    #! Returns the current working directory
    string getCwd() {
        return cwd;
    }

    #! Returns the initialization code
    code getInit() {
        return init;
    }

    #! Creates a new JavaScriptProgram for use in an in-process pool
    /** The caller must set _pool_clone_mode before calling this method to capture closures
        without modifying global state.

        @return a new JavaScriptProgram with the same source and init code
    */
    JavaScriptProgram createProgramForPool() {
        # serialize chdir() calls — chdir is process-global and concurrent calls race
        chdir_mutex.lock();
        on_exit chdir_mutex.unlock();

        string olddir = getcwd();
        chdir(cwd);
        on_exit chdir(olddir);

        date start = now_us();
        on_exit info("perf: JavaScriptProgramPool new pool program for %y: %y", path, now_us() - start);

        JavaScriptProgram new_pgm = new JavaScriptProgram(source, path);
        string h0 = new_pgm.uniqueHash();
        pmap{h0} = self;
        on_error remove pmap{h0};
        init(new_pgm);
        return new_pgm;
    }

    private createProgram(*bool first) {
        # serialize chdir() calls — chdir is process-global and concurrent calls race
        chdir_mutex.lock();
        on_exit chdir_mutex.unlock();

        string olddir = getcwd();
        chdir(cwd);
        on_exit chdir(olddir);

        date start = now_us();
        on_exit info("perf: JavaScriptProgramPool new program for %y: %y", path, now_us() - start);

        pgm = new JavaScriptProgram(source, path);
        string h0 = pgm.uniqueHash();
        pmap{h0} = self;
        if (first) {
            firstmap{h0} = True;
        }
        on_error {
            remove pmap{h0};
            if (first) {
                remove firstmap{h0};
            }
        }
        init(pgm);
    }
}
}
