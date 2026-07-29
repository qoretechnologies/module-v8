# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionEventDataProvider.qc Copyright (C) 2023 - 2026 Qore Technologies s.r.o.

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
#! Data provider that raises events from a TypeScript event function
/** The event function owns its own polling loop, so this class does not use the polling machinery in
    @ref DataProvider::AbstractWatchDataProviderBase "AbstractWatchDataProviderBase"; it inherits that class for the
    <b>durable checkpoint contract</b>, which lets a TypeScript trigger keep its position in an upstream feed across
    a host reload.

    @par Checkpoints
    The event function is called with a fourth argument carrying the checkpoint API:
    @code{.js}
event_function: async (ctx, update, should_stop, checkpoint) => {
    let state = checkpoint.get();               // the state stored by the previous run, if any
    // ... deliver an item with update(item) ...
    await checkpoint.set({ cursor: item.id });  // durable once this returns
}
    @endcode

    The state is opaque to this class: the event function owns its shape. It is wrapped in a versioned envelope
    with a monotonic sequence number so that a checkpoint arriving out of order — possible when the event function
    runs in a separate process and pushes checkpoints over the event socket — cannot move the cursor backwards.

    A checkpoint must only be stored <b>after</b> the item it covers has been delivered with \c update(). Storing
    it first means a failure loses the item; storing it afterwards means a failure re-delivers it, which is the
    at-least-once guarantee the checkpoint exists to provide.

    Without a host checkpoint callback configured through
    @ref DataProvider::AbstractWatchDataProviderBase::setCheckpointPersistence() "setCheckpointPersistence()",
    \c checkpoint.get() returns @ref nothing and \c checkpoint.set() is a no-op, so an event function written
    against this API keeps working with in-memory state only.
*/
public class TypeScriptActionEventDataProvider inherits TypeScriptActionEventDataProviderBase,
        DataProvider::AbstractWatchDataProviderBase {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "type": "TypeScriptActionEventDataProvider",
            "supports_observable": True,
        };

        #! Placeholder polling interval
        /** The TypeScript event function owns its own loop, so the base class's polling interval is never used;
            @ref pollOnce() is likewise never called
        */
        const UnusedPollInterval = 60;
    }

    private {
        hash<AsyncCallInfo> event;

        Mutex m();
        Condition cond();
        bool running;
        int waiting;

        #! For external processes
        JavaScriptProgramProxy proxy;

        #! Event options
        *hash<auto> event_options;

        #! @note the stop flag itself is inherited from @ref DataProvider::AbstractWatchDataProviderBase
        #! "AbstractWatchDataProviderBase" as \c stop_flag, so that @ref isStopping() reports this provider's state

        #! The checkpoint state restored for the event function, if any
        auto checkpoint_state;

        #! The sequence number of the last checkpoint accepted
        /** Guards against a checkpoint arriving out of order over the event socket and moving the cursor backwards
        */
        int checkpoint_seq = 0;

        #! Lock protecting the checkpoint state
        Mutex checkpoint_lock();
    }

    #! Creates the object from the arguments
    constructor(string name, string event_id, hash<DataProviderMessageInfo> event_info,
            *hash<AsyncCallInfo> get_example_event_data, *hash<AsyncCallInfo> get_dynamic_type,
            ActionFunctionContext fctx, hash<AsyncCallInfo> event)
            : TypeScriptActionEventDataProviderBase(name, event_id, event_info, get_example_event_data,
                get_dynamic_type, fctx),
              AbstractWatchDataProviderBase(UnusedPollInterval) {
        self.event = event;
    }

    #! Stops the JavaScript I/O thread and deletes the object
    destructor() {
        stop();
    }

    #! Called when all observers have been added to the object
    /** This method is meant to trigger event generation
    */
    observersReady() {
        if (proxy || running) {
            throw "OBSERVABLE-ERROR", "observersReady() can only be called once";
        }

        event_options = DataProviderDataContextHelper::getHash();
        startEvent();
    }

    #! Called to stop generating events
    /** Stops polling for new events
    */
    stopEvents() {
        stop();
    }

    #! Update any connection used by the data provider
    /** @param conn the new AbstractConnection object
        @param connobj the new connection object itself (ex: RestClient for a "rest" connection)
    */
    updateConnectionObjects(object conn, object connobj) {
        if (!(connobj instanceof RestClient)) {
            throw "UPDATE-CONNECTION-ERROR", sprintf("Data provider %y requires a \"RestClient\" object; got "
                "%y instead", self.className(), connobj.className());
        }
        self.conn = conn;
        self.rest = cast<RestClient>(connobj);
        try {
            stop();
            startEvent();
        } catch (hash<ExceptionInfo> ex) {
            error("EVENT-ERROR", "Exception restarting event listener: %s", get_exception_string(ex));
        }
    }

    #! Is this object still generating events
    bool isActive() {
        return running ?? False;
    }

    #! The ordering of the feed is owned by the TypeScript event function
    /** The event function decides what it fetches and in what order it delivers, so this class cannot make an
        ordering claim on its behalf.
    */
    string getSourceOrdering() {
        return WSO_UNKNOWN;
    }

    #! Never called: the TypeScript event function owns its own polling loop
    /** @ref observersReady() starts the event function instead of the base class's polling thread, so the base
        class's loop — and therefore this method — never runs.
    */
    private pollOnce() {
        throw "UNSUPPORTED-OPERATION", sprintf("%y does not use the polling loop of its base class; the "
            "TypeScript event function owns its own loop", self.className());
    }

    #! Restores the checkpoint stored by a previous run of the event function
    /** @param checkpoint the envelope written by @ref persistEventCheckpoint()

        @throw WATCH-CHECKPOINT-ERROR the envelope is not in a recognized format
    */
    private restoreCheckpoint(hash<auto> checkpoint) {
        if (checkpoint.version.typeCode() != NT_INT || checkpoint.version != 1
                || checkpoint.seq.typeCode() != NT_INT || checkpoint.seq < 0) {
            throw "WATCH-CHECKPOINT-ERROR", sprintf("invalid TypeScript event checkpoint for %y; expecting version 1 "
                "and a non-negative seq", getName());
        }
        checkpoint_state = checkpoint.state;
        checkpoint_seq = checkpoint.seq;
    }

    #! Returns the checkpoint state for the event function, if any
    /** Also used when an external event source is (re)started, so that a restarted child resumes from the position
        reached by the previous child rather than from the position restored at startup.
    */
    auto getCheckpointState() {
        AutoLock al(checkpoint_lock);
        return checkpoint_state;
    }

    #! Durably stores a checkpoint on behalf of the event function
    /** @param state the opaque state to store; the event function owns its shape

        @note called both directly (in-process event function) and from the event listener thread when the event
        function runs in a separate process

        @note the checkpoint lock is held across the host's callback so that the sequence number stays
        monotonic under concurrent stores; the callback must therefore not call back into this provider

        @throw any exception raised by the host's checkpoint callback, so that an event function awaiting
        \c checkpoint.set() learns that the position was not made durable
    */
    persistEventCheckpoint(auto state) {
        AutoLock al(checkpoint_lock);
        int next_seq = checkpoint_seq + 1;
        # persist before updating the in-memory state: a failed write must not look like a stored position
        persistCheckpoint({
            "version": 1,
            "seq": next_seq,
            "state": state,
        });
        checkpoint_state = state;
        checkpoint_seq = next_seq;
    }

    #! Returns the checkpoint API passed to an in-process event function as its fourth argument
    private hash<auto> getCheckpointApi() {
        return {
            "get": auto sub () {
                return getCheckpointState();
            },
            "set": sub (auto state) {
                # values arriving from JavaScript are wrapped; unwrap them before storing
                if (state instanceof JavaScriptObject) {
                    state = cast<JavaScriptObject>(state).toData();
                }
                persistEventCheckpoint(state);
            },
        };
    }

    #! to notify observers
    notify(hash<auto> event) {
        notifyObservers(event_id, event);
    }

    #! Called from the proxy event listener thread when the event thread terminates prematurely
    terminated() {
        info("Event thread terminated prematurely");
        # NOTE: terminated() is called from the proxy event listener thread
        stop(True);
    }

    private startEventThread(Counter c) {
        on_exit {
            m.lock();
            on_exit m.unlock();
            running = False;
            if (waiting) {
                cond.broadcast();
            }
            info("Terminated JavaScript I/O event thread");
        }
        running = True;
        # signal calling thread that we are running
        c.dec();
        try {
            *hash<DataContextInfo> ctx = getCallContextInfo(event_options);
            info("Running event function for @%s/%s: %s", event.app, event.action, event.key);
            getAsyncValue(event, ctx, sub (JavaScriptObject o) {
                auto event = o.toData();
                if (event.typeCode() != NT_HASH) {
                    throw "INVALID-EVENT-DATA", sprintf("Cannot raise event %y with type %y; must be a hash "
                        "(JavaScript object)", event_id, event.fullType());
                }
                notifyObservers(event_id, event);
            }, bool sub () {
                return stop_flag;
            }, getCheckpointApi());
            info("Event function for @%s/%s: %s returned", event.app, event.action, event.key);
        } catch (hash<ExceptionInfo> ex) {
            error("EVENT-THREAD-ERROR", "Exception in event thread: %s", get_exception_string(ex));
        }
    }

    stop(*bool in_listener) {
        m.lock();
        on_exit m.unlock();

        if (*JavaScriptProgramProxy proxy = remove self.proxy) {
            TSAI::server.releaseEventSource(proxy, self, event.key, in_listener);
            running = False;
            return;
        }

        if (running) {
            if (!stop_flag) {
                stop_flag = True;
            }
            while (running) {
                ++waiting;
                cond.wait(m);
                --waiting;
            }
        }
    }

    #! Start event listening
    private startEvent() {
        m.lock();
        on_exit m.unlock();

        if (TSAI::checkInProcessServer()) {
            # in-process pool uses the direct event thread path
            info("Starting in-process event thread for data provider %y for connection %y options %y", name,
                conn.name, event_options);
            running = True;
            on_error running = False;
            Counter c(1);
            int tid = background startEventThread(c);
            c.waitForZero();
            info("Started in-process event thread in TID %d", tid);
        } else if (TSAI::checkServer()) {
            info("Starting external process for data provider %y for connection %y options %y", name, conn.name,
                event_options);
            running = True;
            on_error running = False;
            proxy = TSAI::server.setupEventSource(self, event.app, event.action, event.key,
                getCallContextInfo(event_options));
        } else {
            info("Starting event thread for data provider %y for connection %y options %y", name, conn.name,
                event_options);
            Counter c(1);
            int tid = background startEventThread(c);
            c.waitForZero();
            info("Started event thread in TID %d", tid);
        }
    }

    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}
