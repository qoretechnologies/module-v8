// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { envEntry, leaves, main, maskCommands, parse, punctuationLines } = require('./load-test-variables.cjs');
const { names } = require('./test-variables.json');

const WORKFLOWS = path.resolve(__dirname, '../../.github/workflows');
const PULL_REQUEST_WORKFLOW = path.join(WORKFLOWS, 'pull_request.yml');

/** Runs the script on a secret; returns what happened, in order. */
function run(secret, variables) {
  const events = [];
  main({ GITHUB_ENV: '/github-env', TEST_VARIABLES: secret }, {
    output: line => events.push({ line }),
    append: (file, text) => events.push({ file, text }),
    variables,
  });
  return events;
}

/** Returns the values that the runner masks for the commands that a run printed. */
function masks(events) {
  return events.filter(event => event.line?.startsWith('::add-mask::'))
    .map(event => event.line.slice('::add-mask::'.length).replace(/%0D/g, '\r').replace(/%0A/g, '\n')
      .replace(/%25/g, '%'));
}

/** Reads the GITHUB_ENV text of a run as the runner does. */
function exported(events) {
  const result = {};
  const lines = events.find(event => event.file)?.text.split('\n') ?? [];
  while (lines.length > 1) {
    const [name, delimiter] = lines.shift().split('<<');
    const end = lines.indexOf(delimiter);
    assert.notEqual(end, -1, `${name} has no closing delimiter`);
    result[name] = lines.splice(0, end).join('\n');
    lines.shift();
  }
  return result;
}

test('every value is masked before anything is exported', () => {
  const events = run(JSON.stringify({ A_TOKEN: 'alpha-secret', B_TOKEN: 'beta-secret' }), ['A_TOKEN', 'B_TOKEN']);
  assert.deepEqual(masks(events), ['alpha-secret', 'beta-secret']);
  const firstExport = events.findIndex(event => event.file);
  const lastMask = events.findLastIndex(event => event.line?.startsWith('::add-mask::'));
  assert.ok(lastMask < firstExport, 'the masks come first');
  assert.equal(events.filter(event => event.file).length, 1);
  assert.equal(events.find(event => event.file).file, '/github-env');
});

test('a value the workflow does not export is masked too', () => {
  const events = run(JSON.stringify({ LISTED: 'listed-secret', UNLISTED: 'unlisted-secret' }), ['LISTED']);
  assert.deepEqual(masks(events), ['listed-secret', 'unlisted-secret']);
  assert.deepEqual(exported(events), { LISTED: 'listed-secret' });
});

test('a listed variable with no value is exported empty, as fromJson() left it', () => {
  const events = run(JSON.stringify({ NULL_VALUE: null, EMPTY_VALUE: '' }), ['NULL_VALUE', 'EMPTY_VALUE', 'MISSING']);
  assert.deepEqual(exported(events), { NULL_VALUE: '', EMPTY_VALUE: '', MISSING: '' });
  assert.deepEqual(masks(events), []);
});

test('a value with line breaks and percent signs is masked and exported exactly', () => {
  const value = '-----BEGIN KEY-----\nabc%0Adef%25\r\nlast line\n-----END KEY-----';
  const events = run(JSON.stringify({ KEY: value }), ['KEY']);
  assert.deepEqual(exported(events), { KEY: value });
  const masked = masks(events);
  assert.ok(masked.includes(value), 'the whole value');
  for (const line of ['-----BEGIN KEY-----', 'abc%0Adef%25', 'last line', '-----END KEY-----']) {
    assert.ok(masked.includes(line), line);
  }
  for (const event of events.filter(item => item.line?.startsWith('::add-mask::'))) {
    assert.doesNotMatch(event.line, /[\r\n]/, 'a workflow command is one line');
  }
});

test('numbers are masked, booleans are not, and nested values are found', () => {
  assert.deepEqual(leaves({ a: 12345, b: true, c: null, d: { e: ['nested-secret', { f: 67890 }] } }),
    ['12345', 'nested-secret', '67890']);
  const events = run(JSON.stringify({ NUMBER: 12345, FLAG: true, OBJECT: { key: 'nested-secret' } }),
    ['NUMBER', 'FLAG', 'OBJECT']);
  assert.deepEqual(masks(events), ['12345', 'nested-secret']);
  assert.deepEqual(exported(events), { NUMBER: '12345', FLAG: 'true', OBJECT: '{"key":"nested-secret"}' });
});

test('a blank value has no mask, which the runner would reject', () => {
  assert.deepEqual(maskCommands('   '), []);
  assert.deepEqual(maskCommands('one\n\ntwo'), ['::add-mask::one%0A%0Atwo', '::add-mask::one', '::add-mask::two']);
});

test('a secret stored as indented JSON is reported: the runner masks its braces and drops such outputs', () => {
  const events = run(JSON.stringify({ A_TOKEN: 'alpha-secret' }, null, 2), ['A_TOKEN']);
  const warnings = events.filter(event => event.line?.startsWith('::warning::'));
  assert.equal(warnings.length, 1);
  assert.equal(events[0], warnings[0], 'before anything else');
  assert.match(warnings[0].line,
    /^::warning::TEST_VARIABLES is stored on several lines, some of them only punctuation/);
  assert.match(warnings[0].line, /Store the secret as one line of JSON$/);
  assert.doesNotMatch(warnings[0].line, /alpha-secret|[\r\n{}]/, 'no value, one line, and no character that is masked');
  // and it is loaded all the same
  assert.deepEqual(masks(events), ['alpha-secret']);
  assert.deepEqual(exported(events), { A_TOKEN: 'alpha-secret' });
});

