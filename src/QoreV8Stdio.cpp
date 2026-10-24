/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Stdio.cpp input and output of JavaScript programs with the stdio of the process */
/*
    QoreV8Stdio.cpp

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

#include "QoreV8Stdio.h"
#include "QoreV8Program.h"

#include <cerrno>
#include <memory>

#include <poll.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <unistd.h>

namespace {
//! Returns the stdio descriptor that is the first argument, or -1 with a JavaScript exception thrown
/** @param min the lowest descriptor accepted
    @param max the highest descriptor accepted
*/
int qore_v8_stdio_fd(const v8::FunctionCallbackInfo<v8::Value>& info, int min, int max) {
    v8::Isolate* isolate = info.GetIsolate();
    int32_t fd;
    if (info.Length() < 1 || !info[0]->IsInt32() || (fd = info[0].As<v8::Int32>()->Value()) < min || fd > max) {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(isolate,
            "the stdio bridge was given a descriptor that it does not handle")));
        return -1;
    }
    return fd;
}

//! Waits until the descriptor is ready for the given events; returns 0 if it is ready, an errno value for an
//! error, or -1 if an exception has been raised on the exception sink
/** The wait ends at once if the thread is cancelled or its %Qore program is interrupted.  POLLHUP and POLLERR count
    as ready: the next read(2) or write(2) reports the end or the error.
*/
int qore_v8_stdio_wait(int fd, short events, const char* operation, ExceptionSink& xsink) {
    struct pollfd pfd = {fd, events, 0};
#ifdef _QORE_HAS_CANCELLABLE_POLL
    int prc = qore_cancellable_poll(&pfd, 1, -1, &xsink, operation);
    if (prc == QORE_POLL_CANCELLED) {
        return -1;
    }
#else
    // libqore before 3.0 has no cancellation of blocking waits
    int prc;
    do {
        prc = poll(&pfd, 1, -1);
    } while (prc < 0 && errno == EINTR);
#endif
    return prc < 0 ? errno : 0;
}

//! isStream(fd): true if the descriptor is a pipe (FIFO) or a stream socket
/** These are the descriptors for which Node.js creates a \c net.Socket for \c process.stdin, \c process.stdout and
    \c process.stderr (\c guessHandleType() returns \c "PIPE" or \c "TCP"), which puts the descriptor in non-blocking
    mode
*/
void qore_v8_stdio_is_stream(const v8::FunctionCallbackInfo<v8::Value>& info) {
    int fd = qore_v8_stdio_fd(info, 0, 2);
    if (fd < 0) {
        return;
    }
    bool rv = false;
    struct stat st;
    if (!fstat(fd, &st)) {
        if (S_ISFIFO(st.st_mode)) {
            rv = true;
        } else if (S_ISSOCK(st.st_mode)) {
            int type = 0;
            socklen_t len = sizeof(type);
            rv = !getsockopt(fd, SOL_SOCKET, SO_TYPE, &type, &len) && type == SOCK_STREAM;
        }
    }
    info.GetReturnValue().Set(rv);
}

//! Writes all of the data to the descriptor without changing it; returns 0 for success, an errno value for an error,
//! or -1 if an exception has been raised on the exception sink
int qore_v8_stdio_write_all(int fd, const char* data, size_t len, ExceptionSink& xsink) {
    while (len) {
#ifdef _QORE_HAS_CANCELLABLE_POLL
        // as Qore's own writes do, a cancelled thread stops between writes; a write(2) that waits in the kernel for
        // a blocking descriptor cannot be interrupted, as with Qore's own output to it
        if (qore_check_cancel(&xsink, "JavaScript output to stdout or stderr")) {
            return -1;
        }
#endif
        ssize_t rc = ::write(fd, data, len);
        if (rc > 0) {
            data += rc;
            len -= static_cast<size_t>(rc);
            continue;
        }
        if (!rc) {
            // write(2) does not return 0 for a nonzero size on a pipe or a socket
            return EIO;
        }
        int err = errno;
        if (err == EINTR) {
            continue;
        }
        if (err != EAGAIN && err != EWOULDBLOCK) {
            return err;
        }
        // the description is non-blocking: another process made it so; wait until the descriptor can be written
        // without changing the flag
        if ((err = qore_v8_stdio_wait(fd, POLLOUT, "JavaScript output to stdout or stderr", xsink))) {
            return err;
        }
    }
    return 0;
}

