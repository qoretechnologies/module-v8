#!/usr/bin/python3
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
"""Validate the reviewed copyright map against the exact offline source inputs."""
import io
import json
from pathlib import Path
import re
import zipfile
from dependency_notices import checked, regular_file


def verify_license(expression, texts):
    identifiers = set(re.findall(r'[A-Za-z0-9][A-Za-z0-9.+-]*', expression)) - {'AND', 'OR'}
    if not identifiers or not identifiers <= set(texts):
        raise ValueError('Missing license text: ' + expression)


def verify(root):
    raw = regular_file(root, 'debian/vendor-manifest.json').read_bytes()
    manifest = json.loads(raw)
    mapping = json.loads(regular_file(root, 'debian/copyright-map.json').read_bytes())
    texts = json.loads(regular_file(root, 'debian/license-texts.json').read_bytes())['licenses']
    if mapping['schema'] != 1:
        raise ValueError('Unsupported copyright map schema')
    checked(raw, mapping['vendor_manifest_sha256'], 'copyright vendor manifest')
    for name, field in [('copyright', 'copyright_sha256'), ('license-texts.json', 'license_texts_sha256'),
                        ('third-party-provenance.json', 'provenance_sha256')]:
        checked(regular_file(root, 'debian/' + name).read_bytes(), mapping[field], 'copyright ' + name)
    records = {record['archive']: record for record in mapping['archives']}
    if len(records) != len(mapping['archives']) or set(records) != {a['archive'] for a in manifest['archives']}:
        raise ValueError('Copyright map must cover every vendor archive exactly once')
    total = 0
    for archive in manifest['archives']:
        record = records[archive['archive']]
        if record['sha256'] != archive['sha256']:
            raise ValueError('Copyright archive digest differs: ' + archive['archive'])
        raw = regular_file(root, 'vendor/yarn-cache/' + archive['archive']).read_bytes()
        checked(raw, record['sha256'], archive['archive'])
        with zipfile.ZipFile(io.BytesIO(raw)) as container:
            members = sorted(n for n in container.namelist() if not n.endswith('/'))
        member_set = set(members)
        if len(member_set) != len(members) or len(members) != record['file_count']:
            raise ValueError('Copyright member count differs: ' + archive['archive'])
        checked('\n'.join(members).encode(), record['members_sha256'], 'copyright member inventory')
        for exception in record['exceptions']:
            if not exception['files'] or not set(exception['files']) <= member_set or not exception['basis']:
                raise ValueError('Invalid copyright exception: ' + archive['archive'])
        expressions = [record['license'], *record['archive_licenses'],
                       *[e['license'] for e in record['exceptions']]]
        for expression in expressions:
            verify_license(expression, texts)
        if not record['copyright'] or not record['evidence']:
            raise ValueError('Missing copyright evidence: ' + archive['archive'])
        total += len(members)
    checked(regular_file(root, 'vendor/yarn-4.18.1.js').read_bytes(), mapping['yarn']['sha256'], 'copyright Yarn')
    verify_license(mapping['yarn']['license'], texts)
    provenance = json.loads(regular_file(root, 'debian/third-party-provenance.json').read_bytes())
    packages = provenance['yarn']['closure']['packages']
    expected = {(p['name'], p['version']) for p in packages}
    documents = [p for p in provenance['documents']
                 if p['file'].startswith('debian/third-party-notices/yarn/')]
    if len(expected) != len(packages) or {(p['package'], p['version']) for p in documents} != expected:
        raise ValueError('Yarn copyright evidence must cover the complete dependency closure')
    for document in provenance['documents'] + provenance['source_archives']:
        checked(regular_file(root, document['file']).read_bytes(), document['sha256'], document['file'])
    for document in documents:
        verify_license(document['license'], texts)
    return len(records), total


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    archives, members = verify(args.root)
    print(f'Copyright map verified: {archives} archives, {members} members')
