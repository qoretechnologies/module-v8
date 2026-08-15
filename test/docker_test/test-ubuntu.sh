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

echo "export QORE_UID=999" >> ${ENV_FILE}
echo "export QORE_GID=999" >> ${ENV_FILE}

. ${ENV_FILE}

export MAKE_JOBS=4

# build module and install
echo && echo "-- building module --"
mkdir -p ${MODULE_SRC_DIR}/build
cd ${MODULE_SRC_DIR}/build
export NODE_LIB_DIR=/opt/nodejs/lib
cmake .. -DCMAKE_BUILD_TYPE=debug -DCMAKE_INSTALL_PREFIX=${INSTALL_PREFIX}
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

# Ensure that every provider presentation string exported by the TypeScript
# catalogue has a current source-owned native i18n entry, and that no catalog
# survives for an app that has been removed from the catalogue. Run this only
# after rebuilding dist/index.js so the base image cannot hide source drift.
node --test "${MODULE_SRC_DIR}/test/docker_test/sync-i18n-translations.test.mjs"
"${MODULE_SRC_DIR}/test/docker_test/check-i18n.sh" \
    "${MODULE_SRC_DIR}/qlib/TypeScriptActionInterface/i18n"

# add Qore user and group
groupadd -o -g ${QORE_GID} qore
useradd -o -m -d /home/qore -u ${QORE_UID} -g ${QORE_GID} qore

# own everything by the qore user
chown -R qore:qore ${MODULE_SRC_DIR}

# run the tests
export QORE_MODULE_DIR=${MODULE_SRC_DIR}/qlib:${QORE_MODULE_DIR}
cd ${MODULE_SRC_DIR}
for test in test/*.qtest; do
    gosu qore:qore qore --enable-debug $test -vv
done
