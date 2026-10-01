# TypeScript provider schema boundary

TypeScript app and action records cross an untyped JavaScript-to-Qore boundary. `TypeScriptActionInterface` owns the
single normalization point for that boundary; downstream registration code consumes canonical Qore metadata and must
not repeat structural guesses.

## Version contract

Apps and actions may declare `provider_schema_version`. An absent member means version 1 for backward compatibility.
An explicit member must be the integer `1`; null, an empty value, another type, and unsupported integers fail before
schema materialization. The boundary removes the member after validation so it never leaks into provider metadata.

Adding or changing producer structure requires a new version and an explicit compatibility branch here. Do not infer a
version from labels, optional members, or JavaScript object shape.

## Catalogue handshake and optional schemas

The bundled catalogue requires catalogue protocol **2**, returned by the Qore API's
`getCatalogueProtocolVersion()` callback. This is separate from `provider_schema_version`: it describes
registration capabilities, including connection availability during snapshot failures and schema refresh on retry.
The catalogue checks this version before publishing any identity or registering any app, including custom and lazy
loads. A missing version callback means legacy protocol 1. Unsupported versions produce
`TYPESCRIPT-CATALOGUE-PROTOCOL-ERROR` naming both versions and installation remediation. Older custom scripts that do
not perform the handshake retain the existing legacy behavior. Final app metadata keys are validated against the
installed `DataProviderAppInfo` declaration before typed-hash conversion, so unknown keys produce a protocol error
rather than `HASHDECL-INIT-ERROR`.

For `APP-SCHEMAS-UNAVAILABLE` and HubSpot's existing `HUBSPOT-SCHEMAS-UNAVAILABLE`, app initialization registers
identity, the connection scheme, and OAuth2 metadata. The original error code and remediation text are preserved.
It retains the pending app and action definitions without marking the app fully initialized. Actions remain absent
from the materialized catalogue and each receives the original structured error through
`DataProviderActionCatalog::getInitializationFailures()`. `TypeScriptActionInterface::getAppSchemaError()` exposes
the current app-level schema error without triggering initialization or making the catalogue app unavailable.
Action initialization and provider access raise that error, including remediation; connection creation remains
available. Other initialization errors, including malformed error metadata, still throw on direct initialization.

`initAllApps()` isolates each pending app's initialization: an app failure is retained through
`reportInitializationFailure()` and does not prevent subsequent apps from registering, including during module
loading. Failed apps remain pending for retry. If the app has already initialized and one of its actions fails,
the existing action failure is retained without adding a misleading app failure. Callers can inspect
`getInitializationFailures()` after a bulk load; a successful module load does not imply a complete catalogue.

The catalogue supplies a synchronous `schema_metadata` callback returning only `swagger`, `swagger_schema_map`, or
`initialization_error`. It reads local configuration and verifies snapshots; it never downloads schemas. Failed
selections are not pinned. Each retry refreshes these fields in the same JavaScript pool, preserving connection
callbacks and already registered connection metadata. Once schema and record-based registration succeeds, the app
moves from pending to initialized. Deferred actions are removed only for the duration of registration (to prevent
re-entrant registration), and restored on failure. Successfully materialized actions clear their retained errors.
Existing-app extensions also keep pending metadata until registration succeeds.

### Qorus deployment

Run `qore-app-schemas update trello` (or `import APP FILE` for import-only apps) explicitly, then obtain the JSON map
with `qore-app-schemas status`. Set `QORE_APP_SCHEMA_SNAPSHOTS` to this map in **qorus-core's service/container
environment**, so its TypeScript workers and proxy children inherit it. Setting it only in an operator's shell or
IDE process does not configure the running service. Snapshot directories must be absolute immutable paths, readable
at the same paths by the service account and child containers. Use `--cache-dir DIR` consistently when setup runs
under a different account. `qore-app-schemas run -- COMMAND` supplies the map to a newly launched process and children.

A process can retry an initially missing or invalid snapshot if its JavaScript environment is corrected (or the
configured missing files are installed). Changing a shell or service definition does not update an already running
process's environment, so deployment configuration changes normally require restarting qorus-core. Once a snapshot
has passed verification, `appSchemaMetadata()` pins it: switching to another snapshot requires restarting even if
that process's environment can be changed. `update` alone only changes the cache's active selection.

Install both the Qore module and JS `dist` from the same revision. Check `QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT`,
`QORE_MODULE_DIR`, and any module copy in `$OMQ_DIR/qlib` when diagnosing a protocol mismatch.

## Allowed values

Only the declared `allowed_values` and `element_allowed_values` positions are converted to `AllowedValueInfo`. The
member must be a list, including an explicitly empty list. Each entry must be a hash with its own exact `value` member.
The value itself is opaque and may be a scalar, list, or hash—including a hash that also contains a member named
`value`. Null is not absence and fails validation.

This structural placement rule prevents a recursive "hash containing value" heuristic from reclassifying application
payloads as presentation metadata.

## Discovery inventory

