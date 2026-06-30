<!-- Copyright 2026 Qore Technologies, s.r.o. -->
# Lazy action loading in TypeScriptActionInterface

*Status: plan / not yet implemented. Extends [lazy-app-loading.md](lazy-app-loading.md)
one level down: from the **app** boundary to the **action** boundary.*

## Problem

Today laziness stops at the **app** boundary. Once an app is loaded on demand
(`loadAppFromPath`), the catalogue registers **every** action of that app
eagerly:

- `ActionsCatalogue.loadAppFromPath()` → `registerAppCollection({[name]: app}, …)`
  → `actions.forEach(registerActionFn)` (`ts/src/ActionsCatalogue/index.ts:311,224`).
- Each `api.registerAction(obj)` crosses the JS→Qore boundary and is materialised
  on the Qore side (`TypeScriptActionInterface::registerAction(JavaScriptObject)`
  → `registerActionIntern`, `TypeScriptActionInterface.qc:745,1129`), emitting the
  `Registered TypeScript app X action Y` log line per action.

For a real call we usually need **one** action. Example: a `webhook_register`
for `Github/new_repository_issue` registers all ~50 Github actions
(schema-derived from `github.swagger.json` via `mapActionsToApp`) before doing
any work.

This costs us three ways:

1. **Startup latency** — the ts-proxy child sits in app+action registration on
   the first call. This is the exact "lazy-init first-call latency" window that
   drops the parent↔child command socket (`SOCKET-NOT-OPEN` with a live child).
   Commit `e96d1969` bounds the resulting restart loop, but **shrinking this
   window attacks the root cause**: fewer/cheaper registrations = smaller race
   window = fewer spurious restarts.
2. **Memory** — every app's index does a **barrel import**
   (`import * as ACTIONS from './actions'`, e.g.
   `ts/src/apps/active-campaign/index.ts:15`), so `require(appDir)` parses and
   instantiates *all* action modules (and, for schema apps, maps every operation)
   even when one is used. The Qore side then holds the materialised type/provider
   objects for all of them.
3. **CPU** — N JS→Qore round-trips + N Qore-side materialisations per app load,
   repeated for every fresh ts-proxy child.

## Key constraint: transparency (unchanged from app-level)

The same acceptance bar as app-level lazy loading applies: **no caller may
observe a behavioural difference.** Anything that needs an action it has not yet
materialised must transparently trigger that action's registration on first
touch. Partial registration must never surface as "action not found".

A crucial enabler already exists: **catalogue browse is served from the data
index, not from registered actions.** `ProviderIndexUtil::tryGetApproximateActionsForApp()`
and friends list an app's actions for the UI **with no module loaded**
(see lazy-app-loading.md §"The existing model already gives us the vehicle").
So per-action registration does **not** break the app/action browse experience —
the UI listing does not depend on actions being materialised in the proxy.

## What must always be registered (regardless of action filter)

Partial registration filters only the **per-action API/event materialisation**.
These stay unconditional on every app load:

- the app object itself (`registerApp` / `registerExistingApp`);
- app-scoped closures: `post_auth`, `post_auth_code`, connection `conn_update`
  code (`TypeScriptActionInterface.qc:1332,1348,1372`);
- record-based actions, already registered separately and always when
  `get_table_list` is set (`initAppIntern` → `registerRecordBasedActions`,
  `TypeScriptActionInterface.qc:1099`);
- the **requested** action(s), including their action-scoped
  `webhook_register` / `webhook_deregister` closures
  (`TypeScriptActionInterface.qc:1978,2226`).

## Design: thread an action filter through the existing load path

The action name is already known at the Qore call site and is simply not passed
down. Thread an optional action filter from the call site into the JS catalogue:

```
doAsyncCall(app, action, …)                         # ts-proxy child
  └─ initAppAction(app, action)                     # TypeScriptActionInterface.qc:1013
       └─ initApp(app, do_actions=False, …)         # registers app, NOT all actions
            └─ initAppIntern → loadAppFromPath(path, /*only=*/{action})   # :1059
                 └─ Priv::loadAppFromPath(path, only)                     # Priv.qc:185
                      └─ actionsCatalogue.loadAppFromPath(Api, path, only) # JS :311
                           └─ registerApp(app)
                              + register only the actions in `only`
```

### Phase 0 — Measure first

Before changing behaviour, instrument and quantify (so we optimise the real
cost, not the assumed one):

- per-app **wall time** and **RSS delta** for `loadAppFromPath` broken into
  (a) `require()`/schema-map parse vs (b) action registration round-trips;
- counts: actions registered vs actions used per ts-proxy child lifetime;
- the size of the lazy-init window vs the observed `SOCKET-NOT-OPEN` rate.

