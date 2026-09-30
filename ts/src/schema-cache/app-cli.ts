#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { execFileSync, spawn } from 'node:child_process';
import { constants } from 'node:os';
import * as path from 'node:path';
import { appContract, appIds, readFile, SNAPSHOTS_ENV, verifySnapshot } from './apps';
import { activeSnapshot, appSources, configuredSnapshots, defaultCacheDir, downloadInput,
  downloadNetSuite, installSnapshot, rollback } from './app-store';

const help = `Usage: qore-app-schemas [--cache-dir DIR] COMMAND
  list                        Show apps, download sources and import instructions
  update APP [APP ...]         Download, verify and qualify selected public schemas
  update --all                 Update all public download sources; list import-only apps
  import APP FILE              Verify and qualify a local Swagger/OpenAPI JSON file
  fetch-netsuite ACCOUNT FILE  Fetch account metadata using a bearer token file (mode 600)
  status [APP]                Print one snapshot path or the configured snapshot map
  rollback APP [DIGEST]       Requalify and activate the previous snapshot
  run -- COMMAND [ARGS]       Pin configured snapshots for an application and its children

Downloads happen only on explicit setup/update. Package builds, dpkg and startup stay offline.
Incompatible updates fail without changing the active snapshot. Existing processes must restart.
HubSpot retains its separate qore-hubspot-schemas command; wrappers can be nested.
`;

