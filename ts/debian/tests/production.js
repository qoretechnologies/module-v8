// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
'use strict';
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const requireCatalogue = createRequire(path.resolve(process.argv[2], 'package.json'));
const cli = path.resolve(process.argv[2], 'node_modules/.bin/semver');
assert.equal(require('node:child_process').execFileSync(cli, ['1.2.3'], { encoding: 'utf8' }).trim(), '1.2.3');
const { actionsCatalogue } = requireCatalogue('./dist/index.js');
actionsCatalogue.initializeCatalogue();
actionsCatalogue.loadAllNewApps();
const inventory = [];
let apps = 0;
let actions = 0;
actionsCatalogue.registerAppActions({
  getCatalogueProtocolVersion() { return 2; },
  registerDiscoveryInventory(batch) { inventory.push(...batch); },
  registerApp() { ++apps; },
  registerExistingApp() { ++apps; },
  registerAction() { ++actions; },
});
assert.equal(apps, 81);
assert.equal(actions, 1426);
assert.equal(inventory.length, 1507);
assert.throws(() => requireCatalogue.resolve('@rollup/rollup-linux-x64-gnu'), { code: 'MODULE_NOT_FOUND' });
assert.throws(() => requireCatalogue.resolve('jest'), { code: 'MODULE_NOT_FOUND' });
assert.equal(require('node:fs').existsSync(path.resolve(process.argv[2], 'node_modules/node-gyp')), false);
assert.match(requireCatalogue('katex').renderToString('a^2 + b^2 = c^2'), /class="katex"/);
const derived = requireCatalogue('evp_bytestokey')('offline-test', '12345678', 256, 16);
assert.equal(derived.key.length, 32);
assert.equal(derived.iv.length, 16);
(async () => {
  const { createClient } = requireCatalogue('contentful-management');
  let requests = 0;
  const client = createClient({
    accessToken: 'offline-test-token',
    adapter: async (config) => {
      ++requests;
      assert.equal(config.method, 'get');
      assert.ok(config.url.endsWith('/spaces/offline-test'));
      return { data: { sys: { type: 'Space', id: 'offline-test' }, name: 'Offline test' },
        status: 200, statusText: 'OK', headers: {}, config };
    },
  }, { type: 'plain' });
  const space = await client.space.get({ spaceId: 'offline-test' });
  assert.equal(space.name, 'Offline test');
  assert.equal(requests, 1);
  console.log(JSON.stringify({ apps, actions, identities: inventory.length,
    contentful_mock_request: 'PASS', native_rollup_absent: true, jest_absent: true, node_gyp_absent: true, katex_render: 'PASS', evp_runtime: 'PASS' }));
})().catch((error) => { console.error(error); process.exitCode = 1; });
