# Bundled dependency security maintenance

The 2026-10-05 qualification upgrades Handlebars to 4.7.9, Browserslist to
4.28.7, baseline-browser-mapping to 2.11.0, @humanfs/node to 0.16.8, Babel core
to 7.29.6, UUID to 11.1.1 and @ungap/structured-clone to 1.3.1.
The pinned build tool is upgraded from Yarn 4.12.0 to 4.18.1.

Four dependencies have reviewed, checksum-pinned patches applied by Yarn in
both development and package builds:

| Dependency | Advisory | Resolution |
|---|---|---|
| stream-json 1.9.1 | CVE-2026-71429 | Bound nesting in path filters while preserving Google Ads' CommonJS streaming API. |
| elliptic 6.6.1 | CVE-2025-14505 | Retain the generated nonce's byte width during P-521 truncation. |
| braces 3.0.3 | CVE-2026-93687 | Bound string parsing and direct recursive AST traversal. |
| http-cache-semantics 4.2.0 | CVE-2026-93748 | Apply cache security restrictions before accepting stale responses. |

See dependency-patches/README.md in the source package for advisory links and
patch retirement criteria. Version-only scanners may report patched upstream
versions. An empty audit response alone is not evidence of remediation; retain
patch checksums and regression results. The original unpatched ZIPs remain
source inputs for Yarn's patch mechanism and are never the selected installed
packages for these resolutions.

The UUID/stream-json/elliptic regressions run against the isolated production
dependency tree and installed packages. Build-tool regressions additionally
exercise brace nesting, protected cache entries and structured cloning. The
catalogue's complete offline test selection and app/action inventory must pass
before publishing an update. Credentialed live API tests remain separate.

For each update, review GitHub/registry advisories, trace the actual consumer,
choose a compatible upstream release or reviewed backport, regenerate the
lockfile and offline vendor component, and update the notice and copyright
records. Run the tests on Debian and Ubuntu, including native arm64; inspect
source and binary packages and commit the audit evidence. Publish a new APT
package revision for deployed users. System APT library updates do not replace
private npm copies.

The Yarn build tool is separate from the installed runtime dependency tree.
Its current upstream release, 4.18.1, still has 42 advisory matches against
15 packages in its conservative source dependency closure. These are recorded
in yarn-advisory-review.json; tree shaking and command-specific use mean this
is not proof of reachability, and they are not marked fixed. Catalogue Yarn
resolutions do not patch the dependencies inside Yarn itself.

Yarn is not installed in the binary package. Package builds execute it as an
unprivileged user without network access or dependency lifecycle scripts,
using checksum-verified cache archives and an immutable lockfile. These controls
limit exposure for this specific build; they do not make arbitrary interactive
Yarn commands safe. Prefetch new inputs in an unprivileged disposable environment,
review them before qualification, monitor upstream fixes and requalify each tool
update. The exact build-tool dependency/license provenance is recorded in
third-party-provenance.json. Deprecation notices remain separate from advisories.
