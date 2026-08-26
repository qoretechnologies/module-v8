#!/bin/bash
#
# Regenerates and atomically replaces the source-owned provider catalogs.
#
# Copyright 2026 Qore Technologies, s.r.o.

set -eo pipefail

src_dir=${1:?source directory argument is required}
i18n_parent="${src_dir}/qlib/TypeScriptActionInterface"
i18n_dir="${i18n_parent}/i18n"
stage_dir=
backup_dir=

cleanup() {
    rc=$?
    trap - EXIT

    if [[ -n "${backup_dir}" && -d "${backup_dir}" ]]; then
        if [[ ! -e "${i18n_dir}" ]]; then
            mv "${backup_dir}" "${i18n_dir}" || rc=1
        else
            rm -rf "${backup_dir}" || rc=1
        fi
    fi
    if [[ -n "${stage_dir}" && -d "${stage_dir}" ]]; then
        rm -rf "${stage_dir}" || rc=1
    fi
    exit "${rc}"
}
trap cleanup EXIT

# The CI base image provides this file.
# shellcheck disable=SC1091
. /tmp/env.sh
set -u
export QORE_MODULE_DIR="${src_dir}/qlib${QORE_MODULE_DIR:+:${QORE_MODULE_DIR}}"
export QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT="${src_dir}/ts/dist/index.js"

stage_dir=$(mktemp -d -p "${i18n_parent}" .i18n.stage.XXXXXX)
backup_dir="${stage_dir}.old"

qore-data-provider-i18n --output "${stage_dir}" --owner TypeScriptActionInterface
node "${src_dir}/test/docker_test/sync-i18n-translations.mjs" "${i18n_dir}" "${stage_dir}"
qore-data-provider-i18n --no-color --check-source-tree --require-standard-locales \
    --require-complete-locales --owner TypeScriptActionInterface --output "${stage_dir}"
chmod 755 "${stage_dir}"

mv "${i18n_dir}" "${backup_dir}"
if ! mv "${stage_dir}" "${i18n_dir}"; then
    mv "${backup_dir}" "${i18n_dir}"
    backup_dir=
    exit 1
fi
stage_dir=
rm -rf "${backup_dir}"
backup_dir=
