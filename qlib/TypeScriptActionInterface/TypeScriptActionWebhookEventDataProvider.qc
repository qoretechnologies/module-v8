# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionWebhookEventDataProvider.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
#! The action webhook event data provider
public class TypeScriptActionWebhookEventDataProvider inherits TypeScriptActionEventDataProviderBase {
    public {
        #! Provider info
        const ProviderInfo = <DataProviderInfo>{
            "type": "TypeScriptActionWebhookEventDataProvider",
            "supports_observable": True,
        };
    }

    private {
        string method;
        hash<AsyncCallInfo> webhook_register;
        hash<AsyncCallInfo> webhook_deregister;
        *int webhook_auth;
        *list<auto> webhook_perms;

        #! Any value returned by webhook_register()
        *hash<auto> reginfo;

        #! Did the JS webhook registration function succeed?
        bool js_webhook_registered;

        #! The URL returned after registering the webhook
        string url;
    }

    #! Creates the object from the arguments
    constructor(string name, string event_id, hash<DataProviderMessageInfo> event,
            *hash<AsyncCallInfo> get_example_event_data, *hash<string, hash<AsyncCallInfo>> omap,
            *hash<string, hash<RestGetAllowedValuesInfo>> romap,
            *hash<string, hash<AsyncCallInfo>> dvmap, string method, hash<AsyncCallInfo> webhook_register,
            hash<AsyncCallInfo> webhook_deregister, *int webhook_auth, *list<auto> webhook_perms)
            : TypeScriptActionEventDataProviderBase(name, event_id, event, get_example_event_data, omap, romap,
                dvmap) {
        self.method = method;
        self.webhook_register = webhook_register;
        self.webhook_deregister = webhook_deregister;
    }

    destructor() {
        stop();
    }

    #! Called when all observers have been added to the object
    /** This method is meant to trigger event generation
    */
    observersReady() {
        # register webhook
        url = TypeScriptActionInterface::createWebhook({
            "method": method,
            "auth": webhook_auth,
            "perms": webhook_perms,
            "callback": \callback(),
        });
        info("Registered webhook with URL %y", url);

        debug("Registering webhook for data provider %y URL %y", name, url);
        reginfo = getAsyncValue(webhook_register, getCallContextInfo(ImpliedArgumentHelper::get()), url);
        js_webhook_registered = True;
        debug("Webhook for data provider %y registered with URL %y (reginfo: %y)", name, url, reginfo);
    }

    #! Called to stop generating events
    /** Stops polling for new events
    */
    stopEvents() {
        stop();
    }

    private stop() {
        if (js_webhook_registered) {
            js_webhook_registered = False;
            try {
                getAsyncValue(webhook_deregister, getCallContextInfo(), url, reginfo);
            } catch (hash<ExceptionInfo> ex) {
                error("WEBHOOK-DEREGISTRATION-ERROR", "Error in data provider %y deregistering webhook %y: %s", name,
                    url, get_exception_string(ex));
            }
        }
        if (url) {
            TypeScriptActionInterface::deleteWebhook(remove url);
        }
    }

    private callback(*hash<auto> event) {
        notifyObservers(event_id, event);
    }

    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}
