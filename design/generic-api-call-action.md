# Generic "Make an API call" Action (module-v8 side)

Every TypeScript-defined app registered through `TypeScriptActionInterface`
automatically exposes a `make-api-call` action — the same one the qore-qlib
REST providers get. The mechanism is shared with qore qlib; this doc records
how the integration works on the TypeScript side and what to do (or not do)
in TypeScript apps.

For the full design, see
[`qore/design/generic-api-call-action.md`](../../qore/design/generic-api-call-action.md).

## How it works

The `DataProvider` module's reflective default for
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
app's REST surface is dangerous to expose generically, or the connection
backing the app is not actually REST), set `disable_generic_api_call: true`
when calling `registerApp()` from TypeScript. The qore-side framework
respects the flag and skips auto-registration.

## When the connection isn't REST

If a future TypeScript app uses a non-REST connection (e.g., a custom
protocol with no `restDoRequest()` method), the reflective discovery's
duck-type check fails and the framework correctly does not auto-inject the
action — no opt-out required. The opt-out is only needed when the connection
HAS a `restDoRequest()` method but the app's authors do not want generic
calls exposed.

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
