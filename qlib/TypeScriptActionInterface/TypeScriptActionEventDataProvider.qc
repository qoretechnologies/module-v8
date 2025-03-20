# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionEventDataProvider.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
public class TypeScriptActionEventDataProvider inherits TypeScriptActionEventDataProviderBase {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "type": "TypeScriptActionEventDataProvider",
            "supports_observable": True,
        };
    }

    private {
        hash<AsyncCallInfo> event;

        Mutex m();
        Condition cond();
        bool running;
        int waiting;

        #! stop flag
        bool stop_flag = False;

        #! For external processes
        JavaScriptProgramProxy proxy;

        #! Event options
        *hash<auto> event_options;
    }

    #! Creates the object from the arguments
    constructor(string name, string event_id, hash<DataProviderMessageInfo> event_info,
            *hash<AsyncCallInfo> get_example_event_data, *hash<AsyncCallInfo> get_dynamic_type,
            ActionFunctionContext fctx, hash<AsyncCallInfo> event)
            : TypeScriptActionEventDataProviderBase(name, event_id, event_info, get_example_event_data,
                get_dynamic_type, fctx) {
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

        event_options = ImpliedArgumentHelper::get();
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

    #! to notify observers
    notify(hash<auto> event) {
        notifyObservers(event_id, event);
    }

    #! Called when the event thread terminates prematurely
    terminated() {
        info("Event thread terminated prematurely");
        # NOTE: terminted() is called from the event listener thread
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
            });
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
        if (TSAI::checkServer()) {
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
