#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
// Explicit CI prefetch; these documents are private inputs, never package artifacts.
const fs = require('node:fs');
const path = require('node:path');
const { downloadInput } = require('../../ts/dist/schema-cache/app-store');
const { digest } = require('../../ts/dist/schema-cache/apps');
const inputs = require('./app-schema-inputs.json');

async function downloadInputs(directory, configuration = inputs, download = downloadInput) {
  if (!directory || !path.isAbsolute(directory)) {
    throw new Error('Usage: download-app-schema-inputs.cjs ABSOLUTE_DIRECTORY');
  }
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  for (const [id, expected] of Object.entries(configuration.apps)) {
    const input = await download(id);
    if (digest(input.bytes) !== expected.sha256) {
      throw new Error(`Unreviewed ${id} CI input: review the schema migration before changing the pinned checksum`);
    }
    fs.writeFileSync(path.join(directory, `${id}.json`), input.bytes, { flag: 'wx', mode: 0o600 });
  }
}
module.exports = { downloadInputs };
if (require.main === module) {
  downloadInputs(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
