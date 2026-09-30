#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
// Opt-in test-account qualification of the shared TypeScript request/pagination helpers.
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const master = process.env.QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT
  || '/usr/share/qore-v8-app-catalogue/dist/index.js';
const { pipedriveApiClient, fetchPipedriveAllowedValues } = require(
  path.join(path.dirname(master), 'apps/pipedrive/helpers/client.js'));

async function qualify() {
  assert.ok(process.env.PIPEDRIVE_APIKEY, 'PIPEDRIVE_APIKEY must identify a test account');
  const authentication = { token: '', headers: {
    Authorization: '', 'x-api-token': process.env.PIPEDRIVE_APIKEY,
  } };
  const request = options => pipedriveApiClient({ ...authentication, ...options });
  const created = [];
  const marker = `Qore-5473-${randomUUID()}`;
  try {
    for (const suffix of ['one', 'two']) {
      const person = await request({ method: 'POST', path: 'persons', object: 'data',
        body: { name: `${marker}-${suffix}` } });
      assert.ok(person.id);
      created.push(person.id);
    }
    await request({ method: 'PATCH', path: `persons/${created[0]}`, body: { name: `${marker}-updated` } });
    const person = await request({ path: `persons/${created[0]}`, object: 'data' });
    assert.equal(person.name, `${marker}-updated`);
    const values = await fetchPipedriveAllowedValues({ ...authentication, path: 'persons',
      params: { ids: created.join(',') }, limit: 1, maxResults: 2,
      mapItemToAllowedValue: item => ({ value: item.id, display_name: item.name }),
    });
    assert.deepEqual(values.map(value => value.value).sort(), [...created].sort());
    assert.ok(values.every(value => value.display_name.startsWith(marker)));
    console.log('Pipedrive shared PATCH, allowed-value mapping and cursor pagination passed');
  } finally {
    const failures = [];
    for (const id of created.reverse()) {
      try { await request({ method: 'DELETE', path: `persons/${id}` }); }
      catch { failures.push(id); }
    }
    assert.equal(failures.length, 0, `Remove the remaining test persons: ${failures.join(', ')}`);
    console.log('All Pipedrive helper qualification records removed');
  }
}
qualify().catch(error => {
  // Do not print network exception objects, which can contain credentials.
  console.error(error instanceof assert.AssertionError ? error.message : 'Pipedrive helper qualification failed');
  process.exitCode = 1;
});
