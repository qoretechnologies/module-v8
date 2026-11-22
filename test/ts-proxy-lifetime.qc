# -*- mode: qore; indent-tabs-mode: nil -*-
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT

# The cases of the ts-proxy-lifetime-<n>.qtest tests: each runs one part of them, so that each takes a short time, and
# together they run every case (see addPartCase())

%requires QUnit
%requires Util
%requires FsUtil
%requires Logger
%try-module process
%define MISSING_EXTERNAL_MODULE
%endtry
%try-module uuid
%define MISSING_EXTERNAL_MODULE
%endtry
%try-module json
%define MISSING_EXTERNAL_MODULE
%endtry
%ifndef MISSING_EXTERNAL_MODULE
%requires TypeScriptActionInterface
%endif
%requires v8

#! Tests the lifetime of TypeScript proxies, of their \c ts-proxy child processes and of the master listener
/** The first proxy of a process starts the master listener thread, and the last one stops it when it is destroyed;
    while the thread runs, the process does not exit when its script ends.  The proxy map of the class held a strong
    reference to each proxy, so a proxy was only destroyed by JavaScriptProgramProxy::shutdown() or \c delete: a
    script that let its proxies go out of scope never exited.  A proxy whose \c ts-proxy child exited before it
    started left the master listener running too, as the destructor of an object whose constructor fails is not
    run, and a \c ts-proxy child whose log directory (\c TS_PROXY_LOGDIR) did not exist exited before it started.

    The cases that check that a process exits run a script for each case (see runScript()); the others run in this
    process, which only exits at the end if no master listener is left running.  Each ts-proxy-lifetime-<n>.qtest
    test runs the cases of one part (see addPartCase()).
*/
class TsProxyLifetimeTest inherits Test {
    public {
        #! only turns a script that never exits into a failure; no case waits for a time to pass
        const HangGuard = 10m;

        #! the script; its argument is the name of the case, its startup timeout is HangGuard
        const Script = "%modern
%requires process
%requires Logger
%requires TypeScriptActionInterface
%requires v8

string mode = ARGV[0];
Logger logger(\"null\", LoggerLevel::getLevelFatal());
logger.addAppender(new LoggerAppenderNull());
DataProvider::setGlobalLogger(logger);
JavaScriptProgramProxy::init(new Mutex());
JavaScriptProgramProxy::setStartupTimeout(10m);

# returns the error that the ts-proxy process of the proxy answers a command with: it knows no such app
string sub command(JavaScriptProgramProxy p) {
    try {
        p.getDynamicOptions(\"no-such-app\", \"no-such-action\", NOTHING, NOTHING, NOTHING);
        return \"no error\";
    } catch (hash<ExceptionInfo> ex) {
        return ex.err;
    }
}

switch (mode) {
    # a proxy that is created or fails to start, and that goes out of scope
    case \"start\": {
        try {
            JavaScriptProgramProxy p();
            printf(\"proxy: started\\n\");
        } catch (hash<ExceptionInfo> ex) {
            printf(\"proxy: %s\\n\", ex.err);
        }
        break;
    }

    # a proxy that is used and goes out of scope
    case \"scope\": {
        JavaScriptProgramProxy p();
        printf(\"proxy: %s\\n\", command(p));
        break;
    }

    # several proxies, of which the first ends before the others and the last one ends with the script
    case \"several\": {
        JavaScriptProgramProxy p2;
        int pid1;
        string answer;
        {
            JavaScriptProgramProxy p1();
            pid1 = p1.getInfo().\"proxy-pid\";
            answer = command(p1);
            p2 = new JavaScriptProgramProxy();
        }
        # the destructor of the first one has stopped its child process
        printf(\"first: %s\\n\", Process::checkPid(pid1) ? \"running\" : \"ended\");
        printf(\"second: %s\\n\", command(p2) == answer ? \"OK\" : \"failed\");
        {
            JavaScriptProgramProxy p3();
            printf(\"third: %s\\n\", command(p3) == answer ? \"OK\" : \"failed\");
        }
        printf(\"second again: %s\\n\", command(p2) == answer ? \"OK\" : \"failed\");
        break;
    }

    # a proxy destroyed by shutdown(), whose variable goes out of scope afterwards
    case \"shutdown\": {
        JavaScriptProgramProxy p();
        JavaScriptProgramProxy::shutdown();
        try {
            p.getInfo();
            printf(\"after shutdown: no error\\n\");
        } catch (hash<ExceptionInfo> ex) {
            printf(\"after shutdown: %s\\n\", ex.err);
        }
        break;
    }
}
# the script ends without calling shutdown(): the process exits when no master listener remains
";
    }

    private {
        #! the interpreter running this test, used to launch the scripts
        string qore_exe;
        #! the temporary directory of the test, and the log directory of the ts-proxy children of this process
        TmpDir tmp;
        #! the script file
        string script;
        #! the environment of the scripts
        hash<auto> env;
        #! why the cases are skipped
        *string skip_reason;
        #! the part of the cases that this test runs (see addPartCase())
        int part;
    }

    constructor(string name, int part) : Test(name, "1.0") {
        self.part = part;
        qore_exe = ENV.QORE_EXECUTABLE ?? ENV.QORE_BINARY ?? QORE_ARGV[0];
        tmp = new TmpDir("ts-proxy-lifetime-");
%ifndef MISSING_EXTERNAL_MODULE
        # the errors that the ts-proxy children answer the commands of the cases with are not logged
        Logger logger("null", LoggerLevel::getLevelFatal());
        logger.addAppender(new LoggerAppenderNull());
        DataProvider::setGlobalLogger(logger);
%endif
        script = tmp.path + DirSep + "lifetime.q";
        # the ts-proxy children of this test log to a directory of its own, whatever the environment has
        mkdir(tmp.path + DirSep + "log");
        setenv("TS_PROXY_LOGDIR", tmp.path + DirSep + "log");
        checkEnvironment();

        addPartCase(1, "a proxy that goes out of scope ends, and the process exits", \scopeExit());
        addPartCase(1, "the last of several proxies stops the master listener", \severalProxies());
        addPartCase(2, "a proxy destroyed by shutdown() goes out of scope, and the process exits",
            \shutdownThenScope());
        addPartCase(2, "a proxy whose child exits before it starts fails, and the process exits",
            \childStartFailure());
        addPartCase(2, "a child creates its log directory", \logDirCreated());
        addPartCase(3, "a proxy destroyed while the master listener serves others", \destroyedWhileListening());
        addPartCase(3, "shutdown() while a proxy is being destroyed in another thread", \shutdownDuringDestruction());
        addPartCase(4, "the master listener thread releases the last reference of the only proxy",
            \listenerReleasesOnlyProxy());
        addPartCase(4, "the master listener thread releases the last reference of a proxy while others remain",
            \listenerReleasesWithOthers());

        {
            File f();
            f.open2(script, O_CREAT | O_TRUNC | O_WRONLY);
            f.write(Script);
        }
        set_return_value(main());
    }

    #! adds a case if it is in the part that this test runs: each case is in one part, and each part is a test
    private addPartCase(int case_part, string name, code call, *softlist<auto> args) {
        if (case_part == part) {
            addTestCase(name, call, args);
        }
    }

    scopeExit() {
        runScript("scope", NOTHING, "proxy: APP-ERROR\n");
    }

    severalProxies() {
        runScript("several", NOTHING, "first: ended\nsecond: OK\nthird: OK\nsecond again: OK\n");
    }

    shutdownThenScope() {
        runScript("shutdown", NOTHING, "after shutdown: OBJECT-ALREADY-DELETED\n");
    }

    childStartFailure() {
        # the log directory is under a regular file and cannot be created: the child exits before it starts
        string file = tmp.path + DirSep + "file";
        {
            File f();
            f.open2(file, O_CREAT | O_TRUNC | O_WRONLY);
        }
        runScript("start", file + DirSep + "log", "proxy: CHILD-ERROR\n");
    }

    logDirCreated() {
        string logdir = tmp.path + DirSep + "new" + DirSep + "log";
        runScript("start", logdir, "proxy: started\n");
        assertTrue(is_dir(logdir));
    }

    #! a proxy is destroyed while the master listener runs for other proxies, which still work
    destroyedWhileListening() {
%ifdef MISSING_EXTERNAL_MODULE
        testSkip(skip_reason);
%else
        skipIfNotReady();
        JavaScriptProgramProxy::init(new Mutex());

        JavaScriptProgramProxy p2;
        int pid1;
        string answer;
        {
            JavaScriptProgramProxy p1();
            pid1 = p1.getInfo()."proxy-pid";
            answer = command(p1);
            p2 = new JavaScriptProgramProxy();
        }
        assertFalse(Process::checkPid(pid1), "the child of the destroyed proxy has ended");
        assertEq(answer, command(p2));
        # the master listener still starts new children
        JavaScriptProgramProxy p3();
        assertEq(answer, command(p3));
        # the proxies go out of scope: the last one stops the master listener
%endif
    }

    #! shutdown() runs while the last reference of a proxy has been released and its destructor runs in another
    #! thread; a proxy started meanwhile still starts, and the master listener can be started again afterwards
    shutdownDuringDestruction() {
%ifdef MISSING_EXTERNAL_MODULE
        testSkip(skip_reason);
%else
        skipIfNotReady();
        JavaScriptProgramProxy::init(new Mutex());

        Counter entered(1);
        Counter release(1);
        Queue q();
        int pid;
        {
            LatchedProxy p(entered, release);
            pid = p.getInfo()."proxy-pid";
            q.push(p);
        }
        Counter done(1);
        background sub () {
            on_exit done.dec();
            # the last reference is released in this thread, which then waits in the destructor of LatchedProxy,
            # before the destructor of JavaScriptProgramProxy runs
            q.get();
        }();
        bool released;
        on_exit if (!released) {
            release.dec();
            done.waitForZero();
        }
        if (entered.waitForZero(HangGuard)) {
            fail("the proxy was not destroyed when its last reference was released");
        }

        # a new proxy starts while the other one is being destroyed: the master listener serves it
        JavaScriptProgramProxy p2();
        string answer = command(p2);
        assertNeq("no error", answer);
        # destroys p2, and finds the other proxy being destroyed
        JavaScriptProgramProxy::shutdown();
        assertThrows("OBJECT-ALREADY-DELETED", sub () { p2.getInfo(); });

        # the destructor completes
        released = True;
        release.dec();
        done.waitForZero();
        assertFalse(Process::checkPid(pid), "the child of the proxy destroyed in the other thread has ended");

        # a new master listener is started for a new proxy
        JavaScriptProgramProxy p3();
        assertEq(answer, command(p3));
%endif
    }

    listenerReleasesOnlyProxy() {
        listenerRelease(False);
    }

    listenerReleasesWithOthers() {
        listenerRelease(True);
    }

    #! the master listener thread releases the last reference of a proxy, so the proxy's destructor runs in that thread
    /** The thread cannot wait for itself to stop or for the global lock, so the proxy is removed in another thread,
        which stops the master listener if no other proxy remains.  The thread holds the reference while it starts the
        event listener of a proxy with an event source: ListenerReleaseProxy sends the event connection of its child
        itself, and waits in startEventListener() until every other reference has been released.

        @param others if another proxy remains, which the master listener keeps serving
    */
    private listenerRelease(bool others) {
%ifdef MISSING_EXTERNAL_MODULE
        testSkip(skip_reason);
%else
        skipIfNotReady();
        if (!ListenerReleaseProxy::debugHooks()) {
            testSkip("the test hook of the proxy removal needs debugging enabled (--enable-debug)");
        }
        JavaScriptProgramProxy::init(new Mutex());

        *JavaScriptProgramProxy other;
        string answer;
        if (others) {
            other = new JavaScriptProgramProxy();
            answer = command(other);
        }

        Counter in_listener(1);
        Counter release(1);
        Queue destroyed();
        Queue removed();
        ListenerReleaseProxy::setRemoveHook(sub (string uh) {
            removed.push({"uh": uh, "tid": gettid()});
        });
        on_exit ListenerReleaseProxy::setRemoveHook();
        bool released;
        # the master listener thread is released if the case fails before it releases it
        on_exit if (!released) {
            release.dec();
        }

        int pid;
        string uh;
        int listener_tid;
        {
            ListenerReleaseProxy p(in_listener, release, destroyed);
            pid = p.getInfo()."proxy-pid";
            uh = p.uniqueHash();
            listener_tid = ListenerReleaseProxy::getListenerTid();
            if (!others) {
                answer = command(p);
            }
            p.connectEvent();
            if (in_listener.waitForZero(HangGuard)) {
                fail("the master listener did not start the event listener of the proxy");
            }
            # the master listener thread holds a reference to the proxy; the other ones are released
            p.unpin();
        }
        # the master listener thread releases the last reference
        released = True;
        release.dec();

        hash<auto> d = destroyed.get(HangGuard);
        assertEq(listener_tid, d.tid, "the master listener thread destroyed the proxy");
        hash<auto> r = removed.get(HangGuard);
        assertEq(uh, r.uh);
        assertNeq(listener_tid, r.tid, "the proxy was removed in another thread");
        assertFalse(Process::checkPid(pid), "the child of the proxy has ended");
        if (others) {
            # the master listener still runs, serves the other proxy and starts new children
            assertEq(listener_tid, ListenerReleaseProxy::getListenerTid());
            assertEq(answer, command(other));
            JavaScriptProgramProxy p3();
            assertEq(answer, command(p3));
        } else {
            assertTrue(ListenerReleaseProxy::waitListenerStopped(HangGuard), "the master listener stopped");
            # a new master listener is started for a new proxy
            JavaScriptProgramProxy p3();
            assertEq(answer, command(p3));
        }
%endif
    }

    private skipIfNotReady() {
        if (skip_reason) {
            testSkip(skip_reason);
        }
    }

    #! returns the error that the ts-proxy process of the proxy answers a command with: it knows no such app
    private static string command(JavaScriptProgramProxy p) {
        try {
            p.getDynamicOptions("no-such-app", "no-such-action", NOTHING, NOTHING, NOTHING);
            return "no error";
        } catch (hash<ExceptionInfo> ex) {
            return ex.err;
        }
    }

    private checkEnvironment() {
%ifdef MISSING_EXTERNAL_MODULE
        skip_reason = "the process, uuid or json module is missing";
%else
        string local_bin = sprintf("%s/../bin", get_script_dir());
        string path = getenv("PATH") ?? "";
        if (hstat(local_bin)) {
            path = local_bin + ":" + path;
            # the proxies of this process start the ts-proxy program of this tree
            setenv("PATH", path);
        }
        if (!(select path.split(":"), $1.val() && is_executable($1 + DirSep + "ts-proxy"))) {
            skip_reason = "the ts-proxy program cannot be found";
            return;
        }
        # the scripts load the TypeScript modules of this tree
        string module_dir = ENV.QORE_V8_TEST_QMOD_DIR ?? (get_script_dir() + "/../qlib");
        env = JavaScriptProgram::getEnvironment() + {
            "PATH": path,
            "QORE_MODULE_DIR": module_dir + ":" + (getenv("QORE_MODULE_DIR") ?? ""),
        };
%endif
    }

    #! runs the script for the given case and checks its result lines and that it exited
    /** @param mode the case
        @param logdir the log directory of the ts-proxy children of the script; a directory of the test if not given
        @param expected the result lines of the script
    */
    private runScript(string mode, *string logdir, string expected) {
%ifdef MISSING_EXTERNAL_MODULE
        testSkip(skip_reason);
%else
        if (skip_reason) {
            testSkip(skip_reason);
        }
        date start = now_us();
        Process p(qore_exe, ("-b", script, mode), {
            "env": env + {"TS_PROXY_LOGDIR": logdir ?? (tmp.path + DirSep + "log")},
        });
        if (!p.wait(HangGuard)) {
            p.terminate();
            p.wait();
            fail(sprintf("%s: the script did not exit", mode));
        }
        if (m_options.verbose) {
            printf("  %s: the script ended after %y\n", mode, now_us() - start);
        }
        string all = "";
        while (*string str = p.readStdout(4096)) {
            all += str;
        }
        # the result lines of the script; the TypeScript action interface can log other lines to stdout
        string out = (map $1 + "\n", all.split("\n"), $1 =~ /^[a-z ]+: /).join("");
        string err = "";
        while (*string str = p.readStderr(4096)) {
            err += str;
        }
        assertEq(expected, out, sprintf("%s; stdout: %s; stderr: %s", mode, all, err));
        assertEq(0, p.exitCode(), mode);
%endif
    }
}

%ifndef MISSING_EXTERNAL_MODULE
#! a proxy whose destructor waits until it is released, before the destructor of JavaScriptProgramProxy runs
class LatchedProxy inherits JavaScriptProgramProxy {
    private {
        Counter entered;
        Counter release;
    }

    constructor(Counter entered, Counter release) {
        self.entered = entered;
        self.release = release;
    }

    destructor() {
        entered.dec();
        release.waitForZero();
    }
}

#! a proxy for which the master listener thread holds the last reference
/** Like the proxy of an event source, the object is in the event proxy map of JavaScriptProgramProxy, and it sends
    the event connection of its child itself; the master listener thread, which takes a strong reference to the object
    from the map for the connection, waits in startEventListener() until it is released
*/
class ListenerReleaseProxy inherits JavaScriptProgramProxy {
    private {
        Counter in_listener;
        Counter release;
        Queue destroyed;
    }

    constructor(Counter in_listener, Counter release, Queue destroyed) {
        self.in_listener = in_listener;
        self.release = release;
        self.destroyed = destroyed;
    }

    #! tells the test the thread that destroys the object; runs before the destructor of JavaScriptProgramProxy
    destructor() {
        destroyed.push({"tid": gettid()});
    }

    #! called by the master listener thread with its reference to the object; no event listener is started
    startEventListener(Socket event_socket, hash<auto> v) {
        in_listener.dec();
        release.waitForZero();
    }

    #! adds the object to the event proxy map, as for an event source, and sends the event connection of its child
    connectEvent() {
        Socket sock = testConnectEventProxy();
        sendString(sock, makeSend(TypeScriptProxy::CC_EVENT_START, {"pkey": self.uniqueHash(), "pid": getpid()}));
    }

    #! removes the object from the event proxy map, as when its event source is released
    unpin() {
        testDisconnectEventProxy();
    }

    #! sets the hook that the removal of a proxy calls in debug mode
    static setRemoveHook(*code hook) {
        JavaScriptProgramProxy::setTestRemoveHook(hook);
    }

    static int getListenerTid() {
        return JavaScriptProgramProxy::getTestMasterListenerTid();
    }

    #! returns True if the master listener thread has stopped within the given time
    static bool waitListenerStopped(timeout limit) {
        return JavaScriptProgramProxy::testWaitMasterListenerStopped(limit);
    }

    #! returns True if the debug hooks of the module are active
    static bool debugHooks() {
        bool rv;
        @debug {
            rv = True;
        }
        return rv;
    }
}
%endif
