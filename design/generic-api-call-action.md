# Generic "Make an API call" Action (module-v8 side)

Every TypeScript-defined app registered through `TypeScriptActionInterface`
automatically exposes a `make-api-call` action — the same one the qore-qlib
REST providers get. The mechanism is shared with qore qlib; this doc records
how the integration works on the TypeScript side and what to do (or not do)
in TypeScript apps.

For the full design, see
[`qore/design/generic-api-call-action.md`](../../qore/design/generic-api-call-action.md).

## How it works

Two cooperating layers — gating and dispatch — together decide whether a
TypeScript app gets `make-api-call`:

**Gating (qore side, registration-time).** The qore framework injects
`make-api-call` iff the app's connection scheme is REST-derived — i.e. the
scheme's `ConnectionSchemeInfo.cls` inherits `RestClient::RestConnection`.
Every TypeScript app registers its connection via
`TypeScriptAppRestConnection` or `TypeScriptAwsAppRestConnection`, both of
which `inherits RestConnection`, so the predicate **always returns True** for
TypeScript apps. The action is therefore registered for every TypeScript app
with no per-app code.

**Dispatch (qore side, call-time).** When the user clicks the action, the
`DataProvider` module's reflective default for
`getRestClientForGenericCallImpl()` walks the actual class hierarchy of
`self` looking for either:

1. A member named `rest` (qore-qlib convention)
2. A member named `conn` (the TypeScript convention used by
   `TypeScriptActionAppDataProvider`)

When the framework finds a `conn` member, it calls `conn.get(False)` on the
`AbstractConnection`, which returns the underlying authenticated REST client
(a synchronous `RestClient`). The duck-typed `restDoRequest()` check passes
— both sync `RestClient` and async `RestClientIo` extend
`RestClient::AbstractRestClient` which defines that method.

Result: **every TypeScript app gets `make-api-call` automatically**.
`TypeScriptActionAppDataProvider` does not override
`getRestClientForGenericCallImpl()` — the reflective default handles it.

## What TypeScript app authors need to do

**Nothing.** Apps that register through the standard TypeScript framework
get the action with no per-app code. The action appears in the Qorus picker
alongside the app's typed actions under the auto-injected `__call__` child
path (action name: `make-api-call`).

If a TypeScript app should NOT expose the generic call action (e.g., the
app's authors have a canonical equivalent of their own, or the app is
compliance-sensitive and a free-form API surface is undesirable), set
`disable_generic_api_call: true` when calling `registerApp()` from
TypeScript. The qore-side framework respects the flag and skips
auto-registration.

## When the connection isn't REST

Under the current gating model this case **cannot occur** for TypeScript
apps registered through the standard interface — every such app uses
`TypeScriptAppRestConnection` (or its AWS variant), both of which inherit
`RestConnection`, so they always satisfy the positive REST predicate. If
a future TypeScript framework path registers an app with a non-REST
connection class, the predicate rejects it on the basis of its class
hierarchy alone and no opt-out is required.

## Reference

- `qlib/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc` —
  root provider class; holds the `conn` member that the reflective
  discovery reads.
- `qlib/TypeScriptActionInterface/TypeScriptAppRestConnection.qc` — the
  `RestConnection` subclass whose `get()` returns the auth-configured
  REST client.
- `qore/design/generic-api-call-action.md` — full architecture, request /
  response schema, dynamic-options mechanism, header redaction policy, and
  list of open issues.
