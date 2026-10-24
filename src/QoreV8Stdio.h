/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Stdio.h output of JavaScript programs to the stdout and stderr of the process */
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

//! Returns the functions with which the bootstrap code of a program writes \c process.stdout and \c process.stderr
//! to a pipe or a socket without changing it
/** For a stdout or stderr that is a pipe or a stream socket, Node.js creates \c process.stdout and
    \c process.stderr as \c net.Socket streams; libuv's \c uv_pipe_open() and \c uv_tcp_open() put the descriptor in
    non-blocking mode (\c O_NONBLOCK).  That flag belongs to the open file description, which the descriptor shares
    with the embedding process's own writes and with every other process that has the pipe (a parent shell, a CI
    runner), so their writes to a full pipe failed with \c EAGAIN instead of waiting.

    The bootstrap code of every program therefore creates these two streams itself for such a descriptor, writing
    with the returned functions, which never change the descriptor:
    - <tt>isStream(fd)</tt>: \c true if the descriptor is a pipe (FIFO) or a stream socket, for which Node.js would
      create a \c net.Socket; Node's own streams are kept for a terminal, a file, and any other descriptor, as they
      do not change the shared description
    - <tt>write(fd, data)</tt>: writes all of \a data (a \c Uint8Array or a string, written as UTF-8) to the
      descriptor, waiting until the pipe can take more if it is full; if another process made the description
      non-blocking, it waits for the descriptor to become writable without changing the flag.  The wait ends with
      an exception if the thread is cancelled or its %Qore program is interrupted; an error writing raises the
      Node.js errno exception (for example with \c code \c "EPIPE")

    @return an object with the functions \c isStream and \c write, or an empty handle if an exception is pending
*/
DLLLOCAL v8::MaybeLocal<v8::Object> qore_v8_create_stdio_bridge(v8::Isolate* isolate, v8::Local<v8::Context> context);

#endif
