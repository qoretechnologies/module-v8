#!/usr/bin/python3
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
"""Verify and install pinned dependency notices, without network access.

This verifies notice retention, not license sufficiency or publication approval.
The separately reviewed inventory is bound to the entire vendor manifest.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import zipfile


def relative_path(value):
    """Reject ambiguous paths before using them in either ZIPs or the filesystem."""
    if not isinstance(value, str) or not value or any(c in value for c in '\\\0\r\n'):
        raise ValueError('Invalid notice path: ' + repr(value))
    path = PurePosixPath(value)
    if not path.parts or path.is_absolute() or '..' in path.parts or str(path) != value:
        raise ValueError('Invalid notice path: ' + repr(value))
    return path


def regular_file(root, relative):
    path = root
    for part in relative_path(relative).parts:
        path = path / part
        if path.is_symlink():
            raise ValueError('Symlink in notice input: ' + str(path))
    if not path.is_file():
        raise ValueError('Missing notice input: ' + str(path))
    return path


def digest(data):
    return hashlib.sha256(data).hexdigest()


def checked(data, expected, label):
    if not isinstance(expected, str) or not re.fullmatch('[0-9a-f]{64}', expected):
        raise ValueError('Invalid notice checksum: ' + label)
    if digest(data) != expected:
        raise ValueError('Notice checksum mismatch: ' + label)
    return data


def verified_notices(root):
    """Return exact installed paths and verified bytes; raise on any mismatch."""
    manifest_bytes = regular_file(root, 'debian/vendor-manifest.json').read_bytes()
    manifest = json.loads(manifest_bytes)
    inventory = json.loads(regular_file(root, 'debian/notice-manifest.json').read_bytes())
    if inventory['schema'] != 1:
        raise ValueError('Unsupported notice inventory schema')
    checked(manifest_bytes, inventory['vendor_manifest_sha256'], 'vendor manifest')
    records = {record['archive']: record for record in manifest['archives']}
    if len(records) != len(manifest['archives']) or set(inventory['bundled']) != set(records):
        raise ValueError('Notice inventory must cover every vendor archive exactly once')
    notices = {}

    def add(path, data, expected):
        relative_path(path)
        if path in notices:
            raise ValueError('Duplicate installed notice path: ' + path)
        notices[path] = checked(data, expected, path)

    for name, record in records.items():
        if len(relative_path(name).parts) != 1 or not name.endswith('.zip'):
            raise ValueError('Invalid vendor archive name: ' + name)
        members = inventory['bundled'][name]
        if len(set(record['notice_files'])) != len(record['notice_files']) or set(members) != set(record['notice_files']):
            raise ValueError('Bundled notice inventory differs: ' + name)
        path = regular_file(root, 'vendor/yarn-cache/' + name)
        data = checked(path.read_bytes(), record['sha256'], name)
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            if len(set(archive.namelist())) != len(archive.namelist()):
                raise ValueError('Duplicate ZIP members: ' + name)
            for member, expected in members.items():
                relative_path(member)
                add(name[:-4] + '/' + member, archive.read(member), expected)

    files = set()
    for record in inventory['supplemental']:
        name = record['archive']
        if name not in records:
            raise ValueError('Supplemental notice has no vendor archive: ' + name)
        relative = relative_path(record['file'])
        if relative.parts[:2] != ('debian', 'upstream-notices') or len(relative.parts) != 3:
            raise ValueError('Invalid supplemental notice path: ' + str(relative))
        revision = record['git_head']
        if not re.fullmatch('[0-9a-f]{40}', revision) or not re.fullmatch(
                r'https://raw\.githubusercontent\.com/[^/]+/[^/]+/' + revision + r'/.+', record['url']):
            raise ValueError('Supplemental notice must have an immutable upstream URL')
        files.add(str(relative))
        add(name[:-4] + '/upstream/' + relative.name,
            regular_file(root, str(relative)).read_bytes(), record['sha256'])
    actual = {str(path.relative_to(root)) for path in (root / 'debian/upstream-notices').rglob('*')
              if path.is_file() or path.is_symlink()}
    if actual != files:
        raise ValueError('Supplemental notice directory differs from inventory')

    additional = inventory.get('additional', {})
    for relative, expected in additional.items():
        path = relative_path(relative)
        if path.parts[:2] not in (('debian', 'third-party-notices'), ('debian', 'third-party-sources')):
            raise ValueError('Invalid additional notice path: ' + relative)
        add('additional/' + '/'.join(path.parts[1:]), regular_file(root, relative).read_bytes(), expected)
    actual = {str(path.relative_to(root)) for directory in ('third-party-notices', 'third-party-sources')
              for path in (root / 'debian' / directory).rglob('*') if path.is_file() or path.is_symlink()}
    if actual != set(additional):
        raise ValueError('Additional notice/source directory differs from inventory')

    add('yarn/LICENSE', regular_file(root, 'vendor/YARN-LICENSE').read_bytes(),
        inventory['yarn_license_sha256'])
    return dict(sorted(notices.items()))


def install(root, destination):
    """Install only after verifying all inputs; reject stale files and symlinks."""
    notices = verified_notices(root)
    index = 'installed-notices.json'
    if index in notices:
        raise ValueError('Reserved installed notice path')
    allowed = {*notices, index}
    for path in (destination, *destination.parents):
        if path.is_symlink():
            raise ValueError('Symlink in notice destination: ' + str(path))
    if destination.exists():
        for path in destination.rglob('*'):
            if path.is_symlink():
                raise ValueError('Symlink in installed notices: ' + str(path))
            if not path.is_file() and not path.is_dir():
                raise ValueError('Non-regular installed notice: ' + str(path))
            if path.is_file() and str(path.relative_to(destination)) not in allowed:
                raise ValueError('Unexpected installed notice: ' + str(path))
    destination.mkdir(parents=True, exist_ok=True)
    for relative, data in notices.items():
        path = destination / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        path.chmod(0o644)
    (destination / index).write_text(json.dumps(
        {path: digest(data) for path, data in notices.items()}, indent=2) + '\n')
    (destination / index).chmod(0o644)
    return len(notices)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=['verify', 'install'])
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument('--destination', type=Path)
    args = parser.parse_args()
    if args.operation == 'install':
        if args.destination is None:
            parser.error('install requires --destination')
        count = install(args.root, args.destination)
    else:
        count = len(verified_notices(args.root))
    print(f'{args.operation}: {count} dependency notices verified')
