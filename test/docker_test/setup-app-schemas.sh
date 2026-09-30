#!/bin/bash
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
# Import reviewed qualification inputs into a private cache. Migrated apps use
# checksum-pinned public downloads; Debian builds and startup remain offline.
set -euo pipefail
src_dir=$(cd "$(dirname "$0")/../.." && pwd)
cache=${1:?Usage: setup-app-schemas.sh ABSOLUTE_CACHE_DIRECTORY}
cli="$src_dir/ts/dist/schema-cache/app-cli.js"
node "$src_dir/test/docker_test/download-app-schema-inputs.cjs" "$cache/inputs"
entries=$(node -e 'const {apps}=require(process.argv[1]); for(const [id,app] of Object.entries(apps)) console.log(id+"\t"+app.sourceFile)' \
    "$src_dir/ts/src/schema-cache/app-contracts.json")
while IFS=$'\t' read -r app filename; do
    input="$src_dir/ts/src/schemas/$filename"
    if [[ "$app" == pipedrive || "$app" == trello ]]; then
        input="$cache/inputs/$app.json"
    fi
    node "$cli" --cache-dir "$cache" import "$app" "$input" >&2
done <<< "$entries"
node "$cli" --cache-dir "$cache" status
