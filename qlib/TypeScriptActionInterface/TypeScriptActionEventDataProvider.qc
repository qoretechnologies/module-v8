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
    }

    #! Creates the object from the arguments
    constructor(string name, string event_id, hash<DataProviderMessageInfo> event_info,
            *hash<AsyncCallInfo> get_example_event_data, ActionFunctionContext fctx, hash<AsyncCallInfo> event)
            : TypeScriptActionEventDataProviderBase(name, event_id, event_info, get_example_event_data, fctx) {
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

        *hash<auto> options = ImpliedArgumentHelper::get();
        if (TSAI::checkServer()) {
            info("Starting external process for data provider %y for connection %y options %y", name, conn.name,
                options);
            proxy = TSAI::server.setupEventSource(self, event.app, event.action, event.key, options);
        } else {
            info("Starting event thread for data provider %y for connection %y options %y", name, conn.name, options);
            Counter c(1);
            int tid = background startEventThread(c, options);
            c.waitForZero();
            info("Started event thread in TID %d", tid);
        }
    }

    #! Called to stop generating events
    /** Stops polling for new events
    */
    stopEvents() {
        stop();
    }

    #! Is this object still generating events
    bool isActive() {
        return running;
    }

    #! to notify observers
    notify(hash<auto> event) {
        notifyObservers(event_id, event);
    }

    private startEventThread(Counter c, *hash<auto> options) {
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
            # event function signature:
            getAsyncValue(event, getCallContextInfo(options), sub (JavaScriptObject o) {
                auto event = o.toData();
                if (event.typeCode() != NT_HASH) {
                    throw "INVALID-EVENT-DATA", sprintf("Cannot raise event %y with type %y; must be a hash (JavaScript "
                        "object)", event_id, event.fullType());
                }
                notifyObservers(event_id, event);
            }, bool sub () {
                return stop_flag;
            });
        } catch (hash<ExceptionInfo> ex) {
            error("EVENT-THREAD-ERROR", "Exception in event thread: %s", get_exception_string(ex));
        }
    }

    stop() {
        m.lock();
        on_exit m.unlock();

        if (*JavaScriptProgramProxy proxy = remove self.proxy) {
            TSAI::server.releaseEventSource(proxy, self, event.key);
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

    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}
