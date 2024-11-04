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
    }

    #! Creates the object from the arguments
    constructor(string name, string event_id, hash<DataProviderMessageInfo> event_info, hash<AsyncCallInfo> event)
            : TypeScriptActionEventDataProviderBase(name, event_id, event_info) {
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
        info("Starting event thread for data provider %y for connection %y", name, conn.name);
        Counter c(1);
        int tid = background startEventThread(c);
        c.waitForZero();
        info("Started event thread in TID %d", tid);
    }

    #! Called to stop generating events
    /** Stops polling for new events
    */
    stopEvents() {
        stop();
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
        # event function signature:
        getAsyncValue(event, getCallContextInfo(), sub (JavaScriptObject o) {
            auto event = o.toData();
            if (event.typeCode() != NT_HASH) {
                throw "INVALID-EVENT-DATA", sprintf("Cannot raise event %y with type %y; must be a hash (JavaScript "
                    "object)", event_id, event.fullType());
            }
            notifyObservers(event_id, event);
        }, bool sub () {
            return stop_flag;
        });
    }

    stop() {
        m.lock();
        on_exit m.unlock();

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
