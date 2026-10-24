# REST schema cache

<!-- Copyright 2026 Qore Technologies, s.r.o. -->

`TypeScriptActionInterface::getRestSchema()` caches the source document after allowed-path filtering. Validator
construction options and type overrides are applied on every load and are not part of the cached source.
`QORE_V8_CACHE_DIR` selects the cache directory;
`QORE_V8_DISABLE_CACHE` bypasses cache reads and writes. These environment settings must be present when the module
loads.

Each cache basename is `schema-<64 lowercase SHA-256 hex digits>.yaml` (76 ASCII bytes). The digest covers the JSON
array `[schema_location, canonical_allowed_paths]`, with allowed paths sorted and deduplicated. Empty and absent
allowed-path lists both become an empty array and leave the schema unfiltered. The complete location is hashed,
including any snapshot digest, so selecting a different snapshot creates a separate entry. The `.yaml` suffix is
retained for compatibility with the cache format; document loading detects both JSON and YAML.

For example, `/opt/qorus/app-schemas/mailchimp/snapshots/<digest>/schema.json` with allowed paths
`["/lists:GET", "/campaigns:GET", "/lists:GET"]` uses the same cache entry as that location with
`["/campaigns:GET", "/lists:GET"]`. A different location or allowed-path set uses a different entry. JSON encoding
preserves path boundaries: `["/first,/second"]` and `["/first", "/second"]` have distinct keys.

The previous basenames embedded the URL-encoded location and a SHA-512 of comma-joined paths. Those files are
ignored and left untouched; valid entries are regenerated from their source on first use. No migration or manual
cache cleanup is required. Documents are written only after successful schema loading, so a missing source or
invalid path filter does not populate the cache.

`test/ts-schema-cache.qtest` covers near-`PATH_MAX` snapshot locations with 255-byte directory components,
bounded filenames, reloads in separate processes after removing the source, canonical path sets, distinct inputs,
comma-containing paths, unfiltered Swagger/OpenAPI documents, legacy entries, failures, and disabled caching.

## CI schema inputs

