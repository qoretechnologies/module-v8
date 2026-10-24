// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { test } = require('node:test');
const { checkUpstream, fetchInputs, fromMirror, main, MAX_LISTED, MAX_REASON, mirrorRequest, pinnedSources, stage,
  updateCommands } = require('./schema-inputs.cjs');
const apps = require('../../ts/dist/schema-cache/apps');
const appCompatibility = require('../../ts/dist/schema-cache/app-compatibility.json');
const { DownloadStatusError } = require('../../ts/dist/schema-cache/download');
const hubspotSchemas = require('../../ts/dist/schema-cache/hubspot');
const { schemaNames } = hubspotSchemas;
const { SchemaSourceUnavailableError } = require('../../ts/dist/schema-cache/schema-errors');
const pins = require('./schema-inputs.json');

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const TOKEN = 'synthetic-job-token-value';
const ENV = { QORE_SCHEMA_INPUT_MIRROR: 'https://git.example.test/api/v4/projects/1/packages/generic/schema-inputs/',
  CI_JOB_TOKEN: TOKEN };

/** Owned synthetic documents for every pinned source, and pins for them at the catalogue's URLs. */
function fixture(revision = 'one') {
  const documents = {};
  const configuration = { apps: {}, hubspot: { sources: {} } };
  for (const name of schemaNames) {
    const bytes = Buffer.from(JSON.stringify({ fixture: `hubspot ${name}`, revision }));
    documents[`hubspot ${name}`] = bytes;
    configuration.hubspot.sources[name] = { url: pins.hubspot.sources[name].url, sha256: sha256(bytes) };
  }
  for (const [app, pin] of Object.entries(pins.apps)) {
    configuration.apps[app] = { sources: {} };
    const parsed = {};
    for (const [name, source] of Object.entries(pin.sources)) {
      const bytes = Buffer.from(JSON.stringify({ fixture: `${app} ${name}`, revision }));
      documents[`${app} ${name}`] = bytes;
      parsed[name] = JSON.parse(bytes.toString());
      configuration.apps[app].sources[name] = { url: source.url, sha256: sha256(bytes) };
    }
    const names = Object.keys(pin.sources);
    configuration.apps[app].sha256 = names.length === 1 ? configuration.apps[app].sources[names[0]].sha256
      : sha256(Buffer.from(JSON.stringify(parsed)));
  }
  return { documents, configuration };
}

function directory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qore-schema-inputs-'));
}

const listing = root => fs.readdirSync(root, { recursive: true }).sort();

test('the committed pins name exactly the documents that the catalogue downloads', () => {
  const sources = pinnedSources();
  assert.equal(sources.length, schemaNames.length + 3);
  assert.deepEqual(sources.filter(source => source.app === 'hubspot').map(source => source.name), schemaNames);
  assert.deepEqual(sources.filter(source => source.app !== 'hubspot').map(source => source.id),
    ['pipedrive v1', 'pipedrive v2', 'trello schema']);
  // Trello's input is its one document; Pipedrive's combines its two
  assert.equal(pins.apps.trello.sha256, pins.apps.trello.sources.schema.sha256);
  assert.equal(new Set(sources.map(source => source.file)).size, sources.length);
});

