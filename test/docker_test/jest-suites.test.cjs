// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { listSuites, main, problems } = require('./jest-suites.cjs');
const manifest = require('./jest-suites.json');

const configuration = { gating: ['src/tests/a.test.ts', 'src/tests/b.test.ts'],
  excluded: { 'src/tests/live.test.ts': 'live service tests; they need A_TOKEN' } };
const suites = ['src/tests/a.test.ts', 'src/tests/b.test.ts', 'src/tests/live.test.ts'];

test('every suite that jest finds is gating or excluded with a reason, exactly once', () => {
  const found = listSuites();
  assert.deepEqual(problems(found), []);
  assert.equal(manifest.gating.length + Object.keys(manifest.excluded).length, found.length);
  // the suites of the schema commands gate CI
  for (const suite of ['src/tests/app-schema-cache.test.ts', 'src/tests/hubspot-schema-cache.test.ts',
    'src/tests/schema-download.test.ts']) {
    assert.ok(manifest.gating.includes(suite), suite);
  }
});

test('a matching manifest has no problems', () => {
  assert.deepEqual(problems(suites, configuration), []);
});

test('a new suite in neither list is reported', () => {
  assert.deepEqual(problems([...suites, 'src/tests/new.test.ts'], configuration), [
    'src/tests/new.test.ts is neither gating nor excluded with a reason in test/docker_test/jest-suites.json']);
});

test('stale, duplicate, conflicting and unexplained entries are reported', () => {
  assert.deepEqual(problems(suites.slice(1), configuration), ['src/tests/a.test.ts is listed, but jest does not find it']);
  assert.deepEqual(problems(suites, { ...configuration, gating: [...configuration.gating, 'src/tests/a.test.ts'] }),
    ['src/tests/a.test.ts is listed as gating more than once']);
  assert.deepEqual(problems(suites, { ...configuration, gating: [...configuration.gating, 'src/tests/live.test.ts'] }),
    ['src/tests/live.test.ts is listed both as gating and as excluded']);
  assert.deepEqual(problems(suites, { ...configuration, excluded: { 'src/tests/live.test.ts': ' ' } }),
    ['src/tests/live.test.ts is excluded without a reason']);
});

test('the command line checks the suites or prints the gating ones', () => {
  const lines = [];
  const errors = [];
  assert.equal(main(['gating'], { output: line => lines.push(line) }), 0);
  assert.deepEqual(lines, manifest.gating);
  assert.equal(main(['check'], { output: line => lines.push(line), error: line => errors.push(line),
    suites: () => [...manifest.gating, ...Object.keys(manifest.excluded), 'src/tests/new.test.ts'] }), 1);
  assert.deepEqual(errors, ['JEST-SUITES: src/tests/new.test.ts is neither gating nor excluded with a reason in '
    + 'test/docker_test/jest-suites.json']);
  for (const args of [[], ['list'], ['check', 'extra']]) {
    assert.throws(() => main(args), { message: 'Usage: jest-suites.cjs check|gating' });
  }
});
