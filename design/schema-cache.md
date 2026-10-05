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

## Reviewing CI schema inputs

`test/docker_test/app-schema-inputs.json` pins the exact private Pipedrive and Trello qualification inputs.
Pipedrive's bundle checksum covers `JSON.stringify({v1: <parsed document>, v2: <parsed document>})`, while each
source checksum covers the original response bytes. A changed download fails with the expected and received
checksums before the input is written. The separate `ts/src/schema-cache/app-compatibility.json` allowlist covers
the normalized supported operations, their referenced schemas, presentation, and security metadata.

When upstream changes a document, compare it against the previously reviewed input before updating either pin.
Review request and response fields, requiredness, nullability, routes, references, and authentication; even an
additive optional field changes the supported metadata fingerprint. Add the reviewed fingerprint while retaining
previous compatible revisions, update the exact CI source and bundle checksums, and run the migration tests and
installed runtime qualification in both tiered and AST modes. For example, an optional nullable lead field must
remain optional and nullable after normalization and must materialize in Qore's action options and output types.
Source-owned presentation catalogs must also pass `test/docker_test/check-i18n.sh` with the new snapshot.
Keep downloaded provider documents in private temporary caches; commit only fingerprints and synthetic fixtures.
