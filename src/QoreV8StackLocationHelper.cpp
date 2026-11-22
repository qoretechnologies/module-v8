/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8StackLocationHelper.cpp

    Qore Programming Language

    Copyright (C) 2024 Qore Technologies, s.r.o.

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.

    Note that the Qore library is released under a choice of three open-source
    licenses: MIT (as above), LGPL 2+, or GPL 2+; see README-LICENSE for more
    information.
*/

#include "QoreV8StackLocationHelper.h"
#include "QoreV8Program.h"

std::string QoreV8StackLocationHelper::v8_no_call_name = "<v8_module_no_runtime_stack_info>";
QoreExternalProgramLocationWrapper QoreV8StackLocationHelper::v8_loc_builtin("<v8_module_unknown>", -1,
    -1);

QoreV8StackLocationHelper::QoreV8StackLocationHelper(QoreV8ProgramHelper& v8h) : v8h(v8h) {
}

const std::string& QoreV8StackLocationHelper::getCallName() const {
    if (tid != q_gettid()) {
        return v8_no_call_name;
    }
    checkInit();
    assert((unsigned)current < size());
    printd(0, "QoreV8StackLocationHelper::getCallName() this: %p %d/%d '%s'\n", this, (int)current, (int)size(),
        stack_call[current].c_str());
    return stack_call[current];
}

qore_call_t QoreV8StackLocationHelper::getCallType() const {
    if (tid != q_gettid()) {
        return CT_BUILTIN;
    }
    checkInit();
    assert((unsigned)current < size());
    return CT_USER;
}

const QoreProgramLocation& QoreV8StackLocationHelper::getLocation() const {
    if (tid != q_gettid()) {
        return v8_loc_builtin.get();
    }
    checkInit();
    assert((unsigned)current < size());
    printd(0, "QoreV8StackLocationHelper::getLocation() %s:%d\n", stack_loc[current].getFile().c_str(),
        stack_loc[current].getStartLine());
    return stack_loc[current].get();
}

const QoreStackLocation* QoreV8StackLocationHelper::getNext() const {
    if (tid != q_gettid()) {
        return stack_next;
    }
    checkInit();
    assert((unsigned)current < size());
    // issue #3169: reset the pointer after iterating all the information in the stack
    // the exception stack can be iterated multiple times
    ++current;
    if ((unsigned)current < size()) {
        return this;
    }
    current = 0;
    return stack_next;
}

constexpr size_t frame_limit = 300;

void QoreV8StackLocationHelper::checkInit() const {
    assert(tid == q_gettid());
    if (init) {
        return;
    }
    init = true;

    v8::Isolate* isolate = v8h.getIsolate();
    v8::Local<v8::StackTrace> st = v8::StackTrace::CurrentStackTrace(isolate, frame_limit);
    size_t frame_count = st->GetFrameCount();

    for (size_t i = 0; i < frame_count; ++i) {
        v8::Local<v8::StackFrame> stack_frame = st->GetFrame(isolate, i);
        v8::Local<v8::String> file_name = stack_frame->GetScriptName();
        v8::Local<v8::String> func_name = stack_frame->GetFunctionName();

        int line = stack_frame->GetLineNumber();
        // int column = stack_frame->GetColumn();

        std::string file = !file_name.IsEmpty()
            ? *v8::String::Utf8Value(isolate, file_name)
            : "unknown";
        std::string func = !func_name.IsEmpty()
            ? *v8::String::Utf8Value(isolate, func_name)
            : "unknown";

        printd(0, "QoreV8StackLocationHelper::checkInit() adding %s:%d %s()\n", func.c_str(), line, file.c_str());
        QoreExternalProgramLocationWrapper loc(file.c_str(), line, line, nullptr, 0, QORE_V8_LANG_NAME);
        stack_loc.push_back(loc);
        stack_call.push_back(func.c_str());
    }

    if (!size()) {
        stack_call.push_back(v8_no_call_name);
        stack_loc.push_back(v8_loc_builtin);
    }
}