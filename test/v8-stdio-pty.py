# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
#
# Runs a command on a new pty for v8-stdio-inheritance.qtest.
#
# usage: python3 -I v8-stdio-pty.py COLUMNS ROWS COMMAND...
#
# The pty has the given window size.  When the command has printed a line starting with "ready", the script records
# whether the process catches SIGWINCH (from /proc/PID/status on Linux; "n/a" elsewhere), types "hello" and a newline,
# and reads the rest of the output until the command ends.  It prints the command's output lines (including the echo
# of what was typed), then "sigwinch-caught True|False|n/a" and "exit STATUS".

import fcntl
import os
import pty
import signal
import struct
import sys
import termios

columns, rows = int(sys.argv[1]), int(sys.argv[2])
command = sys.argv[3:]

pid, master = pty.fork()
if pid == 0:
    fcntl.ioctl(0, termios.TIOCSWINSZ, struct.pack("HHHH", rows, columns, 0, 0))
    os.execvp(command[0], command)

output = b""


def read_more():
    """Reads what the command wrote; returns False at the end of the output"""
    global output
    try:
        data = os.read(master, 65536)
    except OSError:
        # EIO: the command has ended and closed the pty
        return False
    if not data:
        return False
    output += data
    return True


while b"ready" not in output or not output[output.index(b"ready"):].count(b"\n"):
    if not read_more():
        break

caught = "n/a"
status_file = "/proc/%d/status" % pid
if os.path.exists(status_file):
    with open(status_file) as f:
        for line in f:
            if line.startswith("SigCgt:"):
                caught = str(bool(int(line.split()[1], 16) >> (signal.SIGWINCH - 1) & 1))

os.write(master, b"hello\n")
while read_more():
    pass
_, status = os.waitpid(pid, 0)

for line in output.decode().replace("\r", "").splitlines():
    print(line)
print("sigwinch-caught", caught)
print("exit", os.waitstatus_to_exitcode(status))
