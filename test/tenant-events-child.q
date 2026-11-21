#!/usr/bin/env qore
# -*- mode: qore; indent-tabs-mode: nil -*-
# Copyright (C) 2026 Qore Technologies, s.r.o.
# the child of tenant-events.qtest: starts event sources and ends normally; the module's unload stops them

%modern
%no-child-restrictions

%requires v8
%requires TypeScriptActionInterface

string script = get_script_dir() + "/tenant-catalogue.js";
JavaScriptProgramPool pool("var exports = {};\n" + ReadOnlyFile::readTextFile(script), script, sub (V8::JavaScriptProgram pgm) {
    pgm.getGlobal().exports.actionsCatalogue.registerAppActions(TypeScriptActionInterface::Api);
});
TenantActionRunner::setCatalogue(script, (get_script_dir(),), pool);
hash<TsTenantContext> ctx = <TsTenantContext>{"tenant": "u"};
string a = TenantActionRunner::startEvents(ctx, "tenant-test", "ticks", {"count": 0});
string b = TenantActionRunner::startEvents(ctx, "tenant-test", "spin-events");
# the spinning function has emitted its event: it runs
TenantActionRunner::pollEvents(ctx, b, 1, 5m);
printf("started 2\n");
