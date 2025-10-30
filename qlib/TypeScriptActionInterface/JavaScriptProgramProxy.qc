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

        #! Bulk search request ID
        string search_id;
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

        #! Event count
        #Counter event_cnt();

        #! Event socket counter
        Counter es_cnt();

        #! Event listener TID
        int es_tid;

        #! Event socket exit flag
        bool es_exit;

        #! File to signal the event listener thread
        File es_sem_write;

        #! File to read in the event listener thread
        ReadOnlyFile es_sem_read;

        #! Semaphore descriptor info for the event listener thread
        hash<SocketPollInfo> es_sem_info;

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

        #! Restart flag: do not restart event
        const RF_NO_EVENT   = (1 << 0);

        #! Restart flag: do not restart process
        const RF_NO_RESTART = (1 << 1);
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
        stopEventListener();

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

    hash<auto> getInfo() {
        return {
            "proxy-pid": proc.id(),
            "event-listener-tid": es_tid,
        };
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
        unlink(master_path);
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

    *hash<auto> searchRecords(string app, string id, string conn_name, hash<auto> conn_opts, int block_size,
            *hash<DataProviderExpression> where_cond, hash<auto> search_options, *hash<DataContextInfo> options) {
        ASSERT(!event && !search_id);
        search_id = id;
        on_error remove search_id;
        info("Setting up search for PID %d @%s: %y", proc.id(), app, id);
        *hash<auto> rv = sendCommandArgs(NOTHING, PC_SEARCH_RECORDS, (app, conn_name, conn_opts, block_size,
            where_cond, search_options));
        if (!rv.firstValue().lsize()) {
            remove search_id;
            info("Search @%s: %y complete -> %y", app, id, LoggerUtil::getArgSummary(rv));
        } else {
            info("Search @%s: %y started -> %y", app, id, LoggerUtil::getArgSummary(rv));
        }
        return rv;
    }

    releaseSearch(string id) {
        ASSERT(!event);
        if (search_id) {
            ASSERT(search_id == id);
            info("Releasing search for PID %d: %y", proc.id(), id);
            sendCommandArgs(NOTHING, PC_RELEASE_SEARCH, NOTHING, NOTHING, True);
            info("Search %y released", id);
            remove search_id;
        } else {
            info("Search %y already released", id);
        }
    }

    *hash<auto> getRecords(string id) {
        if (search_id != id) {
            throw "SEARCH-ERROR", sprintf("Search %y was interrupted due to a proxy restart", id);
        }
        auto rv = sendCommandArgs(NOTHING, PC_GET_RECORDS);
        if (!rv.firstValue().lsize()) {
            info("Search %y complete -> %y", id, LoggerUtil::getArgSummary(rv));
            remove search_id;
        } else {
            info("Search %y continuing -> %y", id, LoggerUtil::getArgSummary(rv));
        }
        return rv;
    }

    # Called with the global lock held
    setupEventSource(TypeScriptActionEventDataProvider observable, string app, string action, string key,
            *hash<DataContextInfo> options) {
        ASSERT(!event && !search_id);
        /*
        if (event) {
            throw "EVENT-ERROR", sprintf("Event key %y is already registered", event.key);
        }
        */
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

        #event_cnt.inc();
        #on_error event_cnt.dec();

        on_error removeEventSource(ekey);
        setupEventSourceIntern();
    }

    private setupEventSourceIntern() {
        info("Setting up event source for PID %d @%s/%s %y", proc.id(), event.app, event.action, event.key);
        sendCommandArgs(NOTHING, PC_SETUP_EVENT, (event.app, event.action, event.key, event.options), NOTHING, True);
        info("Event source for @%s/%s %y ready", event.app, event.action, event.key);
    }

    private stopEventListener() {
        if (es_tid) {
            es_exit = True;
            es_sem_write.write(".");
            es_cnt.waitForZero();
            TSAI::info("Shut down event listener for PID %d", proc.id());
        }
    }

    startEventListener(Socket event_socket, hash<auto> v) {
        if (es_tid) {
            stopEventListener();
        }

        # setup semaphor to stop the event listener thread efficiently
        hash<PipeInfo> info = File::getPipe();
        es_sem_read = info.read;
        es_sem_write = info.write;
        es_sem_info = <SocketPollInfo>{
            "events": SOCK_POLLIN,
            "socket": es_sem_read,
        };
        es_cnt.inc();
        on_error es_cnt.dec();
        es_tid = background eventListenerThread(event_socket);
    }

    private eventListenerThread(Socket event_socket) {
        hash<auto> einfo;
        on_exit {
            remove es_exit;
            remove es_tid;
            remove es_sem_read;
            remove es_sem_write;
            remove es_sem_info;

            es_cnt.dec();
            if (einfo) {
                info("Stopped event thread for PID %d for @%s/%s %y", proc.id(), einfo.app, einfo.action, einfo.key);
            } else {
                info("Stopped event thread for PID %d", proc.id());
            }
        }

        if (!event) {
            if (es_exit) {
                # event already released
                info("Cannot start event listener thread: no event source registered");
            } else {
                error("Failed to start event listener thread: no event source registered");
            }
            return;
        }
        info("Started event thread for PID %d for @%s/%s %y", proc.id(), event.app, event.action, event.key);
        einfo = event{"app", "action", "key"};

        on_error error("Error in event listener thread for PID %d: %s", proc.id(), get_exception_string($1));
        softlist<hash<SocketPollInfo>> poll_list = (es_sem_info, <SocketPollInfo>{
            "events": SOCK_POLLIN,
            "socket": event_socket,
        });
        while (True) {
            int i;
            try {
                # setup polling
                Socket::poll(poll_list, -1);
                if (es_exit) {
                    break;
                }
                if (!event_socket.isOpen()) {
                    error("The event socket for PID %d is closed; terminating", proc.id());
                    break;
                }

                # first read message size
                i = event_socket.recvi8(5s);
                if (!i) {
                    continue;
                }
            } catch (hash<ExceptionInfo> ex) {
                logChildOutput();
                if (ex.err == "SOCKET-TIMEOUT") {
                    continue;
                }
                if (ex.err == "SOCKET-NOT-OPEN" || ex.err == "SOCKET-CLOSED") {
                    error("The event socket for PID %d is closed; terminating", proc.id());
                    break;
                }
                error("Error in listener thread: %s; continuing to listen for events", get_exception_string(ex));
                continue;
            }
            auto v;
            try {
                string yaml = event_socket.recv(i, DefaultIoTimeout);
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
                if (ex.err == "SOCKET-NOT-OPEN" || ex.err == "SOCKET-CLOSED") {
                    error("Error in event listener thread: %s; terminating", get_exception_string(ex));
                    break;
                }
                error("Error in listener thread: %s; continuing to listen for events", get_exception_string(ex));
                continue;
            }
            debug("Got event message: %y", LoggerUtil::getArgSummary(v));

            if (v.cmd == CC_EVENT) {
                if (!event.omap) {
                    error("No observers for event for key %y; ignoring", v.key);
                }
                foreach hash<auto> i in (event.omap.pairIterator()) {
                    try {
                        info("Calling notify() for %y: %y", i.key, v.event);
                        i.value.notify(v.event);
                        info("notify() done for %y", i.key);
                    } catch (hash<ExceptionInfo> ex) {
                        error("Error notifying observer %y for key %y: %s", i.key, v.key, get_exception_string(ex));
                    }
                }
                continue;
            }
            if (v.cmd == CC_EVENT_TERMINATED) {
                if (!event.omap) {
                    error("No observers for event for key %y; ignoring", v.key);
                }
                foreach hash<auto> i in (event.omap.pairIterator()) {
                    try {
                        i.value.terminated();
                    } catch (hash<ExceptionInfo> ex) {
                        error("Error notifying observer %y of terminated event thread for key %y: %s", i.key, v.key,
                            get_exception_string(ex));
                    }
                }
                break;
            }
            error("Unknown command received on event listener: %y; ignoring", v);
        }
        if (!es_exit) {
            info("Event listener thread terminated prematurely");
            background sub () {
                try {
                    checkRestart();
                } catch (hash<ExceptionInfo> ex) {
                    error("Error restarting proxy after event listener error: %s", get_exception_string(ex));
                }
            }();
        }
    }

    private removeEventSource(string ekey) {
        {
            global_lock.lock();
            on_exit global_lock.unlock();

            remove event.omap{ekey};
            if (!event.omap) {
                remove event;
                stopEventListener();
            }
        }
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
    releaseEventSourceLocked(TypeScriptActionEventDataProvider observable, string key, *bool in_listener) {
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
        bool stop;
        {
            global_lock.unlock();
            on_exit global_lock.lock();

            remove event.omap{ekey};
            if (!event.omap) {
                info("Releasing event %y", key);
                remove event;
                stop = True;
            }
        }
        if (stop && !in_listener) {
            stopEventListener();
            try {
                sendCommandArgs(NOTHING, PC_RELEASE_EVENT, key, NOTHING, True);
            } catch (hash<ExceptionInfo> ex) {
                if (proc.running()) {
                    killChild();
                    error("Event key %y was released with an error; proxy process terminated: %s: %s", key,
                        ex.err, ex.desc);
                } else {
                    error("Event key %y was released with an error; proxy process is dead: %s: %s", key, ex.err,
                        ex.desc);
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
        debug("getAsyncValue(%y): %y", LoggerUtil::getArgSummary(argv), LoggerUtil::getArgSummary(rv));
        return rv;
    }

    *HashDataType getDynamicType(string cmd, string app, string action, *string conn_name, *hash<auto> conn_opts,
            auto req) {
        *binary bin = sendCommandArgs(NOTHING, cmd, (app, action, conn_name, conn_opts, req));
        *HashDataType rv = bin ? Serializable::deserialize(bin) : NOTHING;
        debug("getDynamicType(app %y action %y req %y conn_opts: %y): %y", app, action,
            LoggerUtil::getArgSummary(req), LoggerUtil::getArgSummary(conn_opts),
            LoggerUtil::getArgSummary(rv));
        return rv;
    }

    *hash<string, hash<ActionOptionInfo>> getDynamicOptions(string app, string action, *string conn_name,
            *hash<auto> conn_opts, auto req) {
        *binary bin = sendCommandArgs(NOTHING, PC_GET_DYNAMIC_OPTIONS, (app, action, conn_name, conn_opts, req));
        *hash<string, hash<ActionOptionInfo>> rv = bin ? Serializable::deserialize(bin) : NOTHING;
        debug("getDynamicOptions(app %y action %y req %y): %y", app, action, LoggerUtil::getArgSummary(req),
            LoggerUtil::getArgSummary(rv));
        return rv;
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
                    # get proxy from key
                    *JavaScriptProgramProxy proxy = cmap{v.pkey};
                    if (!proxy) {
                        TSAI::error("Proxy connection: invalid proxy key %y; known keys: %y; ignoring message: %y",
                            v.pkey, keys cmap, v);
                        continue;
                    }

                    if (v.cmd == CC_EVENT_START) {
                        proxy.startEventListener(s0, v);
                        continue;
                    }
                    if (v.cmd != CC_STARTED) {
                        TSAI::error("Proxy connection: expecting \"cmd\" = %y; got %y instead; closing", CC_STARTED,
                            v.cmd);
                        continue;
                    }
                    TSAI::debug("Got message from proxy PID %d: %y for proxy: %y", proxy.proc.id(),
                        LoggerUtil::getArgSummary(v), proxy.uniqueHash());
                    hash<auto> msg = {
                        "cmd": CC_OK,
                        "socket": s0,
                    };
                    TSAI::info("Received startup confirmation message for proxy PID %d; sending notification on msg "
                        "queue", proxy.proc.id());
                    proxy.cmdq.push(msg);
                } catch (hash<ExceptionInfo> ex) {
                    TSAI::error("Proxy connection: error processing request: %s", get_exception_string(ex));
                }
            }
        }
    }

    private stopChildProcess() {
        # send shutdown command
        try {
            sendCommandOneWayStop(PC_EXIT);
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
            stopEventListener();
            info("Child terminated normally");
        }
    }

    #! Sends a command from the parent to the child without a response
    private sendCommandOneWayStop(string cmd, *list<auto> args) {
        string yaml = makeSend(cmd, {"args": args});
        while (True) {
            try {
                sendString(yaml);
            } catch (hash<ExceptionInfo> ex) {
                if (retryIntern(ex, NOTHING, RF_NO_RESTART)) {
                    continue;
                }
                rethrow;
            }
            break;
        }
    }

    private killChild() {
        try {
            proc.terminate();
            info("Forced child to terminate");
        } catch (hash<ExceptionInfo> ex) {
            # ignore error
        }
        stopEventListener();
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
        {
            date start = now_us();
            while (True) {
                try {
                    h = cmdq.get(250ms);
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

        # delete the socket file if it exsts
        if (hstat(master_path) && unlink(master_path)) {
            throw "TS-PROXY-ERROR", sprintf("%s: %s; cannot bind master proxy listener", master_path, strerror());
        }

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
            date response_timeout = DefaultRequestTimeout, *bool no_restart_event) {
        string yaml = makeSend(cmd, {"args": args});
        hash<auto> h;
        RetryCounter rc();

        while (True) {
            try {
                command_in_progress = {
                    "cmd": cmd,
                    "args": args,
                    "timeout": io_timeout,
                    "start": now_us(),
                };
                if (!yaml.val()) {
                    yaml = makeSend(cmd, {"args": args});
                }
                debug("Sending command %y", LoggerUtil::getArgSummary(yaml));
                sendString(yaml);
                on_exit remove command_in_progress;
                h = waitForResponse(response_timeout);
                if (!ValidResponses{h.cmd}) {
                    throw "CMD-ERROR", sprintf("Unknown response %y; valid responses: %y", h.cmd,
                        keys ValidResponses);
                }
            } catch (hash<ExceptionInfo> ex) {
                bool restarted = retryIntern(ex, rc, no_restart_event ? RF_NO_EVENT : 0);
                if (restarted && !no_restart_event) {
                    info("Restarting command due to error");
                    continue;
                }
                error("Error running %y: %s", cmd, get_exception_string(ex));
                rethrow;
            }
            break;
        }
        if (h.cmd != CC_OK) {
            throw "CMD-ERROR", sprintf("Unexpected command %y; expected %y", h.cmd, CC_OK);
        }
        return h.rv;
    }

    #! Wait for a command when the listener is active
    hash<auto> waitForResponse(date to = DefaultIoTimeout) {
        int pid = proc.id();
        auto v;
        date start = now_us();
        while (True) {
            int i;
            try {
                # first read message size
                i = s.recvi8(1s);
                if (!i) {
                    throw "CMD-ERROR", sprintf("Invalid response received from proxy with PID %d", pid);
                }
            } catch (hash<ExceptionInfo> ex) {
                logChildOutput();
                if (ex.err == "SOCKET-TIMEOUT") {
                    date d = now_us() - start;
                    if (d > to) {
                        rethrow "SOCKET-TIMEOUT", sprintf("Timed out after %y waiting for a response from the async "
                            "JavaScript call", to);
                    }
                    continue;
                }
                rethrow;
            }
            string yaml = recv(i, to);
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

            info("Received from PID %d: %y", pid, v);
            break;
        }
        if (v.cmd == CC_ERR) {
            logChildOutput();
            throw v.ex.err, v.ex.desc, v.ex.arg;
        }
        return v;
    }

    string recv(int size, *date to) {
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
                if (ex.err != "SOCKET-TIMEOUT") {
                    rethrow;
                }
            }
            if (to) {
                date d = now_us() - start;
                if (d > to) {
                    throw "SOCKET-TIMEOUT", sprintf("Operation interrupted after waiting %y for data", d);
                }
            }
        }
    }

    private *bool retryIntern(hash<ExceptionInfo> ex, *RetryCounter rc, *int restart_flags) {
        if (checkRestart(rc, restart_flags)) {
            return True;
        }
        return rc ? rc.retry(ex, command_in_progress) : True;
    }

    private *bool checkRestart(*RetryCounter rc, *int restart_flags) {
        bool restart;
        {
            AutoLock al(m);
            if (restarting) {
                while (restarting) {
                    ++wait_restart;
                    cond_restart.wait(m);
                    --wait_restart;
                }
                return True;
            }

            if (proc) {
                logChildOutput();
            }

            if (!proc.running()) {
                if (restart_flags & RF_NO_RESTART) {
                    error("Child process aborted; not restarting");
                    return;
                }
                error("Child process aborted; restarting");
                if (rc) {
                    rc.restart();
                }
                restarting = True;
                delete al;

                # run the restart unlocked
                restartProcessIntern(restart_flags & RF_NO_EVENT ? True : False);

                al = new AutoLock(m);
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
    private restartProcessIntern(*bool no_restart_event) {
        int pid = proc.id();
        if (proc.running()) {
            proc.terminate();
        }
        delete s;

        error("Restarting child process after an error");
        *hash<auto> out = logChildOutput(True);

        ++restart_count;

        startChildProcess();

        if (no_restart_event) {
            return;
        }

        *hash<EventSourceInfo> event;
        *string search_id;
        {
            global_lock.lock();
            on_exit global_lock.unlock();

            event = self.event;
            search_id = remove self.search_id;
        }

        if (event) {
            info("Restarting event listener for @%s/%s %y", event.app, event.action, event.key);
            setupEventSourceIntern();
        } else if (search_id.val()) {
            info("Search %y aborted", search_id);
        }
    }

    private *hash<auto> logChildOutput(*bool always_output) {
        *string str = proc.readStdout(64 * 1024, 0s);
        hash<auto> rv;
        if (str) {
            trim str;
            string pfx = " > stdout: ";
            str = pfx + str;
            str = replace(str, "\n", "\n" + pfx);
            info("Child output follows:\n%s", str);
            rv."stdout" = str;
        }
        str = proc.readStderr(64 * 1024, 0s);
        if (str) {
            trim str;
            string pfx = " > stderr: ";
            str = pfx + str;
            str = replace(str, "\n", "\n" + pfx);
            error("Child error output follows:\n%s", str);
            rv."stdout" = str;
        }
        if (always_output && !rv) {
            info("child has no output");
        }
        return rv;
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
        if (command_in_progress.out =~ /EPIPE/) {
            return True;
        }
        return False;
%endif
    }
}
}