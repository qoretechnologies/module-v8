#!/bin/bash
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
# Import reviewed qualification inputs into a private cache. Apps pinned in schema-inputs.json use the documents that
# schema-inputs.cjs fetched into the input directory; the other apps use repository inputs. Debian builds and startup
# remain offline.
set -euo pipefail
src_dir=$(cd "$(dirname "$0")/../.." && pwd)
usage='Usage: setup-app-schemas.sh ABSOLUTE_CACHE_DIRECTORY ABSOLUTE_INPUT_DIRECTORY'
cache=${1:?$usage}
inputs=${2:?$usage}
cli="$src_dir/ts/dist/schema-cache/app-cli.js"
pinned=" $(node -e 'console.log(Object.keys(require(process.argv[1]).apps).join(" "))' \
    "$src_dir/test/docker_test/schema-inputs.json") "
entries=$(node -e 'const {apps}=require(process.argv[1]); for(const [id,app] of Object.entries(apps)) console.log(id+"\t"+app.sourceFile)' \
    "$src_dir/ts/src/schema-cache/app-contracts.json")
while IFS=$'\t' read -r app filename; do
    input="$src_dir/ts/src/schemas/$filename"
    if [[ "$pinned" == *" $app "* ]]; then
        input="$inputs/$app.json"
    fi
    node "$cli" --cache-dir "$cache" import "$app" "$input" >&2
done <<< "$entries"
node "$cli" --cache-dir "$cache" status
