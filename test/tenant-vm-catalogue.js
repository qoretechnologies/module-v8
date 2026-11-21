// Copyright (C) 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// A catalogue of an app that needs a builtin that tenants do not get while it loads (qoretechnologies/qore#6845)

const vm = require('vm');

exports.actionsCatalogue = {
    registerAppActions: function(api) {
        api.registerApp({
            "name": "tenant-vm-app",
            "display_name": "Tenant VM App",
            "short_desc": "Tenant VM app",
            "desc": "Tenant VM app",
            "groups": ["Other"],
            "logo": "PHN2Zy8+",
            "logo_file_name": "test.svg",
            "logo_mime_type": "image/svg+xml",
        });
        api.registerAction({
            "app": "tenant-vm-app",
            "action": "run",
            "display_name": "run",
            "short_desc": "run",
            "desc": "run",
            "action_code": 2,
            "api_function": async () => ({"ok": typeof vm.runInNewContext}),
        });
    },
};
