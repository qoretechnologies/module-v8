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

## Measured (Phase 0)

Harness: `test/profile-app-load.qr` builds the real `ts/dist` master catalogue and
calls `actionsCatalogue.loadAppFromPath()` per app with a counting API sink, so it
isolates the **JS-side** load cost (require + schema/action mapping + the
per-action registration callbacks) and the action count. The first row is a
warmup that absorbs one-time infra (i18n, helpers, V8 heap); rows below are
incremental.

```
app                    actions   load_ms   rss_delta_kb   ms_per_act
telegram (warmup)            9     258.2          30572        28.69
github (schema)             47     394.9         130928         8.40
stripe                      50     174.2          41332         3.48
shopify                     19      75.0          22016         3.95
jira                        28      68.8          30208         2.46
hubspot                     78      87.4           5792         1.12
slack                       24      28.7            768         1.19
notion                      18      88.3           3680         4.91
pushover                     3       6.9              0         2.29
```

Findings:

- **The first-call window is real and large for schema apps.** `Github` costs
  ~**395 ms** and ~**130 MB** of JS-side RSS to materialise **47** actions when a
  `webhook_register` needs **1**. This is precisely the lazy-init latency that
  drops the command socket; Phase 1 (register only the requested action) targets
  the per-action portion directly.
- **Cost scales with action count**, in both time and memory — the premise of
  Phases 1–2. Large/schema apps (`Github` 47, `Stripe` 50, `HubSpot` 78) are the
  ones that matter; tiny apps (`pushover` 3) are already cheap, so the optimisation
  is self-targeting.
- **A fixed floor exists** (swagger parse + `processNewApp` setup) that per-action
  filtering will not remove; Phase 0 cannot separate it from the per-action cost
  without the Phase 1 code, so the realisable saving is "most of, not all of" the
  per-action share.

### Where the cost actually is (no-op vs real sink)

Re-running with the sink also calling `action.toData()` (the per-action JS→Qore
serialization that the real `registerAction` performs) isolates the part Phase 1
(action-registration filtering) would remove from the part only Phase 2 (lazy
mapping) can:

```
app       actions   require+map floor (ms)   +per-action serialize (ms)   Phase-1 saving
github         47                    389                        429        ~40 ms (~9%)
stripe         50                    175                        184        ~9 ms  (~5%)
hubspot        78                     91                        104        ~13 ms (~14%)
```

**~85–95% of the first-call cost is the `require()` + (for schema apps) the
Swagger `mapActionsToApp` of *all* operations** — the floor that filtering
registration does **not** touch. The per-action serialization that **Phase 1**
removes is only ~0.2–0.85 ms/action (~5–15% of load), and likewise a minority of
RSS.

**Re-prioritisation:** Phase 1 alone is low ROI and carries the transparency/
completion complexity (the `initmap` short-circuit, partial→full completion).
The high-value work is **Phase 2 for schema apps** — map a *single* operation on
demand (`mapSingleAction(app, opId, locale)`) instead of the whole schema. Once
only the requested action is *materialised in JS*, there is only one action to
register, so Phase 1's filter is **subsumed** by Phase 2 for the cases that
matter (`Github`, `Stripe`, …). Recommended order: do Phase 2 (schema-app lazy
mapping) first; treat Phase 1 filtering as a small companion that falls out of it.

### Where the cost REALLY is (decisive): the swagger schema, not the actions

Splitting `Github`'s load with a node micro-bench (`process.hrtime`):

```
require(github.swagger.json)   340.8 ms   (37.5 MB, 630 paths)   ~127 MB heap
require(helpers + constants)   187.4 ms   (one-time, shared across all apps)
buildActionsFromSwaggerSchema    4.3 ms   -> 40 actions
```

**The entire per-app cost is parsing the oversized swagger schema.** Building the
action specs from it is ~4 ms; mapping/registration is single-digit ms. So
*lazy action mapping (Phase 2 as first framed) saves ~0* — the 37.5 MB JSON is
parsed on `require()` regardless of how many of its operations become actions.

This is a module-wide pattern: **16 schemas, ~83 MB total**, of which only a
small `allowedPaths` subset is ever used per app:

```
github 37.5 MB · mailchimp 9.4 · netsuite 6.1 · esignature 4.4 · stripe 3.5
pipedrive 3.1 · jira 2.8 · gitlab 2.8 · asana 2.6 · zendesk 1.2 · …  (19 schema apps)
```