/** Require the complete owned inventory and materialize every action in the installed Qore runtime. */
export async function qualifySnapshot(id: string, snapshot: string): Promise<void> {
  verifySnapshot(id, snapshot);
  const contract = appContract(id);
  const env = { ...process.env };
  for (const key of ['NODE_PATH', 'NODE_OPTIONS', 'LD_LIBRARY_PATH', 'LD_PRELOAD', 'QORE_MODULE_DIR',
    'QORE_MODULE_DIR_ONLY', 'QORE_INCLUDE_DIR', 'QORE_TYPESCRIPT_ACTION_SCRIPTS',
    'QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS', 'QORE_DATA_PROVIDERS', 'QORE_CONNECTION_PROVIDERS',
    'QORE_DATASOURCE_PROVIDERS', 'QORE_PROVIDER_INDEX_DIR', SNAPSHOTS_ENV]) delete env[key];
  env.QORE_MODULE_DIR = execFileSync('qore', ['--module-path'], { env, encoding: 'utf8', timeout: 30000 }).trim();
  env.QORE_MODULE_DIR_ONLY = '1';
  env.QORE_V8_DISABLE_CACHE = '1';
  env.QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT = path.resolve(__dirname, '../index.js');
  env[SNAPSHOTS_ENV] = JSON.stringify({ [id]: snapshot });
  const program = `DataProvider::checkStaticInit();
auto expected = parse_json(ARGV[0]);
string app = ARGV[1];
list<string> actual = ();
foreach auto identity in (TypeScriptActionInterface::getDiscoveryInventory()) {
    if (identity.app == app && identity.action) actual += identity.action;
}
if (sort(actual) != sort(expected)) throw "APP-SCHEMA-INVENTORY-ERROR", app;
hash<auto> actions;
try {
    actions = DataProviderActionCatalog::getActionHashEx(app);
} catch (auto ex) {
    auto failures = DataProviderActionCatalog::getInitializationFailures((app,));
    if (failures) throw "APP-SCHEMA-INITIALIZATION-ERROR", make_json(failures);
    throw ex.err, ex.desc;
}
foreach string name in (expected) {
    if (!exists actions{name}) throw "APP-SCHEMA-ACTION-ERROR", name;
}
auto failures = DataProviderActionCatalog::getInitializationFailures((app,));
if (failures) throw "APP-SCHEMA-INITIALIZATION-ERROR", make_json(failures);
printf("APP-SNAPSHOT-QUALIFIED:%d\\n", expected.size());`;
  let output: string;
  try {
    output = execFileSync('qore', ['-M', '-l', 'TypeScriptActionInterface', '-l', 'json', '-e', program,
      JSON.stringify(contract.actions), contract.app], { env, encoding: 'utf8', timeout: 120000,
      maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const failure = error as { stderr?: string; message: string };
    throw new Error(`APP-SCHEMA-QUALIFICATION: ${contract.app}: ${failure.stderr || failure.message}`);
  }
  if (!output.includes(`APP-SNAPSHOT-QUALIFIED:${contract.actions.length}\n`)) {
    throw new Error('APP-SCHEMA-QUALIFICATION: runtime did not confirm the expected actions');
  }
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  let cache = defaultCacheDir();
  if (args[0] === '--cache-dir') {
    if (!args[1]) throw new Error('--cache-dir requires a directory');
    cache = path.resolve(args[1]); args.splice(0, 2);
  }
  const command = args.shift();
  if (!command || command === '--help' || command === 'help') { process.stdout.write(help); return; }
  if (command === 'list') {
    if (args.length) throw new Error('list takes no arguments');
    console.log(JSON.stringify(appSources, null, 2)); return;
  }
  if (command === 'status') {
    if (args.length > 1) throw new Error('status accepts at most one app');
    console.log(args.length ? activeSnapshot(cache, args[0]) : JSON.stringify(configuredSnapshots(cache))); return;
  }
  if (command === 'run') {
    if (args.shift() !== '--' || !args.length) throw new Error('run requires -- COMMAND [ARGS]');
    const snapshots = configuredSnapshots(cache);
    const child = spawn(args[0], args.slice(1), { stdio: 'inherit',
      env: { ...process.env, [SNAPSHOTS_ENV]: JSON.stringify(snapshots) } });
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];
    const handlers = signals.map(signal => () => { child.kill(signal); });
    signals.forEach((signal, index) => process.on(signal, handlers[index]));
    const cleanup = () => signals.forEach((signal, index) => process.removeListener(signal, handlers[index]));
    await new Promise<void>((resolve, reject) => {
      child.once('error', error => { cleanup(); reject(error); });
      child.once('exit', (code, signal) => {
        cleanup(); process.exitCode = code ?? (128 + (signal ? constants.signals[signal] : 15)); resolve();
      });
    });
    return;
  }
  if (command === 'update') {
    if (!args.length) throw new Error('update requires APP [APP ...] or --all');
    if (args.includes('--all')) {
      if (args.length !== 1) throw new Error('--all cannot be combined with app names');
      args = appIds.filter(id => appSources[id].url);
      for (const id of appIds.filter(id => !appSources[id].url)) {
        console.error(`${id}: import required. ${appSources[id].importHelp}`);
      }
    }
    // Validate all names before the first download or cache mutation.
    args.forEach(appContract);
    let failed = false;
    for (const id of new Set(args)) {
      try { console.log(`${id}: ${await installSnapshot(cache, id, await downloadInput(id), qualifySnapshot)}`); }
      catch (error) { failed = true; console.error(`${id}: ${(error as Error).message}`); }
    }
    if (failed) process.exitCode = 1;
    return;
  }
  if (command === 'import') {
    if (args.length !== 2) throw new Error('import requires APP FILE');
    const [id, file] = args; appContract(id);
    console.log(await installSnapshot(cache, id, { bytes: readFile(path.resolve(file)),
      source: `file:${path.resolve(file)}` }, qualifySnapshot)); return;
  }
  if (command === 'fetch-netsuite') {
    if (args.length !== 2) throw new Error('fetch-netsuite requires ACCOUNT TOKEN_FILE');
    console.log(await installSnapshot(cache, 'netsuite', await downloadNetSuite(args[0], args[1]), qualifySnapshot)); return;
  }
  if (command === 'rollback') {
    if (args.length < 1 || args.length > 2) throw new Error('rollback requires APP [DIGEST]');
    console.log(await rollback(cache, args[0], args[1], qualifySnapshot)); return;
  }
  throw new Error(`Unknown command: ${command}`);
}

if (require.main === module) main().catch(error => {
  console.error(`qore-app-schemas: ${(error as Error).message}`); process.exitCode = 1;
});