Deliverable: a short measured table appended here (mirroring lazy-app-loading.md
§"Measured"). This decides how much of Phase 2 is worthwhile per app class
(schema apps vs hand-written apps may differ sharply).

### Phase 1 — Action-filtered registration (biggest race/startup win)

Reduce cost (b) without touching module structure:

1. JS: `loadAppFromPath(api, appPath, only?: string[])`. When `only` is set,
   `registerApp(app)` then register **only** the matching actions (plus the
   always-on set above); otherwise behave exactly as today.
2. Qore: `Priv::loadAppFromPath(path, *softlist<string> only)` →
   pass through to JS; `initApp`/`initAppAction` supply the requested action.
3. Track per app, in the proxy, **which actions are already registered**, so a
   later call for a different action registers just that one (idempotent;
   `require()` is already cached, so no re-parse).

This alone removes ~49/50 of the Qore-side materialisations and JS→Qore
round-trips for the Github webhook case, shrinking the lazy-init window.

Barrel imports still parse all action modules, so **Phase 1 cuts CPU/latency and
Qore-side memory, but not JS-side parse memory** — that is Phase 2.

### Phase 2 — Lazy action materialisation (memory win)

Attack cost (a): make an app expose its actions as **lazy thunks** instead of a
barrel import, so only the requested action's module/operation is instantiated.

- **Hand-written apps**: replace `import * as ACTIONS from './actions'` +
  `actions: [...]` with an action **registry of factories**
  (`Record<string, () => TQoreAppAction>`); `loadAppFromPath(…, only)` invokes
  only the needed factories. A codemod can convert the ~100 app indexes
  mechanically; `mapActionsToApp` becomes lazy-aware.
- **Schema apps** (Github, etc.): map **one operation** from the Swagger schema
  on demand (`mapActionsToApp` → `mapSingleAction(appName, opId, locale)`)
  instead of mapping the whole schema up front.

### Phase 3 — Completion-to-full for whole-catalogue consumers

Some paths legitimately need every action of an app:

- `oload` / deployment validation;
- `getDynamicOptions` that depends on sibling actions;
- any tooling that enumerates an app's materialised actions.

Provide an explicit **"complete to full"** entry (the existing pending→completing
machinery already models this for apps, `TypeScriptActionInterface.qc:776,955`):
`ensureAllActions(app)` registers any not-yet-registered actions. Whole-catalogue
consumers call it; the hot per-call path does not. On-demand completion is the
transparency backstop: a touch of an unregistered action triggers
`ensureAction(app, action)` first.

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| A caller sees "action not found" (transparency break) | On-demand `ensureAction()` on first touch; `ensureAllActions()` for enumerating consumers; browse already served from the data index |
| Action-scoped webhook/auth closures missed | The requested action's `webhook_register`/`deregister` are part of its own registration; app-scoped auth/conn closures stay unconditional |
| Schema apps can't map one operation cheaply | Phase 0 measures this; if `mapSingleAction` is not worthwhile for an app class, keep Phase 1 only (still removes Qore-side cost) |
| Partial state inconsistency across restarts | Per-app registered-action set is rebuilt from scratch in each fresh child; idempotent registration; `require()` cache avoids re-parse |
| Codemod regressions across ~100 apps | Land Phase 2 behind a flag, app-by-app; keep barrel path as fallback |

## Testing plan

- **JS/Jest**: `loadAppFromPath(api, path, ['x'])` registers app + only `x`
  (+ always-on set); second call for `y` adds only `y`; `ensureAllActions`
  registers the remainder; no-filter path unchanged.
- **Qore qtest** (`test/ts-action-interface.qtest`): `initAppAction(app, a)`
  materialises only `a` (assert via a registered-actions introspection helper);
  a second action loads on demand; full-catalogue/oload path still sees all
  actions; webhook_register for an event action works with only that action
  loaded.
- **Regression**: `typescript.qtest`, `ts-proxy.qtest`, existing app qtests.
- **Perf gate**: child startup time + RSS for a single `webhook_register`
  before/after (target: measurable shrink of the lazy-init window and reduced
  `SOCKET-NOT-OPEN` restart rate).

## Rollout

1. Phase 0 instrumentation (no behaviour change) → publish measurements here.
2. Phase 1 behind `TS_PROXY_LAZY_ACTIONS` (default off) → measure → default on.
3. Phase 2 codemod app-by-app behind the same flag; schema-app `mapSingleAction`.
4. Phase 3 completion path + transparency tests; remove the flag once green.

## Relationship to the restart-bound fix

The restart bound (commit `e96d1969`) is the **safety net** — it stops a broken
or slow first-call from looping forever. Lazy action loading is the
**prevention** — it shrinks the first-call window so the underlying
`SOCKET-NOT-OPEN` race fires far less often. They are complementary; this plan
does not change or depend on the restart bound.
