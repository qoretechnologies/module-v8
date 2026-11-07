# module-v8
JavaScript / v8 module for Qore

HubSpot connection deployment and read-only CMS examples:
[Optional CMS authorization](docs/hubspot-cms-oauth.md).

The native library includes LGPL-2.1-or-later sources (see `COPYING.LGPL` and
`COPYING.GPL`); supporting headers and Qore modules retain their MIT notices.
TypeScript execution uses Node's built-in compiler where available, or the
`typescript` package (`node-typescript` on Debian/Ubuntu). The separately built
`ts/` app catalogue is optional; see `debian/README.source` for package scope.

## CI verification after merges

For pushes to `develop`, the `tree-already-tested` preflight checks whether the
current commit or an immediate parent with the identical Git tree (for example
the branch of a merged pull request) already has a successful module pipeline.
It requires successful `test-ubuntu` and `test-alpine` jobs that ran their suites
(with their qualification artifacts, which expire after 7 days), so a pipeline
that itself reused earlier evidence never becomes evidence. When that evidence
is available, the platform jobs report success to GitHub with a link to the
earlier pipeline and finish before building or testing; the qualification
artifacts are those of the earlier pipeline. GitLab still creates the preflight
and lightweight platform jobs.

Feature branches, tags, scheduled pipelines (including the upstream schema
check) and pipelines started manually run in full. Set `QORE_CI_FORCE_FULL=1` to
require full verification on a `develop` push, for example after updating the
test images or dependencies without changing this repository's tree.

The preflight first uses `CI_JOB_TOKEN`. If the server refuses pipeline reads,
configure the masked CI variable `QORE_CI_READ_API_TOKEN` with a token that has
`read_api` access to `mirror/module-v8`. Missing credentials, API errors,
invalid responses and incomplete platform results retain the full pipeline, and
a failed preflight is allowed to fail without blocking the platform jobs.
This follows Qore's successful-tree reuse mechanism introduced in commit
`22a9b5c721`, as adapted in module-ncurses.

The deterministic preflight and status-reporting tests run on both CI platforms.
To run them locally:

```bash
python3 test/docker_test/test_tree_tested.py
```
