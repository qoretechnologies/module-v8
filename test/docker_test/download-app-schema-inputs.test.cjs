// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { test } = require('node:test');
const { downloadInputs } = require('./download-app-schema-inputs.cjs');

test('CI prefetch pins exact bytes and keeps private, exclusive inputs', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'qore-schema-prefetch-'));
  const bytes = Buffer.from('{"fixture":"owned synthetic input"}');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const configuration = { apps: { pipedrive: { sha256 }, trello: { sha256 } } };
  const download = async () => ({ bytes });
  try {
    await downloadInputs(directory, configuration, download);
    for (const id of ['pipedrive', 'trello']) {
      const file = path.join(directory, `${id}.json`);
      assert.deepEqual(fs.readFileSync(file), bytes);
      assert.equal(fs.statSync(file).mode & 0o777, 0o600);
    }
    await assert.rejects(downloadInputs(directory, configuration, download), /EEXIST/);
    await assert.rejects(downloadInputs(path.join(directory, 'changed'), configuration,
      async () => ({ bytes: Buffer.from('{"fixture":"changed"}') })), /Unreviewed pipedrive CI input/);
    assert.equal(fs.existsSync(path.join(directory, 'changed/pipedrive.json')), false);
    await assert.rejects(downloadInputs(path.join(directory, 'failed'), configuration,
      async () => { throw new Error('synthetic network failure'); }), /synthetic network failure/);
    await assert.rejects(downloadInputs('relative', configuration, download), /ABSOLUTE_DIRECTORY/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
