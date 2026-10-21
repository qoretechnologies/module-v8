#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { spawn } from 'node:child_process';
import { constants } from 'node:os';
import * as path from 'node:path';
import { appContract, appIds, readFile, SNAPSHOTS_ENV, verifySnapshot } from './apps';
import { activeSnapshot, appSources, configuredSnapshots, defaultCacheDir, downloadInput,
  downloadNetSuite, installSnapshot, rollback } from './app-store';
import { DOWNLOAD_TIMEOUT_MS } from './download';
import { combinedExitStatus, EXIT_REFUSED, EXIT_UNAVAILABLE, EXIT_UNVERIFIED, exitStatus } from './schema-errors';
import { QUALIFICATION_TIMEOUT_MS, qoreModulePath, refusingProgram, runQualification } from './qualification';

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

Exit status: 0 success; ${EXIT_REFUSED} a schema was refused (invalid, incompatible or refused by the Qore
runtime); ${EXIT_UNVERIFIED} a schema could not be verified (the Qore runtime did not finish within
${QUALIFICATION_TIMEOUT_MS / 1000} s per run, see QORE_APP_SCHEMA_QUALIFICATION_TIMEOUT_MS, or failed without a
verdict); ${EXIT_UNAVAILABLE} a schema source could not be reached or did not answer (the connection failed
or closed early, no complete response within ${DOWNLOAD_TIMEOUT_MS / 1000} s, or HTTP 408, 429 or 5xx; the
message names the URL); 1 any other error. An update of several apps exits ${EXIT_REFUSED} if any schema was
refused, otherwise with the status that every failure has, or 1 for different ones.
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
  env.QORE_MODULE_DIR = qoreModulePath(env);
  env.QORE_MODULE_DIR_ONLY = '1';
  env.QORE_V8_DISABLE_CACHE = '1';
  env.QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT = path.resolve(__dirname, '../index.js');
  env[SNAPSHOTS_ENV] = JSON.stringify({ [id]: snapshot });
  // a check that fails is the runtime refusing the schema; any other failure verifies nothing
  const program = refusingProgram('DataProvider::checkStaticInit();', `auto expected = parse_json(ARGV[0]);
string app = ARGV[1];
list<string> actual = ();
foreach auto identity in (TypeScriptActionInterface::getDiscoveryInventory()) {
    if (identity.app == app && identity.action) { actual += identity.action; }
}
if (sort(actual) != sort(expected)) { throw "APP-SCHEMA-INVENTORY-ERROR", app; }
hash<auto> actions;
try {
    actions = DataProviderActionCatalog::getActionHashEx(app);
} catch (auto ex) {
    auto failures = DataProviderActionCatalog::getInitializationFailures((app,));
    if (failures) { throw "APP-SCHEMA-INITIALIZATION-ERROR", make_json(failures); }
    throw ex.err, ex.desc;
}
foreach string name in (expected) {
    if (!exists actions{name}) { throw "APP-SCHEMA-ACTION-ERROR", name; }
    try {
        auto action = DataProviderActionCatalog::checkAppActionOptions(app, name);
        if (action.get_output_type) { action.get_output_type(); }
    } catch (auto ex) {
        throw "APP-SCHEMA-ACTION-ERROR", sprintf("%s/%s: %s: %s", app, name, ex.err, ex.desc);
    }
}
auto failures = DataProviderActionCatalog::getInitializationFailures((app,));
if (failures) { throw "APP-SCHEMA-INITIALIZATION-ERROR", make_json(failures); }
printf("APP-SNAPSHOT-QUALIFIED:%d\\n", expected.size());`, ['APP-SCHEMA-INVENTORY-ERROR',
    'APP-SCHEMA-INITIALIZATION-ERROR', 'APP-SCHEMA-ACTION-ERROR']);
  for (const mode of ['tiered', 'ast']) {
    runQualification(`${contract.app} (${mode})`, ['-M', '--enable-debug', `--exec-mode=${mode}`,
      '-l', 'TypeScriptActionInterface', '-l', 'json', '-e', program, JSON.stringify(contract.actions), contract.app],
      env, `APP-SNAPSHOT-QUALIFIED:${contract.actions.length}\n`);
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
      args = appIds.filter(id => appSources[id].url || appSources[id].urls);
      for (const id of appIds.filter(id => !appSources[id].url && !appSources[id].urls)) {
        console.error(`${id}: import required. ${appSources[id].importHelp}`);
      }
    }
    // Validate all names before the first download or cache mutation.
    args.forEach(appContract);
    const errors: unknown[] = [];
    for (const id of new Set(args)) {
      try { console.log(`${id}: ${await installSnapshot(cache, id, await downloadInput(id), qualifySnapshot)}`); }
      catch (error) { errors.push(error); console.error(`${id}: ${(error as Error).message}`); }
    }
    if (errors.length) process.exitCode = combinedExitStatus(errors);
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

/** Runs a command and returns its exit status; see the help text for its meaning. */
export async function cli(args: string[] = process.argv.slice(2)): Promise<number> {
  process.exitCode = undefined;
  try {
    await main(args);
    return Number(process.exitCode ?? 0);
  } catch (error) {
    console.error(`qore-app-schemas: ${(error as Error).message}`);
    return exitStatus(error);
  }
}

if (require.main === module) cli().then(status => { process.exitCode = status; });