test('a secret on one line, or on several that all hold text, is not reported', () => {
  for (const secret of ['{"A_TOKEN":"alpha-secret"}', '{"A_TOKEN":"alpha-secret",\n\n "B_TOKEN":"beta-secret"}\n']) {
    assert.deepEqual(run(secret, ['A_TOKEN']).filter(event => event.line?.startsWith('::warning::')), []);
  }
});

test('a value with a line of punctuation only is reported by the name of its variable', () => {
  const events = run(JSON.stringify({
    KEY_FILE: '{\n  "private": "nested-secret"\n}',
    DEEP: { list: ['plain-secret', '[\r\ninner-secret\r\n]'] },
    PEM: '-----BEGIN KEY-----\nabc\n-----END KEY-----',
    PLAIN: 'one-secret',
  }), ['KEY_FILE', 'PLAIN']);
  const warnings = events.filter(event => event.line?.startsWith('::warning::')).map(event => event.line);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0],
    /^::warning::In TEST_VARIABLES, KEY_FILE, DEEP have a value with a line that is only punctuation\. /);
  assert.doesNotMatch(warnings[0], /secret"|nested-secret|inner-secret|plain-secret|one-secret|PEM|PLAIN/);
  const one = run(JSON.stringify({ KEY_FILE: '{\n"a": 1\n}' }), []);
  assert.match(one.find(event => event.line?.startsWith('::warning::')).line,
    /^::warning::In TEST_VARIABLES, KEY_FILE has a value /);
});

test('a line counts as punctuation only when it holds no letter and no digit', () => {
  assert.equal(punctuationLines('{\n  "a": "b",\n  },\n]\n\n   \n}'), 4);
  assert.equal(punctuationLines('{"a":"b"}'), 0);
  assert.equal(punctuationLines('é\n7\n-----BEGIN-----'), 0);
  assert.equal(punctuationLines(''), 0);
});

test('a secret that does not parse is refused without quoting it', () => {
  for (const secret of ['{"A_TOKEN": "partial-secret', 'plain-secret', '["array-secret"]', 'null', '12345']) {
    const events = [];
    assert.throws(() => main({ GITHUB_ENV: '/github-env', TEST_VARIABLES: secret }, {
      output: line => events.push({ line }),
      append: (file, text) => events.push({ file, text }),
      variables: ['A_TOKEN'],
    }), { message: 'TEST-VARIABLES: TEST_VARIABLES is not a JSON object' });
    assert.deepEqual(events, []);
    assert.throws(() => parse(secret), error => !error.message.includes('secret"') && !error.message.includes('plain'));
  }
});

test('a pull request with no access to the secret runs without credentials', () => {
  const events = [];
  main({ GITHUB_ENV: '/github-env', TEST_VARIABLES: '' }, {
    output: line => events.push({ line }),
    append: (file, text) => events.push({ file, text }),
    variables: ['A_TOKEN'],
  });
  assert.deepEqual(events, [{ line: '::warning::TEST_VARIABLES is not set; the live service suites run without '
    + 'credentials' }]);
});

test('nothing is exported without GITHUB_ENV', () => {
  assert.throws(() => main({ TEST_VARIABLES: '{}' }), { message: 'TEST-VARIABLES: GITHUB_ENV is not set' });
});

test('an entry cannot be ended early by its value', () => {
  assert.equal(envEntry('A', 'value', 'END'), 'A<<END\nvalue\nEND\n');
  assert.throws(() => envEntry('A', 'before\nEND\nA_INJECTED=1', 'END'),
    { message: 'TEST-VARIABLES: the value of A contains the delimiter' });
  assert.notEqual(envEntry('A', 'value'), envEntry('A', 'value'), 'each delimiter is random');
});

test('the listed names are sorted, unique and can be exported', () => {
  assert.ok(names.length > 0);
  assert.deepEqual(names, [...new Set(names)].sort());
  for (const name of names) {
    assert.match(name, /^[A-Z][A-Z0-9_]*$/);
    assert.doesNotMatch(name, /^(GITHUB_|RUNNER_|ACTIONS_|NODE_OPTIONS$|PATH$)/);
  }
});

test('no workflow takes a value out of a secret', () => {
  for (const file of fs.readdirSync(WORKFLOWS)) {
    assert.doesNotMatch(fs.readFileSync(path.join(WORKFLOWS, file), 'utf8'), /fromJson\(\s*secrets\b/, file);
  }
});

test('only the step that masks them reads the test variables, just before the unit tests', () => {
  const reads = fs.readdirSync(WORKFLOWS).flatMap(file => (fs.readFileSync(path.join(WORKFLOWS, file), 'utf8')
    .match(/secrets\s*(\.\s*TEST_VARIABLES|\[\s*['"]TEST_VARIABLES)/g) ?? []).map(() => file));
  assert.deepEqual(reads, ['pull_request.yml']);

  const workflow = fs.readFileSync(PULL_REQUEST_WORKFLOW, 'utf8');
  const steps = workflow.slice(workflow.indexOf('\n  unit_tests:'), workflow.indexOf('\n  qore_tests:'))
    .split(/\n      - /).slice(1);
  const load = steps.findIndex(step => step.includes('secrets.TEST_VARIABLES'));
  assert.notEqual(load, -1, 'the unit test job reads them');
  assert.match(steps[load], /^name: Load test variables\n/);
  assert.match(steps[load], /run: node test\/docker_test\/load-test-variables\.cjs\n/);
  assert.match(steps[load + 1], /name: Run unit tests/);
  assert.equal(load + 2, steps.length, 'no step follows the unit tests');
});
