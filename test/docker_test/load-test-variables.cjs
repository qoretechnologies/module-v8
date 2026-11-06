#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// The credentials of the live service suites, which the GitHub pull request workflow keeps in one JSON secret,
// TEST_VARIABLES. Run as a step of the unit test job, this masks every value of the secret in the job's log and only
// then exports the variables named in test-variables.json to the steps that follow.
//
// GitHub masks a secret as a whole, not a value taken out of it, so no workflow may read a value with fromJson() and
// no other step may read the secret: load-test-variables.test.cjs fails if one does.
//
//   load-test-variables.cjs    mask the values of TEST_VARIABLES and export them through GITHUB_ENV
'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const { names } = require('./test-variables.json');

/** Returns the parsed secret; the parser's message quotes its input, so it is never shown. */
function parse(secret) {
  let values;
  try {
    values = JSON.parse(secret);
  } catch {
    values = undefined;
  }
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new Error('TEST-VARIABLES: TEST_VARIABLES is not a JSON object');
  }
  return values;
}

/** Returns every string and number in a parsed value, however deeply nested. */
function leaves(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return [];
  if (typeof value === 'object') return Object.values(value).flatMap(leaves);
  return [String(value)];
}

/** Returns the workflow commands that mask a value, as a whole and line by line; a blank value has nothing to mask. */
function maskCommands(value) {
  const escape = text => text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  const texts = new Set([value, ...value.split(/\r\n|\r|\n/)]);
  return [...texts].filter(text => text.trim()).map(text => `::add-mask::${escape(text)}`);
}

/** Returns a value as the text of an environment variable; a missing value is empty, as fromJson() left it. */
function asText(value) {
  if (value === null || value === undefined) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/** Returns the GITHUB_ENV entry that sets a variable. */
function envEntry(name, value, delimiter = `ghadelimiter_${crypto.randomUUID()}`) {
  if (value.includes(delimiter)) throw new Error(`TEST-VARIABLES: the value of ${name} contains the delimiter`);
  return `${name}<<${delimiter}\n${value}\n${delimiter}\n`;
}

/** Masks the values of the secret, then exports the variables; returns the exit status. */
function main(env = process.env, { output = console.log, append = fs.appendFileSync, variables = names } = {}) {
  if (!env.GITHUB_ENV) throw new Error('TEST-VARIABLES: GITHUB_ENV is not set');
  if (!env.TEST_VARIABLES) {
    output('::warning::TEST_VARIABLES is not set; the live service suites run without credentials');
    return 0;
  }
  const values = parse(env.TEST_VARIABLES);
  // every value of the secret, listed or not, and all of them before the first export
  const masked = new Set(leaves(values));
  for (const value of masked) maskCommands(value).forEach(command => output(command));
  append(env.GITHUB_ENV, variables.map(name => envEntry(name, asText(values[name]))).join(''));
  output(`test variables: ${masked.size} masked, ${variables.length} exported`);
  return 0;
}

module.exports = { asText, envEntry, leaves, main, maskCommands, parse };
if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
