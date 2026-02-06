/* indent-tabs-mode: nil -*- */
/*
    v8 Qore module

    Copyright (C) 2020 - 2026 Qore Technologies, s.r.o.

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

#include "v8-module.h"

#include "QC_JavaScriptProgram.h"
#include "QC_JavaScriptObject.h"
#include "QC_JavaScriptPromise.h"
#include "QoreV8Program.h"

//static std::unique_ptr<v8::Platform> platform;
std::unique_ptr<node::MultiIsolatePlatform> platform;
std::shared_ptr<node::InitializationResult> init_result;

static void v8_module_init(QoreModuleInitContext& ctx, ExceptionSink& xsink);
static void v8_module_ns_init(QoreNamespace* rns, QoreNamespace* qns, ExceptionSink& xsink);
static void v8_module_delete();
//static void v8_module_parse_cmd(const QoreString& cmd, ExceptionSink* xsink);

static QoreStringNode* v8_module_init_intern(bool repeat);

// module declaration for Qore 0.9.5+
void v8_qore_module_desc(QoreModuleInfo& mod_info) {
    mod_info.name = QORE_V8_MODULE_NAME;
    mod_info.version = PACKAGE_VERSION;
    mod_info.desc = "v8 module";
    mod_info.author = "David Nichols";
    mod_info.url = "http://qore.org";
    mod_info.api_major = QORE_MODULE_API_MAJOR;
    mod_info.api_minor = QORE_MODULE_API_MINOR;
    mod_info.init = v8_module_init;
    mod_info.ns_init = v8_module_ns_init;
    mod_info.del = v8_module_delete;
    //mod_info.parse_cmd = v8_module_parse_cmd;
    mod_info.license = QL_MIT;
    mod_info.license_str = "MIT";

    /*
    mod_info.info = new QoreHashNode(autoTypeInfo);
    mod_info.info->setKeyValue("v8_version", new QoreStringNodeMaker(V8_VERSION), nullptr);
    mod_info.info->setKeyValue("v8_major", V8_MAJOR_VERSION, nullptr);
    mod_info.info->setKeyValue("v8_minor", V8_MINOR_VERSION, nullptr);
    mod_info.info->setKeyValue("v8_micro", V8_MICRO_VERSION, nullptr);
    */
}

QoreNamespace* V8NS = nullptr;

/*
struct qore_v8_cmd_info_t {
    qore_v8_module_cmd_t cmd;
    bool requires_arg = true;

    DLLLOCAL qore_v8_cmd_info_t(qore_v8_module_cmd_t cmd, bool requires_arg)
        : cmd(cmd), requires_arg(requires_arg) {
    }
};

// module cmds
typedef std::map<std::string, qore_v8_cmd_info_t> mcmap_t;
static mcmap_t mcmap = {
};
*/

/*
static sig_vec_t sig_vec = {
#ifndef _Q_WINDOWS
    SIGSEGV, SIGBUS
#endif
};
*/

static void v8_module_shutdown() {
    //printd(5, "v8_module_shutdown()\n");
    QoreV8Program::shutdown();

    v8::V8::Dispose();
    v8::V8::DisposePlatform();

    node::TearDownOncePerProcess();
    platform = nullptr;
}

static void v8_module_init(QoreModuleInitContext& ctx, ExceptionSink& xsink) {
    QoreStringNode* err = v8_module_init_intern(false);
    if (err) {
        xsink.raiseException("MODULE-INIT-ERROR", err);
    }
}

static QoreStringNode* v8_module_init_intern(bool repeat) {
    if (!V8NS) {
        V8NS = new QoreNamespace("V8");
        preinitJavaScriptObjectClass();
        V8NS->addSystemClass(initJavaScriptProgramClass(*V8NS));
        V8NS->addSystemClass(initJavaScriptObjectClass(*V8NS));
        V8NS->addSystemClass(initJavaScriptPromiseClass(*V8NS));
    }

    std::vector<std::string> args = {"qore"};
    init_result =
        node::InitializeOncePerProcess(args, {
            node::ProcessInitializationFlags::kNoInitializeV8,
            node::ProcessInitializationFlags::kNoInitializeNodeV8Platform,
        });

    if (!init_result->errors().empty()) {
        SimpleRefHolder<QoreStringNode> err(new QoreStringNode);
        for (const std::string& error : init_result->errors()) {
            if (!err->empty()) {
                err->concat(", ");
            }
            err->concat(error.c_str());
        }
        return err.release();
    }

    // Create a v8::Platform instance. `MultiIsolatePlatform::Create()` is a way
    // to create a v8::Platform instance that Node.js can use when creating
    // Worker threads. When no `MultiIsolatePlatform` instance is present,
    // Worker threads are disabled.
    platform = node::MultiIsolatePlatform::Create(4);

    // Initialize V8.
    v8::V8::InitializePlatform(platform.get());
    v8::V8::Initialize();

    //printd(5, "v8_module_init_intern()\n");
    return nullptr;
}

