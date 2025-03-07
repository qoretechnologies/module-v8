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

        #! Setup event timeout
        const SetupEventTimeout = 60s;

        #! Default proxy request timeout
        const DefaultRequestTimeout = 90s;

        #! Event source info
        hash<EventSourceInfo> event;
    }

    private {
        # Child process object
        Process proc;

        #! Listener TID
        int listener_tid;

        #! Listener counter
        Counter listener_cnt();

        #! Command queue
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

        #! Current command in progress
        hash<auto> command_in_progress;

        #! Set when a proxy restart is made from a proxy listener thread
        Queue rq;

        #! Event count
        Counter event_cnt();

        #! Master UNIX socket file path
        static string master_path;

        #! Master socket listener
        static Socket master();

        #! Global lock
        /** This is the same as JavaScriptThreadProcessPool::m
        */
        static Mutex global_lock;

        #! New socket map; proxy unique hash -> queue
        #static hash<string, Queue> qmap;

        #! Child map; proxy unique hash -> proxy
        static hash<string, JavaScriptProgramProxy> cmap;

        #! Master listener TID
        static int master_listener_tid;

        #! Master listener counter
        static Counter master_listener_cnt();

        #! Master listener stop flag
        static bool master_listener_stop;

        #! File to signal the master listener thread
        static File sem_write;

        #! File to read in the master listener thread
        static ReadOnlyFile sem_read;

        #! Semaphore descriptor info
        static hash<SocketPollInfo> sem_info;
    }

    #! Creates the object
    constructor() : TypeScriptProxy(True) {
        string uh = self.uniqueHash();
        {
            global_lock.lock();
            on_exit global_lock.unlock();
            cmap{uh} = self;
        }
        on_error {
            global_lock.lock();
            on_exit global_lock.unlock();
            cmap{uh} = self;
        }

        startChildProcess();
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
        if (!cmap) {
            stopMasterListener();
        }
    }

    static stopMasterListener() {
        master_listener_stop = True;
        sem_write.write(".");
        master_listener_cnt.waitForZero();
        master.shutdown();
        delete master;
        remove master_listener_stop;
        remove sem_read;
        remove sem_write;
        remove sem_info;
        TSAI::info("Shut down master listener on %y", master_path);
        remove master_path;
    }

    static init(Mutex m) {
        JavaScriptProgramProxy::global_lock = m;
    }

    static shutdown() {
        global_lock.lock();
        on_exit global_lock.unlock();

        int size = cmap.size();
        map delete cmap{$1}, keys cmap;
        TSAI::info("Shut down %d client%s", size, size == 1 ? "" : "s");
    }

    bool supportsEvent(string key) {
        return event.key == key ? True : False;
    }

    # Called with the global lock held
    setupEventSourceLocked(TypeScriptActionEventDataProvider observable, string app, string action, string key,
            *hash<DataContextInfo> options) {
        if (event) {
            throw "EVENT-ERROR", sprintf("Event key %y is already registered", event.key);
        }
        string ekey = observable.uniqueHash();
        event = <EventSourceInfo>{
            "key": key,
            "app": app,
            "action": action,
            "options": options,
            "omap": {
                ekey: observable,
            },
        };

        event_cnt.inc();
        on_error event_cnt.dec();

        global_lock.unlock();
        on_exit global_lock.lock();

        on_error removeEventSource(ekey);
        info("Setting up event source for @%s/%s %y", app, action, key);
        sendCommandArgs(NOTHING, PC_SETUP_EVENT, (app, action, key, options), SetupEventTimeout);
        info("Event source for @%s/%s %y ready", app, action, key);
    }

    private removeEventSource(string ekey) {
        bool stop;
        {
            global_lock.lock();
            on_exit global_lock.unlock();

            remove event.omap{ekey};
            if (!event.omap) {
                remove event;
                stop = True;
            }
        }
        #debug("JavaScriptProgramProxy::removeEventSource() ekey: %y remaining: %y stop: %y", ekey, keys event.omap,
        #    stop);
    }

    #! Add an additional observable to the event source; called with the global lock held
    addEventSourceLocked(TypeScriptActionEventDataProvider observable, string key) {
        if (!event) {
            throw "EVENT-ERROR", sprintf("Event key %y is not registered", key);
        }
        if (event.key != key) {
            throw "EVENT-ERROR", sprintf("Event key %y is already registered; cannot add event %y to the same proxy",
                event.key, key);
        }
        string ekey = observable.uniqueHash();
        if (event.omap{ekey}) {
            throw "EVENT-ERROR", sprintf("Event key %y for observable %y is already registered", key, ekey);
        }
        event.omap{ekey} = observable;
    }

    #! Called with the global lock held
    releaseEventSourceLocked(TypeScriptActionEventDataProvider observable, string key) {
        if (!event) {
            throw "EVENT-ERROR", sprintf("Event key %y is not registered", key);
        }
        if (event.key != key) {
            throw "EVENT-ERROR", sprintf("Event key %y is registered; cannot remove observable from unregistered "
                "event %y in this proxy", event.key, key);
        }
        string ekey = observable.uniqueHash();
        if (!event.omap{ekey}) {
            throw "EVENT-ERROR", sprintf("Observable %y is not registered under event key %y", ekey, key);
        }
        {
            global_lock.unlock();
            on_exit global_lock.lock();

            remove event.omap{ekey};
            if (!event.omap) {
                remove event;
                info("Releasing event %y", key);
                try {
                    sendCommandArgs(NOTHING, PC_RELEASE_EVENT, key, NOTHING, True);
                } catch (hash<ExceptionInfo> ex) {
                    if (ex.err == "QUEUE-TIMEOUT") {
                        error("Event key %y was released by killing the proxy process due to an error: %s: %s", key,
                            ex.err, ex.desc);
                    } else {
                        rethrow;
                    }
                }
            }
        }
        #debug("JavaScriptProgramProxy::releaseEventSourceLocked() key: %y remaining: %y stop: %y", key,
        #    keys event.omap);
    }

    auto getAsyncValue(hash<AsyncCallInfo> api, ...) {
        list<auto> args += (api.app, api.action, api.key);
        if (argv) {
            args += argv;
        }
        auto rv = sendCommandArgs(api.to, PC_CALL, args);
        debug("getAsyncValue(%y): %y", argv, rv);
        return rv;
    }

    *HashDataType getRequestType(string app, string action, *string conn_name, *hash<auto> conn_opts, auto req) {
        *binary bin = sendCommandArgs(NOTHING, PC_GET_REQUEST_TYPE, (app, action, conn_name, conn_opts, req));
        *HashDataType rv = bin ? Serializable::deserialize(bin) : NOTHING;
        debug("getRequestType(app %y action %y req %y): %y", app, action, req, rv);
        return rv;
    }

    # called with the global lock held
    private startListener() {
        if (listener_tid) {
            throw "LISTENER-ERROR", sprintf("Listener already running on TID %d", listener_tid);
        }
        listener_cnt.inc();
        on_error listener_cnt.dec();
        int pid = proc.id();
        listener_tid = background listenerThread(pid);
    }

    private listenerThread(int pid) {
        info("Started listener thread");
        on_exit {
            remove listener_stop;
            remove listener_tid;
            listener_cnt.dec();
            info("Stopped listener thread for PID %d", pid);
        }
        on_error error("Error in listener thread for PID %d: %s", pid, get_exception_string($1));
        bool restarted;
        while (!listener_stop) {
            int i;
            if (command_in_progress."timeout") {
                date d = now_us() - command_in_progress.start;
                if (d > (command_in_progress."timeout" + 10s)) {
                    killChild();
                    restarted = checkRestart(NOTHING, True);
                    string desc = restarted
                        ? sprintf("The async call timed out; terminated and restarted child process with PID %d", pid)
                        : sprintf("The async call timed out; terminated child process");
                    cmdq.push({
                        "cmd": CC_ERR,
                        "ex": {
                            "err": "ASYNC-CALL-TIMEOUT",
                            "desc": sprintf("The async call timed out; terminated and restarted child process with "
                                "PID %d", pid),
                            "arg": command_in_progress,
                        },
                    });
                    if (restarted) {
                        pid = proc.id();
                    }
                }
            }
            bool restarted_flag;
            code handle_restarted = sub () {
                if (restarted_flag) {
                    pid = proc.id();
                    if (!restarted) {
                        restarted = True;
                    }
                    remove restarted_flag;
                }
            };
            try {
                # first read message size
                i = recvi8(5s, \restarted_flag);
                handle_restarted();
                if (!i) {
                    continue;
                }
            } catch (hash<ExceptionInfo> ex) {
                logChildOutput();
                if (ex.err == "SOCKET-TIMEOUT") {
                    continue;
                }
                if (retry(ex, \restarted_flag)) {
                    handle_restarted();
                    continue;
                }
                error("Error in listener thread: %s; exiting", get_exception_string(ex));
                break;
            }
            auto v;
            try {
                string yaml = recv(i, DefaultIoTimeout, \restarted_flag);
                handle_restarted();
                if (!yaml.val()) {
                    throw "CMD-ERROR", sprintf("Missing response payload of size %d", i);
                }
                v = parse_yaml(yaml);
                if (v.typeCode() != NT_HASH) {
                    throw "CMD-ERROR", sprintf("Expecting type \"hash\"; got %y", v.fullType());
                }
                if (v.cmd.typeCode() != NT_STRING) {
                    throw "CMD-ERROR", sprintf("Expecting \"cmd\" as a string; got %y", v.cmd.fullType());
                }
            } catch (hash<ExceptionInfo> ex) {
                logChildOutput();
                if (retry(ex, \restarted_flag)) {
                    handle_restarted();
                    continue;
                }
                error("Error in listener thread: %s; exiting", get_exception_string(ex));
                break;
            }

            if (v.cmd == CC_EVENT) {
                if (!event.omap) {
                    error("No observers for event for key %y; ignoring", v.key);
                }
                foreach hash<auto> i in (event.omap.pairIterator()) {
                    try {
                        i.value.notify(v.event);
                    } catch (hash<ExceptionInfo> ex) {
                        error("Error notifying observer %y for key %y: %s", i.key, v.key, get_exception_string(ex));
                    }
                }
                continue;
            }
            if (v.cmd == CC_STATUS) {
                info("Status event received: %y", v.info);
                continue;
            }
            info("Received from PID %d (restarted: %y): %y", pid, restarted, v);
            # process event setup message if necessary inline
            if (restarted) {
                if (event) {
                    if (v.cmd == CC_OK) {
                        info("Event listener restarted");
                    } else if (v.cmd == CC_ERR) {
                        logChildOutput();
                        error("Error in proxy PID %d in event restart response: %s; exiting", pid, v.ex.desc);
                        break;
                    }
                }
                remove restarted;
                continue;
            }
            # push command on queue
            cmdq.push(v);
            #debug("pushed to queue");
        }
    }

    private stopListener() {
        if (listener_tid) {
            listener_stop = True;
            listener_cnt.waitForZero();
        }
    }

    private static masterListenerThread(Counter c) {
        TSAI::info("Master listener thread started");
        c.dec();
        on_exit {
            TSAI::info("Master listener thread stopped");
            master_listener_cnt.dec();
        }
        softlist<hash<SocketPollInfo>> poll_list = (sem_info, <SocketPollInfo>{
            "events": SOCK_POLLIN,
            "socket": master,
        });
        while (True) {
            # setup polling
            Socket::poll(poll_list, -1);
            if (master_listener_stop) {
                break;
            }
            timeout to = 1s;
            *Socket s0 = master.accept(to);
            if (s0) {
                TSAI::debug("Got connection from %y", s0.getPeerInfo());
                try {
                    # first read message size
                    int i = s0.recvi8(to);
                    string yaml = s0.recv(i, to);
                    auto v = parse_yaml(yaml);
                    if (v.typeCode() != NT_HASH) {
                        TSAI::error("Proxy connection: expecting type \"hash\"; got %y; closing", v.fullType());
                        continue;
                    }
                    if (v.cmd.typeCode() != NT_STRING) {
                        TSAI::error("Proxy connection: expecting \"cmd\" as a string; got %y; closing",
                            v.cmd.fullType());
                        continue;
                    }
                    if (v.cmd != CC_STARTED) {
                        TSAI::error("Proxy connection: expecting \"cmd\" = %y; got %y instead; closing", CC_STARTED,
                            v.cmd);
                        continue;
                    }
                    # get proxy from key
                    *JavaScriptProgramProxy proxy = cmap{v.pkey};
                    if (!proxy) {
                        TSAI::error("Proxy connection: invalid proxy key %y; known keys: %y; closing", v.pkey,
                            keys cmap);
                        continue;
                    }
                    TSAI::debug("Got message from proxy PID %d: %y for proxy: %y", proxy.proc.id(), v,
                        proxy.uniqueHash());
                    hash<auto> msg = {
                        "cmd": CC_OK,
                        "socket": s0,
                    };
                    TSAI::info("Received startup confirmation message for proxy PID %d on %s queue",
                        proxy.proc.id(), proxy.rq ? "restart" : "primary");
                    if (proxy.rq) {
                        proxy.rq.push(msg);
                        remove proxy.rq;
                    } else {
                        proxy.cmdq.push(msg);
                    }
                } catch (hash<ExceptionInfo> ex) {
                    TSAI::error("Proxy connection: error processing request: %s", get_exception_string(ex));
                }
            }
        }
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
            info("Child terminated normally");
        }
    }

    private killChild() {
        try {
            proc.terminate();
            info("Forced child to terminate");
        } catch (hash<ExceptionInfo> ex) {
            # ignore error
        }
        logChildOutput(True);
    }

    #! Starts the child process
    private startChildProcess() {
        checkStartMasterListener();
        list<string> args = (
            sprintf("-s=%s", master_path),
            "-vvv",
        );
        if (ENV.TS_PROXY_LOGDIR) {
            args += sprintf("-l=%s", ENV.TS_PROXY_LOGDIR);
        }
        string uh = self.uniqueHash();
        hash<auto> env = ENV + {
            "TS_PROXY_PROCESS_KEY": uh,
        };
        proc = new Process("ts-proxy", args, {
            "env": env,
            "close_fds": True,
        });
        if (!proc.running()) {
            logChildOutput(True);
            throw "CHILD-ERROR", "Failed to start child process";
        }
        info("Started child process");
        hash<auto> h;
        bool start_listener = !exists rq;
        {
            date start = now_us();
            Queue q = rq ?? cmdq;
            while (True) {
                try {
                    h = q.get(250ms);
                    break;
                } catch (hash<ExceptionInfo> ex) {
                    logChildOutput();
                    if (ex.err != "QUEUE-TIMEOUT") {
                        rethrow;
                    }
                    date d = now_us() - start;
                    if (d >= 20s || !proc.running()) {
                        rethrow "CHILD-ERROR", sprintf("Timeout (%y) waiting for startup message from child "
                            "process: %s", d, get_exception_string(ex));
                    }
                }
            }
        }
        if (h.cmd == CC_ERR) {
            logChildOutput();
            throw h.ex.err, sprintf("Error in child process startup response: %s", h.ex.desc), h.ex.arg;
        }
        s = h.socket;
        logChildOutput();
        info("Child process ready");
        if (start_listener) {
            startListener();
        }
    }

    static private checkStartMasterListener() {
        global_lock.lock();
        on_exit global_lock.unlock();

        if (master_path.val()) {
            return;
        }

        # must keep socket paths less than ~ 104 chars
        string host = gethostname();
        host =~ s/\..*//;
        master_path = sprintf("%s/ts-proxy-%s-%d.sock", tmp_location(), host, getpid());
        if (master_path.size() >= 104) {
            master_path = sprintf("/tmp/ts-proxy-%d.sock", tmp_location(), getpid());
        }
        on_error remove master_path, remove master;

        master.bindUNIX(master_path);
        master.listen();
        TSAI::info("Started master listener on %y", master_path);

        # setup semaphor to stop the master listener thread efficiently
        hash<PipeInfo> info = File::getPipe();
        sem_read = info.read;
        sem_write = info.write;
        sem_info = <SocketPollInfo>{
            "events": SOCK_POLLIN,
            "socket": sem_read,
        };

        master_listener_cnt.inc();
        Counter c(1);
        {
            on_error master_listener_cnt.dec();
            master_listener_tid = background masterListenerThread(c);
        }
        c.waitForZero();
        TSAI::info("Master listener running in TID %d", master_listener_tid);
    }

    #! Sends a command from the parent to the child with a response
    private auto sendCommandArgs(*date io_timeout, string cmd, *softlist<auto> args,
            date response_timeout = DefaultRequestTimeout, *bool no_retry) {
        string yaml = makeSend(cmd, {"args": args});
        hash<auto> h;
        RetryCounter rc();
        while (True) {
            try {
                sendCommandArgsIntern(io_timeout, cmd, args, yaml);
                on_exit remove command_in_progress;
                h = waitForCommand(response_timeout);
                if (!ValidResponses{h.cmd}) {
                    throw "CMD-ERROR", sprintf("Unknown response %y; valid responses: %y", h.cmd,
                        keys ValidResponses);
                }
            } catch (hash<ExceptionInfo> ex) {
                if (ex.err == "QUEUE-TIMEOUT") {
                    error("Error waiting for response to proxy command %y; terminating proxy and retrying", cmd);
                    killChild();
                }
                if (retryIntern(ex, rc) && !no_retry) {
                    info("Restarting command due to error");
                    continue;
                }
                rethrow;
            }
            break;
        }
        if (h.cmd == CC_ERR) {
            logChildOutput();
            throw h.ex.err, sprintf("Remote JavaScript error: %s", h.ex.desc), h.ex.arg;
        }
        if (h.cmd != CC_OK) {
            throw "CMD-ERROR", sprintf("Unexpected command %y; expected %y", h.cmd, CC_OK);
        }
        return h.rv;
    }

    private sendCommandArgsIntern(*date io_timeout, string cmd, *softlist<auto> args, *string yaml) {
        command_in_progress = {
            "cmd": cmd,
            "args": args,
            "timeout": io_timeout,
            "start": now_us(),
        };
        if (!yaml.val()) {
            yaml = makeSend(cmd, {"args": args});
        }
        debug("Sending command %y", yaml);
        sendString(yaml);
    }

    #! Wait for a command when the listener is active
    hash<auto> waitForCommand(*date to) {
        hash<auto> v = cmdq.get(to);
        if (v.cmd == CC_ERR) {
            throw v.ex.err, v.ex.desc, v.ex.arg;
        }
        return v;
    }

    #! Reads an 8-byte integer in network byte order from the socket
    /** Only called in the per-process listener thread
    */
    int recvi8(*date to, *reference<bool> restarted) {
        date start = now_us();
        while (True) {
            try {
                return s.recvi8(250ms);
            } catch (hash<ExceptionInfo> ex) {
                if (ex.err == "SOCKET-CLOSED") {
                    if (!listener_tid || listener_stop) {
                        return 0;
                    }
                    if (checkRestart(NOTHING, True)) {
                        restarted = True;
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
            if (checkRestart(NOTHING, True)) {
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

    string recv(int size, *date to, *reference<bool> restarted) {
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
                    if (!listener_tid || listener_stop || checkRestart()) {
                        return "";
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
                restarted = True;
                return "";
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
        bool restarted;
        return retry(ex, \restarted);
    }

    private *bool retry(hash<ExceptionInfo> ex, reference<bool> restarted) {
        return retryIntern(ex, NOTHING, \restarted);
    }

    private *bool retryIntern(hash<ExceptionInfo> ex, *RetryCounter rc, *reference<bool> restarted) {
        bool aborted = (ex.err == "CHILD-ABORTED");
        if (aborted) {
            # at this point the process has been restarted
            error("Error communicating with child: %s (restarted: %y)", get_exception_string(ex), proc.running());
        } else if (checkRestart(rc)) {
            restarted = True;
            return True;
        }
        return rc ? rc.retry(ex, command_in_progress) : True;
    }

    private *bool checkRestart(*RetryCounter rc, *bool in_listener) {
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
                error("Child process aborted; restarting");
                if (rc) {
                    rc.restart();
                }
                restarting = True;
                delete al;
                rq = new Queue();
                restartProcessIntern();
                remove restarting;
                if (wait_restart) {
                    cond_restart.broadcast();
                }
                return True;
            }
        }
        return;
    }

    # Called with no locks held
    private restartProcessIntern() {
        int pid = proc.id();
        if (proc.running()) {
            proc.terminate();
        }
        bool in_listener = exists rq;
        if (!in_listener) {
            stopListener();
        }
        delete s;

        error("Restarting child process after an error");
        logChildOutput();

        ++restart_count;

        startChildProcess();

        if (command_in_progress) {
            cmdq.push({
                "cmd": CC_ERR,
                "ex": {
                    "err": "CHILD-ABORTED",
                    "desc": sprintf("Restarted child process with PID %d", pid),
                    "arg": command_in_progress,
                },
            });
        }

        *hash<EventSourceInfo> event;
        {
            global_lock.lock();
            on_exit global_lock.unlock();

            event = self.event;
        }

        if (event) {
            info("Restarting event listener for @%s/%s %y", event.app, event.action, event.key);
            if (in_listener) {
                sendCommandArgsIntern(NOTHING, PC_SETUP_EVENT, (event.app, event.action, event.key, event.options));
            } else {
                sendCommandArgs(NOTHING, PC_SETUP_EVENT, (event.app, event.action, event.key, event.options));
            }
        }
    }

    private logChildOutput(*bool always_output) {
        *string str = proc.readStdout(64 * 1024, 0s);
        bool out;
        if (str) {
            trim str;
            string pfx = " > stdout: ";
            str = pfx + str;
            str = replace(str, "\n", "\n" + pfx);
            info("Child output follows:\n%s", str);
            out = True;
        }
        str = proc.readStderr(64 * 1024, 0s);
        if (str) {
            trim str;
            string pfx = " > stderr: ";
            str = pfx + str;
            str = replace(str, "\n", "\n" + pfx);
            error("Child error output follows:\n%s", str);
            if (!out) {
                out = True;
            }
        }
        if (always_output && !out) {
            info("child has no output");
        }
        /*
        if (out) {
            try {
                throw "LOCATION-ERROR";
            } catch (hash<ExceptionInfo> ex) {
                info("%s", get_exception_string(ex));
            }
        }
        */
    }

    private debug(string fmt, ...) {
        fmt = sprintf("JavaScriptProgramProxy%s: ", proc ? (" for PID " + proc.id()) : "") + fmt;
        TSAI::logArgs(LoggerLevel::LevelDebug, fmt, argv);
    }

    private info(string fmt, ...) {
        fmt = sprintf("JavaScriptProgramProxy%s: ", proc ? (" for PID " + proc.id()) : "") + fmt;
        TSAI::logArgs(LoggerLevel::LevelInfo, fmt, argv);
    }

    private error(string fmt, ...) {
        fmt = sprintf("JavaScriptProgramProxy%s: ", proc ? (" for PID " + proc.id()) : "") + fmt;
        TSAI::logArgs(LoggerLevel::LevelError, fmt, argv);
    }

    private fatal(string fmt, ...) {
        fmt = sprintf("JavaScriptProgramProxy%s: ", proc ? (" for PID " + proc.id()) : "") + fmt;
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
class RetryCounter {
    public {
%ifdef RestartLogic
        const MaxRetries = 3;
%endif
    }

    private {
        int restarts;
%ifdef RestartLogic
        # error map: err hash -> count
        hash<string, int> emap;
%endif
    }

    restart() {
        ++restarts;
    }

    # if this returns True, the operation will be retried
    *bool retry(hash<ExceptionInfo> ex, *hash<auto> command_in_progress) {
%ifdef RestartLogic
        if (!command_in_progress) {
            return False;
        }
        string k = command_in_progress.cmd;
        if (exists command_in_progress.args) {
            k += sprintf("-%s", TypeScriptActionDataProviderBase::getKeyValue(command_in_progress.args));
        }
        k = k.toSHA512();
        if (++emap{k} < MaxRetries) {
            return True;
        }
        TSAI::error("Not retrying cmd: %y args: %y that has failed %d times", command_in_progress.cmd,
            command_in_progress.args, MaxRetries);
%else
        return False;
%endif
    }
}
}