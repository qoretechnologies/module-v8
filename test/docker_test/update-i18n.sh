#!/bin/bash
#
# Regenerates the source-owned data-provider i18n catalogs inside the CI base image.
#
# DataProviderActionCatalog is process-wide: qore-data-provider-i18n extracts a catalog for every app
# registered in the process, not only for the apps exported by this repository's TypeScript
# catalogue.  Running the extraction against a developer's own Qore / Qorus installation therefore
# writes catalogs owned by other modules into this repository - for example the "WebSockets" app
# registered by the WebSocketClient module, or Slack's "watch-messages" action registered by the
# Qorus QorusSlackServices module - and CI, which loads neither, then reports the affected catalogs
# as stale.  Regenerating inside the CI base image pins the module set to exactly the one CI
# verifies against.
#
# Copyright 2026 Qore Technologies, s.r.o.

set -e

IMAGE=${QORE_TEST_BASE_IMAGE:-registry.qoretechnologies.com/infrastructure/qore-test-base/qore-test-base:develop}

src_dir=$(cd "$(dirname "$0")/../.." && pwd)

if [ ! -f "${src_dir}/ts/dist/index.js" ]; then
    echo "ERROR: ${src_dir}/ts/dist/index.js is missing; run \"yarn build\" in ${src_dir}/ts first" >&2
    exit 1
fi

if command -v docker >/dev/null 2>&1; then
    runtime=docker
elif command -v podman >/dev/null 2>&1; then
    runtime=podman
else
    echo "ERROR: neither docker nor podman is available; one of them is required to run ${IMAGE}" >&2
    exit 1
fi

echo "-- regenerating i18n catalogs in ${IMAGE} --"

# The extraction only ever adds or rewrites catalogs, so it is run into an empty directory and the
# result replaces the committed tree wholesale; this is what drops the catalogs of apps that have
# been removed from the catalogue.  The container runs as the invoking user so that the regenerated
# files stay owned by the developer.
exec ${runtime} run --rm --user "$(id -u):$(id -g)" -v "${src_dir}":/src "${IMAGE}" bash -c '
set -e
. /tmp/env.sh
export HOME=/tmp
export QORE_MODULE_DIR=/src/qlib:${QORE_MODULE_DIR}
export QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT=/src/ts/dist/index.js
# the staging directory is created on the same filesystem as the catalog tree so that the
# replacement is a rename and not a cross-device copy that could fail half way through
out=$(mktemp -d -p /src/qlib/TypeScriptActionInterface)
trap "rm -rf ${out}" EXIT
qore-data-provider-i18n --output "${out}" --module TypeScriptActionInterface
chmod 755 "${out}"
rm -rf /src/qlib/TypeScriptActionInterface/i18n
mv "${out}" /src/qlib/TypeScriptActionInterface/i18n
'
