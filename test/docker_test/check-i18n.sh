#!/bin/bash
#
# Verifies the source-owned data-provider i18n catalogs for the TypeScript app catalogue.
#
# Copyright 2026 Qore Technologies, s.r.o.

set -e

if [ -z "$1" ]; then
    echo "usage: $(basename $0) <i18n-catalog-dir>" >&2
    exit 1
fi

i18n_dir="$1"

if [ ! -d "${i18n_dir}" ]; then
    echo "ERROR: i18n catalog directory ${i18n_dir} does not exist" >&2
    exit 1
fi

# Regenerate every catalog domain exported by the TypeScript catalogue and fail when a committed
# catalog is missing or out of date.  This must run after dist/index.js has been rebuilt from this
# branch so that a pre-built catalogue from the base image cannot hide source drift.
summary=$(qore-data-provider-i18n --no-color --check --output "${i18n_dir}" \
    --module TypeScriptActionInterface)
echo "${summary}"

# --check only walks the domains it regenerates, so a catalog directory belonging to an app that has
# since been deleted from the catalogue survives unnoticed.  Every regenerated domain matched a
# committed catalog above, so the committed directory count can exceed the generated domain count
# only when orphaned catalogs are present.
generated=$(echo "${summary}" \
    | sed -n 's/^verified [0-9][0-9]* app(s), \([0-9][0-9]*\) catalog domain(s)$/\1/p')
if [ -z "${generated}" ]; then
    echo "ERROR: cannot determine the generated catalog domain count from: ${summary}" >&2
    exit 1
fi

committed=$(find "${i18n_dir}" -mindepth 1 -maxdepth 1 -type d | wc -l)
if [ "${committed}" -ne "${generated}" ]; then
    echo "ERROR: ${i18n_dir} holds ${committed} catalog domain(s) but the TypeScript catalogue only" >&2
    echo "exports ${generated}; $((committed - generated)) orphaned catalog(s) must be removed." >&2
    echo "Regenerate the catalogs with test/docker_test/update-i18n.sh" >&2
    exit 1
fi
