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
   the command queue, for at most the startup timeout
   (`JavaScriptProgramProxy::setStartupTimeout()`, `QORE_TYPESCRIPT_PROXY_STARTUP_TIMEOUT_SECS`, 60s by
   default). A child that exits first fails the start at once; a child that has not started in time is
   terminated. The child gets the parent's process environment as it is when the
   child is started (`JavaScriptProgram::getEnvironment()`, which copies it under
   Qore's environment lock), not the `ENV` hash, which is the environment of the
   parent when it started and misses its `setenv()` and `unsetenv()` changes. The
   `env` option of `Process` replaces the child's environment, so the copy is
   passed with the child's own variables: `TS_PROXY_PROCESS_KEY` and the parent's
   call time limit in `QORE_TYPESCRIPT_CALL_TIMEOUT_SECS`, so the child applies it
   to the calls it runs.
2) Parent sends commands with `sendCommandArgs()`:
   - `CALL`, `SETUP-EVENT`, `GET-DYNAMIC-OPTIONS`, etc.
3) Child executes and replies with `CC_OK` or `CC_ERR`. A `CALL` is run with its
   time limit (the action's `io_timeout_secs`, or the module's call time limit),
   and the child reports a call that exceeds it. The parent waits for the limit
   plus `DefaultRequestTimeout` (90s); a child that has not answered by then is
   terminated, because its late answer would be read as the answer to the next
   command, and the next command starts a new child. Other commands wait
   `DefaultRequestTimeout`.
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
- Commands marked `RF_NO_RESTART`, such as event/search release during teardown,
  do not wait behind an active restart. They fail fast because teardown must not
  depend on a restart that may itself be blocked on the event being torn down.
- The restart owner TID is tracked so restart-internal commands cannot wait on
  their own `restarting` state if a nested restart-path error occurs.
- Releasing an event while its proxy is restarting aborts the restarted child
  instead of sending a child `RELEASE-EVENT` command. This prevents a stale event
  setup from surviving after the parent has already removed the observer.
- If a restart fails, the failure is logged and the caller receives an error;
  the proxy is no longer stuck in the restarting state.

Debug builds add `@debug()` logs and `@assert()` checks around the restart path,
which are enabled with `qore -G`.

## Testing Hooks
The hooks are environment variables read with `getenv()` in debug mode
(`--enable-debug`); the `ENV` hash does not see `setenv()`. A child gets the
hooks that a test sets with `setenv()` in its environment.

`TS_PROXY_TEST_FORCE_RESTART_ERROR` is a test-only environment variable used to
force `restartProcessIntern()` to throw. It is used by `test/ts-proxy.qtest` to
validate that restart failures do not deadlock callers and that errors are
propagated correctly.

`TS_PROXY_TEST_STARTUP_HANG` makes the child wait, without connecting, until it
is terminated: a child that never starts, for the startup timeout test.
`TS_PROXY_TEST_RESPONSE_TIMEOUT_MS` sets the time the parent waits for any
command's answer.

`TS_PROXY_TEST_FORCE_SEND_ERROR` forces the next parent socket send to fail
after startup, simulating EPIPE/SOCKET-CLOSED behavior when responding to a
command. `TS_PROXY_TEST_FORCE_SEND_ERROR_STARTUP` forces the startup `CC_STARTED`
send to fail. Both are used for negative and corner-case tests.

`TS_PROXY_TEST_RESTART_WAIT_FAST_PATHS` enables a `getInfo()` debug probe used
by `test/ts-proxy.qtest` to verify that no-restart teardown commands and
restart-owner reentry do not wait on `cond_restart`.

## Operational Notes
- The UNIX socket path is short to avoid the ~104-byte limit.
- If the child dies mid-command, the parent retries based on `RetryCounter`
  policy.
- EPIPE or socket-close failures can occur when the child exits; the proxy
  should treat these as restart conditions.
