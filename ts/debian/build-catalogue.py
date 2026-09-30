#!/usr/bin/python3
# Copyright 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
"""Build the local catalogue prototype offline; no publication is performed."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PRODUCTION = ROOT / '.debian-production'
MANIFEST = json.loads((ROOT / 'debian/vendor-manifest.json').read_text())
TESTS = ('actions-catalogue', 'app-api-versions', 'helpers', 'qore-api-client',
         'event-triggers', 'slack-allowed-values-cache', 'monday-pagination',
         'hubspot-oauth', 'dependency-security', 'catalogue-entry', 'hubspot-schema-cache', 'app-schema-cache', 'pipedrive-migration', 'trello-migration')
ENV = {**os.environ, 'YARN_ENABLE_NETWORK': '0', 'YARN_ENABLE_GLOBAL_CACHE': '0',
       'YARN_ENABLE_TELEMETRY': '0', 'YARN_ENABLE_SCRIPTS': '0',
       'YARN_GLOBAL_FOLDER': str(ROOT / '.debian-yarn-global'),
       'YARN_CACHE_FOLDER': str(ROOT / 'vendor/yarn-cache'),
       'QORE_CATALOGUE_YARN': str(ROOT / 'vendor/yarn-4.12.0.js'),
       'PATH': str(ROOT / 'debian/bin') + ':/usr/bin:/bin', 'QORE_MODULE_DIR_ONLY': '1'}
for key in ('QORE_APP_SCHEMA_SNAPSHOTS', 'QORE_HUBSPOT_SCHEMA_SNAPSHOT'):
    ENV.pop(key, None)

EXTERNAL_SCHEMAS = [app['sourceFile'] for app in json.loads(
    (ROOT / 'src/schema-cache/app-contracts.json').read_text())['apps'].values()]


def verify_schema_exclusions(directory):
    for relative in ['hubspot', *EXTERNAL_SCHEMAS]:
        if (directory / relative).exists():
            raise ValueError('External schema must not be packaged: ' + relative)

ENV['QORE_MODULE_DIR'] = subprocess.check_output(
    ['/usr/bin/qore', '--module-path'], text=True,
    env={key: value for key, value in ENV.items()
         if key not in ('QORE_MODULE_DIR', 'QORE_MODULE_DIR_ONLY')}).strip()


def run(args, cwd=ROOT, **kwargs):
    subprocess.run(args, cwd=cwd, env=ENV, check=True, **kwargs)


def verify_inputs():
    for name, key in [('yarn.lock', 'lock_sha256'), ('package.json', 'package_sha256'),
                      ('vendor/yarn-4.12.0.js', 'yarn_sha256')]:
        if hashlib.sha256((ROOT / name).read_bytes()).hexdigest() != MANIFEST[key]:
            raise ValueError('Input changed; regenerate reviewed manifest: ' + name)
    verify_schema_exclusions(ROOT / 'src/schemas')
    cache = ROOT / 'vendor/yarn-cache'
    expected = {record['archive'] for record in MANIFEST['archives']}
    actual = {path.name for path in cache.glob('*.zip')}
    if expected != actual:
        raise ValueError('Cache differs from the exact dependency manifest')
    for record in MANIFEST['archives']:
        if Path(record['archive']).name != record['archive']:
            raise ValueError('Invalid cache path')
        if hashlib.sha256((cache / record['archive']).read_bytes()).hexdigest() != record['sha256']:
            raise ValueError('Dependency checksum mismatch: ' + record['archive'])


def prune_runtime():
    modules = PRODUCTION / 'node_modules'
    removed = []
    # node-gyp is a Yarn-injected test:prepare dependency of evp_bytestokey;
    # its published runtime manifest depends only on md5.js and safe-buffer.
    # The KaTeX paths generate fonts/metrics; its runtime uses committed dist/.
    # Remaining paths are upstream test pages, documentation or release tools.
    excluded = ('node-gyp', '.bin/node-gyp', 'katex/src/fonts', 'katex/src/metrics',
                'js-md4/doc', 'js-md4/tests', 'polished/docs', 'performance-now/test',
                'rewire/testLib', '@icons/material/transform.js',
                '@getbrevo/brevo/git_push.sh', 'webflow-api/scripts/rename-to-esm-files.js',
                'mime/src/build.js')
    for relative in excluded:
        path = modules / relative
        if path.is_symlink() or path.is_file():
            path.unlink()
            removed.append(relative)
        elif path.is_dir():
            shutil.rmtree(path)
            removed.append(relative + '/')
    metadata = {'.npmignore', '.gitignore', '.gitattributes', '.gitmodules',
                '.travis.yml', '.editorconfig', '.eslintignore'}
    for path in sorted(modules.rglob('*')):
        if path.is_file() and (path.name in metadata or path.name.startswith('.eslintrc')):
            removed.append(str(path.relative_to(modules)))
            path.unlink()
    (ROOT / '.debian-pruned.json').write_text(json.dumps(sorted(removed), indent=2) + '\n')


def build():
    verify_inputs()
    run(['yarn', 'install', '--immutable', '--immutable-cache', '--mode=skip-build'])
    run(['yarn', 'build'])
    PRODUCTION.mkdir(exist_ok=True)
    for name in ('package.json', 'yarn.lock', '.yarnrc.yml'):
        shutil.copy2(ROOT / name, PRODUCTION / name)
    run(['yarn', 'workspaces', 'focus', '--production'], cwd=PRODUCTION)
    shutil.copytree(ROOT / 'dist', PRODUCTION / 'dist', dirs_exist_ok=True)
    # contentful-sdk-core declares its optional build-time Rollup binding as a
    # production dependency. The runtime never imports it; the package smoke
    # test loads every app and issues a Contentful request using a mock adapter.
    rollup = PRODUCTION / 'node_modules/@rollup/rollup-linux-x64-gnu'
    if rollup.exists():
        shutil.rmtree(rollup)
    prune_runtime()
    state = PRODUCTION / 'node_modules/.yarn-state.yml'
    state.unlink(missing_ok=True)
    mapping = ROOT / '.debian-app-map.json'
    with mapping.open('w') as output:
        run(['node', '-e', '''const c=require('./dist/index.js').actionsCatalogue;
c.initializeCatalogue(); c.loadAllNewApps();
const map={}; for (const dir of c.getNewAppDirs()) map[dir]=c.apps[dir].name;
process.stdout.write(JSON.stringify(map));'''], cwd=PRODUCTION, stdout=output)
    with (PRODUCTION / 'dist/ts-app-dirs.yaml').open('w') as output:
        run(['qore', '-l', 'json', '-l', 'yaml', '-e',
             'print(make_yaml(parse_json(File::readTextFile(ARGV[0]))));', str(mapping)], stdout=output)
    verify_inputs()


def test():
    run(['node', '--experimental-vm-modules', 'node_modules/jest/bin/jest.js', '--ci',
         '--maxWorkers=2', '--config', 'src/jest.config.ts', '--runTestsByPath',
         *['src/tests/' + name + '.test.ts' for name in TESTS]])
    # Isolate from the development node_modules tree: Node otherwise searches
    # parent directories and can hide a missing runtime dependency.
    with tempfile.TemporaryDirectory(prefix='qore-catalogue-production-') as temporary:
        fixture = Path(temporary) / 'catalogue'
        shutil.copytree(PRODUCTION, fixture, symlinks=True)
        run(['node', str(ROOT / 'debian/tests/production.js'), str(fixture)])


def install():
    target = ROOT / 'debian/qore-v8-app-catalogue/usr/share/qore-v8-app-catalogue'
    target.mkdir(parents=True, exist_ok=True)
    verify_schema_exclusions(PRODUCTION / 'dist/schemas')
    bindir = ROOT / 'debian/qore-v8-app-catalogue/usr/bin'
    bindir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / 'debian/qore-hubspot-schemas', bindir / 'qore-hubspot-schemas')
    shutil.copy2(ROOT / 'debian/qore-app-schemas', bindir / 'qore-app-schemas')
    for name in ('dist', 'node_modules'):
        shutil.copytree(PRODUCTION / name, target / name, symlinks=True)
    shutil.copy2(ROOT / 'package.json', target / 'package.json')
    for path in target.rglob('*'):
        if path.is_symlink():
            if not path.resolve().is_relative_to(target):
                raise ValueError('Symlink escapes private package: ' + str(path))
        elif path.is_file():
            with path.open('rb') as stream:
                magic = stream.read(4)
            if magic in (b'\x7fELF', b'\xcf\xfa\xed\xfe', b'\xfe\xed\xfa\xcf') or path.suffix == '.node':
                raise ValueError('Native file in Architecture: all package: ' + str(path))
    notices = ROOT / 'debian/qore-v8-app-catalogue/usr/share/doc/qore-v8-app-catalogue/dependency-notices'
    notices.mkdir(parents=True, exist_ok=True)
    for record in MANIFEST['archives']:
        if not record['notice_files']:
            continue
        with zipfile.ZipFile(ROOT / 'vendor/yarn-cache' / record['archive']) as archive:
            for member in record['notice_files']:
                relative = Path(record['archive'].removesuffix('.zip')) / member
                if '..' in relative.parts or relative.is_absolute():
                    raise ValueError('Invalid notice path')
                destination = notices / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(archive.read(member))


def permissions():
    # The private npm tree contains both CLI scripts and ordinary resources.
    # Upstream archive execute bits are inconsistent and dh_fixperms treats
    # /usr/share data conservatively. Preserve executable scripts while keeping
    # declarations, documentation, fonts and other data non-executable.
    target = ROOT / 'debian/qore-v8-app-catalogue/usr/share/qore-v8-app-catalogue'
    for path in target.rglob('*'):
        if path.is_symlink() or not path.is_file():
            continue
        with path.open('rb') as stream:
            script = stream.read(2) == b'#!'
        declaration = path.name.endswith(('.d.ts', '.d.mts', '.d.cts'))
        path.chmod(0o755 if script and not declaration else 0o644)


def clean():
    for name in ('.debian-production', '.debian-yarn-global', '.yarn', 'node_modules', 'dist'):
        path = ROOT / name
        if path.is_symlink():
            raise ValueError('Refusing generated-directory symlink: ' + str(path))
        if path.exists():
            shutil.rmtree(path)
    (ROOT / '.debian-app-map.json').unlink(missing_ok=True)
    (ROOT / '.debian-pruned.json').unlink(missing_ok=True)


if __name__ == '__main__':
    operations = {'build': build, 'test': test, 'install': install, 'clean': clean, 'prune': prune_runtime, 'permissions': permissions}
    if len(sys.argv) != 2 or sys.argv[1] not in operations:
        raise SystemExit('Usage: build-catalogue.py build|test|install|clean')
    operations[sys.argv[1]]()
