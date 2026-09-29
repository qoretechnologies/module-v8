#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import * as path from 'node:path';
import { constants } from 'node:os';
import { execFileSync, spawn } from 'node:child_process';
import { hubspotContract, readFile, SNAPSHOT_ENV, verifySchemaCompatibility, verifySnapshot } from './hubspot';
import {
  activateSnapshot, activeSnapshot, defaultCacheDir, downloadInputs, importInputs,
  installSnapshot, withCacheLock,
} from './hubspot-store';

const help = `Usage: qore-hubspot-schemas [--cache-dir DIR] COMMAND
  update                 Fetch and qualify current documents for supported v3 APIs
  import DIR             Qualify ten NAME.swagger.json files from a local directory
  status                 Print the active immutable snapshot path
  rollback [DIGEST]      Qualify and activate a previous snapshot
  run -- COMMAND [ARGS]  Pin the active snapshot for an application and its children

Run update explicitly after installing the catalogue; apt/dpkg never downloads schemas.
Existing processes keep their pinned snapshot. Restart them to use an update.
HubSpot terms: https://legal.hubspot.com/hs-developer-terms
`;

/** Require the exact public inventory and materialize every HubSpot action with the installed Qore runtime. */
export async function qualifySnapshot(snapshot: string): Promise<void> {
  verifySnapshot(snapshot);
  verifySchemaCompatibility(snapshot);
  const env = { ...process.env };
  for (const key of ['NODE_PATH', 'NODE_OPTIONS', 'LD_LIBRARY_PATH', 'LD_PRELOAD', 'QORE_MODULE_DIR',
    'QORE_MODULE_DIR_ONLY', 'QORE_INCLUDE_DIR', 'QORE_TYPESCRIPT_ACTION_SCRIPTS',
    'QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS', 'QORE_DATA_PROVIDERS', 'QORE_CONNECTION_PROVIDERS',
    'QORE_DATASOURCE_PROVIDERS', 'QORE_PROVIDER_INDEX_DIR']) delete env[key];
  env.QORE_MODULE_DIR = execFileSync('qore', ['--module-path'], { env, encoding: 'utf8', timeout: 30000 }).trim();
  env.QORE_MODULE_DIR_ONLY = '1';
  env.QORE_V8_DISABLE_CACHE = '1';
  env.QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT = path.resolve(__dirname, '../index.js');
  env[SNAPSHOT_ENV] = snapshot;
  const program = `DataProvider::checkStaticInit();
auto expected = parse_json(ARGV[0]);
list<string> actual = ();
foreach auto identity in (TypeScriptActionInterface::getDiscoveryInventory()) {
    if (identity.app == "Hubspot" && identity.action) actual += identity.action;
}
if (sort(actual) != sort(expected)) throw "HUBSPOT-SCHEMA-INVENTORY-ERROR", "HubSpot identities changed";
auto actions = DataProviderActionCatalog::getActionHashEx("Hubspot");
foreach string name in (expected) {
    if (!exists actions{name}) throw "HUBSPOT-SCHEMA-ACTION-ERROR", name;
}
auto failures = DataProviderActionCatalog::getInitializationFailures(("Hubspot",));
if (failures) throw "HUBSPOT-SCHEMA-INITIALIZATION-ERROR", make_json(failures);
printf("HUBSPOT-SNAPSHOT-QUALIFIED:%d\\n", expected.size());`;
  const output = execFileSync('qore', ['-M', '-l', 'TypeScriptActionInterface', '-l', 'json', '-e', program,
    JSON.stringify(hubspotContract.actions)], { env, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  if (!output.includes(`HUBSPOT-SNAPSHOT-QUALIFIED:${hubspotContract.actions.length}\n`)) {
    throw new Error('HUBSPOT-SCHEMA-QUALIFICATION: runtime did not confirm the expected actions');
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let cache = defaultCacheDir();
  if (args[0] === '--cache-dir') {
    if (!args[1]) throw new Error('--cache-dir requires a directory');
    cache = path.resolve(args[1]); args.splice(0, 2);
  }
  const command = args.shift();
  if (!command || command === '--help' || command === 'help') { process.stdout.write(help); return; }
  if (command === 'status') {
    if (args.length) throw new Error('status takes no arguments');
    console.log(activeSnapshot(cache)); return;
  }
  if (command === 'run') {
    if (args.shift() !== '--' || !args.length) throw new Error('run requires -- COMMAND [ARGS]');
    const snapshot = activeSnapshot(cache);
    const child = spawn(args[0], args.slice(1), { stdio: 'inherit', env: { ...process.env, [SNAPSHOT_ENV]: snapshot } });
    const forward = (signal: NodeJS.Signals) => { child.kill(signal); };
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];
    const handlers = signals.map(signal => () => forward(signal));
    signals.forEach((signal, index) => process.on(signal, handlers[index]));
    const cleanup = () => signals.forEach((item, index) => process.removeListener(item, handlers[index]));
    await new Promise<void>((resolve, reject) => {
      child.once('error', error => { cleanup(); reject(error); });
      child.once('exit', (code, signal) => {
        cleanup();
        process.exitCode = code ?? (128 + (signal ? constants.signals[signal] : 15));
        resolve();
      });
    });
    return;
  }
  if (!['update', 'import', 'rollback'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if ((command === 'update' && args.length) || (command === 'import' && args.length !== 1)
      || (command === 'rollback' && args.length > 1)) throw new Error(`Invalid arguments for ${command}`);
  await withCacheLock(cache, async () => {
    if (command === 'rollback') {
      const previous = args[0] ?? JSON.parse(readFile(path.join(cache, 'active.json'), 4096).toString()).previous;
      if (typeof previous !== 'string' || !/^[a-f0-9]{64}$/.test(previous)) throw new Error('No valid previous snapshot');
      const snapshot = path.join(cache, 'snapshots', previous);
      await qualifySnapshot(snapshot);
      activateSnapshot(cache, snapshot);
      console.log(snapshot);
    } else {
      const inputs = command === 'update' ? await downloadInputs() : importInputs(args[0]);
      console.log(await installSnapshot(cache, inputs, qualifySnapshot));
    }
  });
}

if (require.main === module) main().catch(error => {
  const message = (error as Error).message;
  console.error(`qore-hubspot-schemas: ${message}`);
  process.exitCode = 1;
});
