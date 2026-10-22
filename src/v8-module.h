/* -*- mode: c++; indent-tabs-mode: nil -*- */
/*
    v8-module.h

    Qore Programming Language

    Copyright 2020 - 2021 Qore Technologies, s.r.o.

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

#ifndef _QORE_V8_MODULE_H
#define _QORE_V8_MODULE_H

#include <v8.h>
#include <libplatform/libplatform.h>
#include <node.h>

/*
#include <v8-context.h>
#include <v8-initialization.h>
#include <v8-isolate.h>
#include <v8-local-handle.h>
#include <v8-primitive.h>
#include <v8-script.h>
*/

#include <qore/Qore.h>

//! the name of the module
#define QORE_V8_MODULE_NAME "v8"
//! the name of the main V8 namespace in Qore
#define QORE_V8_NS_NAME "V8"
//! the name of the language in stack traces
#define QORE_V8_LANG_NAME "V8"

// module registration function
DLLEXPORT extern "C" void v8_qore_module_desc(QoreModuleInfo& mod_info);

// export function for other language modules
//DLLEXPORT extern "C" int v8_module_import(ExceptionSink* xsink, QoreProgram* pgm, const char* module,
//    const char* symbol);

DLLLOCAL extern QoreNamespace* V8NS;

DLLLOCAL extern std::unique_ptr<node::MultiIsolatePlatform> platform;
DLLLOCAL extern std::shared_ptr<node::InitializationResult> init_result;

//! Returns true in a child process created with fork() by a process that had loaded the module
/** A child process created with \c fork() runs only the thread that called \c fork(): the platform's worker threads,
    the threads running JavaScript code and the threads holding the locks of V8, of Node.js and of the module do not
    exist in it, and on Linux the descriptors of the event loops of the programs refer to the event loops of the
    parent.  No JavaScript code can be run in the child, and nothing is torn down there: V8 and Node.js are left as
    they are when the child exits, since tearing them down waits for threads and locks that the child does not have
    (or changes the event loops of the parent)
*/
DLLLOCAL bool qore_v8_forked_child();

#endif
