/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Environment.cpp access to the process environment under Qore's environment lock */
/*
    QoreV8Environment.cpp

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

#include "QoreV8Environment.h"

#include <cstring>
#include <unordered_set>

#ifdef __APPLE__
// a shared library cannot refer to environ directly on macOS
#include <crt_externs.h>
#define environ (*_NSGetEnviron())
#else
extern char** environ;
#endif

std::vector<std::pair<std::string, std::string>> qore_v8_get_environment() {
    std::vector<std::pair<std::string, std::string>> rv;
    std::unordered_set<std::string> names;

    // the environment array and its strings stay unchanged while the lock is held; only copies are kept
    QoreEnvironmentReadLock env_lock;
    for (char** e = environ; e && *e; ++e) {
        const char* eq = strchr(*e, '=');
        if (!eq || eq == *e) {
            continue;
        }
        std::string name(*e, eq - *e);
        if (!names.insert(name).second) {
            continue;
        }
        rv.emplace_back(std::move(name), std::string(eq + 1));
    }
    return rv;
}

QoreHashNode* qore_v8_get_environment_hash(ExceptionSink* xsink) {
    // the hash is built after the lock is released
    std::vector<std::pair<std::string, std::string>> env = qore_v8_get_environment();
    ReferenceHolder<QoreHashNode> rv(new QoreHashNode(stringTypeInfo), xsink);
    for (auto& i : env) {
        rv->setKeyValue(i.first.c_str(), new QoreStringNode(i.second.c_str(), i.second.size(), QCS_DEFAULT),
            xsink);
        if (*xsink) {
            return nullptr;
        }
    }
    return rv.release();
}
