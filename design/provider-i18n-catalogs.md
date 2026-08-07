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
calls `DataProviderPresentation::buildSourceCatalogs()` for every app returned
by `DataProviderActionCatalog::getAllApps()`.

## The extraction is not hermetic by itself

`DataProviderActionCatalog` is a **process-wide** registry, and the catalog
domain is keyed on the *app*, not on the module that registered it. So
`qore-data-provider-i18n --module TypeScriptActionInterface` extracts a catalog
for every app registered in the process, and every action registered against
those apps — including apps and actions this repository does not own:

- the `WebSockets` app is registered by qore's `WebSocketClient` module, and
  gets its own `data-provider.V2ViU29ja2V0cw` catalog directory;
- Qorus' `QorusSlackServices` module registers a `watch-messages` action
  against the **same** `Slack` app the TypeScript catalogue defines, so its
  strings land inside `data-provider.U2xhY2s/root.json`.

Which foreign modules get loaded depends entirely on the module set installed
on the machine running the extraction. Regenerating on a developer box with a
Qore/Qorus installation therefore writes strings this module must not own into
the repository; CI loads neither module and reports the affected catalogs as
`STALE`.

**Always regenerate through `test/docker_test/update-i18n.sh`**, which runs the
extraction inside the CI base image — the same module set CI verifies against.
The script replaces the catalog tree wholesale, so it also drops the catalogs
of apps that have been removed from the TypeScript catalogue.

## What CI verifies

`test/docker_test/check-i18n.sh`, run by both docker test scripts after
`dist/index.js` has been rebuilt from the branch (so a pre-built catalogue from
the base image cannot hide source drift), enforces two things:

1. `qore-data-provider-i18n --check` — every domain exported by the catalogue
   has a committed catalog whose content matches a fresh extraction. The
   comparison is semantic (parsed JSON), so message ordering does not matter.
2. The committed catalog directory count equals the generated domain count.
   `--check` only walks the domains it regenerates, so it is blind to a
   directory left behind by a deleted app; the count comparison closes that
   gap. It is exact, because step 1 guarantees every generated domain already
   has a matching committed directory.
