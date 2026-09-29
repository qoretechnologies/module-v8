# Catalogue dependencies

<!-- Copyright 2026 Qore Technologies, s.r.o. SPDX-License-Identifier: MIT -->

The catalogue uses the exact Yarn version and checksum in `packageManager` and
the package versions and integrity checksums in `yarn.lock`. Use `yarn install
--immutable` to reproduce the dependency graph. Updating `package.json` alone
does not update the installed versions.

Run `yarn npm audit --all --recursive --environment production` when preparing
a package. Assess advisory applicability as well as severity; a successful
build is not a security review. Keep the advisory report with the qualification
artifacts, since registry results change over time.

Two scoped resolutions keep older consumers on fixed dependencies:

- `@cypress/request/qs`: 6.16.0 fixes query-string denial-of-service issues.
  The request client's exact pin otherwise retains an affected version. The
  replacement stays on the same major version.
- `react-use/js-cookie`: 3.0.7 fixes cookie-attribute prototype injection.
  `react-use` uses string `get`, `set` and `remove`, which are retained in v3;
  it does not use the removed JSON convenience API. The security test resolves
  the dependency from the hook itself and covers that API and the injection.

Reassess each resolution when its consumer adopts a fixed version. Relevant
upstream advisories:

- [Query-string serialization](https://github.com/ljharb/qs/security/advisories/GHSA-q8mj-m7cp-5q26)
- [Query-string buffer detection](https://github.com/ljharb/qs/security/advisories/GHSA-4mjr-xmp4-gh2g)
- [Cookie-attribute injection](https://github.com/js-cookie/js-cookie/security/advisories/GHSA-qjx8-664m-686j)

The catalogue registration and dependency regression tests run without service
credentials or network access. Live integration tests require their respective
service accounts and are separate qualification work.
