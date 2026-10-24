#!/usr/bin/env qore
# -*- mode: qore; indent-tabs-mode: nil -*-
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT

# The child process of the terminal test in v8-stdio-inheritance.qtest, run on a pty by v8-stdio-pty.py.
#
# A JavaScript program reports the terminal members of process.stdout, process.stderr and process.stdin on a "ready"
# line, then reads one line from process.stdin and pauses; the script prints it as "stdin-got <line>".

%modern
%requires v8

JavaScriptProgram js('const out = process.stdout;
out.write("ready isTTY=" + out.isTTY + " columns=" + out.columns + " rows=" + out.rows
    + " size=" + JSON.stringify(out.getWindowSize()) + " depth=" + out.getColorDepth({TERM: "xterm-256color"})
    + " stderr=" + process.stderr.isTTY + "/" + process.stderr.columns + " stdin=" + process.stdin.isTTY
    + String.fromCharCode(10));
globalThis.line = new Promise((resolve) => process.stdin.once("data", (data) => {
    process.stdin.pause();
    resolve(data.toString().trim());
}));
', "tty.js");
JavaScriptPromise line = js.getGlobal().line;
line.wait();
printf("stdin-got %s\n", line.getResult());
