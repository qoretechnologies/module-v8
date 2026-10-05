#!/usr/bin/python3
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
"""Exercise notice retention and fail-closed handling with synthetic archives."""
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
import warnings
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import dependency_notices as notices


class NoticeTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.cache = self.root / 'vendor/yarn-cache'
        self.cache.mkdir(parents=True)
        (self.root / 'debian/upstream-notices').mkdir(parents=True)
        self.archive = 'example-npm-1.0.0.zip'
        self.member = 'node_modules/example/LICENSE'
        with zipfile.ZipFile(self.cache / self.archive, 'w') as archive:
            archive.writestr(self.member, b'Bundled notice\n')
            archive.writestr('node_modules/example/index.js', b'// example\n')
        self.manifest = {'archives': [{'archive': self.archive,
            'sha256': notices.digest((self.cache / self.archive).read_bytes()),
            'notice_files': [self.member]}]}
        self.write_manifest()
        (self.root / 'vendor/YARN-LICENSE').write_bytes(b'Yarn notice\n')
        self.supplement = 'debian/upstream-notices/example-LICENSE'
        (self.root / self.supplement).write_bytes(b'Upstream notice\n')
        revision = 'a' * 40
        self.inventory = {'schema': 1, 'vendor_manifest_sha256': notices.digest(
            (self.root / 'debian/vendor-manifest.json').read_bytes()),
            'yarn_license_sha256': notices.digest(b'Yarn notice\n'),
            'bundled': {self.archive: {self.member: notices.digest(b'Bundled notice\n')}},
            'supplemental': [{'archive': self.archive, 'file': self.supplement,
                'sha256': notices.digest(b'Upstream notice\n'), 'git_head': revision,
                'url': 'https://raw.githubusercontent.com/example/project/' + revision + '/LICENSE'}]}
        self.write_inventory()

    def write_manifest(self):
        (self.root / 'debian/vendor-manifest.json').write_text(json.dumps(self.manifest))

    def write_inventory(self):
        (self.root / 'debian/notice-manifest.json').write_text(json.dumps(self.inventory))

    def test_install_preserves_all_bytes_and_index(self):
        destination = self.root / 'output'
        self.assertEqual(notices.install(self.root, destination), 3)
        expected = {
            self.archive[:-4] + '/' + self.member: b'Bundled notice\n',
            self.archive[:-4] + '/upstream/example-LICENSE': b'Upstream notice\n',
            'yarn/LICENSE': b'Yarn notice\n'}
        self.assertEqual({k: (destination / k).read_bytes() for k in expected}, expected)
        self.assertEqual(json.loads((destination / 'installed-notices.json').read_text()),
                         {k: notices.digest(v) for k, v in expected.items()})
        self.assertEqual(notices.install(self.root, destination), 3)

    def test_tampering_fails_before_installing(self):
        for relative in (self.supplement, 'vendor/YARN-LICENSE', 'vendor/yarn-cache/' + self.archive,
                         'debian/vendor-manifest.json'):
            with self.subTest(relative=relative):
                path = self.root / relative
                original = path.read_bytes()
                path.write_bytes(original + b' ')
                with self.assertRaisesRegex(ValueError, 'checksum mismatch'):
                    notices.install(self.root, self.root / 'output')
                self.assertFalse((self.root / 'output').exists())
                path.write_bytes(original)

    def test_missing_and_uninventoried_supplements(self):
        path = self.root / self.supplement
        path.rename(path.with_suffix('.extra'))
        with self.assertRaisesRegex(ValueError, 'Missing notice input'):
            notices.verified_notices(self.root)
        path.write_bytes(b'Upstream notice\n')
        with self.assertRaisesRegex(ValueError, 'differs from inventory'):
            notices.verified_notices(self.root)

    def test_incomplete_bundled_inventory(self):
        self.inventory['bundled'][self.archive] = {}
        self.write_inventory()
        with self.assertRaisesRegex(ValueError, 'Bundled notice inventory differs'):
            notices.verified_notices(self.root)
        self.inventory['bundled'] = {}
        self.write_inventory()
        with self.assertRaisesRegex(ValueError, 'every vendor archive'):
            notices.verified_notices(self.root)

    def test_corrupt_member_digest(self):
        self.inventory['bundled'][self.archive][self.member] = '0' * 64
        self.write_inventory()
        with self.assertRaisesRegex(ValueError, 'checksum mismatch'):
            notices.verified_notices(self.root)

    def test_unpinned_upstream(self):
        self.inventory['supplemental'][0]['url'] = 'https://raw.githubusercontent.com/example/project/main/LICENSE'
        self.write_inventory()
        with self.assertRaisesRegex(ValueError, 'immutable upstream URL'):
            notices.verified_notices(self.root)

    def test_duplicate_members_and_supplements(self):
        self.inventory['supplemental'].append(self.inventory['supplemental'][0])
        self.write_inventory()
        with self.assertRaisesRegex(ValueError, 'Duplicate installed notice'):
            notices.verified_notices(self.root)
        self.inventory['supplemental'].pop()
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', UserWarning)
            with zipfile.ZipFile(self.cache / self.archive, 'a') as archive:
                archive.writestr(self.member, b'Bundled notice\n')
        self.manifest['archives'][0]['sha256'] = notices.digest((self.cache / self.archive).read_bytes())
        self.write_manifest()
        self.inventory['vendor_manifest_sha256'] = notices.digest(
            (self.root / 'debian/vendor-manifest.json').read_bytes())
        self.write_inventory()
        with self.assertRaisesRegex(ValueError, 'Duplicate ZIP members'):
            notices.verified_notices(self.root)

    def test_destination_fifo(self):
        destination = self.root / 'output'
        destination.mkdir()
        os.mkfifo(destination / 'installed-notices.json')
        with self.assertRaisesRegex(ValueError, 'Non-regular installed notice'):
            notices.install(self.root, destination)

    def test_invalid_paths(self):
        for value in ('', '.', '..', '../escape', '/absolute', 'a/../b', 'a//b', './a', 'a\\b', 'a\n', 'a\0'):
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'Invalid notice path'):
                notices.relative_path(value)

    def test_input_symlink(self):
        path = self.root / self.supplement
        path.unlink()
        path.symlink_to(self.root / 'vendor/YARN-LICENSE')
        with self.assertRaisesRegex(ValueError, 'Symlink in notice input'):
            notices.verified_notices(self.root)

    def test_destination_symlink_and_stale_file(self):
        destination = self.root / 'output'
        destination.symlink_to(self.root / 'debian', target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'Symlink in notice destination'):
            notices.install(self.root, destination)
        destination.unlink()
        destination.mkdir()
        (destination / 'stale').write_text('stale')
        with self.assertRaisesRegex(ValueError, 'Unexpected installed notice'):
            notices.install(self.root, destination)
        (destination / 'stale').unlink()
        (destination / 'yarn').symlink_to(self.root / 'debian', target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'Symlink in installed notices'):
            notices.install(self.root, destination)


if __name__ == '__main__':
    unittest.main()
