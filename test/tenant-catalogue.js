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

// where a function runs: a restricted program refuses child_process, the full runtime of the catalogue does not
const where = () => {
    try {
        require('child_process');
        return 'full';
    } catch (e) {
        return 'restricted';
    }
};

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
        api.registerAction(action("post-url", async (obj) => { const r = await fetch(obj.url, {"method": "POST", "body": obj.body}); return {"status": r.status, "body": await r.text()}; }));
        api.registerAction(action("axios-url", async (obj) => { if (!axios) { return {"skip": true}; } const r = await axios.get(obj.url, {"responseType": "text"}); return {"status": r.status, "body": r.data}; }));
        // a builtin that tenants do not get
        api.registerAction(action("need-vm", async () => { require('vm'); return {}; }));
        // a builtin of the load phase, refused once the program is sealed
        api.registerAction(action("need-fs", async () => { require('fs').readFileSync('/etc/hostname'); return {}; }));
        // runs forever
        api.registerAction(action("spin", async () => { for (;;) {} }));
        // an error whose stack must not reach the caller
        api.registerAction(action("throw", async (obj, opts, ctx) => { throw new Error('boom'); }));

        // a record-based app: the table "items" is kept in the program's globals, so each tenant has its own
        const items = () => (globalThis.__items = globalThis.__items || []);
        const checkTable = (opts) => { if (opts.table !== 'items') { throw new Error('unknown table ' + opts.table); } };
        // the search expressions of the app: "&&" and "=="
        const argValue = (a, r) => (a && a.field !== undefined) ? r[a.field] : (a ? a.value : undefined);
        const matches = (exp, r) => {
            if (!exp) { return true; }
            if (exp.exp === '&&') { return exp.args.every((e) => matches(e, r)); }
            if (exp.exp === '==') { return argValue(exp.args[0], r) == argValue(exp.args[1], r); }
            throw new Error('unknown expression ' + exp.exp);
        };
        const opDef = (name, args, varargs) => ({
            "type": "operator", "subtype": "logic-operator", "name": name, "display_name": name, "short_desc": name,
            "desc": name, "symbol": name, "roles": ["search"], "args": args, "varargs": varargs, "return_type": "bool",
        });
        const recordFns = {
            "get_table_list": async (ctx) => ["items"],
            "get_record_type": async (ctx, table) => ({
                "type": "hash",
                "fields": {
                    "id": {"type": "int", "display_name": "ID", "short_desc": "ID", "desc": "ID", "example_value": 1, "required": true},
                    "name": {"type": "string", "display_name": "Name", "short_desc": "Name", "desc": "Name", "example_value": "a", "required": true},
                    "url": {"type": "*string", "display_name": "URL", "short_desc": "URL", "desc": "the connection URL of the tenant", "example_value": "x", "required": false},
                },
            }),
            "expressions": {
                "&&": opDef("&&", [{"type_code": "any", "type": "bool"}], true),
                "==": opDef("==", [{"type_code": "any", "type": "any"}, {"type_code": "any", "type": "any"}], false),
            },
            "search_records": async (ctx, where, opts) => {
                checkTable(opts);
                let done = false;
                const found = items().filter((r) => matches(where, r));
                return (ctx2, block_size) => {
                    if (done || !found.length) { return; }
                    done = true;
                    return {
                        "id": found.map((r) => r.id),
                        "name": found.map((r) => r.name),
                        "url": found.map((r) => ctx && ctx.conn_opts ? ctx.conn_opts.url : null),
                    };
                };
            },
            "create_records": async (ctx, recs, opts) => {
                checkTable(opts);
                for (let i = 0; i < recs.id.length; ++i) { items().push({"id": recs.id[i], "name": recs.name[i]}); }
            },
            "update_records": async (ctx, set, where, opts) => {
                checkTable(opts);
                items().forEach((r) => Object.assign(r, set));
                return items().length;
            },
            "upsert_records": async (ctx, recs, opts) => {
                checkTable(opts);
                const rv = [];
                for (let i = 0; i < recs.id.length; ++i) {
                    const r = items().find((x) => x.id === recs.id[i]);
                    if (r) { r.name = recs.name[i]; rv.push('updated'); } else { items().push({"id": recs.id[i], "name": recs.name[i]}); rv.push('inserted'); }
                }
                return rv;
            },
            "delete_records": async (ctx, where, opts) => {
                checkTable(opts);
                const n = items().length;
                globalThis.__items = [];
                return n;
            },
        };
        api.registerApp({
            "name": "tenant-records",
            "display_name": "Tenant Records",
            "short_desc": "Tenant records",
            "desc": "Tenant records",
            "groups": ["Other"],
            "logo": "PHN2Zy8+",
            "logo_file_name": "test.svg",
            "logo_mime_type": "image/svg+xml",
            ...recordFns,
        });

        // an app with a connection: each kind of call that a data provider or a connection makes for its caller
        const opt = (name, extra) => Object.assign({"type": "string", "display_name": name, "short_desc": name, "desc": name}, extra);
        api.registerApp({
            "name": "tenant-conn",
            "display_name": "Tenant Connection",
            "short_desc": "Tenant connection",
            "desc": "Tenant connection",
            "groups": ["Other"],
            "logo": "PHN2Zy8+",
            "logo_file_name": "test.svg",
            "logo_mime_type": "image/svg+xml",
            "rest": {
                "data": "json",
                "url": "tsrest-tenant-conn://conn.example.com",
            },
            "rest_modifiers": {
                "options": {
                    "marker": opt("marker", {}),
                },
                // the OAuth hook
                "set_options_post_auth": async (ctx) => ({"marker": where()}),
            },
            ...recordFns,
        });
        api.registerAction({
            "app": "tenant-conn",
            "action": "info",
            "display_name": "info",
            "short_desc": "info",
            "desc": "info",
            "action_code": 2,
            "api_function": async (obj, opts, ctx) => ({"where": where(), "url": ctx && ctx.conn_opts ? ctx.conn_opts.url : null}),
            "options": {
                // an allowed value
                "choice": opt("choice", {"get_allowed_values": async (ctx) => [{"display_name": "w", "short_desc": "w", "desc": "w", "value": where()}]}),
                // a dependent option
                "key": opt("key", {
                    "allowed_values": [{"display_name": "A", "short_desc": "A", "desc": "A", "value": "A"}],
                    "get_dependent_options": async (ctx) => ({["dep_" + where()]: opt("dep", {})}),
                }),
                // a dynamic type
                "dyn": {"type": "hash", "display_name": "dyn", "short_desc": "dyn", "desc": "dyn",
                    "get_dynamic_type": async (ctx) => ({"type": "hash", "fields": {["f_" + where()]: opt("f", {})}})},
            },
        });
        // a request for the connection's caller (trusted code's tenant calls: TenantActionRunner::dispatchTrusted())
        api.registerAction({
            "app": "tenant-conn",
            "action": "fetch",
            "display_name": "fetch",
            "short_desc": "fetch",
            "desc": "fetch",
            "action_code": 2,
            "api_function": async (obj, opts) => { const r = await fetch((obj && obj.url) || opts.url); return {"status": r.status}; },
            "options": {"url": opt("url", {})},
        });
        // event actions: each runs until it is stopped
        const eventAction = (name, fn) => ({
            "app": "tenant-test",
            "action": name,
            "display_name": name,
            "short_desc": name,
            "desc": name,
            "action_code": 1,
            "event_function": fn,
            "event_info": {"desc": name, "type": {"type": "hash", "fields": {"n": {"type": "int", "display_name": "n", "short_desc": "n", "desc": "n"}}}},
        });
        // waits until the source is stopped, without running JavaScript in the meantime
        const idle = async (isStopped) => { while (!isStopped()) { await new Promise((r) => setTimeout(r, 10)); } };
        // emits opts.count events from the stored checkpoint on, and sets the checkpoint after each
        api.registerAction(eventAction("ticks", async (ctx, emit, isStopped, checkpoint) => {
            let n = checkpoint.get() || 0;
            const end = n + ctx.opts.count;
            for (; n < end && !isStopped(); ) {
                emit({"n": n, "where": where()});
                checkpoint.set(++n);
            }
            await idle(isStopped);
        }));
        // never cooperates
        api.registerAction(eventAction("spin-events", async (ctx, emit) => { emit({"n": 0}); for (;;) {} }));
        // waits in a request of the bridge that is never answered
        api.registerAction(eventAction("blocked-events", async (ctx, emit) => { emit({"n": 0}); await fetch(ctx.opts.url); }));
        // keeps growing its live data
        api.registerAction(eventAction("hog-events", async (ctx, emit) => { emit({"n": 0}); const a = []; for (;;) { a.push(new Array(100000).fill(1)); } }));
        // fails after one event
        api.registerAction(eventAction("throw-events", async (ctx, emit) => { emit({"n": 0}); throw new Error('ev-boom'); }));

        // a response with a connection update (refreshed token fields)
        api.registerAction({
            "app": "tenant-conn",
            "action": "refresh",
            "display_name": "refresh",
            "short_desc": "refresh",
            "desc": "refresh",
            "action_code": 2,
            "api_function": async (obj, opts, ctx) => ({"ok": true, "connection_update": {"token": "new-" + where()}}),
        });
    },
};
