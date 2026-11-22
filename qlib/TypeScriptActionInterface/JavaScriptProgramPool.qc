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
        });
    }

    #! Creates the object and the JavaScript program
    constructor(string source, string path, code init) {
        self.source = source;
        self.path = path;
        self.init = init;
        createProgram(True);
    }

    #! Returns the absolute path of the pool's script
    /** The program is created in the script's directory (TypeScriptActionInterfacePriv::createPool()), which is
        \c cwd
    */
    string getScriptPath() {
        return absolute_path(path) ? path : cwd + DirSep + basename(path);
    }

    #! Returns the JavaScript program
    JavaScriptProgram getProgram() {
        return pgm;
    }

    #! Returns the unique hash of the program
    string uniqueHash() {
        return pgm.uniqueHash();
    }

    #! Gives the module's registration interface to the given catalogue object
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the interface
        changes the process-wide registries of the module
    */
    registerAppActions(object obj) {
        # the interface registers in the process-wide registries of the module (qoretechnologies/qore#6749)
        SandboxManager::checkProcessWideRegistration("give the registration interface of the TypeScript action "
            "interface to an object");
        obj.registerAppActions(TsaiProcessState::Api);
    }

    info(string fmt, ...) {
        if (*LoggerInterface logger = TypeScriptActionInterfacePriv::getLogger()) {
            logger.logArgs(Qore::Logger::LoggerLevel::LevelInfo, fmt, argv);
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
        SandboxManager::checkProcessWideRegistration("map a program to a TypeScript action program pool");
        pmap{pgm.uniqueHash()} = self;
    }

    #! Removes the mapping of a program made with mapProgram(), by the program's unique hash
    /** @throw SANDBOX-REGISTRATION-ERROR the calling code is sandboxed or acts for sandboxed code: the map is
        process-wide
    */
    static unmapProgram(string id) [dom=PROCESS_CONTROL] {
        # process-wide (qoretechnologies/qore#6749)
        SandboxManager::checkProcessWideRegistration("unmap a program from a TypeScript action program pool");
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
    /** @throw TS-TENANT-ERROR the calling code is sandboxed: the source is that of a catalogue that trusted code
        loaded
    */
    string getSource() {
        TenantActionRunner::refuseSandboxed("the source of a program pool");
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
    /** @throw TS-TENANT-ERROR the calling code is sandboxed: the code is that of trusted code
    */
    code getInit() {
        TenantActionRunner::refuseSandboxed("the initialization code of a program pool");
        return init;
    }

    #! Creates a new JavaScriptProgram for use in an in-process pool
    /** The caller must set _pool_clone_mode before calling this method to capture closures
        without modifying global state.

        @return a new JavaScriptProgram with the same source and init code

        @throw TS-TENANT-ERROR the calling code is sandboxed: the program runs the catalogue that trusted code loaded
    */
    JavaScriptProgram createProgramForPool() {
        TenantActionRunner::refuseSandboxed("a program pool");
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

    private:internal createProgram(*bool first) {
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
