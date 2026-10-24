/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Stdio.cpp output of JavaScript programs to the stdout and stderr of the process */
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
int qore_v8_stdio_fd(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    int32_t fd;
    if (info.Length() < 1 || !info[0]->IsInt32() || ((fd = info[0].As<v8::Int32>()->Value()) != 1 && fd != 2)) {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8Literal(isolate,
            "the stdio bridge requires the descriptor 1 or 2")));
        return -1;
    }
    return fd;
}

//! isStream(fd): true if the descriptor is a pipe (FIFO) or a stream socket
/** These are the descriptors for which Node.js creates a \c net.Socket for \c process.stdout and \c process.stderr
    (\c guessHandleType() returns \c "PIPE" or \c "TCP"), which puts the descriptor in non-blocking mode
*/
void qore_v8_stdio_is_stream(const v8::FunctionCallbackInfo<v8::Value>& info) {
    int fd = qore_v8_stdio_fd(info);
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
        struct pollfd pfd = {fd, POLLOUT, 0};
#ifdef _QORE_HAS_CANCELLABLE_POLL
        int prc = qore_cancellable_poll(&pfd, 1, -1, &xsink, "JavaScript output to stdout or stderr");
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
        if (prc < 0) {
            return errno;
        }
        // POLLERR or POLLHUP: the next write(2) reports the error
    }
    return 0;
}

//! write(fd, data): writes all of the data (a Uint8Array or a string, written as UTF-8) to the descriptor
void qore_v8_stdio_write(const v8::FunctionCallbackInfo<v8::Value>& info) {
    int fd = qore_v8_stdio_fd(info);
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
