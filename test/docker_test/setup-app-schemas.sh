#!/bin/bash
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
# Import existing repository qualification inputs into a private cache. Debian
# exports omit these inputs; this helper is for repository CI/i18n checks only.
set -euo pipefail
src_dir=$(cd "$(dirname "$0")/../.." && pwd)
cache=${1:?Usage: setup-app-schemas.sh ABSOLUTE_CACHE_DIRECTORY}
cli="$src_dir/ts/dist/schema-cache/app-cli.js"
entries=$(node -e 'const {apps}=require(process.argv[1]); for(const [id,app] of Object.entries(apps)) console.log(id+"\t"+app.sourceFile)' \
    "$src_dir/ts/src/schema-cache/app-contracts.json")
while IFS=$'\t' read -r app filename; do
    node "$cli" --cache-dir "$cache" import "$app" "$src_dir/ts/src/schemas/$filename" >&2
done <<< "$entries"
node "$cli" --cache-dir "$cache" status
