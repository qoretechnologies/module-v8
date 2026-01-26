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

    private createProgram(*bool first) {
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
