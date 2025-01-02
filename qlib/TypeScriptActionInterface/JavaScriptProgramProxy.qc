# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptActionInterface module definition

/*  JavaScriptProgramProxy.qc Copyright 2024 Qore Technologies, s.r.o.

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
#! JavaScript program proxy class
public class JavaScriptProgramProxy inherits TypeScriptProxy {
    public {
        #! Process name
        const ProcessName = "ts-proxy";

        #! Child connect timeout
        const ChildConnectTimeout = 30s;

        #! Event source tracker: event key -> info
        hash<string, hash<EventSourceInfo>> emap;
    }

    private {
        # Child process object
        Process proc;

        #! Listener TID
        int listener_tid;

        #! Listener counter
        Counter listener_cnt();

        #! Command queue when the listener is active
        Queue cmdq();

        #! Listener stop flag
        bool listener_stop;

        #! Child restart count
        int restart_count = 0;

        #! Restarting flag
        bool restarting;

        #! Restart condition
        Condition cond_restart();

        #! Restart waiting
        int wait_restart;

        #! Local lock
        Mutex m();

        #! Is a command in progress while the event listener is active?
        bool command_in_progress;

        #! Master UNIX socket file path
        static string master_path;

        #! Master socket listener
        static Socket master();

        #! Global lock
        static Mutex global_lock;

        #! New socket map; PID -> queue
        static hash<string, Queue> qmap;

        #! Child map
        static hash<string, JavaScriptProgramProxy> cmap;
    }

    #! Creates the object
    constructor() : TypeScriptProxy(True) {
        startChildProcess();
        waitForChild();
        startListener();
        logChildOutput();

        global_lock.lock();
        on_exit global_lock.unlock();

        cmap{self.uniqueHash()} = self;
    }

    destructor() {
        {
            m.lock();
            on_exit m.unlock();

            while (restarting) {
                ++wait_restart;
                cond_restart.wait(m);
                --wait_restart;
            }

            if (proc && proc.running()) {
                stopChildProcess();
            }
        }
        stopListener();

        string uh = self.uniqueHash();
        bool lck = !global_lock.lockOwner();
        if (lck) {
            global_lock.lock();
        }
        on_exit if (lck) {
            global_lock.unlock();
        }

        remove cmap{uh};
    }

    static init(Mutex m) {
        JavaScriptProgramProxy::global_lock = m;
        master_path = sprintf("%s/ts-proxy-%s-%d.sock", tmp_location(), gethostname(), getpid());
        master.bindUNIX(master_path);
        master.listen();
        TSAI::info("Started master listener on %y", master_path);
    }

    static shutdown() {
        global_lock.lock();
        on_exit global_lock.unlock();

        int size = cmap.size();
        map delete cmap{$1}, keys cmap;
        master.shutdown();
        delete master;
        TSAI::info("Shut down %d client%s and master listener on %y", size, size == 1 ? "" : "s", master_path);
    }

    bool supportsEvent(string key) {
        return exists emap{key};
    }

    # Called with the global lock held
    setupEventSourceLocked(TypeScriptActionEventDataProvider observable, string app, string action, string key) {
        if (emap{key}) {
            throw "EVENT-ERROR", sprintf("Event key %y is already registered", key);
        }
        string ekey = observable.uniqueHash();
        if (emap{key}.omap{ekey}) {
            throw "EVENT-ERROR", sprintf("Event key %y for observable %y is already registered", key, ekey);
        }
        *hash<auto> options = ImpliedArgumentHelper::get();
        emap{key} = <EventSourceInfo>{
            "app": app,
            "action": action,
            "options": options,
            "omap": {
                ekey: observable,
            },
        };

        global_lock.unlock();
        on_exit global_lock.lock();

        on_error removeEventSource(key, ekey);
        sendCommandArgs(PC_SETUP_EVENT, (app, action, key, options));
    }

    private removeEventSource(string key, string ekey) {
        bool stop;
        {
            global_lock.lock();
            on_exit global_lock.unlock();

            remove emap{key}.omap{ekey};
            if (!emap{key}.omap) {
                remove emap{key};
                if (!emap) {
                    stop = True;
                }
            }
        }
        if (stop) {
            stopListener();
        }
    }

    #! Add an additional observable to the event source; called with the global lock held
    addEventSourceLocked(TypeScriptActionEventDataProvider observable, string key) {
        if (!emap{key}) {
            throw "EVENT-ERROR", sprintf("Event key %y is not registered", key);
        }
        string ekey = observable.uniqueHash();
        if (emap{key}.omap{ekey}) {
            throw "EVENT-ERROR", sprintf("Event key %y for observable %y is already registered", key, ekey);
        }
        emap{key}.omap{ekey} = observable;
    }

    #! Called with the global lock held
    releaseEventSourceLocked(Mutex m, TypeScriptActionEventDataProvider observable, string key) {
        if (!emap{key}) {
            throw "EVENT-ERROR", sprintf("Event key %y is not registered", key);
        }
        string ekey = observable.uniqueHash();
        if (!emap{key}{ekey}) {
            throw "EVENT-ERROR", sprintf("Observable %y is not registered under event key %y", ekey, key);
        }
        {
            on_success remove emap{key}{ekey};
            m.unlock();
            on_exit m.lock();
            if (emap{key}{ekey}.size() == 1) {
                sendCommandArgs(PC_RELEASE_EVENT, key);
            }
        }
        if (!emap{key}) {
            remove emap{key};
            if (!emap) {
                stopListener();
            }
        }
    }

    auto getAsyncValue(...) {
        auto rv = sendCommandArgs(PC_CALL, argv);
        debug("getAsyncValue(%y): %y", argv, rv);
        return rv;
    }

    # called with the global lock held
    private startListener() {
        if (listener_tid) {
            throw "LISTENER-ERROR", sprintf("Listener already running on TID %d", listener_tid);
        }
        listener_cnt.inc();
        on_error listener_cnt.dec();
        listener_tid = background listenerThread();
    }

    private listenerThread() {
        on_exit {
            remove listener_stop;
            remove listener_tid;
            listener_cnt.dec();
        }
        while (!listener_stop) {
            int i;
            try {
                # first read message size
                i = recvi8(250ms);
                if (!i) {
                    continue;
                }

            } catch (hash<ExceptionInfo> ex) {
                if (ex.err == "SOCKET-TIMEOUT") {
                    continue;
                }
                if (retry(ex)) {
                    continue;
                }
                error("Error in listener thread: %s; exiting", get_exception_string(ex));
                break;
            }
            auto v;
            try {
                string yaml = recv(i, DefaultIoTimeout);
                if (!yaml.val()) {
                    continue;
                }
                v = parse_yaml(yaml);
                if (v.typeCode() != NT_HASH) {
                    throw "CMD-ERROR", sprintf("Expecting type \"hash\"; got %y", v.fullType());
                }
                if (v.cmd.typeCode() != NT_STRING) {
                    throw "CMD-ERROR", sprintf("Expecting \"cmd\" as a string; got %y", v.cmd.fullType());
                }
            } catch (hash<ExceptionInfo> ex) {
                if (retry(ex)) {
                    continue;
                }
                error("Error in listener thread: %s; exiting", get_exception_string(ex));
                break;
            }

            if (v.cmd == CC_EVENT) {
                *hash<string, TypeScriptActionEventDataProvider> omap = emap{v.key}.omap;
                if (!omap) {
                    error("No observers for event for key %y; ignoring", v.key);
                }
                foreach hash<auto> i in (omap.pairIterator()) {
                    try {
                        i.value.notify(v.event);
                    } catch (hash<ExceptionInfo> ex) {
                        error("Error notifying observer %y for key %y: %s", i.key, v.key, get_exception_string(ex));
                    }
                }
                continue;
            }
            if (v.cmd != CC_OK) {
                throw "CMD-ERROR", sprintf("Unexpected command %y; expected %y", v.cmd, CC_OK);
            }
            # push command on queue
            cmdq.push(v);
        }
    }

    private stopListener() {
        if (listener_tid) {
            listener_stop = True;
            listener_cnt.waitForZero();
        }
    }

    private waitForChild() {
        softstring pid = proc.id();
        Queue q = qmap{pid} = new Queue();
        waitForConnection(proc);
        s = q.get();
        remove qmap{pid};
    }

    private static waitForConnection(Process proc) {
        *Socket s0;
        date start = now_us();
        while (True) {
            s0 = master.accept(250ms);
            if (s0) {
                break;
            }
            if (!proc.running()) {
                break;
            }
            date d = now_us() - start;
            if (d > ChildConnectTimeout) {
                break;
            }
        }
        if (!s0) {
            string desc = sprintf("Child PID %d did not connect in the timeout period (%y)", proc.id(),
                ChildConnectTimeout);
            if (!proc.running()) {
                desc += "; child terminated prematurely";
            }
            if (*string stdout = proc.readStdout(64 * 1024)) {
                desc += sprintf(" stdout: %y", stdout);
            }
            if (*string stderr = proc.readStderr(64 * 1024)) {
                desc += sprintf(" stderr: %y", stderr);
            }
            throw "CHILD-PROCESS-ERRPR", desc;
        }
        int pid = s0.recvi8(10s);
        TSAI::info("Connected to child with PID: %y", pid, s0.getPeerInfo());
        qmap{pid}.push(s0);
    }

    private stopChildProcess() {
        # send shutdown command
        try {
            sendCommandOneWay(PC_EXIT);
        } catch (hash<ExceptionInfo> ex) {
            # ignore error
        }
        date start = now_us();
        while (True) {
            if (!proc.running()) {
                break;
            }
            date d = now_us() - start;
            if (d > 500ms) {
                break;
            }
            usleep(100ms);
        }
        if (proc.running()) {
            killChild();
        } else {
            info("Child with PID %d terminated normally", proc.id());
        }
    }

    private killChild() {
        try {
            proc.terminate();
            info("Forced child PID %d to terminate", proc.id());
        } catch (hash<ExceptionInfo> ex) {
            logChildOutput();
            # ignore error
        }
    }

    #! Starts the child process
    private startChildProcess() {
        list<string> args = (
            sprintf("-s=%s", master_path),
            "-vvv",
        );
        proc = new Process("ts-proxy", args, {
            "env": ENV,
        });
        if (!proc.running()) {
            throw "CHILD-ERROR", sprintf("Failed to start child process");
        }
        info("Started child process with PID %d", proc.id());
    }

    #! Sends a command from the parent to the child with a response
    private auto sendCommandArgs(string cmd, *softlist<auto> args) {
        string yaml = makeSend(cmd, {"args": args});
        hash<auto> h;
        while (True) {
            try {
                debug("sending command %y", yaml);
                sendString(yaml);
                h = waitForCommand();
                #logChildOutput();
                if (!ValidResponses{h.cmd}) {
                    throw "CMD-ERROR", sprintf("Unknown response %y; valid responses: %y", h.cmd,
                        keys ValidResponses);
                }
            } catch (hash<ExceptionInfo> ex) {
                if (retry(ex)) {
                    continue;
                }
                rethrow;
            }
            break;
        }
        if (h.cmd == CC_ERR) {
            logChildOutput();
            throw h.ex.err, sprintf("Remote JavaScript error: %s", h.ex.desc);
        }
        if (h.cmd != CC_OK) {
            throw "CMD-ERROR", sprintf("Unexpected command %y; expected %y", h.cmd, CC_OK);
        }
        return h.rv;
    }

    #! Wait for a command when the listener is active
    hash<auto> waitForCommand() {
        command_in_progress = True;
        on_exit remove command_in_progress;
        hash<auto> v = cmdq.get();
        if (v.err) {
            throw v.err, v.desc;
        }
        return v;
    }

    #! Reads an 8-byte integer in network byte order from the socket
    int recvi8(*timeout to) {
        date start = now_us();
        while (True) {
            try {
                return s.recvi8(250ms);
            } catch (hash<ExceptionInfo> ex) {
                if (ex.err == "SOCKET-CLOSED") {
                    if (!listener_tid || listener_stop) {
                        return 0;
                    }
                    if (checkRestart()) {
                        continue;
                    }
                }
                if (ex.err != "SOCKET-TIMEOUT") {
                    rethrow;
                }
            }
            if (listener_stop || !listener_tid) {
                return 0;
            }
            if (checkRestart()) {
                continue;
            }
            if (to) {
                date d = now_us() - start;
                if (d > to) {
                    throw "SOCKET-TIMEOUT", sprintf("Operation interrupted after waiting %y for data", d);
                }
            }
        }
    }

    string recv(int size, *timeout to) {
        string str;
        date start = now_us();
        while (True) {
            try {
                string str0 = s.recv(size - str.size(), 250ms);
                str += str0;
                debug("received %y (%d / %d)", str, str.size(), size);
                if (str.size() == size) {
                    return str;
                }
            } catch (hash<ExceptionInfo> ex) {
                if (ex.err == "SOCKET-CLOSED") {
                    if (!listener_tid || listener_stop) {
                        return "";
                    }
                    if (checkRestart()) {
                        continue;
                    }
                }
                if (ex.err != "SOCKET-TIMEOUT") {
                    rethrow;
                }
            }
            if (listener_stop || !listener_tid) {
                return "";
            }
            if (checkRestart()) {
                continue;
            }
            if (to) {
                date d = now_us() - start;
                if (d > to) {
                    throw "SOCKET-TIMEOUT", sprintf("Operation interrupted after waiting %y for data", d);
                }
            }
        }
    }

    private *bool retry(hash<ExceptionInfo> ex) {
        if (ex.err != "CHILD-ABORTED") {
            error("Error encountered communicating with child PID %d (running: %y): %s", proc.id(), proc.running(),
                get_exception_string(ex));
        }
        checkRestart();
        return True;
    }

    private *bool checkRestart() {
        bool restart;
        {
            AutoLock al(m);
            if (proc && !restarting) {
                logChildOutput();
            }

            while (restarting) {
                ++wait_restart;
                cond_restart.wait(m);
                --wait_restart;
            }
            if (listener_stop || !listener_tid) {
                return;
            }
            if (!proc.running()) {
                restarting = True;
                delete al;
                restartProcessIntern();
                return True;
            }
        }
        return False;
    }

    # Called with no locks held
    private restartProcessIntern() {
        int pid = proc.id();
        if (proc.running()) {
            proc.terminate();
        }

        error("Restarting child process %d after an error", pid);

        ++restart_count;

        startChildProcess();
        waitForChild();

        if (command_in_progress) {
            cmdq.push({
                "err": "CHILD-ABORTED",
                "desc": "Restarted child process",
            });
        }

        *hash<string, hash<EventSourceInfo>> emap;
        {
            global_lock.lock();
            on_exit global_lock.unlock();

            emap = self.emap;
        }

        if (emap) {
            map sendCommandArgs(PC_SETUP_EVENT, ($1.value.app, $1.value.action, $1.key, $1.value.options)),
                emap.pairIterator();
        }

        AutoLock al(m);
        remove restarting;
        if (wait_restart) {
            cond_restart.broadcast();
        }
    }

    private logChildOutput() {
        *string str = proc.readStdout(64 * 1024, 0s);
        if (str) {
            trim str;
            info("Child PID %d output: %s", proc.id(), str);
        }
        str = proc.readStderr(64 * 1024, 0s);
        if (str) {
            trim str;
            error("Child PID %d error output: %s", proc.id(), str);
        }
    }

    private debug(string fmt, ...) {
        fmt = "JavaScriptProgramProxy: " + fmt;
        TSAI::logArgs(LoggerLevel::LevelDebug, fmt, argv);
    }

    private info(string fmt, ...) {
        fmt = "JavaScriptProgramProxy: " + fmt;
        TSAI::logArgs(LoggerLevel::LevelInfo, fmt, argv);
    }

    private error(string fmt, ...) {
        fmt = "JavaScriptProgramProxy: " + fmt;
        TSAI::logArgs(LoggerLevel::LevelError, fmt, argv);
    }

    private fatal(string fmt, ...) {
        fmt = "JavaScriptProgramProxy: " + fmt;
        TSAI::logArgs(LoggerLevel::LevelFatal, fmt, argv);
    }
}
}

namespace Priv {
hashdecl EventSourceInfo {
    string app;
    string action;
    string key;
    *hash<auto> options;
    hash<string, TypeScriptActionEventDataProvider> omap;
}
}