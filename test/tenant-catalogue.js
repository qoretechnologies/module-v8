// Copyright (C) 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// A catalogue of a test app for TenantActionRunner (qoretechnologies/qore#6845): each action checks one rule of the
// restricted programs that tenants' calls run in

let axios = null;
try {
    // required while the program loads, as apps do; optional for the test
    axios = require('axios');
} catch (e) {
}

const action = (name, fn) => ({
    "app": "tenant-test",
    "action": name,
    "display_name": name,
    "short_desc": name,
    "desc": name,
    "action_code": 2,
    "api_function": fn,
});

exports.actionsCatalogue = {
    registerAppActions: function(api) {
        api.registerApp({
            "name": "tenant-test",
            "display_name": "Tenant Test",
            "short_desc": "Tenant test",
            "desc": "Tenant test",
            "groups": ["Other"],
            "logo": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDUyIDYzIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtMTYuNjUsLTIzLjAxNzIpIj4KICAgICAgICA8cGF0aCBkPSJNNjguMzYzLDYzLjk3M0w2OC4zNjMsNDAuMTA5QzY4LjM2Myw0MC4xMDkgNjguMzYzLDM3LjExMyA2NS43NjgsMzUuNjE1TDQ1LjEwMiwyMy42ODNDNDUuMTAyLDIzLjY4MyA0Mi41MDcsMjIuMTg1IDM5LjkxMiwyMy42ODNMMTkuMjQ1LDM1LjYxNUMxOS4yNDUsMzUuNjE1IDE2LjY1LDM3LjExMyAxNi42NSw0MC4xMDlMMTYuNjUsNjMuOTczQzE2LjY1LDYzLjk3MyAxNi42NSw2Ni45NjkgMTkuMjQ1LDY4LjQ2N0w0Ny44MzksODQuODIyQzQ3LjgzOSw4NC44MjIgNTAuNDM0LDg2LjM2OCA1My4wMjksODQuODdMNjQuNjUyLDc4LjExMkw0Mi41Miw2NS41MDNMNDIuNTA3LDY1LjUxMUwzMC44NDMsNTguNzc2TDMwLjg0Myw0NS4zMDdMNDIuNTA3LDM4LjU3M0w1NC4xNzEsNDUuMzA3TDU0LjE3MSw1OC43NzZMNDUuMjEzLDYzLjk0OEw1OS41NjUsNzIuMDVMNjUuNzY4LDY4LjQ2OUM2NS43NjksNjguNDY4IDY4LjM2Myw2Ni45NyA2OC4zNjMsNjMuOTczIiBzdHlsZT0iZmlsbDpyZ2IoNjQsNjQsNjQpO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgPC9nPgo8L3N2Zz4K",
            "logo_file_name": "test.svg",
            "logo_mime_type": "image/svg+xml",
        });
        // echoes the request and the url of the connection
        api.registerAction(action("echo", async (obj, opts, ctx) => ({"req": obj, "url": ctx && ctx.conn_opts ? ctx.conn_opts.url : null})));
        // a global of the program: another tenant's program does not have it
        api.registerAction(action("set-global", async (obj) => { globalThis.__tenantValue = obj.v; return {"v": globalThis.__tenantValue}; }));
        api.registerAction(action("get-global", async () => ({"v": globalThis.__tenantValue === undefined ? null : globalThis.__tenantValue})));
        // network requests through the bridge
        api.registerAction(action("fetch-url", async (obj) => { const r = await fetch(obj.url); return {"status": r.status, "body": await r.text()}; }));
        api.registerAction(action("axios-url", async (obj) => { if (!axios) { return {"skip": true}; } const r = await axios.get(obj.url, {"responseType": "text"}); return {"status": r.status, "body": r.data}; }));
        // a builtin that tenants do not get
        api.registerAction(action("need-vm", async () => { require('vm'); return {}; }));
        // a builtin of the load phase, refused once the program is sealed
        api.registerAction(action("need-fs", async () => { require('fs').readFileSync('/etc/hostname'); return {}; }));
        // runs forever
        api.registerAction(action("spin", async () => { for (;;) {} }));
        // an error whose stack must not reach the caller
        api.registerAction(action("throw", async (obj, opts, ctx) => { throw new Error('boom'); }));
    },
};
