#!/bin/bash
#
# Regenerates the source-owned data-provider i18n catalogs inside the CI base image.
#
# Catalog extraction is scoped to the TypeScriptActionInterface technical owner. Ambient and
# transitive modules therefore cannot add their apps or actions to this repository's roots.
#
# Copyright 2026 Qore Technologies, s.r.o.

set -euo pipefail

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

# Generate into a same-filesystem staging directory, retain only translations whose recorded
# producer source still matches, validate the complete staged tree, and atomically replace the
# committed tree. The container runs as the invoking user so regenerated files keep their owner.
exec "${runtime}" run --rm --user "$(id -u):$(id -g)" -v "${src_dir}":/src "${IMAGE}" \
    bash /src/test/docker_test/regenerate-i18n-in-container.sh /src
