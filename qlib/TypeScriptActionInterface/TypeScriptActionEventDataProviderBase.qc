# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionEventDataProviderBase.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
public class TypeScriptActionEventDataProviderBase inherits TypeScriptActionDataProviderBase,
        DataProvider::DelayedObservable {
    private {
        string event_id;
        hash<DataProviderMessageInfo> event_info;
        *hash<AsyncCallInfo> get_example_event_data;
    }

    #! Creates the object from the arguments
    constructor(string name, string event_id, hash<DataProviderMessageInfo> event_info,
            *hash<AsyncCallInfo> get_example_event_data, ActionFunctionContext fctx)
            : TypeScriptActionDataProviderBase(name, fctx) {
        self.event_id = event_id;
        self.event_info = event_info;
        self.get_example_event_data = get_example_event_data;
    }

    #! Returns a hash of all supported event types
    /** @return a hash of all supported event types

        @note only called if the provider supports the observer pattern / event API
    */
    private hash<string, hash<DataProviderMessageInfo>> getEventTypesImpl() {
        return {
            event_id: event_info,
        };
    }

    #! Returns example data for the given observable event
    /** @param id the event ID of the event

        @return example data for the given observable event

        @throw INVALID-EVENT the event_id is not valid
    */
    private auto getExampleEventDataImpl(string id) {
        if (!get_example_event_data) {
            return TypeScriptActionDataProviderBase::getExampleEventDataImpl(id);
        }
        if (id != event_id) {
            throw "INVALID-EVENT", sprintf("Event ID %y is unknown; expecting %y", id, event_id);
        }
        *hash<auto> options = ImpliedArgumentHelper::get();
        *hash<DataContextInfo> arg = getCallContextInfo(options);
        return getAsyncValue(get_example_event_data, arg);
    }
}
}
