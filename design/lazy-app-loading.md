# Lazy app loading in TypeScriptActionInterface

## Problem

When `TypeScriptActionInterface` is loaded, the master catalogue
(`ts/dist/index.js` → `ActionsCatalogue`) eagerly `require()`s **all ~100
apps**, each pulling in its SDK. Measured peak in the `qorus-alpine` image:

- master catalogue (all apps): **~1.9 GB** in the embedded-V8 ts-proxy
- a single app (Paddle): **~430 MB**

In a memory-constrained CI/k8s pod this OOM-kills the ts-proxy subprocess,
surfacing to Qorus as a Qore `SOCKET-NOT-OPEN` on the ts-proxy IPC socket
(see `design/ts-proxy.md`). It also slows every startup that touches one app.

## Key constraint: transparency

The change must be **transparent to API consumers** — `getDataProvider()`,
`getChildProviderEx()`, the `tsrest-<app>` connection schemes, action schemas
and `doRequest()` must behave identically. Callers must never have to call
`initApp()` themselves.

## The existing model already gives us the vehicle

This is the *within-module* continuation of an existing, already-transparent
**cross-module** lazy model:

1. **Data index** — `qctl update-index` writes `$OMQ_DIR/etc/qore-data-index.yaml`
   (`ProviderIndexUtil`). It holds, per app, the full browse metadata
   (`name`, `display_name`, `desc`, `groups`, `scheme: tsrest-<app>`, `logo`,
   `supports_*`, actions) plus `appmap`/`schememap` (app/scheme → providing
   `.qmod`).
2. **Browse is already lazy** — `ProviderIndexUtil::getCachedApps()` /
   `tryGetAppInfo()` / `tryGetApproximateActionsForApp()` serve the catalogue
   from the index **with no module loaded**.
3. **Access is already lazy** — `DataProviderActionCatalog` calls
   `ProviderIndexUtil::checkAppModule(app)` (and the scheme equivalent) on first
   touch; that loads the *providing module* and the
   `registerPendingApp(app, () => initApp(app))` /
   `registerPendingScheme(...)` closures drive the on-demand init.

So today the laziness stops at the **module** boundary: `checkAppModule("Paddle")`
loads `TypeScriptActionInterface`, which then loads **all** 100 apps.

## Design: extend the same model one level down

On load, the module registers **every app it provides as pending** (cheap,
metadata-only) through the *standard* path, and only loads an app's JS+SDK when
its pending closure fires.

### 1. Lightweight catalogue (done)
`ActionsCatalogue` no longer statically imports the ~100 apps. It exposes:
- `loadAppFromPath(api, appDir)` — `require()` one app dir, map it
  (`processNewApp`) and register its actions on demand.
- `initializeCatalogue()` only sets up the small custom/existing sets.

Result: the master is now lightweight (it is loaded only to provide
`loadAppFromPath`).

### 2. Register pending from the index (replaces the manifest)
There is **no bespoke manifest** — the index is the manifest. On module init,
when the data index is available:
- enumerate the module's own `apps/` directories (dir name → `scheme =
  "tsrest-<dir>"`), cross-reference `ProviderIndexUtil::getCachedApps()` by
  `scheme` to get the app `name` (+ any metadata needed for the pending stub),
- register each app pending via the existing primitives:
  - `appmap{name} = <AppInfo>{app: {name, display_name, …}, pending_path: appDir}`
  - `ConnectionSchemeCache::registerPendingScheme("tsrest-"+name, () => initApp(name))`
  - `DataProviderActionCatalog::registerPendingApp(name, () => initApp(name), modulePath)`

These are the exact closures `checkAppModule` already relies on, so catalogue
drill-in and connection resolution trigger `initApp` with **zero caller
changes** — that is what makes it transparent.

### 3. On-demand load completes the pending entry
`initApp(name)` for a pending entry (`AppInfo.pending_path` set) calls
`TypeScriptActionInterfacePriv::loadAppFromPath(path)` → master
`actionsCatalogue.loadAppFromPath(Api, path)`. The load re-enters `registerApp`
with the fully-mapped app; `registerApp` must **complete the existing pending
entry** (fill in the closures/pool, leave the already-correct pending
scheme/catalogue in place) rather than throw "already registered" or
re-register the scheme/catalogue. This is the one careful framework change.

### 4. Dual mode (index build vs runtime)
- **runtime** (index present for this module): register pending (above).
- **`qctl update-index` / no index**: fall back to the current full load (load
  the catalogue and initialize all apps) so the index can be (re)built. The
  index is built once at image-build time; runtime only reads it.

### 5. Phase 3 — dynamic option values (handled by the lazy-init triggers)
Options whose `allowed_values`/`default_value` are functions (e.g.
`getPaddleProductIdAllowedValues`) can't be served from the index. They are
served by the app's action data provider, which is only reachable through
`TypeScriptActionRootDataProvider::getChildProviderImpl()` (→ `initApp`) or
`DataProviderActionCatalog::getAppEx()` (→ `initApp`); both transparently load
the app on access, after which the dynamic values resolve normally. Verified:
accessing a pending app's action request type loads only that app and exposes
the dynamic-allowed-values option. No extra code is required.

## Transparency acceptance test

Against eager and lazy builds, with the module **unloaded**:
1. browse the catalogue (from the index) — same app list + metadata;
2. open one app's data provider — only that app loads;
3. create its `tsrest-<app>` connection — resolves and works;
4. fetch an action schema and execute it — identical results;
5. resolve a dynamic `allowed_values` — values returned (lazily).
None of these require the caller to call `initApp`.

## Measured (prototype, manifest-based precursor)

- register all 100 apps pending: **~110 MB** (all 100 listed)
- lazy catalogue + load & run Paddle on demand: **590 MB** (vs **1241 MB** all
  eager) — Paddle executes correctly.

The index-driven version above keeps these numbers while removing the manifest
and making the path fully transparent via the standard pending primitives.
