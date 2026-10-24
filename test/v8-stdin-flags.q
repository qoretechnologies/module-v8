#!/usr/bin/env qore
# -*- mode: qore; indent-tabs-mode: nil -*-
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT

# The child process of the stdin test in v8-stdio-inheritance.qtest.
#
# usage: qore v8-stdin-flags.q [once] < INPUT
#
# Reports whether the open file description of its stdin is non-blocking (O_NONBLOCK) before and after a JavaScript
# program reads all of process.stdin: a python3 grandchild inherits the description and prints
# "<when> <fd 0 non-blocking>".  Between them it prints the number of bytes that the program read and their SHA-256.
#
# With "once", the program reads one chunk and pauses the stream, and the script prints "once <chunk>" instead of the
# size and the digest: a consumer that pauses must not be left waiting for more input.

%modern
%requires v8

sub flags(string when) {
    system('python3 -I -c "import fcntl, os, sys; print(sys.argv[1], fcntl.fcntl(0, fcntl.F_GETFL) & os.O_NONBLOCK '
        '!= 0, flush=True)" ' + when);
}

flags("before");
string source = ARGV[0] == "once"
    ? 'process.stdin.once("data", (chunk) => {
    globalThis.result = "once " + chunk.toString().trim();
    process.stdin.pause();
});
'
    : 'const chunks = [];
process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", () => {
    const data = Buffer.concat(chunks);
    globalThis.result = data.length + " " + require("crypto").createHash("sha256").update(data).digest("hex");
});
';
JavaScriptProgram js(source, "stdin-read.js");
js.spinEventLoop();
printf("%s\n", js.getGlobal().result);
flags("after");
