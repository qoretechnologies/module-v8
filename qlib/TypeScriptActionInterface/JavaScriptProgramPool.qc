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

    # the state of a pool is not readable by subclasses: the pools hold the catalogues that trusted code loaded
    # (qoretechnologies/qore#6749)
    private:internal {
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
        static hash<string, JavaScriptProgramPool> pmap = {};

        # indicates the first program unique hash for each holder
        static hash<string, bool> firstmap = {};

        #! Mutex to serialize chdir() calls during program creation (chdir is process-global)
        static Mutex chdir_mutex();

        #! Gives the unchecked implementations of the checked methods to the module's own code
        static bool internal_set = TsaiProcessState::setInternal({
            "poolMapProgram": \JavaScriptProgramPool::mapProgramInternal(),
            "poolUnmapProgram": \JavaScriptProgramPool::unmapProgramInternal(),
            "poolGetProgram": \JavaScriptProgramPool::getProgramInternal(),
            "poolScriptPath": \JavaScriptProgramPool::getScriptPathInternal(),
            "poolGetPath": \JavaScriptProgramPool::getPathInternal(),
            "poolUniqueHash": \JavaScriptProgramPool::uniqueHashInternal(),
            "poolGetPoolInfo": \JavaScriptProgramPool::getPoolInfoInternal(),
        });
    }

    #! Creates the object and the JavaScript program
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: a pool registers
        its programs in the process-wide program map
    */
    constructor(string source, string path, code init) [dom=PROCESS_CONTROL] {
        # the program map is process-wide (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("create a TypeScript action program pool");
        self.source = source;
        self.path = path;
        self.init = init;
        createProgram(True);
    }

    #! Returns the absolute path of the pool's script
    /** The program is created in the script's directory (TypeScriptActionInterfacePriv::createPool()), which is
        \c cwd

        @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the path is the
        host's
    */
    string getScriptPath() [dom=PROCESS_CONTROL] {
        # a host path (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("get the script path of a TypeScript action program pool");
        return getScriptPathIntern();
    }

    #! Returns the JavaScript program
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the program is the
        catalogue's process-wide program
    */
    JavaScriptProgram getProgram() [dom=PROCESS_CONTROL] {
        # the program of a catalogue is process-wide (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("get the program of a TypeScript action program pool");
        return pgm;
    }

    #! Returns the unique hash of the program
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the hash names the
        program in the process-wide program map
    */
    string uniqueHash() [dom=PROCESS_CONTROL] {
        # the key of the process-wide program map (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("get the unique hash of a TypeScript action program pool");
        return pgm.uniqueHash();
    }

    #! Returns the program of a pool, for the module's own code
    private:internal static JavaScriptProgram getProgramInternal(JavaScriptProgramPool pool) {
        return pool.pgm;
    }

    #! Returns the absolute path of the script of a pool, for the module's own code
    private:internal static string getScriptPathInternal(JavaScriptProgramPool pool) {
        return pool.getScriptPathIntern();
    }

    #! Returns the path of the script of a pool, for the module's own code
    private:internal static string getPathInternal(JavaScriptProgramPool pool) {
        return pool.path;
    }

    #! Returns the unique hash of the program of a pool, for the module's own code
    private:internal static string uniqueHashInternal(JavaScriptProgramPool pool) {
        return pool.pgm.uniqueHash();
    }

    #! Returns the pool of a program and whether it is the pool's first program, for the module's own code
    /** @return a hash with the keys \c pool and \c first

        @throw ACTION-ERROR the program is not mapped to a pool
    */
    private:internal static hash<auto> getPoolInfoInternal(JavaScriptProgram pgm) {
        string h0 = pgm.uniqueHash();
        *JavaScriptProgramPool pool = pmap{h0};
        if (!pool) {
            throw "ACTION-ERROR", sprintf("Cannot map unknown program %y to a pool", h0);
        }
        return {"pool": pool, "first": firstmap{h0} ?? False};
    }

    #! Returns the absolute path of the pool's script
    private:internal string getScriptPathIntern() {
        return absolute_path(path) ? path : cwd + DirSep + basename(path);
    }

    #! Gives the module's registration interface to the given catalogue object
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the interface
        changes the process-wide registries of the module
    */
    registerAppActions(object obj) [dom=PROCESS_CONTROL] {
        # the interface registers in the process-wide registries of the module (qoretechnologies/qore#6749)
        TsaiProcessState::checkHostScope("give the registration interface of the TypeScript action interface to "
            "an object");
        obj.registerAppActions(TsaiProcessState::Api);
    }

    #! Logs a message at the info level with the module's logger
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the logger is the
        host's
    */
    info(string fmt, ...) [dom=PROCESS_CONTROL] {
        # the host's logger (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("log with the logger of a TypeScript action program pool");
        infoIntern(fmt, argv);
    }

    #! Logs a message at the info level with the module's logger
    private:internal infoIntern(string fmt, *list<auto> args) {
        if (*LoggerInterface logger = TypeScriptActionInterfacePriv::getLogger()) {
            logger.logArgs(Qore::Logger::LoggerLevel::LevelInfo, fmt, args);
        }
    }

    #! Maps a program that runs the pool's code but that another component created to the pool
    /** For the restricted programs of tenants (TenantActionRunner, qoretechnologies/qore#6845): the apps that the
        program registers are mapped to the pool, as those of the pool's own programs are
    */
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the map is
        process-wide
    */
    mapProgram(JavaScriptProgram pgm) [dom=PROCESS_CONTROL] {
        # process-wide (qoretechnologies/qore#6749)
        TsaiProcessState::checkHostScope("map a program to a TypeScript action program pool");
        pmap{pgm.uniqueHash()} = self;
    }

    #! Removes the mapping of a program made with mapProgram(), by the program's unique hash
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the map is
        process-wide
    */
    static unmapProgram(string id) [dom=PROCESS_CONTROL] {
        # process-wide (qoretechnologies/qore#6749)
        TsaiProcessState::checkHostScope("unmap a program from a TypeScript action program pool");
        remove pmap{id};
    }

    #! Maps a program to a pool, for the module's own code
    private:internal static mapProgramInternal(JavaScriptProgramPool pool, JavaScriptProgram pgm) {
        pmap{pgm.uniqueHash()} = pool;
    }

    #! Unmaps a program, for the module's own code
    private:internal static unmapProgramInternal(string id) {
        remove pmap{id};
    }

    #! Returns True if the program is the first program of its pool
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the program map is
        process-wide
    */
    static bool isFirst(JavaScriptProgram pgm) [dom=PROCESS_CONTROL] {
        # the program map is process-wide (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("look up a program in the TypeScript action program map");
        return firstmap{pgm.uniqueHash()} ?? False;
    }

    #! Returns the pool of a program
    /** @param pgm the program
        @param first set to True if the program is the first program of the pool

        @throw ACTION-ERROR the program is not mapped to a pool
        @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the program map is
        process-wide and holds the pools of the host's catalogues
    */
    static JavaScriptProgramPool getPool(JavaScriptProgram pgm, reference<bool> first) [dom=PROCESS_CONTROL] {
        # the program map is process-wide (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("look up a program in the TypeScript action program map");
        hash<auto> h = JavaScriptProgramPool::getPoolInfoInternal(pgm);
        first = h.first;
        return h.pool;
    }

    #! Returns the JavaScript source code
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the source is that
        of a catalogue that trusted code loaded
    */
    string getSource() [dom=PROCESS_CONTROL] {
        # the host's catalogue (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("get the source of a TypeScript action program pool");
        return source;
    }

    #! Returns the JavaScript source path
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the path is the
        host's
    */
    string getPath() [dom=PROCESS_CONTROL] {
        # a host path (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("get the path of a TypeScript action program pool");
        return path;
    }

    #! Returns the current working directory
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the directory is
        the host's
    */
    string getCwd() [dom=PROCESS_CONTROL] {
        # a host path (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("get the directory of a TypeScript action program pool");
        return cwd;
    }

    #! Returns the initialization code
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the code is that
        of trusted code
    */
    code getInit() [dom=PROCESS_CONTROL] {
        # trusted code (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("get the initialization code of a TypeScript action program pool");
        return init;
    }

    #! Creates a new JavaScriptProgram for use in an in-process pool
    /** The caller must set _pool_clone_mode before calling this method to capture closures
        without modifying global state.

        @return a new JavaScriptProgram with the same source and init code

        @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the program runs
        the catalogue that trusted code loaded and is registered in the process-wide program map
    */
    JavaScriptProgram createProgramForPool() [dom=PROCESS_CONTROL] {
        # the host's catalogue (qoretechnologies/qore#7185)
        TsaiProcessState::checkHostScope("create a program of a TypeScript action program pool");
        # serialize chdir() calls — chdir is process-global and concurrent calls race
        chdir_mutex.lock();
        on_exit chdir_mutex.unlock();

        string olddir = getcwd();
        chdir(cwd);
        on_exit chdir(olddir);

        date start = now_us();
        on_exit infoIntern("perf: JavaScriptProgramPool new pool program for %y: %y", (path, now_us() - start));

        JavaScriptProgram new_pgm = new JavaScriptProgram(source, path);
        string h0 = new_pgm.uniqueHash();
        pmap{h0} = self;
        on_error remove pmap{h0};
        init(new_pgm);
        return new_pgm;
    }

    private:internal createProgram(*bool first) {
        # serialize chdir() calls — chdir is process-global and concurrent calls race
        chdir_mutex.lock();
        on_exit chdir_mutex.unlock();

        string olddir = getcwd();
        chdir(cwd);
        on_exit chdir(olddir);

        date start = now_us();
        on_exit infoIntern("perf: JavaScriptProgramPool new program for %y: %y", (path, now_us() - start));

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
