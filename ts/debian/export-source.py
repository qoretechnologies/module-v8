#!/usr/bin/python3
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
"""Export tracked catalogue sources without external schema documents or vendor inputs.

Run from a reviewed checkout; the destination must not exist. Add the matching
orig-vendor component separately as described in README.source.
"""
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent


def main():
    if len(sys.argv) != 2:
        raise SystemExit('Usage: export-source.py NEW_DESTINATION')
    destination = Path(sys.argv[1]).resolve()
    if destination.is_relative_to(REPO):
        raise SystemExit('The export must be outside the repository')
    contracts = json.loads((ROOT / 'src/schema-cache/app-contracts.json').read_text())
    excluded = {'src/schemas/' + app['sourceFile'] for app in contracts['apps'].values()}
    destination.mkdir(parents=True, exist_ok=False)
    names = subprocess.check_output(['git', 'ls-files', '-z', '--', 'ts'], cwd=REPO).split(b'\0')
    for raw in names:
        if not raw:
            continue
        relative = Path(raw.decode()).relative_to('ts')
        if relative.as_posix() in excluded or relative.parts[:3] == ('src', 'schemas', 'hubspot'):
            continue
        source = ROOT / relative
        if source.is_symlink() or not source.is_file():
            raise SystemExit('Unexpected tracked source type: ' + str(relative))
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    shutil.copy2(REPO / 'LICENSE', destination / 'LICENSE')
    for relative in excluded:
        assert not (destination / relative).exists(), relative
    print(destination)


if __name__ == '__main__':
    main()
