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
