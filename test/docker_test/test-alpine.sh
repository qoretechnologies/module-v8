#!/bin/bash

set -e
set -x

ENV_FILE=/tmp/env.sh

. ${ENV_FILE}

# setup MODULE_SRC_DIR env var
cwd=`pwd`
if [ -z "${MODULE_SRC_DIR}" ]; then
    if [ -e "$cwd/src/QoreV8Program.cpp" ]; then
        MODULE_SRC_DIR=$cwd
    else
        MODULE_SRC_DIR=$WORKDIR/module-v8
    fi
fi
echo "export MODULE_SRC_DIR=${MODULE_SRC_DIR}" >> ${ENV_FILE}

echo "export QORE_UID=1000" >> ${ENV_FILE}
echo "export QORE_GID=1000" >> ${ENV_FILE}

. ${ENV_FILE}

export MAKE_JOBS=4

# build module and install
echo && echo "-- building module --"
mkdir -p ${MODULE_SRC_DIR}/build
cd ${MODULE_SRC_DIR}/build
export NODE_LIB_DIR=/opt/nodejs/lib
export NODE_INCLUDE_DIR=/opt/nodejs/include/node
cmake .. -DCMAKE_BUILD_TYPE=debug -DCMAKE_INSTALL_PREFIX=${INSTALL_PREFIX} -DCMAKE_POLICY_VERSION_MINIMUM=3.5
make -j${MAKE_JOBS}
make install

# build the TypeScript dist from THIS branch so the tests run against the
# matching catalogue.  The build must be self-contained: do not depend on a
# pre-built dist from the base image, which may be out of sync with the qlib in
# this branch.
echo && echo "-- building TypeScript dist --"
cd ${MODULE_SRC_DIR}/ts
corepack enable
yarn install
export NODE_OPTIONS="--max-old-space-size=8192"
yarn build
echo "export QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT=${MODULE_SRC_DIR}/ts/dist/index.js" >> ${ENV_FILE}
. ${ENV_FILE}

# Installed release qualification covers this checkout's master catalogue, never ambient developer/runner fixtures.
unset QORE_TYPESCRIPT_ACTION_SCRIPTS QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS
unset QORE_DATA_PROVIDERS QORE_CONNECTION_PROVIDERS QORE_DATASOURCE_PROVIDERS
unset QORE_PROVIDER_INDEX_DIR

# The catalogue deliberately ships no HubSpot documents. Fetch and qualify a private
# snapshot explicitly before materializing apps for i18n and provider qualification.
# Keep only the checksum/provenance manifest in CI artifacts, never the documents.
qualification_dir=${MODULE_SRC_DIR}/qualification
qualification_index=$(mktemp -d)
hubspot_cache=$(mktemp -d)
app_schema_cache=$(mktemp -d)
trap 'rm -rf "$qualification_index" "$hubspot_cache" "$app_schema_cache"' EXIT HUP INT TERM
mkdir -p "$qualification_dir"
hubspot_setup_log="$qualification_dir/hubspot-schema-setup-${CI_JOB_NAME:-local}.log"
if ! node "${MODULE_SRC_DIR}/ts/dist/schema-cache/hubspot-cli.js" \
        --cache-dir "$hubspot_cache" update > "$hubspot_setup_log" 2>&1; then
    cat "$hubspot_setup_log"
    exit 1
fi
QORE_HUBSPOT_SCHEMA_SNAPSHOT=$(node "${MODULE_SRC_DIR}/ts/dist/schema-cache/hubspot-cli.js" \
    --cache-dir "$hubspot_cache" status)
export QORE_HUBSPOT_SCHEMA_SNAPSHOT
cp "$QORE_HUBSPOT_SCHEMA_SNAPSHOT/manifest.json" \
    "$qualification_dir/hubspot-schema-manifest-${CI_JOB_NAME:-local}.json"

# Exercise missing-cache and cache-integrity regressions without service access.
cd "${MODULE_SRC_DIR}/ts"
node --experimental-vm-modules node_modules/jest/bin/jest.js --ci --maxWorkers=2 \
    --config src/jest.config.ts --runTestsByPath src/tests/app-schema-cache.test.ts \
    src/tests/pipedrive-migration.test.ts src/tests/trello-migration.test.ts
# Repository and checksum-pinned private downloads are qualification inputs; Debian exports omit them.
QORE_APP_SCHEMA_SNAPSHOTS=$("${MODULE_SRC_DIR}/test/docker_test/setup-app-schemas.sh" "$app_schema_cache")
export QORE_APP_SCHEMA_SNAPSHOTS
node -e 'const fs=require("fs"); const out=process.argv[1]; const result={};
for (const [id,dir] of Object.entries(JSON.parse(process.env.QORE_APP_SCHEMA_SNAPSHOTS))) {
    result[id]=JSON.parse(fs.readFileSync(dir+"/manifest.json"));
} fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");' \
    "$qualification_dir/app-schema-manifests-${CI_JOB_NAME:-local}.json"

# Ensure that every provider presentation string exported by the TypeScript
# catalogue has a current source-owned native i18n entry, and that no catalog
# survives for an app that has been removed from the catalogue. Run this only
# after rebuilding dist/index.js so the base image cannot hide source drift.
node --test \
    "${MODULE_SRC_DIR}/test/docker_test/download-app-schema-inputs.test.cjs" \
    "${MODULE_SRC_DIR}/test/docker_test/sync-i18n-translations.test.mjs" \
    "${MODULE_SRC_DIR}/test/docker_test/qualification-environment.test.mjs"
"${MODULE_SRC_DIR}/test/docker_test/check-i18n.sh" \
    "${MODULE_SRC_DIR}/qlib/TypeScriptActionInterface/i18n"

# Build the complete provider index through Qore's qualified publication path
# using installed modules.  Keep the structured report even when qualification
# fails so CI never has to infer completeness from logs.
env -u QORE_TYPESCRIPT_ACTION_SCRIPTS -u QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS \
    -u QORE_DATA_PROVIDERS -u QORE_CONNECTION_PROVIDERS -u QORE_DATASOURCE_PROVIDERS \
    -u QORE_PROVIDER_INDEX_DIR \
    qore "${MODULE_SRC_DIR}/test/docker_test/qualify-provider-discovery.q" \
    "$qualification_index" \
    "$qualification_dir/provider-discovery-${CI_JOB_NAME:-local}.json"

# add Qore user and group
if ! grep -q "^qore:x:${QORE_GID}" /etc/group; then
    addgroup -g ${QORE_GID} qore
fi
if ! grep -q "^qore:x:${QORE_UID}" /etc/passwd; then
    adduser -u ${QORE_UID} -D -G qore -h /home/qore -s /bin/bash qore
fi

# own everything by the qore user
chown -R qore:qore ${MODULE_SRC_DIR}
chown -R qore:qore "$hubspot_cache" "$app_schema_cache"

# run the tests
export QORE_MODULE_DIR=${MODULE_SRC_DIR}/qlib:${QORE_MODULE_DIR}
cd ${MODULE_SRC_DIR}
for test in test/*.qtest; do
    if [ "$test" = test/hubspot-oauth.qtest ] || [ "$test" = test/ts-app-initialization.qtest ]; then
        # These fixtures register their own local apps; do not preload the live catalog.
        gosu qore:qore env -u QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT -u QORE_TYPESCRIPT_ACTION_SCRIPTS \
            -u QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS qore --enable-debug "$test" -vv
    else
        gosu qore:qore qore --enable-debug "$test" -vv
    fi
done
