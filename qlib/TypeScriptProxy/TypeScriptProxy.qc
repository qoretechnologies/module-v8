# -*- mode: qore; indent-tabs-mode: nil -*-
#! Qore TypeScriptProxy module definition

/*  TypeScriptProxy.qc Copyright 2024 Qore Technologies, s.r.o.

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

#! Main namespace for the TypeScriptProxy module
public namespace TypeScriptProxy {
#! Proxy command "CALL": make an async call and return the response
public const PC_CALL = "CALL";

#! Proxy command "SETUP-EVENT": setup the process with the given event source
public const PC_SETUP_EVENT = "SETUP-EVENT";

#! Proxy comment "RELEASE-EVENT": stop processing the given event source
public const PC_RELEASE_EVENT = "RELEASE-EVENT";

#! Proxy command "GET-REQUEST-TYPE": retrieve a dynamic type based on JS calls
public const PC_GET_REQUEST_TYPE = "GET-REQUEST-TYPE";

#! Proxy command "GET-RESPONSE-TYPE": retrieve a dynamic type based on JS calls
public const PC_GET_RESPONSE_TYPE = "GET-RESPONSE-TYPE";

#! Proxy command "GET-EVENT-TYPE": retrieve a dynamic type based on JS calls
public const PC_GET_EVENT_TYPE = "GET-EVENT-TYPE";

#! Proxy command "EXIT": exit the process
public const PC_EXIT = "EXIT";

#! Valid commands
public const ValidCommands = {
    PC_CALL: True,
    PC_SETUP_EVENT: True,
    PC_RELEASE_EVENT: True,
    PC_GET_REQUEST_TYPE: True,
    PC_GET_RESPONSE_TYPE: True,
    PC_GET_EVENT_TYPE: True,
    PC_EXIT: True,
};

#! Child response "STARTED"
/** body:
    - string pkey: the process unique hash key
    - int pid: the PID of the child process
*/
public const CC_STARTED = "STARTED";

#! Child response "OK"
public const CC_OK = "OK";

#! Child response "ERR" when an exception occurs
public const CC_ERR = "ERR";

#! Child command: "EVENT"
public const CC_EVENT = "EVENT";

#! Child commnad: "EVENT-START"
public const CC_EVENT_START = "EVENT-START";

#! Child command: "EVENT-TERMINATED"
public const CC_EVENT_TERMINATED = "EVENT-TERMINATED";

#! Child command: "STATUS"
public const CC_STATUS = "STATUS";

#! Valid responses
public const ValidResponses = {
    CC_OK: True,
    CC_ERR: True,
};

#! Class with proxy API methods to support clients and servers
public class TypeScriptProxy {
    public {
        const DefaultIoTimeout = 15s;
    }

    private {
        #! Socket connection to the other process
        Socket s();

        #! Is this a server?
        bool server;
    }

    #! Creates the object
    constructor(bool server) {
        self.server = server;
    }

    #! Sends a string to the remote end
    private sendString(string str) {
        sendString(s, str);
    }

    #! Sends a string to the remote end
    private sendString(Socket sock, string str) {
        # first send the size as an 8-byte integer in network byte order
        sock.sendi8(str.size(), DefaultIoTimeout);
        # now send the UTF-8 string
        sock.send(str, DefaultIoTimeout);
    }

    #! Creates a hash for sending
    private string makeSend(string cmd, *hash<auto> info) {
        on_error rethrow $1.err, sprintf("%s (cannot serialize: cmd: %y info: %y)", $1.desc, cmd, info);
        return make_yaml({
            "cmd": cmd,
        } + info);
    }

    #! Reads a string and returns the corresponding hash
    private hash<auto> getCommand(*timeout to) {
        # first read message size
        int i = recvi8(to);
        string yaml = recv(i, to);
        auto v = parse_yaml(yaml);
        if (v.typeCode() != NT_HASH) {
            throw "CMD-ERROR", sprintf("Expecting type \"hash\"; got %y", v.fullType());
        }
        if (v.cmd.typeCode() != NT_STRING) {
            throw "CMD-ERROR", sprintf("Expecting \"cmd\" as a string; got %y", v.cmd.fullType());
        }
        return v;
    }

    #! Reads an 8-byte integer in network byte order from the socket
    private int recvi8(*timeout to) {
        return s.recvi8(to);
    }

    private string recv(int size, *timeout to) {
        return s.recv(size, to);
    }

    #! Log info messages
    private abstract info(string fmt, ...);

    #! Log error messages
    private abstract error(string fmt, ...);

    #! Log fatal messages
    private abstract fatal(string fmt, ...);
}
}