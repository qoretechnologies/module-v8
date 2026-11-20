// Copyright (C) 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// A catalogue whose actions are files of their own (qoretechnologies/qore#6932): the probe attributes a builtin that a
// package of one action requires lazily to that action only

const plain = require("./actions/plain.action");
const lazy = require("./actions/lazy.action");

exports.actionsCatalogue = {
    registerAppActions: function(api) {
        api.registerApp({
            "name": "tenant-graph",
            "display_name": "Tenant Graph",
            "short_desc": "Tenant graph",
            "desc": "Tenant graph",
            "groups": ["Other"],
            "logo": "PHN2Zy8+",
            "logo_file_name": "test.svg",
            "logo_mime_type": "image/svg+xml",
        });
        api.registerAction(plain.definition);
        api.registerAction(lazy.definition);
    },
};
