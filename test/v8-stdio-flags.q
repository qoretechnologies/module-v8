#!/usr/bin/env qore
# -*- mode: qore; indent-tabs-mode: nil -*-
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT

# The child process of the stdio file description tests in v8-stdio-inheritance.qtest.
#
# usage: qore v8-stdio-flags.q SIZE
#
# Reports whether the open file descriptions of its stdout and stderr are non-blocking (O_NONBLOCK) before and after
# a JavaScript program writes to process.stdout and process.stderr: a python3 grandchild inherits the descriptions
# and prints "<when> <fd 1 non-blocking> <fd 2 non-blocking>".  The program writes a line to each stream, a line with
# console.log() and console.error(), and SIZE bytes followed by a newline to process.stdout.

%modern
%requires v8

sub flags(string when) {
    system('python3 -I -c "import fcntl, os, sys; print(sys.argv[1], *[fcntl.fcntl(fd, fcntl.F_GETFL) & os.O_NONBLOCK '
        '!= 0 for fd in (1, 2)], flush=True)" ' + when);
}

int size = ARGV[0].toInt();
flags("before");
JavaScriptProgram js(sprintf('const nl = String.fromCharCode(10);
process.stdout.write("js-stdout" + nl);
process.stderr.write("js-stderr" + nl);
console.log("js-console-log");
console.error("js-console-error");
process.stdout.write("x".repeat(%d) + nl);
', size), "stdio-write.js");
flags("after");
