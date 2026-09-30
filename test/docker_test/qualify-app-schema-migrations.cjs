#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
// Run against installed Debian packages. Only the explicit update step uses the network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const catalogue = '/usr/share/qore-v8-app-catalogue';
const contracts = require(`${catalogue}/dist/schema-cache/app-contracts.json`).apps;
const env = { ...process.env, PATH: '/usr/bin:/bin' };
for (const key of ['NODE_PATH', 'NODE_OPTIONS', 'LD_LIBRARY_PATH', 'LD_PRELOAD', 'QORE_MODULE_DIR',
  'QORE_MODULE_DIR_ONLY', 'QORE_INCLUDE_DIR', 'QORE_TYPESCRIPT_ACTION_SCRIPTS',
  'QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS', 'QORE_DATA_PROVIDERS', 'QORE_CONNECTION_PROVIDERS',
  'QORE_DATASOURCE_PROVIDERS', 'QORE_PROVIDER_INDEX_DIR', 'QORE_APP_SCHEMA_SNAPSHOTS']) {
  delete env[key];
}
env.QORE_MODULE_DIR = execFileSync('/usr/bin/qore', ['--module-path'], { env, encoding: 'utf8' }).trim();
env.QORE_MODULE_DIR_ONLY = '1';
env.QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT = `${catalogue}/dist/index.js`;
env.QORE_V8_DISABLE_CACHE = '1';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'qore-migrated-apps-'));
const cache = path.join(directory, 'cache');
function run(command, args) {
  return execFileSync(command, args, { env, encoding: 'utf8', timeout: 300000,
    maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function cli(...args) {
  return run('/usr/bin/qore-app-schemas', ['--cache-dir', cache, ...args]);
}
try {
  cli('update', 'pipedrive', 'trello');
  const snapshots = JSON.parse(cli('status'));
  for (const id of ['pipedrive', 'trello']) {
    assert.ok(snapshots[id]);
    const input = JSON.parse(fs.readFileSync(path.join(snapshots[id], 'schema.json')));
    const candidate = path.join(directory, `${id}.json`);
    input.info.version += '-qualification';
    fs.writeFileSync(candidate, JSON.stringify(input));
    const second = cli('import', id, candidate);
    assert.notEqual(second, snapshots[id]);
    assert.equal(cli('rollback', id), snapshots[id]);

    for (const mutate of [
      document => { delete document.paths[contracts[id].operations[0].path]; },
      document => { document.servers = [{ url: 'https://example.invalid' }]; },
    ]) {
      const invalid = structuredClone(input);
      mutate(invalid);
      fs.writeFileSync(candidate, JSON.stringify(invalid));
      assert.throws(() => cli('import', id, candidate), /APP-SCHEMA-INCOMPATIBLE/);
      assert.equal(cli('status', id), snapshots[id]);
    }
    const schemaFile = path.join(second, 'schema.json');
    fs.chmodSync(schemaFile, 0o600);
    fs.appendFileSync(schemaFile, ' ');
    assert.throws(() => cli('rollback', id, path.basename(second)), /checksum/);
    assert.equal(cli('status', id), snapshots[id]);
  }

  const program = `
DataProvider::checkStaticInit();
auto contracts = parse_json(File::readTextFile(ARGV[0])).apps;
auto inventory = TypeScriptActionInterface::getDiscoveryInventory();
foreach string id in (("pipedrive", "trello")) {
    string app = contracts{id}.app;
    auto actual = map $1.action, inventory, $1.app == app && $1.action;
    if (sort(actual) != sort(contracts{id}.actions)) { throw "INVENTORY-MISMATCH", app; }
    auto presentation = DataProviderPresentation::buildSourceCatalogs(
        DataProviderActionCatalog::getAppEx(app), DataProviderActionCatalog::getActions(app, False));
    foreach auto entry in (presentation.pairIterator()) {
        auto installed = parse_json(ReadOnlyFile::readTextFile(
            "/usr/share/qore/i18n/" + entry.key + "/root/TypeScriptActionInterface.json"));
        if (installed != entry.value) { throw "STALE-PRESENTATION", app; }
    }
    foreach string name in (contracts{id}.actions) {
        auto action = DataProviderActionCatalog::checkAppActionOptions(app, name);
        if (action.get_output_type) { action.get_output_type(); }
    }
    if (DataProviderActionCatalog::getInitializationFailures((app,))) { throw "INITIALIZATION-FAILURE", app; }
    printf("%s: %d actions qualified\\n", app, actual.size());
}`;
  for (const mode of ['tiered', 'ast']) {
    console.log(cli('run', '--', '/usr/bin/qore', '-M', '--enable-debug', `--exec-mode=${mode}`,
      '-l', 'TypeScriptActionInterface', '-l', 'json', '-e', program,
      `${catalogue}/dist/schema-cache/app-contracts.json`));
  }
  for (const app of ['Pipedrive', 'Trello']) {
    const directory = `/usr/share/qore/i18n/data-provider.${Buffer.from(app).toString('base64url')}`;
    const read = locale => JSON.parse(fs.readFileSync(`${directory}/${locale}/TypeScriptActionInterface.json`));
    const root = read('root').locales.root.messages;
    const locales = new Set();
    for (const entry of fs.readdirSync(directory)) {
      if (entry === 'root') { continue; }
      for (const [locale, { messages }] of Object.entries(read(entry).locales)) {
        assert.deepEqual(Object.keys(messages).sort(), Object.keys(root).sort());
        for (const [id, value] of Object.entries(messages)) {
          assert.equal(value.source, root[id].source);
          assert.equal(typeof value.message, 'string');
          assert.ok(value.message.length);
        }
        locales.add(locale);
      }
    }
    assert.equal(locales.size, 12);
    console.log(`${app}: ${Object.keys(root).length} presentation messages and ${locales.size} locales verified`);
  }
  assert.throws(() => cli('run', '--', '/bin/sh', '-c', 'exit 17'), error => error.status === 17);

  const missing = run('/usr/bin/qore', ['-M', '--enable-debug', '-l', 'TypeScriptActionInterface', '-e', `
DataProvider::checkStaticInit();
foreach string app in (("Pipedrive", "Trello")) {
    DataProviderActionCatalog::getAppEx(app);
    if (!TypeScriptActionInterface::getAppSchemaError(app)) { throw "MISSING-SCHEMA-ERROR", app; }
    try { TypeScriptActionInterface::checkAppActions(app); } catch (auto ex) {}
    auto failures = DataProviderActionCatalog::getInitializationFailures((app,));
    if (!(map $1, failures, $1.error == "APP-SCHEMAS-UNAVAILABLE")) { throw "MISSING-STRUCTURED-ERROR", app; }
}
print("Structured missing-snapshot errors verified\\n");`]);
  assert.ok(missing.includes('Structured missing-snapshot errors verified'));
  console.log('Installed download/import/rollback, rejection, wrapper and initialization checks passed');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
