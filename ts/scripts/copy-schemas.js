// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { apps } = require('../src/schema-cache/app-contracts.json');
const excluded = new Set(Object.values(apps).map(app => app.sourceFile));
const source = path.resolve(__dirname, '../src/schemas');
const destination = path.resolve(__dirname, '../dist/schemas');
function copy(directory, relative = '') {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name);
    if (excluded.has(name) || name === 'hubspot' || name.startsWith('hubspot/')) continue;
    if (entry.isDirectory()) copy(path.join(directory, entry.name), name);
    else if (entry.isFile()) {
      const target = path.join(destination, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(directory, entry.name), target);
    } else throw new Error(`Unexpected schema input type: ${name}`);
  }
}
copy(source);