`test/docker_test/schema-inputs.json` pins every upstream document that CI qualifies with the SHA-256 of its bytes:
the ten HubSpot documents (each with its v3 release URL), Pipedrive's v1 and v2 documents and Trello's document. The
pins are the source of truth. Pipedrive's input pin covers `JSON.stringify({v1: <parsed document>, v2: <parsed
document>})`, which `assembleInput()` in `app-store.ts` builds; Trello's input is its one document. A pinned URL
must be the URL that the catalogue downloads (`app-sources.json`), and the pins must name exactly the documents that
the catalogue downloads. The separate `ts/src/schema-cache/app-compatibility.json` and `hubspot-compatibility.json`
allowlists cover the normalized supported operations, their referenced schemas, presentation, and security metadata.

CI never downloads these documents from the upstream services. `test/docker_test/schema-inputs.cjs mirror DIR`
reads each one by its pin from the project's private mirror, the generic package registry of mirror/module-v8:
package `schema-inputs`, version `<SHA-256>`, file `<app>-<source>.json` (for example `hubspot-companies.json`,
`pipedrive-v1.json`, `trello-schema.json`). `QORE_SCHEMA_INPUT_MIRROR` in `.gitlab-ci.yml` is the package's base
URL, read with the job token (`CI_JOB_TOKEN`; elsewhere `QORE_SCHEMA_INPUT_MIRROR_TOKEN` is sent as `PRIVATE-TOKEN`).
A token is sent only to the mirror and never printed. Every document is checked against its own pin and every app
input against its pin; a document missing from the mirror, or with other bytes, fails the job with the pinned
SHA-256 and the mirror URL. CI then imports the documents with `qore-hubspot-schemas import` and
`test/docker_test/setup-app-schemas.sh` (`qore-app-schemas import`), so the same compatibility checks and installed
runtime qualification run as for an update. The same commit therefore always qualifies the same documents, whatever
the upstream services do. `test/docker_test/regenerate-i18n-in-container.sh` uses the same pinned documents
(`schema-inputs.cjs upstream`, which downloads them from upstream and checks them against the pins), so that it
generates the catalogs that CI checks.

The daily pipeline schedule (`QORE_SCHEMA_UPSTREAM_CHECK=1`) runs the `check-upstream-schemas` job:
`schema-inputs.cjs check-upstream` downloads every document from upstream as the catalogue does (HubSpot's through
its live catalogue), compares it with its pin, and runs the user-facing `qore-hubspot-schemas update` and
`qore-app-schemas update pipedrive trello` against the upstream services. A document that changed fails the job
with `upstream changed: <source>, <pinned SHA-256> → <new SHA-256> (<URL>)`, or the old and new URL if HubSpot's
catalogue selects another release. An upstream service that cannot be reached or does not answer is reported as
`upstream unavailable` (exit status 69), not as a change.

For every app with a changed document (each HubSpot document on its own; Pipedrive's two documents together), the
job also reports what the change does to the generated app. It reads the pinned documents from the mirror (with the
job token), normalizes them and the upstream documents as the catalogue does, and compares the results:

- `<app>: supported surface unchanged (fingerprint <SHA-256>); the normalized snapshot is unchanged`: the change is
  in operations and definitions that the catalogue does not use; an update installs the same schema
- `... the normalized snapshot changes outside it`: the same fingerprint, but the installed schema differs outside
  the supported surface (for example, a Pipedrive component that no supported operation references)
- `<app>: supported surface CHANGED: <actions> (fingerprint <pinned> → <upstream>, which the catalogue accepts|does
  not accept)`: the actions whose operation, parameters or referenced definitions changed, and any other covered
  part (`servers`, `security`, `securitySchemes`, ...); at most ten names are listed, followed by `and <n> more`
- `<app>: supported surface CHANGED: the catalogue refuses the upstream documents: <error>`, for example when upstream
  removed a supported operation
- `<app>: supported surface not compared: <reason>`, when the mirror lacks a pinned document or an upstream document
  was unavailable

Every reason is cut after 600 characters. The report does not change the result: a changed document fails the job
whatever its effect, because CI qualifies exactly the pinned documents, and the report never stops the update
commands.

When upstream changes a document, compare it against the previously reviewed input before updating any pin.
Review request and response fields, requiredness, nullability, routes, references, and authentication; even an
additive optional field changes the supported metadata fingerprint. Add the reviewed fingerprint while retaining
previous compatible revisions, update the document's pin (and Pipedrive's input pin, which `schema-inputs.cjs`
reports when the sources no longer combine to it), and run the migration tests and installed runtime qualification
in both tiered and AST modes. For example, an optional nullable lead field must remain optional and nullable after
normalization and must materialize in Qore's action options and output types. Source-owned presentation catalogs
must also pass `test/docker_test/check-i18n.sh` with the new snapshot.

Add the reviewed document to the mirror before pushing the new pin: `schema-inputs.cjs stage DIR` downloads every
pinned document from upstream, checks it against its pin, and writes `DIR/<SHA-256>/<file>`, printing one
`<SHA-256> <file>` line per document. Upload the documents that the mirror lacks with an existing GitLab login (no
new token):

```sh
node test/docker_test/schema-inputs.cjs stage "$dir" | while IFS=$'\t' read -r sha file; do
    glab api "projects/mirror%2Fmodule-v8/packages/generic/schema-inputs/$sha/$file" >/dev/null 2>&1 && continue
    glab api --method PUT "projects/mirror%2Fmodule-v8/packages/generic/schema-inputs/$sha/$file" \
        --input "$dir/$sha/$file"
done
```

A version is the document's SHA-256, so older pins keep working, and CI checks every document it reads against its
pin, so a wrong upload fails CI instead of changing what it qualifies.
Keep downloaded provider documents only in private caches and the mirror; commit only fingerprints, pins and
synthetic fixtures, and keep only manifests in CI artifacts.