The TypeScript catalogue publishes the complete app/action identity batch for each app before invoking its first Qore
schema conversion. The inventory contains no action schemas and is exposed through `getDiscoveryInventory()`.
Each batch describes exactly one app, includes its app identity, and atomically replaces that app's previous action
set; dynamic replacement preserves the new batch while removing the old runtime registration.
Per-record registration also records its identity as a backward-compatible fallback for older catalogue scripts and
direct dynamic calls. A one-shot batch marker pairs the complete batch with its app registration; an older script
that does not publish a batch clears the previous replacement inventory and rebuilds it per record, rather than
mistaking stale action identities for a current complete set. Module initialization registers the inventory callback
with `DataProviderActionCatalog`; a
qualified `ProviderIndex` generation collects it after TypeScript sources load. A malformed earlier record therefore
cannot hide later action identities behind the first conversion failure.
Every exact identity addition/removal advances Qore's producer-inventory revision, so collection cannot race a
producer mutation and then certify the newer catalog against an older expected set. Filtered index builds collect only
identities in their requested app scope.

The inventory mutation and `DataProviderActionCatalog::markDiscoveryInventoryChanged()` call occur in the same
`discovery_inventory_lock` interval. Collection snapshots Qore's inventory revision without that lock, invokes the
producer callback outside Qore's catalog lock, and then rechecks the revision. This lock ordering makes the producer
state/revision pair linearizable without ever nesting the producer lock below the catalog lock; a collector sees the
old pair, the new pair, or a stale revision that cannot qualify.

Failures are retained at the earliest boundary that has a valid technical identity, including JavaScript pool lookup,
JavaScript-to-Qore conversion, and validation before catalog materialization. Deregistration removes inventory and
retained failure state even when no catalog app was created, so failed dynamic registrations do not leak identities.
A catalogue load or invocation failure that occurs before any valid record identity is retained against its exact
source. The inventory callback raises a structured source error until that same source loads successfully, preventing
an API-version mismatch or broken master script from masquerading as a valid empty inventory.

Consequences:

- an action that fails schema conversion remains expected and makes index qualification fail;
- a source that fails before publishing identities makes inventory collection fail;
- a successful retry satisfies the same exact identity;
- dynamic app deregistration removes its inventory contribution;
- inventory collection adds no work to action execution.

## Static presentation view

A TypeScript field can carry a context-dependent `dynamic_type` or default-value callback. Catalog extraction must
not execute either: it has no connection context, and the same source revision must always produce the same root
catalog. `TypeScriptDataField::getDeclaredType()` therefore returns the static fallback type directly while
`AbstractDataField::getPresentationInfo()` exposes only static labels and choices. Runtime schema resolution continues
to use `getType()` and is unchanged.

Compound types constructed at this boundary retain a stable technical path
rooted at the exact app/action role (request, response, event, or option).
Each dynamic component is a typed base64url-encoded segment; punctuation in a flat identifier therefore cannot
collide with a structurally nested path (for example, field `a-b` is distinct from fields `a` then `b`).
Presentation extraction uses the path to disambiguate equal-shaped anonymous
schemas without hashing translated prose. Any adapter adding another compound
schema entry point must assign an equally stable path before publication.

## Change checklist

When changing the producer boundary:

1. update the version contract if the accepted wire structure changes;
2. normalize only at the named structural position;
3. test absent, empty, null, malformed, supported-version, and unsupported-version inputs;
4. include an opaque payload hash containing `value` and a serialization round trip;
5. verify the complete app/action batch is published before registration and a failed action remains in the
   lightweight discovery inventory;
6. verify catalog extraction does not invoke dynamic type/default/example callbacks;
7. build the AOT qmod against the matching Qore `DataProvider` version and run normal, AST, and AOT test modes.

Release CI then runs `test/docker_test/qualify-provider-discovery.q` against the installed module set, with ambient
TypeScript fixture paths and the `QORE_DATA_PROVIDERS`, `QORE_CONNECTION_PROVIDERS`, and
`QORE_DATASOURCE_PROVIDERS` auto-load paths plus the `QORE_PROVIDER_INDEX_DIR` cached-index overlay removed before
the Qore process starts. Qore modules receive their own startup environment snapshots, so clearing these variables
inside the qualification script would be too late; the script also fails closed if a caller launches it without the
clean boundary. Before opening a qualification generation, the script selects the
same eager-discovery options as `ProviderIndex`, loads `TypeScriptActionInterface` inside the structured error
boundary, completes its static initializer, and dynamically verifies that the exact TypeScript inventory is non-empty
before ProviderIndex can publish. After ProviderIndex returns, the script verifies that the qualified app/action sets
are non-empty. An incompatible installed Qore/module pair therefore
cannot regress to a generic index that reports success with zero TypeScript providers. The script writes the
complete structured discovery report together with the source revision and qore-test-base build provenance as a CI
artifact. A failed generation writes its structured exception report before failing the job; logs are never used as
the qualification signal.
