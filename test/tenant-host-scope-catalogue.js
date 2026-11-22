// Copyright (C) 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// A catalogue whose code keeps the interface that it registers its apps with (qoretechnologies/qore#7185): in a
// tenant's program, the interface registers only while the program is built, so a later call is refused

let kept = null;

exports.actionsCatalogue = {
    registerAppActions: function(api) {
        kept = api;
        api.registerApp({
            "name": "tenant-scope",
            "display_name": "Tenant Scope",
            "short_desc": "Tenant scope",
            "desc": "Tenant scope",
            "groups": ["Other"],
            "logo": "PHN2Zy8+",
            "logo_file_name": "test.svg",
            "logo_mime_type": "image/svg+xml",
        });
        // an error with a second line and a long text, which the host's log must not get as it is
        api.registerAction({
            "app": "tenant-scope",
            "action": "throw-lines",
            "display_name": "throw-lines",
            "short_desc": "throw-lines",
            "desc": "throw-lines",
            "action_code": 2,
            "api_function": async () => { throw new Error("tenant-line-1\ninjected-line-2 " + "x".repeat(3000)); },
        });
        // registers an app identity with the interface kept from the registration
        api.registerAction({
            "app": "tenant-scope",
            "action": "late-register",
            "display_name": "late-register",
            "short_desc": "late-register",
            "desc": "late-register",
            "action_code": 2,
            "api_function": async () => {
                try {
                    kept.registerDiscoveryInventory([{"app": "tenant-scope-late"}]);
                    return {"result": "registered"};
                } catch (e) {
                    return {"result": "refused", "message": String(e && e.message ? e.message : e)};
                }
            },
        });
    },
};
