# Source-owned provider i18n catalogs

`qlib/TypeScriptActionInterface/i18n` holds the source-owned native i18n
catalogs for the presentation strings (`display_name`, `short_desc`, `desc`)
exported by the TypeScript app catalogue. One directory per catalog domain,
each holding a single `root.json`:

```
qlib/TypeScriptActionInterface/i18n/data-provider.<base64url(app name)>/root.json
```

The catalogs are generated, not hand-written. They are extracted from the
registered app metadata by `qore-data-provider-i18n` (qore repo, `bin/`), which
calls `DataProviderPresentation::buildSourceCatalogs()` for the presentation
contributions of a given owner module.

## Ownership, not app enumeration

`DataProviderActionCatalog` is a **process-wide** registry, and a catalog domain
is keyed on the *app*, not on the module that registered it, so enumerating apps
is not a usable scoping rule: `qore-data-provider-i18n --module
TypeScriptActionInterface` extracts a catalog for every app registered in the
process, including apps and actions this repository does not own. Two concrete
cases:

- qore's `WebSocketClient` module registers the `WebSockets` app, which gets its
  own `data-provider.V2ViU29ja2V0cw` catalog directory;
- Qorus' `QorusSlackServices` module registers a `watch-messages` action against
  the **same** `Slack` app the TypeScript catalogue defines, so its strings land
  inside `data-provider.U2xhY2s/root.json`.

Extraction and validation are therefore scoped to the technical **owner** of
each registration, which `DataProviderActionCatalog` tracks per app and per
action:

- `qore-data-provider-i18n --owner TypeScriptActionInterface` extracts only the
  contributions this module registered. An action-only contributor to a shared
  app emits only its own action messages, so a foreign action against a
  TypeScript app drops out while the app's own catalog stays complete.
- `qore-data-provider-i18n --check-source-tree` infers the owner of each
  committed catalog from its location in the source tree
  (`qlib/<module>/i18n/...`), loads that module, and compares the committed
  roots against a fresh extraction for that owner. Missing, duplicate, and
  orphaned domains are all rejected, so no directory-count heuristic is needed
  and a catalog left behind by an app that was deleted from the catalogue cannot
  survive unnoticed.

Ownership attribution depends on a `DataProvider` fix (3.7): a module loaded
from inside another module's deferred app initialization used to inherit that
module's identity, so anything it registered while its own initializer ran was
attributed to the module whose app was being initialized. The TypeScript apps
are registered pending and initialized on demand, so both cases above were
misattributed to `TypeScriptActionInterface` on any host where those modules are
installed - which is how their strings were committed here. With an older
`DataProvider`, extraction and `--check-source-tree` on a developer box with a
Qore/Qorus installation both still pull in those foreign strings.

## Regenerating

**Always regenerate through `test/docker_test/update-i18n.sh`**, which runs the
extraction inside the CI base image - the same module set CI verifies against -
and replaces the catalog tree wholesale, so the catalogs of apps that have been
removed from the TypeScript catalogue are dropped. It requires a current
`ts/dist/index.js` (`yarn build` in `ts/`) and docker or podman.

## What CI verifies

`test/docker_test/check-i18n.sh`, run by both docker test scripts after
`dist/index.js` has been rebuilt from the branch (so a pre-built catalogue from
the base image cannot hide source drift), runs
`qore-data-provider-i18n --check-source-tree` against
`qlib/TypeScriptActionInterface/i18n`. It prepends this checkout to
`QORE_MODULE_DIR` so that an installed `TypeScriptActionInterface` cannot hide
source drift, and fails on any catalog that is stale, missing, duplicated, or
not owned by this module. The comparison is semantic (parsed JSON), so message
ordering does not matter.