//! read(fd, size): reads up to size bytes from the descriptor, waiting until it has data; returns a Uint8Array with
//! at least one byte, or null at the end of the input
/** The wait for data is a cancellable poll(2) (it ends with an exception if the thread is cancelled or its %Qore
    program is interrupted); read(2) is called only when the descriptor has data or has reached its end, so it does
    not wait, and the descriptor's flags are never changed.
*/
void qore_v8_stdio_read(const v8::FunctionCallbackInfo<v8::Value>& info) {
    int fd = qore_v8_stdio_fd(info, 0, 0);
    if (fd < 0) {
        return;
    }
    v8::Isolate* isolate = info.GetIsolate();
    int32_t size;
    if (info.Length() < 2 || !info[1]->IsInt32() || (size = info[1].As<v8::Int32>()->Value()) < 1) {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(isolate,
            "the stdio bridge reads a positive number of bytes")));
        return;
    }

    std::shared_ptr<v8::BackingStore> store = v8::ArrayBuffer::NewBackingStore(isolate, static_cast<size_t>(size));
    ExceptionSink xsink;
    ssize_t rc;
    while (true) {
        int err = qore_v8_stdio_wait(fd, POLLIN, "JavaScript input from stdin", xsink);
        if (err < 0) {
            assert(xsink);
            QoreV8Program::raiseV8Exception(xsink, isolate);
            return;
        }
        if (err) {
            isolate->ThrowException(node::ErrnoException(isolate, err, "poll"));
            return;
        }
        rc = ::read(fd, store->Data(), static_cast<size_t>(size));
        if (rc >= 0) {
            break;
        }
        err = errno;
        // EAGAIN: the data was read by another reader of the description first; wait again
        if (err != EINTR && err != EAGAIN && err != EWOULDBLOCK) {
            isolate->ThrowException(node::ErrnoException(isolate, err, "read"));
            return;
        }
    }
    if (!rc) {
        info.GetReturnValue().SetNull();
        return;
    }
    v8::Local<v8::ArrayBuffer> buf = v8::ArrayBuffer::New(isolate, store);
    info.GetReturnValue().Set(v8::Uint8Array::New(buf, 0, static_cast<size_t>(rc)));
}

//! write(fd, data): writes all of the data (a Uint8Array or a string, written as UTF-8) to the descriptor
void qore_v8_stdio_write(const v8::FunctionCallbackInfo<v8::Value>& info) {
    int fd = qore_v8_stdio_fd(info, 1, 2);
    if (fd < 0) {
        return;
    }
    v8::Isolate* isolate = info.GetIsolate();
    if (info.Length() < 2 || (!info[1]->IsArrayBufferView() && !info[1]->IsString())) {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(isolate,
            "the stdio bridge writes a Uint8Array or a string")));
        return;
    }

    std::shared_ptr<v8::BackingStore> store;
    std::unique_ptr<v8::String::Utf8Value> str;
    const char* data;
    size_t len;
    if (info[1]->IsArrayBufferView()) {
        v8::Local<v8::ArrayBufferView> view = info[1].As<v8::ArrayBufferView>();
        len = view->ByteLength();
        if (!len) {
            return;
        }
        // the backing store keeps the memory while it is written; no JavaScript code runs meanwhile
        store = view->Buffer()->GetBackingStore();
        data = static_cast<const char*>(store->Data()) + view->ByteOffset();
    } else {
        str = std::make_unique<v8::String::Utf8Value>(isolate, info[1]);
        if (!**str) {
            return;
        }
        data = **str;
        len = static_cast<size_t>(str->length());
    }

    ExceptionSink xsink;
    int err = qore_v8_stdio_write_all(fd, data, len, xsink);
    if (err < 0) {
        assert(xsink);
        QoreV8Program::raiseV8Exception(xsink, isolate);
        return;
    }
    if (err) {
        isolate->ThrowException(node::ErrnoException(isolate, err, "write"));
    }
}
}

v8::MaybeLocal<v8::Object> qore_v8_create_stdio_bridge(v8::Isolate* isolate, v8::Local<v8::Context> context) {
    static const struct {
        const char* name;
        v8::FunctionCallback callback;
    } functions[] = {
        {"isStream", qore_v8_stdio_is_stream},
        {"read", qore_v8_stdio_read},
        {"write", qore_v8_stdio_write},
    };

    v8::Local<v8::Object> bridge = v8::Object::New(isolate);
    for (const auto& i : functions) {
        v8::Local<v8::Function> func;
        v8::Local<v8::String> key;
        if (!v8::Function::New(context, i.callback).ToLocal(&func)
            || !v8::String::NewFromUtf8(isolate, i.name).ToLocal(&key)
            || !bridge->CreateDataProperty(context, key, func).FromMaybe(false)) {
            return v8::MaybeLocal<v8::Object>();
        }
    }
    return bridge;
}
