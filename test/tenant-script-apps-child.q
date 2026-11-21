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
        return {\"err\": ex.err, \"desc\": ex.desc, \"arg\": ex.arg};
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
# the host probes the apps when it builds its catalogue
# the plain action of tenant-graph runs before the probe, which then refuses the lazy one
rv.graph_plain_before = p.callFunction("run", "tenant-graph", "plain", NOTHING);
rv.probe = TenantActionRunner::probeApps(("tenant-test", "tenant-vm-app", "tenant-graph"));
rv.graph_plain = p.callFunction("run", "tenant-graph", "plain", NOTHING);
rv.graph_lazy = p.callFunction("run", "tenant-graph", "lazy", NOTHING);
rv.graph_lazy_info = TypeScriptActionInterface::TenantActionRunner::getActionInfo(<TsTenantContext>{"tenant": "s"}, "tenant-graph", "lazy"){"tenant_available", "tenant_unsupported_builtin", "tenant_unsupported_package"};
rv.graph_plain_info = {"tenant_available": TypeScriptActionInterface::TenantActionRunner::getActionInfo(<TsTenantContext>{"tenant": "s"}, "tenant-graph", "plain").tenant_available};
rv.vm_info = TypeScriptActionInterface::TenantActionRunner::getActionInfo(<TsTenantContext>{"tenant": "s"}, "tenant-vm-app", "run"){"tenant_available", "tenant_unsupported_builtin"};
printf("%s\n", make_json(rv));
