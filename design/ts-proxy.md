Copyright 2026 Qore Technologies, s.r.o.

# TS Proxy Design

## Overview
The TypeScript proxy (ts-proxy) is a helper process used by the V8 module to run
TypeScript/JavaScript actions out of process. Qore code communicates with the
proxy over a UNIX domain socket using a simple length-prefixed YAML protocol.
This separation lets Qore isolate JS execution, restart it on failures, and
manage event listeners without blocking core worker threads.

## Architecture
- Parent side: `JavaScriptProgramProxy` in `qlib/TypeScriptActionInterface`.
  It owns the child process, performs command/response I/O, and tracks event
  state.
- Child side: `bin/ts-proxy`, which receives commands, executes actions, and
  replies with results or errors.
- Master listener: a per-process UNIX socket used by the child to signal startup
  and to establish event sockets.

### Command Flow
1) Parent starts the child (`ts-proxy`) and waits for a `CC_STARTED` message on
   the command queue.
2) Parent sends commands with `sendCommandArgs()`:
   - `CALL`, `SETUP-EVENT`, `GET-DYNAMIC-OPTIONS`, etc.
3) Child executes and replies with `CC_OK` or `CC_ERR`.
4) Parent validates responses and propagates errors.

## Event Listener Flow
Event actions require a dedicated event socket. The child notifies the parent
with `CC_EVENT_START`, and the parent spins up a listener thread per proxy.
The listener dispatches events to registered observers and detects premature
event termination. If the listener exits unexpectedly, the parent triggers a
restart attempt for the proxy.

## Restart Logic
Restart handling is centralized in `JavaScriptProgramProxy::checkRestart()`.

Key behaviors:
- If the child process is dead and restarting is allowed, the proxy transitions
  into `restarting` state and restarts the process.
- The restart is executed without holding the proxy mutex to avoid deadlocks.
- The `restarting` flag is cleared in all cases, even when restart fails, and
  any waiters are woken up. This prevents `checkRestart()` waiters from blocking
  indefinitely.
- If a restart fails, the failure is logged and the caller receives an error;
  the proxy is no longer stuck in the restarting state.

Debug builds add `@debug()` logs and `@assert()` checks around the restart path,
which are enabled with `qore -G`.

## Testing Hooks
`TS_PROXY_TEST_FORCE_RESTART_ERROR` is a test-only environment variable used to
force `restartProcessIntern()` to throw. It is used by `test/ts-proxy.qtest` to
validate that restart failures do not deadlock callers and that errors are
propagated correctly.

`TS_PROXY_TEST_FORCE_SEND_ERROR` forces the next parent socket send to fail
after startup, simulating EPIPE/SOCKET-CLOSED behavior when responding to a
command. `TS_PROXY_TEST_FORCE_SEND_ERROR_STARTUP` forces the startup `CC_STARTED`
send to fail. Both are used for negative and corner-case tests.

## Operational Notes
- The UNIX socket path is short to avoid the ~104-byte limit.
- If the child dies mid-command, the parent retries based on `RetryCounter`
  policy.
- EPIPE or socket-close failures can occur when the child exits; the proxy
  should treat these as restart conditions.
