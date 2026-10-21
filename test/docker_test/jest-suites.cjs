#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// The jest suites that CI runs. jest-suites.json lists every suite that jest finds in ts/ exactly once: as gating (CI
// runs it, and it must pass) or as excluded, with the reason. A new suite that is in neither list fails the check, so
// that no suite stops running unnoticed.
//
//   jest-suites.cjs check    compare jest-suites.json with the suites that jest finds
//   jest-suites.cjs gating   print the gating suites, one per line, relative to ts/
'use strict';
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const manifest = require('./jest-suites.json');

const TS = path.resolve(__dirname, '../../ts');
const USAGE = 'Usage: jest-suites.cjs check|gating';

/** Returns the suites that jest finds with the catalogue's configuration, relative to ts/ and sorted. */
function listSuites() {
  const output = execFileSync(process.execPath, [path.join(TS, 'node_modules/jest/bin/jest.js'), '--config',
    'src/jest.config.ts', '--listTests'], { cwd: TS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  return output.split('\n').filter(line => line.trim()).map(file => path.relative(TS, file).split(path.sep).join('/'))
    .sort();
}

/** Returns every problem of the manifest against the suites that jest finds; none means they match. */
function problems(suites, configuration = manifest) {
  const result = [];
  const gating = configuration.gating ?? [];
  const excluded = configuration.excluded ?? {};
  const found = new Set(suites);
  const seen = new Set();
  for (const suite of gating) {
    if (seen.has(suite)) result.push(`${suite} is listed as gating more than once`);
    seen.add(suite);
    if (Object.hasOwn(excluded, suite)) result.push(`${suite} is listed both as gating and as excluded`);
  }
  for (const [suite, reason] of Object.entries(excluded)) {
    if (typeof reason !== 'string' || !reason.trim()) result.push(`${suite} is excluded without a reason`);
  }
  for (const suite of [...gating, ...Object.keys(excluded)]) {
    if (!found.has(suite)) result.push(`${suite} is listed, but jest does not find it`);
  }
  for (const suite of suites) {
    if (!seen.has(suite) && !Object.hasOwn(excluded, suite)) {
      result.push(`${suite} is neither gating nor excluded with a reason in test/docker_test/jest-suites.json`);
    }
  }
  return [...new Set(result)];
}

/** Runs a command; returns the exit status. */
function main(args, { output = console.log, error = console.error, suites = listSuites } = {}) {
  if (args.length !== 1 || !['check', 'gating'].includes(args[0])) throw new Error(USAGE);
  if (args[0] === 'gating') {
    if (!manifest.gating?.length) throw new Error('JEST-SUITES: no gating suites');
    for (const suite of manifest.gating) output(suite);
    return 0;
  }
  const found = suites();
  const list = problems(found);
  for (const problem of list) error(`JEST-SUITES: ${problem}`);
  if (list.length) return 1;
  output(`jest suites: ${manifest.gating.length} gating, ${Object.keys(manifest.excluded).length} excluded, `
    + `${found.length} found`);
  return 0;
}

module.exports = { listSuites, main, problems };
if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
