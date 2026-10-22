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

#include <qore/Qore.h>

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

#endif
