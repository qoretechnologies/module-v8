# -*- mode: qore; indent-tabs-mode: nil -*-

/*  TypeScriptActionDataProviderBase.qc Copyright (C) 2023 - 2024 Qore Technologies s.r.o.

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
*/

#! Main module namespace
public namespace TypeScriptActionInterface {
public class TypeScriptActionDataProviderBase inherits AbstractDataProvider {
    private {
        #! The name of the data provider
        string name;

        #! The connection for the action
        AbstractConnection conn;
    }

    #! Creates the object from the arguments
    constructor(string name) {
        self.name = name;
    }

    #! Sets the connection
    setConnection(AbstractConnection conn) {
        self.conn = conn;
    }

    #! Returns the logger interface for logging
    *LoggerInterface getLogger() {
        return logger;
    }

    #! Returns the data provider name
    string getName() {
        return name;
    }
}
}
