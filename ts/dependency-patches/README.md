# Catalogue dependency security patches

Copyright 2026 Qore Technologies, s.r.o. — MIT

Yarn applies these patches during installation in development, CI and Debian
builds. Both original and patched archives are pinned in the offline vendor
manifest. Package version strings remain unchanged; version-only advisory
scanners therefore still report the patched dependencies.

* `stream-json` 1.9.1: backport the default nesting bound from the resolution of
  [CVE-2026-71429](https://github.com/advisories/GHSA-528h-pc64-c93x).
  Stop path-filter traversal before a stack exceeds 1024 containers; validate
  an explicit positive integer limit and preserve the upstream Infinity opt-out.
  Google Ads 24.1.0 and 25.1.0 still depend on the CommonJS 1.x API. Its
  StreamArray path is unaffected, but the distributed filters must also be safe.
  Remove this backport when the SDK supports a fixed upstream API.
* `elliptic` 6.6.1: preserve the original DRBG output bit width when truncating
  a generated nonce for a curve whose order is not byte-aligned. A leading
  zero byte must not change that width. This addresses the nonce truncation
  described by [CVE-2025-14505](https://github.com/advisories/GHSA-848j-6mx2-7j84).
  Explicit caller-provided `k` retains its integer semantics. The regression
  checks a P-521/SHA-512 signature against an independent RFC 6979 calculation
  and verifies it with Node/OpenSSL. Remove the patch when upstream ships the
  equivalent correction or the Webflow dependency no longer includes elliptic.

* `braces` 3.0.3: bound parser nesting and each recursive AST walker to 128
  levels, including direct AST inputs, for
  [CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
  Ordinary expansion and escaped/literal syntax retain their existing behavior.
* `http-cache-semantics` 4.2.0: apply the existing security restrictions for
  zero freshness before accepting max-stale, stale-while-revalidate or
  stale-if-error. Private, no-store, no-cache and shared cookie responses cannot
  bypass revalidation. Public cache entries still accept valid max-stale.
  This addresses [CVE-2026-93748](https://github.com/advisories/GHSA-ch52-4w7c-c8xp).
  The two additional advisories were found in the fresh npm audit; neither has
  an upstream patched release listed. Replace these patches when one is available.

`scripts/verify-dependency-security.js` exercises the patched libraries through
SDK resolution paths, UUID output-buffer checks after upgrading to 11.1.1,
and the CommonJS APIs used by the consumers. It runs in Jest and against the
isolated production dependency tree. All four patch regressions fail against the
original archives.

Future updates must refresh `yarn.lock`, the offline archive and the vendor,
notice and copyright manifests together. Re-run dependency advisories and
compatibility tests, review changed licenses, and rebuild the Debian/Ubuntu
packages. Bundled JavaScript is maintained by this package; system library
updates do not replace it. Do not resolve new versions or fetch packages during
the Debian build.
