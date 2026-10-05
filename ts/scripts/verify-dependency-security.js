// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
'use strict';
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { createHash, createPublicKey, verify } = require('node:crypto');
const { Readable, Writable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const path = require('node:path');

/** Exercise security fixes through the production SDK dependency paths, offline. */
async function verifyDependencies(root, includeBuildDependencies = false) {
  const fromRoot = createRequire(path.resolve(root, 'package.json'));
  for (const consumer of ['@cypress/request', 'odoo-await', 'quickbooks-node-promise', 'google-ads-api']) {
    const fromConsumer = createRequire(fromRoot.resolve(consumer));
    const uuid = fromConsumer('uuid');
    assert.equal(uuid.version(uuid.v4()), 4, consumer);
    assert.equal(uuid.v5('www.example.com', uuid.v5.DNS), '2ed6657d-e927-568b-95e1-2665a8aea6a2');
    for (const method of ['v3', 'v5']) {
      const buffer = Buffer.alloc(16, 0xa5);
      for (const offset of [-1, 1, 100]) {
        assert.throws(() => uuid[method]('x', uuid[method].DNS, buffer, offset), RangeError);
        assert.deepEqual(buffer, Buffer.alloc(16, 0xa5));
      }
      assert.throws(() => uuid[method]('x', uuid[method].DNS, Buffer.alloc(15)), RangeError);
    }
  }
  // Exercise the request library itself, including its UUID-based MIME boundary.
  const { Multipart } = fromRoot('@cypress/request/lib/multipart');
  const multipart = new Multipart({});
  assert.match(multipart.boundary, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

  const adsRequire = createRequire(fromRoot.resolve('google-ads-api'));
  const { parser } = adsRequire('stream-json');
  const { streamArray } = adsRequire('stream-json/streamers/StreamArray');
  async function collect(input, transform) {
    const rows = [];
    await pipeline(Readable.from([input]), parser(), transform,
      new Writable({ objectMode: true, write(item, _, done) { rows.push(item); done(); } }));
    return rows;
  }
  assert.deepEqual((await collect('[{"results":[{"id":1}]}]', streamArray())).map(x => x.value),
    [{ results: [{ id: 1 }] }]);
  for (const [name, options] of [['Pick', { filter: 'target' }], ['Ignore', { filter: /target/ }],
    ['Filter', { filter: 'target' }], ['Replace', { filter: /target/ }]]) {
    const Filter = adsRequire('stream-json/filters/' + name);
    await assert.rejects(collect('{"nested":'.repeat(1025) + '0' + '}'.repeat(1025), new Filter(options)),
      { name: 'RangeError', message: 'JSON nesting exceeds maxDepth' });
    assert.throws(() => new Filter({ ...options, maxDepth: 0 }), RangeError);
  }
  const Pick = adsRequire('stream-json/filters/Pick');
  assert.ok((await collect('{"target":42}', new Pick({ filter: 'target' }))).length);

  const webflowRequire = createRequire(fromRoot.resolve('webflow-api'));
  const cryptoRequire = createRequire(webflowRequire.resolve('crypto-browserify'));
  const signRequire = createRequire(cryptoRequire.resolve('browserify-sign'));
  const EC = signRequire('elliptic').ec;
  const ec = new EC('p521');
  const key = ec.keyFromPrivate('1');
  const message = Buffer.from('Qore elliptic regression 888');
  const signature = key.sign(createHash('sha512').update(message).digest());
  // RFC 6979 HMAC-SHA512 reference calculation with fixed 66-byte nonce width;
  // independently derived using BigInt modular arithmetic and OpenSSL ECDH.
  assert.equal(signature.r.toString(16),
    '100048ae3f98f111521fe84a7b81f02cabb311360dc946b90d8d9e36e09b069b68254a16dd54881c15efb1a69913542a12af157aaf6262525fb1d0cabcd3170045d');
  assert.equal(signature.s.toString(16),
    '1bf4f4838e49fb9ded595125c7fd24ce524cd4e815ca67eb8d4ea51ea07f949c8c738900f2315f5c1fe0db69e2f238ad3f04ed6a169b1667d31a49c95cac190999e');
  const pub = key.getPublic();
  const jwk = { kty: 'EC', crv: 'P-521',
    x: Buffer.from(pub.getX().toArray('be', 66)).toString('base64url'),
    y: Buffer.from(pub.getY().toArray('be', 66)).toString('base64url') };
  assert.ok(verify('sha512', message, createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(signature.toDER())));
  assert.ok(!verify('sha512', Buffer.from('modified'), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(signature.toDER())));
  if (includeBuildDependencies) {
    const braces = fromRoot('braces');
    assert.deepEqual(braces.expand('file-{a,b}.txt'), ['file-a.txt', 'file-b.txt']);
    for (const text of ['{'.repeat(200) + 'x' + '}'.repeat(200), '('.repeat(200) + 'x' + ')'.repeat(200)]) {
      for (const method of ['parse', 'compile', 'expand', 'stringify']) {
        assert.throws(() => braces[method](text), { name: 'RangeError', message: 'Brace nesting exceeds 128 levels' });
      }
    }
    // Direct AST APIs also need bounds, independent of the string parser.
    let ast = { type: 'text', value: 'x' };
    for (let i = 0; i < 200; ++i) ast = { type: 'root', nodes: [ast] };
    for (const method of ['compile', 'expand', 'stringify']) {
      assert.throws(() => braces[method](ast), { name: 'RangeError', message: 'Brace nesting exceeds 128 levels' });
    }
    const CachePolicy = fromRoot('http-cache-semantics');
    const request = { url: 'https://offline.invalid/resource', method: 'GET', headers: { host: 'offline.invalid' } };
    for (const responseHeaders of [
      { 'set-cookie': ['session=private'], 'cache-control': 'max-age=600' },
      { 'cache-control': 'private, max-age=600' },
      { 'cache-control': 'no-store' },
      { 'cache-control': 'no-cache, stale-while-revalidate=600, stale-if-error=600' },
      { 'cache-control': 'proxy-revalidate, max-age=600' },
    ]) {
      const policy = new CachePolicy(request, { status: 200, headers: responseHeaders });
      policy.now = () => policy._responseTime + 1000;
      for (const directive of ['max-stale', 'max-stale=999999']) {
        const staleRequest = { ...request, headers: { ...request.headers, 'cache-control': directive } };
        assert.equal(policy.satisfiesWithoutRevalidation(staleRequest), false);
      }
      assert.equal(policy.useStaleWhileRevalidate(), false);
      assert.equal(policy.revalidatedPolicy(request, { status: 503, headers: {} }).modified, true);
    }
    const publicPolicy = new CachePolicy(request, { status: 200, headers: { 'cache-control': 'public, max-age=60' } });
    publicPolicy.now = () => publicPolicy._responseTime + 61000;
    assert.equal(publicPolicy.satisfiesWithoutRevalidation({ ...request, headers: { ...request.headers, 'cache-control': 'max-stale=30' } }), true);
    const clone = fromRoot('@ungap/structured-clone').default;
    const input = { values: [1, 'text'] };
    const copied = clone(input);
    assert.equal(copied.values.length, 2);
    assert.equal(copied.values[0], 1);
    assert.equal(copied.values[1], 'text');
    copied.values[0] = 2;
    assert.equal(input.values[0], 1);
  }
  return { uuid: 'PASS', stream_json: 'PASS', elliptic: 'PASS',
    ...(includeBuildDependencies ? { braces: 'PASS', http_cache_semantics: 'PASS', structured_clone: 'PASS' } : {}) };
}
module.exports = verifyDependencies;
if (require.main === module) {
  verifyDependencies(process.argv[2] || path.resolve(__dirname, '..'), process.argv.includes('--build'))
    .then(result => console.log(JSON.stringify(result)))
    .catch(error => { console.error(error); process.exitCode = 1; });
}
