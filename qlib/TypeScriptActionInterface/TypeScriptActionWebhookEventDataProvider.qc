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
        *string webhook_event_loc;
        *string webhook_echo_header;
        *softlist<string> webhook_echo_body_keys;
        *string webhook_confirmation_key_loc;
        auto webhook_confirmation_value;
        *string webhook_confirmation_url_loc;
        *string webhook_confirmation_method;
        *string webhook_assume_json;
        #! Optional async function to transform or filter webhook event data
        *hash<AsyncCallInfo> format_event_data;

        #! Event options for the webhook register and deregister calls
        *hash<auto> event_opts;

        #! Any value returned by the webhook registration function
        *hash<auto> reginfo;

        #! Did the JS webhook registration function succeed?
        bool js_webhook_registered;

        #! The info hash returned after registering the webhook
        hash<auto> wf_info;
    }

    #! Creates the object from the arguments
    constructor(string name, string event_id, hash<DataProviderMessageInfo> event,
            *hash<AsyncCallInfo> get_example_event_data, *hash<AsyncCallInfo> get_dynamic_type,
            ActionFunctionContext fctx, string method, hash<AsyncCallInfo> webhook_register,
            hash<AsyncCallInfo> webhook_deregister, *int webhook_auth,
            *list<auto> webhook_perms, *string webhook_event_loc, *string webhook_echo_header,
            *softlist<string> webhook_echo_body_keys, *string webhook_confirmation_key_loc,
            auto webhook_confirmation_value, *string webhook_confirmation_url_loc,
            *string webhook_confirmation_method, *string webhook_assume_json,
            *hash<AsyncCallInfo> format_event_data)
            : TypeScriptActionEventDataProviderBase(name, event_id, event, get_example_event_data, get_dynamic_type,
                fctx) {
        self.method = method;
        self.webhook_register = webhook_register;
        self.webhook_deregister = webhook_deregister;
        self.webhook_auth = webhook_auth;
        self.webhook_event_loc = webhook_event_loc;
        self.webhook_echo_header = webhook_echo_header;
        self.webhook_echo_body_keys = webhook_echo_body_keys;
        self.webhook_confirmation_key_loc = webhook_confirmation_key_loc;
        self.webhook_confirmation_value = webhook_confirmation_value;
        self.webhook_confirmation_url_loc = webhook_confirmation_url_loc;
        self.webhook_confirmation_method = webhook_confirmation_method;
        self.webhook_assume_json = webhook_assume_json;
        self.format_event_data = format_event_data;
    }

    destructor() {
        stop();
    }

    #! Called when all observers have been added to the object
    /** This method is meant to trigger event generation
    */
    observersReady() {
        # register webhook
        wf_info = TypeScriptActionInterface::createWebhook({
            "method": method,
            "auth": webhook_auth,
            "perms": webhook_perms,
            "event_loc": webhook_event_loc,
            "echo_header": webhook_echo_header,
            "echo_body_keys": webhook_echo_body_keys,
            "confirmation_key_loc": webhook_confirmation_key_loc,
            "confirmation_value": webhook_confirmation_value,
            "confirmation_url_loc": webhook_confirmation_url_loc,
            "confirmation_method": webhook_confirmation_method,
            "assume_json": webhook_assume_json,
            "callback": \callback(),
        });
        info("Registered webhook with URL %y", wf_info.url);

        event_opts += DataProviderDataContextHelper::getHash();
        debug("Registering webhook for data provider %y URL %y opts %y", name, wf_info.url, event_opts);
        on_error rethrow $1.err, sprintf("%s (while registering webhook URL %y with the server; options: %y)",
            $1.desc, wf_info.url, event_opts);
        reginfo = getAsyncValue(webhook_register, getCallContextInfo(event_opts), wf_info.url);
        js_webhook_registered = True;
        debug("Webhook for data provider %y registered with URL %y (opts: %y, reginfo: %y)", name, wf_info.url,
            LoggerUtil::getArgSummary(event_opts), LoggerUtil::getArgSummary(reginfo));
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
                debug("Deregistering webhook for data provider %y on URL %y (opts: %y, reginfo: %y)", name,
                    wf_info.url, LoggerUtil::getArgSummary(event_opts), LoggerUtil::getArgSummary(reginfo));
                getAsyncValue(webhook_deregister, getCallContextInfo(event_opts), wf_info.url, reginfo);
            } catch (hash<ExceptionInfo> ex) {
                error("WEBHOOK-DEREGISTRATION-ERROR", "Error in data provider %y deregistering webhook %y: %s", name,
                    wf_info.url, get_exception_string(ex));
            }
        }
        if (wf_info) {
            TypeScriptActionInterface::deleteWebhook(remove wf_info);
        }
    }

    private callback(*hash<auto> event) {
        if (format_event_data) {
            # Call format_event_data with context and event data
            auto formatted = getAsyncValue(format_event_data, getCallContextInfo(event_opts), event);
            # null/undefined means skip this event
            if (!exists formatted) {
                debug("Event skipped by format_event_data for provider %y", name);
                return;
            }
            if (formatted.typeCode() != NT_HASH) {
                throw "FORMAT-EVENT-DATA-ERROR", sprintf("format_event_data must return a hash or null/undefined; "
                    "got %y", formatted.fullType());
            }
            event = formatted;
        }
        notifyObservers(event_id, event ?? {});
    }

    private hash<DataProviderInfo> getStaticInfoImpl() {
        return ProviderInfo;
    }
}
}
