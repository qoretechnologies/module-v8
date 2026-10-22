/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QoreV8Environment.h access to the process environment under Qore's environment lock */
/*
    QoreV8Environment.h

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

#ifndef _QORE_V8_ENVIRONMENT_H
#define _QORE_V8_ENVIRONMENT_H

#include "v8-module.h"

#include <string>
#include <utility>
#include <vector>

//! Returns a copy of the variables of the process environment, in the order of the environment
/** The environment is read with Qore's environment lock held shared (see QoreEnvironmentReadLock), so the copy is
    consistent: no variable can be changed through Qore while it is made.  Only the first entry of a name that
    appears more than once is returned, as getenv() returns it; an entry without \c '=' or with an empty name is not
    a variable and is skipped.
*/
DLLLOCAL std::vector<std::pair<std::string, std::string>> qore_v8_get_environment();

//! Returns a copy of the variables of the process environment as a hash of strings
/** @see qore_v8_get_environment()
*/
DLLLOCAL QoreHashNode* qore_v8_get_environment_hash(ExceptionSink* xsink);

//! Returns the function with which the bootstrap code of a program replaces \c process.env
/** Node.js reads and changes the process environment for \c process.env with a lock of its own, which does not
    serialize it with %Qore: a variable that %Qore changes in another thread while JavaScript code reads it can be
    read after it was freed (musl frees the value that \c setenv() replaces), and a change made by JavaScript code
    while %Qore reads the environment, or makes a copy of it for a new process, can do the same to %Qore.

    The returned function takes Node's original \c process.env object and returns a new object for \c process.env
    whose named property interceptors perform every operation on the original object with Qore's environment lock
    held: shared to read the environment (get, query, enumerate), exclusively to change it (set, delete, define).
    Node's own handling, including the conversion of values to strings, its errors, and the time zone change that a
    change of \c TZ causes, is kept, and Node acquires its lock inside Qore's, never the other way around.  No
    JavaScript code runs while the lock is held: the original object's operations are implemented in C++, and names
    and values are converted to strings before the lock is acquired.  Like Node's object, the new one is an ordinary
    object with interceptors (not a proxy); only Node's serializer does not know it, so \c structuredClone() of it
    raises \c DataCloneError, where Node converts its own object to a plain object.

    @return the function, or an empty handle if an exception is pending
*/
DLLLOCAL v8::MaybeLocal<v8::Function> qore_v8_create_env_factory(v8::Local<v8::Context> context);

#endif