`Github` uses ~24 of 630 paths (~4%). The bulk of the schema (unused paths +
their `$ref` definitions) is parsed and held in memory for nothing.

### Revised approach: prune schemas at build time (supersedes runtime lazy mapping)

The high-value, lower-risk fix is **build-time swagger pruning**: for each schema
app, emit a schema containing only the `allowedPaths` operations plus their
transitively `$ref`-referenced `definitions`/`components`. Expected effect on
`Github`: 37.5 MB → well under 1 MB, ~341 ms → ~10 ms parse, ~127 MB → a few MB
heap — per ts-proxy child and per Qore-side swagger type derivation.

- **Build step**: a script in the `ts` build pipeline (alongside `copy-schemas`)
  that reads each schema-app's `allowedPaths`, tree-shakes the schema (keep used
  paths; walk `$ref` closure to keep only referenced definitions), and writes the
  pruned schema to `dist/schemas/`. Source schemas stay intact for reference.
- **Correctness risk**: `$ref` closure must be complete (including transitive and
  `allOf`/`oneOf`/`anyOf` refs) so runtime request/response type derivation for
  the kept actions is unchanged. This is the main thing to test.
- **Transparency**: none of the runtime registration/init machinery changes, so
  there is no partial-state/completion problem — a major simplification over the
  runtime-lazy designs above.
- **Generality**: one build step helps all 19 schema apps; hand-written apps
  (barrel imports) are a separate, smaller follow-up if measurements justify it.

Phase 1 (action-registration filtering) remains low ROI and is **not** needed if
schemas are pruned. The runtime-lazy designs (Phases 1–3 above) are retained for
history but are superseded by schema pruning for the apps that dominate the cost.

### Implemented: `ts/scripts/prune-schemas.js` (build step)

A post-build step (`yarn prune-schemas`, wired into `build`/`build:debug`/
`test-build` after `copy-schemas`) prunes each schema app's `dist/schemas` file
to only the operations the app exposes (its actions' `swagger_path`) plus the
**transitive `$ref` closure** of those operations and the schema metadata; it
drops unreferenced definitions/components and vendor blobs (`x-webhooks` etc.).
`src/schemas` is left intact. The script self-validates: it throws if pruning
would leave any dangling local `$ref`.

Measured (all 16 schema apps, one dev host):

```
total  77.40 MB -> 9.72 MB  (saved 67.68 MB, ~87%)
github 37.57 -> 1.04 MB (97%, 24/630 paths)   mailchimp 9.39 -> 0.38 (96%)
gitlab  2.77 -> 0.69 (75%)   jira 2.80 -> 0.61 (78%)   netsuite 6.08 -> 1.69 (72%)
```

End-to-end app-load (harness, github): **~395 ms → ~71 ms**, **~131 MB → ~11 MB**
JS-side RSS; `jira` ~69 → ~50 ms and ~30 MB → ~0.4 MB. The Qore-side swagger type
derivation reads the same pruned file, so it benefits identically.

Correctness:
- `Github` (no `$ref`s): all 40 kept operations are **byte-identical** to the
  pristine source — type derivation provably unchanged.
- `$ref` apps (Stripe, Jira, NetSuite, GitLab, …): **no dangling `$ref`** in any
  pruned schema (built-in self-check + independent re-scan), and each app still
  builds its full action set; existing qtests pass (11/11, 127 assertions).

Deploy note: this takes effect when the `ts` bundle is rebuilt (`yarn build`);
the pruned schemas ship in `dist/schemas`. Hand-written (non-schema) apps are
unaffected and remain a separate, smaller follow-up if measurements justify it.

Caveat on the earlier table: it measures JS-side load only — the Qore-side
data-provider materialisation (cost "b") is additional but, like registration, is
already lazy in the hot path (`do_actions=False` materialises only the requested
action). The Qore side ALSO parses the same swagger for type derivation, so
schema pruning helps it too.
RSS deltas are read from `/proc/self/statm` and are noisy (V8 heap growth / GC
timing — e.g. `slack` reads ~0); treat memory figures as order-of-magnitude and
`load_ms` as the more stable signal. Numbers are from one dev host
(aarch64, debug build) and are for relative comparison, not absolute budgets.

## Relationship to the restart-bound fix

The restart bound (commit `e96d1969`) is the **safety net** — it stops a broken
or slow first-call from looping forever. Lazy action loading is the
**prevention** — it shrinks the first-call window so the underlying
`SOCKET-NOT-OPEN` race fires far less often. They are complementary; this plan
does not change or depend on the restart bound.