test('mirror fetches every pinned document by its pin with the job token and writes private import inputs', async () => {
  const { documents, configuration } = fixture();
  const requests = [];
  const download = async (url, options) => {
    requests.push({ url, options });
    const source = pinnedSources(configuration).find(item => url.endsWith(`/${item.sha256}/${item.file}`));
    return documents[source.id];
  };
  const root = directory();
  try {
    await fetchInputs(root, 'mirror', { configuration, fetchSource: source => fromMirror(source, ENV, download) });
    assert.equal(requests.length, schemaNames.length + 3);
    const companies = configuration.hubspot.sources.companies.sha256;
    assert.equal(requests[0].url, 'https://git.example.test/api/v4/projects/1/packages/generic/schema-inputs/'
      + `${companies}/hubspot-companies.json`);
    for (const { options } of requests) {
      assert.deepEqual(options.headers, { 'JOB-TOKEN': TOKEN });
      assert.equal(options.prefix, 'SCHEMA-INPUT-MIRROR');
    }
    assert.deepEqual(listing(root), ['hubspot', ...schemaNames.map(name => path.join('hubspot', `${name}.swagger.json`)),
      'pipedrive.json', 'trello.json'].sort());
    assert.deepEqual(fs.readFileSync(path.join(root, 'hubspot', 'companies.swagger.json')),
      documents['hubspot companies']);
    assert.deepEqual(fs.readFileSync(path.join(root, 'trello.json')), documents['trello schema']);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'pipedrive.json'))), {
      v1: JSON.parse(documents['pipedrive v1']), v2: JSON.parse(documents['pipedrive v2']) });
    assert.equal(fs.statSync(path.join(root, 'pipedrive.json')).mode & 0o777, 0o600);
    // inputs are never overwritten
    await assert.rejects(fetchInputs(root, 'mirror', { configuration,
      fetchSource: source => fromMirror(source, ENV, download) }), /EEXIST/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('mirror fails clearly for a pinned document that is missing from the mirror, and writes nothing', async () => {
  const { documents, configuration } = fixture();
  const v2 = configuration.apps.pipedrive.sources.v2.sha256;
  const download = async (url, options) => {
    if (url.includes(v2)) throw new DownloadStatusError(`${options.prefix}: ${url}: HTTP 404`, 404);
    return documents[pinnedSources(configuration).find(item => url.includes(item.sha256)).id];
  };
  const root = directory();
  try {
    await assert.rejects(fetchInputs(root, 'mirror', { configuration,
      fetchSource: source => fromMirror(source, ENV, download) }), error => {
      assert.equal(error.message, `SCHEMA-INPUT-MIRROR: the mirror has no pipedrive v2 document with the pinned `
        + `SHA-256 ${v2} (https://git.example.test/api/v4/projects/1/packages/generic/schema-inputs/${v2}/`
        + 'pipedrive-v2.json); stage and upload the reviewed document, as design/schema-cache.md describes');
      assert.ok(!error.message.includes(TOKEN));
      return true;
    });
    assert.deepEqual(listing(root), []);
    // a mirror that refuses the token or cannot answer keeps its own error
    const refused = new DownloadStatusError('SCHEMA-INPUT-MIRROR: https://git.example.test/x: HTTP 401', 401);
    await assert.rejects(fromMirror(pinnedSources(configuration)[0], ENV, async () => { throw refused; }),
      error => error === refused);
    const unavailable = new SchemaSourceUnavailableError('SCHEMA-INPUT-MIRROR: https://git.example.test/x: HTTP 503');
    await assert.rejects(fromMirror(pinnedSources(configuration)[0], ENV, async () => { throw unavailable; }),
      error => error === unavailable);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('every document is checked by its own pin, and every app input by its pin', async () => {
  const { documents, configuration } = fixture();
  const root = directory();
  try {
    // the mirror returned other bytes for one Pipedrive generation
    const tampered = { ...documents, 'pipedrive v2': Buffer.from('{"fixture":"changed"}') };
    await assert.rejects(fetchInputs(root, 'mirror', { configuration, fetchSource: async source => tampered[source.id] }),
      { message: `SCHEMA-INPUT-MIRROR: the mirror's pipedrive v2 document has the SHA-256 `
        + `${sha256(tampered['pipedrive v2'])}, not the pinned ${configuration.apps.pipedrive.sources.v2.sha256}` });
    // an upstream service that changed a document
    const changed = { ...documents, 'trello schema': Buffer.from('{"fixture":"revised"}') };
    await assert.rejects(fetchInputs(root, 'upstream', { configuration, fetchSource: async source => changed[source.id] }),
      { message: `upstream changed: trello schema, ${configuration.apps.trello.sources.schema.sha256} → `
        + `${sha256(changed['trello schema'])} (${pins.apps.trello.sources.schema.url}); review the change before `
        + 'updating the pin, as design/schema-cache.md describes' });
    // source pins that do not combine to the pinned input
    const inconsistent = structuredClone(configuration);
    inconsistent.apps.pipedrive.sha256 = 'a'.repeat(64);
    await assert.rejects(fetchInputs(root, 'mirror', { configuration: inconsistent,
      fetchSource: async source => documents[source.id] }), /SCHEMA-INPUT-PINS: the pinned pipedrive sources combine to an input with the SHA-256 [a-f0-9]{64}, not the pinned a{64}/);
    assert.deepEqual(listing(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('pins must match the catalogue', () => {
  const { configuration } = fixture();
  const changed = mutate => { const copy = structuredClone(configuration); mutate(copy); return () => pinnedSources(copy); };
  assert.throws(changed(copy => delete copy.hubspot.sources.users), /SCHEMA-INPUT-PINS: hubspot needs exactly the documents/);
  assert.throws(changed(copy => { copy.hubspot.sources.users.url = 'https://example.test/users'; }),
    /SCHEMA-INPUT-PINS: hubspot users needs a v3 release URL/);
  assert.throws(changed(copy => { copy.apps.pipedrive.sources.v1.url = 'https://example.test/v1'; }),
    /SCHEMA-INPUT-PINS: pipedrive v1 is pinned at https:\/\/example.test\/v1, but the catalogue downloads/);
  assert.throws(changed(copy => delete copy.apps.pipedrive.sources.v2), /pipedrive needs exactly the sources v1, v2/);
  assert.throws(changed(copy => { copy.apps.trello.sources.schema.sha256 = 'ABC'; }), /trello schema needs a SHA-256/);
  assert.throws(changed(copy => { copy.apps.trello.sha256 = undefined; }), /trello needs the SHA-256 of its input/);
  assert.throws(changed(copy => { copy.apps.zoom = { sha256: 'a'.repeat(64), sources: {} }; }),
    /SCHEMA-INPUT-PINS: zoom: APP-SCHEMA-IMPORT-REQUIRED/);
});

test('the mirror is read with the job token or a configured token, which is never printed', () => {
  const source = pinnedSources()[0];
  const url = `https://git.example.test/api/v4/projects/1/packages/generic/schema-inputs/${source.sha256}/${source.file}`;
  assert.deepEqual(mirrorRequest(source, ENV), { url, headers: { 'JOB-TOKEN': TOKEN } });
  assert.deepEqual(mirrorRequest(source, { QORE_SCHEMA_INPUT_MIRROR: ENV.QORE_SCHEMA_INPUT_MIRROR,
    QORE_SCHEMA_INPUT_MIRROR_TOKEN: TOKEN }), { url, headers: { 'PRIVATE-TOKEN': TOKEN } });
  assert.throws(() => mirrorRequest(source, { QORE_SCHEMA_INPUT_MIRROR: ENV.QORE_SCHEMA_INPUT_MIRROR }),
    { message: 'SCHEMA-INPUT-MIRROR: neither CI_JOB_TOKEN nor QORE_SCHEMA_INPUT_MIRROR_TOKEN is set' });
  assert.throws(() => mirrorRequest(source, { CI_JOB_TOKEN: TOKEN }),
    { message: 'SCHEMA-INPUT-MIRROR: QORE_SCHEMA_INPUT_MIRROR (the base URL of the mirror) is not set' });
});

test('stage writes the pinned upstream documents in the mirror layout', async () => {
  const { documents, configuration } = fixture();
  const root = directory();
  try {
    const lines = await stage(root, { configuration, fetchSource: async source => documents[source.id] });
    const sources = pinnedSources(configuration);
    assert.deepEqual(lines, sources.map(source => `${source.sha256}\t${source.file}`));
    for (const source of sources) {
      assert.deepEqual(fs.readFileSync(path.join(root, source.sha256, source.file)), documents[source.id]);
    }
    const other = directory();
    try {
      const changed = { ...documents, 'hubspot lists': Buffer.from('{}') };
      await assert.rejects(stage(other, { configuration, fetchSource: async source => changed[source.id] }),
        /^Error: upstream changed: hubspot lists, /);
      assert.deepEqual(listing(other), []);
    } finally {
      fs.rmSync(other, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

/**
 * Runs checkUpstream against fixtures; returns its status, its lines, the update commands it ran and the documents
 * that it read from the mirror. The mirror has the pinned documents (by default the upstream ones).
 */
async function check({ configuration, documents, pinned = documents, hubspot, fetchSource, fetchPinned,
  statuses = [0, 0] }) {
  const lines = [];
  const commands = [];
  const mirrored = [];
  const readPinned = fetchPinned ?? (async source => pinned[source.id]);
  const status = await checkUpstream('/cache', {
    configuration,
    hubspotInputs: hubspot ?? (async () => Object.fromEntries(schemaNames.map(name => [name,
      { bytes: documents[`hubspot ${name}`], source: configuration.hubspot.sources[name].url }]))),
    fetchSource: fetchSource ?? (async source => documents[source.id]),
    fetchPinned: async source => { mirrored.push(source.id); return readPinned(source); },
    runUpdate: command => { commands.push(command); return statuses[commands.length - 1]; },
    log: line => lines.push(line),
  });
  return { status, lines, commands, mirrored };
}

test('check-upstream passes when every upstream document has its pin and every update succeeds', async () => {
  const { documents, configuration } = fixture();
  const { status, lines, commands } = await check({ configuration, documents });
  assert.equal(status, 0);
  assert.equal(lines.filter(line => line.startsWith('unchanged: ')).length, schemaNames.length + 3);
  assert.deepEqual(lines.slice(-3), ['updated: qore-hubspot-schemas update', 'updated: qore-app-schemas update '
    + 'pipedrive trello', `upstream check: ${schemaNames.length + 3} unchanged, 0 changed, 0 unavailable, 0 failed`]);
  // the update commands are the user-facing commands, each with a cache of its own
  assert.deepEqual(commands, updateCommands('/cache', configuration));
  assert.deepEqual(commands.map(command => command.args.slice(1)), [['--cache-dir', '/cache/hubspot', 'update'],
    ['--cache-dir', '/cache/apps', 'update', 'pipedrive', 'trello']]);
  assert.match(commands[0].args[0], /ts\/dist\/schema-cache\/hubspot-cli\.js$/);
  assert.match(commands[1].args[0], /ts\/dist\/schema-cache\/app-cli\.js$/);
});

test('check-upstream reports each upstream change with the pin and the new digest', async () => {
  const { documents, configuration } = fixture();
  const changed = { ...documents, 'pipedrive v1': Buffer.from('{"fixture":"revised"}'),
    'hubspot deals': Buffer.from('{"fixture":"revised deals"}') };
  const moved = 'https://api.hubspot.com/public/api/spec/v2/specs/release/99999/version/3';
  const hubspot = async () => Object.fromEntries(schemaNames.map(name => [name, { bytes: changed[`hubspot ${name}`],
    source: name === 'forms' ? moved : configuration.hubspot.sources[name].url }]));
  const { status, lines, mirrored } = await check({ configuration, documents: changed, pinned: documents, hubspot,
    statuses: [2, 0] });
  assert.equal(status, 1);
  const review = 'review the change before updating the pin, as design/schema-cache.md describes';
  const deals = configuration.hubspot.sources.deals;
  const forms = configuration.hubspot.sources.forms;
  const v1 = configuration.apps.pipedrive.sources.v1;
  // these synthetic documents are not OpenAPI documents, so the catalogue cannot compare their surfaces
  const refused = 'supported surface not compared: the catalogue refuses the pinned documents:';
  assert.deepEqual(lines.filter(line => !line.startsWith('unchanged: ')), [
    `upstream changed: hubspot deals, ${deals.sha256} → ${sha256(changed['hubspot deals'])} (${deals.url}); ${review}`,
    `upstream changed: hubspot forms, ${forms.url} → ${moved} (${forms.sha256} → ${forms.sha256}); ${review}`,
    `upstream changed: pipedrive v1, ${v1.sha256} → ${sha256(changed['pipedrive v1'])} (${v1.url}); ${review}`,
    `hubspot deals: ${refused} HUBSPOT-SCHEMA-INVALID: OpenAPI 3.0 required`,
    `hubspot forms: ${refused} HUBSPOT-SCHEMA-INVALID: OpenAPI 3.0 required`,
    `pipedrive: ${refused} APP-SCHEMA-INVALID: Swagger 2.0 or OpenAPI 3.0 required`,
    'update failed: qore-hubspot-schemas update exited with 2 (a schema was refused)',
    'updated: qore-app-schemas update pipedrive trello',
    `upstream check: ${schemaNames.length} unchanged, 3 changed, 0 unavailable, 1 failed`,
  ]);
  // only documents whose bytes changed are read from the mirror; the moved forms document still has its pinned bytes
  assert.deepEqual(mirrored, ['hubspot deals', 'pipedrive v1']);
});

test('check-upstream reports unavailable upstream services as such', async () => {
  const { documents, configuration } = fixture();
  const unavailable = new SchemaSourceUnavailableError('HUBSPOT-SCHEMA-DOWNLOAD: https://api.hubspot.com/public/api/'
    + 'spec/v1/specs: ECONNRESET: socket hang up; nothing was changed, and the source may answer later');
  const result = await check({ configuration, documents, hubspot: async () => { throw unavailable; },
    statuses: [69, 0] });
  assert.equal(result.status, 69);
  assert.deepEqual(result.lines.filter(line => !line.startsWith('unchanged: ')), [
    `upstream unavailable: hubspot: ${unavailable.message}`,
    'update failed: qore-hubspot-schemas update exited with 69 (a source was unavailable)',
    'updated: qore-app-schemas update pipedrive trello',
    'upstream check: 3 unchanged, 0 changed, 2 unavailable, 0 failed',
  ]);
  // any other failure is not unavailability
  const other = await check({ configuration, documents, fetchSource: async source => {
    if (source.id === 'trello schema') throw new Error('APP-SCHEMA-DOWNLOAD: https://dac-static.atlassian.com/x: HTTP 404');
    return documents[source.id];
  } });
  assert.equal(other.status, 1);
  assert.ok(other.lines.includes('check failed: trello schema: APP-SCHEMA-DOWNLOAD: https://dac-static.atlassian.com/x: '
    + 'HTTP 404'));
});

/** A synthetic OpenAPI document with the given operations, each answering with a shared record definition. */
function openapi(server, operations) {
  const paths = {};
  for (const { route, method } of operations) {
    (paths[route] ||= {})[method] = { responses: { 200: { description: 'Synthetic response', content: {
      'application/json': { schema: { $ref: '#/components/schemas/Record' } } } } } };
  }
  return { openapi: '3.0.1', info: { title: 'Synthetic provider', version: '1' }, servers: [{ url: server }], paths,
    components: { schemas: { Record: { type: 'object', properties: { id: { type: 'integer' } } } },
      securitySchemes: { token: { type: 'apiKey', in: 'header', name: 'x-api-token' } } } };
}

/**
 * Pins for synthetic OpenAPI documents with every supported operation of Pipedrive's two generations and of HubSpot's
 * deals; the other documents stay opaque and unchanged. revision(change) returns the upstream documents, and the
 * parsed ones, after change has edited a copy of the parsed pinned documents.
 */
function surfaceFixture() {
  const { documents: opaque, configuration } = fixture();
  const generations = { v1: [], v2: [] };
  for (const { path: route, method } of apps.appContract('pipedrive').operations) {
    const v1 = route.startsWith('/v1/');
    generations[v1 ? 'v1' : 'v2'].push({ route: route.slice(v1 ? 3 : 7), method });
  }
  const parsed = {
    'pipedrive v1': openapi('https://api.pipedrive.com/v1', generations.v1),
    'pipedrive v2': openapi('https://api.pipedrive.com/api/v2', generations.v2),
    'hubspot deals': openapi('https://api.hubapi.com', hubspotSchemas.hubspotContract.schemas.deals.operations
      .map(operation => ({ route: operation.sourcePaths[0], method: operation.method }))),
  };
  const serialize = items => Object.fromEntries(Object.entries(items)
    .map(([id, document]) => [id, Buffer.from(JSON.stringify(document))]));
  const documents = { ...opaque, ...serialize(parsed) };
  configuration.hubspot.sources.deals.sha256 = sha256(documents['hubspot deals']);
  for (const name of ['v1', 'v2']) {
    configuration.apps.pipedrive.sources[name].sha256 = sha256(documents[`pipedrive ${name}`]);
  }
  configuration.apps.pipedrive.sha256 = sha256(Buffer.from(JSON.stringify({ v1: parsed['pipedrive v1'],
    v2: parsed['pipedrive v2'] })));
  const revision = change => {
    const revised = structuredClone(parsed);
    change(revised);
    return { upstream: { ...documents, ...serialize(revised) }, revised };
  };
  return { documents, configuration, parsed, revision };
}

/** The compatibility fingerprint of Pipedrive's parsed documents, as the catalogue computes it. */
const pipedriveFingerprint = parsed => apps.schemaCompatibilityDigest(apps.normalizeSchema('pipedrive',
  { v1: parsed['pipedrive v1'], v2: parsed['pipedrive v2'] }));

/** The surface lines of a check. */
const surfaceLines = lines => lines.filter(line => / supported surface /.test(line));

test('check-upstream tells a change outside the supported surface from one in it, and still fails', async () => {
  const { documents, configuration, parsed, revision } = surfaceFixture();
  const fingerprint = pipedriveFingerprint(parsed);
  // an operation that the catalogue does not support: the normalized snapshot is the same
  const thread = revision(revised => {
    revised['pipedrive v1'].paths['/mailbox/mailThreads/{id}'] = { get: { responses: { 200: {
      description: 'A mail thread', content: { 'application/json': { schema: { type: 'object', properties: {
        archived_flag: { type: 'integer', nullable: true, enum: [0, 1] } } } } } } } } };
  });
  let result = await check({ configuration, documents: thread.upstream, pinned: documents });
  assert.equal(result.status, 1);
  assert.ok(result.lines.some(line => line.startsWith('upstream changed: pipedrive v1, ')));
  assert.deepEqual(surfaceLines(result.lines), [`pipedrive: supported surface unchanged (fingerprint ${fingerprint}); `
    + 'the normalized snapshot is unchanged']);
  // the pinned v2 document still has its bytes upstream, so only v1 is read from the mirror
  assert.deepEqual(result.mirrored, ['pipedrive v1']);
  // a definition that no supported operation references is carried into the snapshot, outside the surface
  const definition = revision(revised => {
    revised['pipedrive v2'].components.schemas.ProductVariationPrice = { type: 'object' };
  });
  result = await check({ configuration, documents: definition.upstream, pinned: documents });
  assert.equal(result.status, 1);
  assert.deepEqual(surfaceLines(result.lines), [`pipedrive: supported surface unchanged (fingerprint ${fingerprint}); `
    + 'the normalized snapshot changes outside it']);
  // a supported operation: its action identity is named, with both fingerprints
  const lead = revision(revised => {
    revised['pipedrive v1'].paths['/leads/{id}'].get.parameters = [{ name: 'id', in: 'path', required: true,
      schema: { type: 'string', format: 'uuid' } }];
  });
  const changed = pipedriveFingerprint(lead.revised);
  assert.notEqual(changed, fingerprint);
  result = await check({ configuration, documents: lead.upstream, pinned: documents });
  assert.equal(result.status, 1);
  assert.deepEqual(surfaceLines(result.lines), [`pipedrive: supported surface CHANGED: getLead (fingerprint `
    + `${fingerprint} → ${changed}, which the catalogue does not accept)`]);
  // a reviewed fingerprint that the catalogue accepts is still a change from the pin
  appCompatibility.apps.pipedrive.push(changed);
  try {
    result = await check({ configuration, documents: lead.upstream, pinned: documents });
  } finally {
    appCompatibility.apps.pipedrive.pop();
  }
  assert.equal(result.status, 1);
  assert.deepEqual(surfaceLines(result.lines), [`pipedrive: supported surface CHANGED: getLead (fingerprint `
    + `${fingerprint} → ${changed}, which the catalogue accepts)`]);
});

test('check-upstream names the supported parts that a change affects, within bounds', async () => {
  const { documents, configuration, parsed, revision } = surfaceFixture();
  const fingerprint = pipedriveFingerprint(parsed);
  // a definition that every v2 operation references: the first operations are named, and the rest counted
  const record = revision(revised => {
    revised['pipedrive v2'].components.schemas.Record.properties.id.type = 'string';
  });
  let result = await check({ configuration, documents: record.upstream, pinned: documents });
  const v2 = apps.appContract('pipedrive').operations.filter(operation => operation.path.startsWith('/api/v2/'))
    .map(operation => operation.operationId);
  assert.ok(v2.length > MAX_LISTED);
  assert.deepEqual(surfaceLines(result.lines), [`pipedrive: supported surface CHANGED: `
    + `${v2.slice(0, MAX_LISTED).join(', ')} and ${v2.length - MAX_LISTED} more (fingerprint ${fingerprint} → `
    + `${pipedriveFingerprint(record.revised)}, which the catalogue does not accept)`]);
  // a security scheme is covered by the fingerprint, but belongs to no operation
  const scheme = revision(revised => {
    revised['pipedrive v1'].components.securitySchemes.token.name = 'x-other-token';
  });
  result = await check({ configuration, documents: scheme.upstream, pinned: documents });
  assert.deepEqual(surfaceLines(result.lines), [`pipedrive: supported surface CHANGED: securitySchemes (fingerprint `
    + `${fingerprint} → ${pipedriveFingerprint(scheme.revised)}, which the catalogue does not accept)`]);
  // a HubSpot document is its own surface, named by its actions
  const deals = revision(revised => {
    revised['hubspot deals'].components.schemas.Record.properties.amount = { type: 'number' };
  });
  result = await check({ configuration, documents: deals.upstream, pinned: documents });
  const fingerprints = [parsed, deals.revised].map(items => hubspotSchemas.schemaCompatibilityDigest(
    hubspotSchemas.normalizeSchema('deals', items['hubspot deals'])));
  assert.deepEqual(surfaceLines(result.lines), [`hubspot deals: supported surface CHANGED: `
    + `${hubspotSchemas.hubspotContract.schemas.deals.operations.map(operation => operation.action).join(', ')} `
    + `(fingerprint ${fingerprints[0]} → ${fingerprints[1]}, which the catalogue does not accept)`]);
});

test('check-upstream reports a supported operation that upstream removed, and a surface it cannot compare', async () => {
  const { documents, configuration, revision } = surfaceFixture();
  const removed = revision(revised => { delete revised['pipedrive v1'].paths['/leads/{id}'].get; });
  let result = await check({ configuration, documents: removed.upstream, pinned: documents });
  assert.equal(result.status, 1);
  assert.deepEqual(surfaceLines(result.lines), ['pipedrive: supported surface CHANGED: the catalogue refuses the '
    + 'upstream documents: APP-SCHEMA-INCOMPATIBLE: pipedrive: expected exactly one get /v1/leads/{id}']);
  // the comparison never stops the check or the update commands
  const { upstream } = revision(revised => { revised['pipedrive v1'].info.version = '2'; });
  const v1 = configuration.apps.pipedrive.sources.v1.sha256;
  const missing = (url, options) => { throw new DownloadStatusError(`${options.prefix}: ${url}: HTTP 404`, 404); };
  result = await check({ configuration, documents: upstream, fetchPinned: source => fromMirror(source, ENV, missing) });
  assert.equal(result.status, 1);
  assert.deepEqual(surfaceLines(result.lines), ['pipedrive: supported surface not compared: SCHEMA-INPUT-MIRROR: the '
    + `mirror has no pipedrive v1 document with the pinned SHA-256 ${v1} (https://git.example.test/api/v4/projects/1/`
    + `packages/generic/schema-inputs/${v1}/pipedrive-v1.json); stage and upload the reviewed document, as `
    + 'design/schema-cache.md describes']);
  assert.equal(result.commands.length, 2);
  // a mirror document with other bytes is not compared
  result = await check({ configuration, documents: upstream, pinned: upstream });
  assert.deepEqual(surfaceLines(result.lines), ['pipedrive: supported surface not compared: SCHEMA-INPUT-MIRROR: the '
    + `mirror's pipedrive v1 document has the SHA-256 ${sha256(upstream['pipedrive v1'])}, not the pinned ${v1}`]);
  // the other document of the app is unavailable upstream
  result = await check({ configuration, documents: upstream, pinned: documents, fetchSource: async source => {
    if (source.id === 'pipedrive v2') throw new SchemaSourceUnavailableError('APP-SCHEMA-DOWNLOAD: HTTP 503');
    return upstream[source.id];
  } });
  assert.equal(result.status, 1);
  assert.deepEqual(surfaceLines(result.lines), ['pipedrive: supported surface not compared: upstream pipedrive v2 is '
    + 'unavailable']);
  // a long reason is cut, so that every line stays bounded
  result = await check({ configuration, documents: upstream, fetchPinned: async () => {
    throw new Error(`SCHEMA-INPUT-MIRROR: ${'x'.repeat(2 * MAX_REASON)}`);
  } });
  const [line] = surfaceLines(result.lines);
  assert.equal(line, `pipedrive: supported surface not compared: SCHEMA-INPUT-MIRROR: ${'x'.repeat(MAX_REASON
    - 'SCHEMA-INPUT-MIRROR: '.length)}…`);
});

test('the command line accepts only the documented commands and absolute directories', async () => {
  for (const args of [[], ['mirror'], ['fetch', '/tmp/x'], ['mirror', 'relative'], ['stage', '/tmp/x', 'extra']]) {
    await assert.rejects(main(args), { message: 'Usage: schema-inputs.cjs mirror|upstream|stage|check-upstream '
      + 'ABSOLUTE_DIRECTORY' });
  }
});
