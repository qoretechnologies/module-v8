/* -*- mode: c++; indent-tabs-mode: nil -*- */
/** @file QC_SandboxCapture.h defines the SandboxCapture class (qoretechnologies/qore#6845) */
/*
    Copyright 2026 Qore Technologies, s.r.o.

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
    documentation files (the "Software"), to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of
    the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
    THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

#ifndef _QORE_V8_QC_SANDBOXCAPTURE_H
#define _QORE_V8_QC_SANDBOXCAPTURE_H

#include "v8-module.h"

#include <qore/QoreSandboxManager.h>

DLLLOCAL extern qore_classid_t CID_SANDBOXCAPTURE;
DLLLOCAL extern QoreClass* QC_SANDBOXCAPTURE;

DLLLOCAL QoreClass* initSandboxCaptureClass(QoreNamespace& ns);

//! The private data of a SandboxCapture object: the sandbox that governed the code that created it
class QoreV8SandboxCapture : public AbstractPrivateData {
public:
    QoreSandboxCapture capture;
};

#endif
