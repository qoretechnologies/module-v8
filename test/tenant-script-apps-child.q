#!/usr/bin/env qore
# -*- mode: qore; indent-tabs-mode: nil -*-
# Copyright (C) 2026 Qore Technologies, s.r.o.
# the child of tenant-script-apps.qtest: started with QORE_TYPESCRIPT_ACTION_SCRIPTS; prints the results as JSON

%modern
%no-child-restrictions

%requires v8
%requires TypeScriptActionInterface
%requires json

const TenantSource = "%modern
%requires TypeScriptActionInterface
hash<auto> sub run(string app, string action, auto req) {
    try {
        return {\"result\": TypeScriptActionInterface::TenantActionRunner::exec(<TypeScriptActionInterface::TsTenantContext>{\"tenant\": \"s\", \"conn_opts\": {\"url\": \"https://script.example.com\"}}, app, action, req)};
    } catch (hash<ExceptionInfo> ex) {
        return {\"err\": ex.err, \"desc\": ex.desc};
    }
}
";

Program p(PO_NEW_STYLE | PO_NO_CHILD_PO_RESTRICTIONS);
p.parse(TenantSource, "tenant");
p.setSandboxManager(new SandboxManager());
hash<auto> rv = {
    "echo": p.callFunction("run", "tenant-test", "echo", {"x": 1}),
    "create": p.callFunction("run", "tenant-records", "create", {"table": "items", "records": {"id": 1, "name": "a"}}),
    "search": p.callFunction("run", "tenant-records", "search", {"table": "items"}),
};
printf("%s\n", make_json(rv));
