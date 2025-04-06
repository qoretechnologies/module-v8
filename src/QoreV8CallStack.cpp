/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    QoreV8CallStack.h

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

#include "QoreV8Program.h"

#include <sstream>

QoreV8CallStack::QoreV8CallStack(v8::Isolate* isolate, const v8::TryCatch& tryCatch,
        v8::Local<v8::Context> context, v8::Local<v8::Message> msg,
        QoreExternalProgramLocationWrapper& loc, std::string& code_line) {
    assert(!msg.IsEmpty());

    v8::String::Utf8Value filename(isolate, msg->GetScriptOrigin().ResourceName());
    //const char* filename_string = ToCString(filename);
    int linenum = msg->GetLineNumber(context).FromJust();

    loc.set(*filename, linenum, linenum, nullptr, 0, "JavaScript");

    v8::Local<v8::Value> st_string;
    if (tryCatch.StackTrace(context).ToLocal(&st_string) &&
        st_string->IsString() && st_string.As<v8::String>()->Length() > 0) {
        v8::String::Utf8Value st(isolate, st_string);
        const char* str = strchr(*st, '\n');
        if (!str) {
            return;
        }
        ++str;

        ExceptionSink xsink;
        QoreRegexInterface re(&xsink, " at ([^\\)]+) \\((.+):([0-9]+):[0-9]+\\)", QRE_GLOBAL);

        //printd(5, "QoreV8CallStack::QoreV8CallStack() stack trace to parse: '%s'\n", str);

        std::string exstr(str);
        std::string line;
        std::stringstream ss(exstr);

        bool stop = false;
        while (getline(ss, line, '\n')) {
            //printd(5, "stack trace line: '%s'\n", line.c_str());
            QoreString targ(line);
            ReferenceHolder<QoreListNode> l(re.extractSubstrings(targ, &xsink), &xsink);
            if (l) {
                size_t offset = 0;
                while ((offset + 2) < l->size()) {
                    QoreValue func = l->retrieveEntry(offset);
                    assert(func.getType() == NT_STRING);
                    QoreValue file = l->retrieveEntry(offset + 1);
                    assert(file.getType() == NT_STRING);
                    QoreValue line = l->retrieveEntry(offset + 2);
                    assert(line.getType() == NT_STRING);
                    long ln = strtol(line.get<const QoreStringNode>()->c_str(), nullptr, 10);

                    add(CT_USER, file.get<const QoreStringNode>()->c_str(), ln, ln,
                        func.get<const QoreStringNode>()->c_str(), "JavaScript");
                    offset += 3;
                }
            } else {
                if (!stop) {
                    if (!code_line.empty()) {
                        code_line += '\n';
                    }
                    //code_line += "> ";
                    code_line += line;
                    if (line.find('^') != std::string::npos) {
                        stop = true;
                    }
                }
            }
        }
    }
}