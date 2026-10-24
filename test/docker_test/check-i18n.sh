#!/bin/bash
#
# Verifies the source-owned data-provider i18n catalogs for the TypeScript app catalogue.
#
# usage: check-i18n.sh [I18N_DIRECTORY [REPORT_FILE]]
#
# The checker reports every stale, missing or orphaned message on a line of its own: hundreds of thousands of lines
# when the message IDs of a large catalog change, more than a CI job log holds. The complete report is written to
# REPORT_FILE, compressed with gzip if its name ends with ".gz", or to a temporary file that is named in the output and
# kept when the check fails. The output shows the first QORE_I18N_CHECK_MAX_LINES lines of the report (default 20)
# and, when it has more, the number of lines of each kind for each catalog file. The checker writes to a regular file,
# never to a pipe.
#
# Copyright 2026 Qore Technologies, s.r.o.

set -e

src_dir=$(cd "$(dirname "$0")/../.." && pwd)
i18n_dir="${1:-${src_dir}/qlib/TypeScriptActionInterface/i18n}"
report=${2:-}
max_lines=${QORE_I18N_CHECK_MAX_LINES:-20}

if [ ! -d "${i18n_dir}" ]; then
    echo "ERROR: i18n catalog directory ${i18n_dir} does not exist" >&2
    exit 1
fi
case "${max_lines}" in
    ''|*[!0-9]*)
        echo "ERROR: QORE_I18N_CHECK_MAX_LINES must be a non-negative integer; got \"${max_lines}\"" >&2
        exit 1
        ;;
esac
if [ -z "${report}" ]; then
    report=$(mktemp "${TMPDIR:-/tmp}/i18n-check.XXXXXX")
elif ! : 2>/dev/null > "${report}"; then
    echo "ERROR: cannot write the report file ${report}" >&2
    exit 1
fi
# a compressed report is written uncompressed next to its final name, and compressed after it has been summarized
compressed=
case "${report}" in
    *.gz)
        compressed=${report}
        report=${report%.gz}
        if ! : 2>/dev/null > "${report}"; then
            echo "ERROR: cannot write the report file ${report}" >&2
            exit 1
        fi
        ;;
esac

# Load this checkout explicitly so an installed module cannot hide source drift. The owner-aware
# source-tree check validates current roots and translations and rejects missing, duplicate, or
# orphaned domains without relying on an English app list or a directory-count heuristic.
export QORE_MODULE_DIR="${src_dir}/qlib${QORE_MODULE_DIR:+:${QORE_MODULE_DIR}}"

# Source-catalog qualification must describe this repository's master catalogue only. Developer and runner
# environments can point these variables at unrelated Qorus fixtures or provider modules; loading them here would
# make test-only or foreign registrations affect the release catalog.
unset QORE_TYPESCRIPT_ACTION_SCRIPTS QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS
unset QORE_DATA_PROVIDERS QORE_CONNECTION_PROVIDERS QORE_DATASOURCE_PROVIDERS
unset QORE_PROVIDER_INDEX_DIR

rc=0
qore-data-provider-i18n --no-color --check-source-tree --require-standard-locales \
    --require-complete-locales --output "${i18n_dir}" > "${report}" 2>&1 || rc=$?

# A report line is "KIND: FILE" or "KIND: FILE: MESSAGE-ID: REASON"; the lines are counted by kind and file
awk -v max="${max_lines}" -v report="${compressed:-${report}}" '
    NR <= max {
        print
    }
    match($0, /^[A-Z][A-Z_-]*: /) {
        kind = substr($0, 1, RLENGTH - 2)
        rest = substr($0, RLENGTH + 1)
        sep = index(rest, ": ")
        key = kind ": " (sep ? substr(rest, 1, sep - 1) : rest)
        if (!(key in count)) {
            order[++keys] = key
        }
        ++count[key]
    }
    END {
        if (NR > max) {
            printf "... %d more line(s); the lines of the report by kind and catalog file:\n", NR - max
            for (i = 1; i <= keys; ++i) {
                printf "  %s: %d\n", order[i], count[order[i]]
            }
            printf "the complete report (%d line(s)) is %s\n", NR, report
        }
    }' "${report}"

if [ -n "${compressed}" ]; then
    gzip -c "${report}" > "${compressed}"
    rm -f "${report}"
elif [ -z "${2:-}" ] && [ "${rc}" -eq 0 ]; then
    rm -f "${report}"
fi
exit "${rc}"
