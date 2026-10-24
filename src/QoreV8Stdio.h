/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Stdio.h input and output of JavaScript programs with the stdio of the process */
/*
    QoreV8Stdio.h

    Qore Programming Language

    Copyright 2026 Qore Technologies, s.r.o.

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 2.1 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

#ifndef _QORE_V8_STDIO_H
#define _QORE_V8_STDIO_H

#include "v8-module.h"

//! Returns the functions with which the bootstrap code of a program reads \c process.stdin and writes
//! \c process.stdout and \c process.stderr for a terminal, a pipe or a socket without changing it
/** For a stdin, stdout or stderr that is a pipe or a stream socket, Node.js creates \c process.stdin,
    \c process.stdout and \c process.stderr as \c net.Socket streams; libuv's \c uv_pipe_open() and
    \c uv_tcp_open() put the descriptor in non-blocking mode (\c O_NONBLOCK).  That flag belongs to the open file
    description, which the descriptor shares with the embedding process's own I/O and with every other process that
    has the pipe (a parent shell, a CI runner), so their writes to a full pipe failed with \c EAGAIN instead of
    waiting, and their reads of an empty one failed instead of waiting.  For a terminal, Node.js creates
    \c tty.WriteStream streams for \c process.stdout and \c process.stderr, which install a \c SIGWINCH handler in
    the process (libuv's \c uv_signal_start()), while %Qore owns the process's signal handling.

    The bootstrap code of every program therefore creates these streams itself for such a descriptor, with the
    returned functions, which never change the descriptor or the process's signal handling:
    - <tt>kind(fd)</tt>: \c "tty" if the descriptor (0, 1 or 2) is a terminal, \c "pipe" if it is a pipe (FIFO) or
      a stream socket, or \c undefined otherwise, for which Node's own streams are kept (a file, a datagram socket)
    - <tt>read(fd, size)</tt>: reads up to \a size bytes from stdin (\a fd 0), waiting until it has data; returns a
      \c Uint8Array with at least one byte, or \c null at the end of the input.  The wait is a cancellable
      \c poll(2), and \c read(2) is called only when there is data or the end has been reached
    - <tt>windowSize(fd)</tt>: the <tt>[columns, rows]</tt> of a terminal, read with \c ioctl(TIOCGWINSZ), or
      \c undefined if they are unknown
    - <tt>write(fd, data)</tt>: writes all of \a data (a \c Uint8Array or a string, written as UTF-8) to stdout or
      stderr (\a fd 1 or 2), waiting until the descriptor can take more if it is full; if another process made the
      description non-blocking, it waits for the descriptor to become writable without changing the flag

    A wait ends with an exception if the thread is cancelled or its %Qore program is interrupted; an error reading
    or writing raises the Node.js errno exception (for example with \c code \c "EPIPE").

    @return an object with the functions \c kind, \c read, \c windowSize and \c write, or an empty handle if an
    exception is pending
*/
DLLLOCAL v8::MaybeLocal<v8::Object> qore_v8_create_stdio_bridge(v8::Isolate* isolate, v8::Local<v8::Context> context);

#endif