static void v8_module_ns_init(QoreNamespace* rns, QoreNamespace* qns, ExceptionSink& xsink) {
    QoreProgram* pgm = getProgram();
    assert(pgm->getRootNS() == rns);
    if (!pgm->getExternalData(QORE_V8_MODULE_NAME)) {
        QoreNamespace* v8ns = V8NS->copy();
        rns->addNamespace(v8ns);
        /*
        // issue #4153: in case we only have the calling context here
        ExceptionSink xsink;
        QoreExternalProgramContextHelper pch(&xsink, pgm);
        if (!xsink) {
            pgm->setExternalData(QORE_V8_MODULE_NAME, new QoreV8Program(pgm, v8ns));
        }
        */
    }
}

static void v8_module_delete() {
    /*
    if (qore_v8_pgm) {
        qore_v8_pgm->doDeref();
        qore_v8_pgm = nullptr;
    }
    */
    if (V8NS) {
        delete V8NS;
        V8NS = nullptr;
    }
    v8_module_shutdown();
}

/*
static void v8_module_parse_cmd(const QoreString& cmd, ExceptionSink* xsink) {
    //printd(5, "v8_module_parse_cmd() cmd: '%s'\n", cmd.c_str());

    const char* p = strchr(cmd.c_str(), ' ');
    QoreString str;
    QoreString arg;
    if (p) {
        QoreString nstr(&cmd, p - cmd.c_str());
        str = nstr;
        arg = cmd;
        arg.replace(0, p - cmd.c_str() + 1, (const char*)nullptr);
        arg.trim();
    } else {
        str = cmd;
        str.trim();
    }

    mcmap_t::const_iterator i = mcmap.find(str.c_str());
    if (i == mcmap.end()) {
        QoreStringNode* desc = new QoreStringNodeMaker("unrecognized command '%s' in '%s' (valid commands: ",
            str.c_str(), cmd.c_str());
        for (mcmap_t::const_iterator i = mcmap.begin(), e = mcmap.end(); i != e; ++i) {
            if (i != mcmap.begin())
                desc->concat(", ");
            desc->sprintf("'%s'", i->first.c_str());
        }
        desc->concat(')');
        xsink->raiseException("V8-PARSE-COMMAND-ERROR", desc);
        return;
    }

    if (i->second.requires_arg) {
        if (arg.empty()) {
            xsink->raiseException("V8-PARSE-COMMAND-ERROR", "missing argument / command name in parse command: '%s'",
                cmd.c_str());
            return;
        }
    } else {
        if (!arg.empty()) {
            xsink->raiseException("V8-PARSE-COMMAND-ERROR", "extra argument / command name in parse command: '%s'",
                cmd.c_str());
            return;
        }
    }

    QoreProgram* pgm = getProgram();
    QoreV8Program* v8pgm = static_cast<QoreV8Program*>(pgm->getExternalData(QORE_V8_MODULE_NAME));
    //printd(5, "parse-cmd '%s' v8pgm: %p v8ns: %p\n", arg.c_str(), v8pgm, v8pgm->getV8Namespace());
    if (!v8pgm) {
        QoreNamespace* v8ns = V8NS->copy();
        pgm->getRootNS()->addNamespace(v8ns);
        v8pgm = new QoreV8Program(pgm, v8ns);
        pgm->setExternalData(QORE_V8_MODULE_NAME, v8pgm);
        pgm->addFeature(QORE_V8_MODULE_NAME);
    }

    i->second.cmd(xsink, arg, v8pgm);
}
*/