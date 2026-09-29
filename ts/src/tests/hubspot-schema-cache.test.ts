// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import hubspotApp from '../apps/hubspot';
import * as os from 'node:os';
import * as path from 'node:path';
import { hubspotContract, normalizeSchema, schemaCompatibilityDigest, schemaNames, verifySnapshot, readFile,
  verifySchemaCompatibility } from '../schema-cache/hubspot';
import {
  activateSnapshot, activeSnapshot, download, Inputs, installSnapshot, selectDownloads, withCacheLock,
} from '../schema-cache/hubspot-store';

// Qore-owned minimal fixtures. No upstream document, descriptions or data types are embedded.
function inputs(revision = 'one'): Inputs {
  return Object.fromEntries(schemaNames.map(name => {
    const paths: Record<string, any> = {};
    for (const operation of hubspotContract.schemas[name].operations) {
      const route = operation.sourcePaths[operation.sourcePaths.length - 1];
      (paths[route] ||= {})[operation.method] = {
        operationId: `upstream-${operation.action}-${revision}`,
        responses: { '200': { description: 'Synthetic response', content: {
          'application/json': { schema: { $ref: '#/components/schemas/Result' } },
        } } },
      };
    }
    return [name, { source: `fixture:${name}`, bytes: Buffer.from(JSON.stringify({
      openapi: '3.0.1', info: { title: 'Synthetic Qore test fixture', version: revision },
      servers: [{ url: 'https://api.hubapi.com' }], paths,
      components: { schemas: { Result: { type: 'object', properties: { id: { type: 'string' } } } } },
    })) }];
  }));
}

describe('HubSpot schema snapshots', () => {
  let directory: string;
  beforeEach(() => { directory = fs.mkdtempSync(path.join(os.tmpdir(), 'qore-hubspot-cache-')); });
  afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

  it('Keeps user-facing action presentation independent of downloaded schemas', () => {
    const actions = hubspotApp('en').actions;
    for (const schema of Object.values(hubspotContract.schemas)) {
      for (const operation of schema.operations) {
        const action = actions.find(candidate => candidate.action === operation.action);
        expect(action).toMatchObject(operation.presentation);
        expect(action?.display_name).not.toContain('/crm/');
        expect(action?.desc).toBeTruthy();
      }
    }
    expect(actions.find(action => action.action === 'get-crm-v3-objects-companies_getPage'))
      .toMatchObject({ display_name: 'Retrieve Companies', short_desc: 'Retrieve companies' });
  });

  it('Rejects a named pipe without blocking while opening an offline input', () => {
    const filename = path.join(directory, 'pipe');
    execFileSync('mkfifo', [filename]);
    expect(() => readFile(filename)).toThrow(/invalid file/);
  });

  it('Preserves all stable operation identities across changed upstream IDs and known path aliases', () => {
    let count = 0;
    for (const [name, input] of Object.entries(inputs())) {
      const normalized = normalizeSchema(name, JSON.parse(input.bytes.toString()));
      for (const operation of hubspotContract.schemas[name].operations) {
        expect(normalized.paths[operation.path][operation.method].operationId).toBe(operation.action);
        ++count;
      }
    }
    expect(count).toBe(66);
    expect(hubspotContract.actions).toHaveLength(78);
    expect(new Set(hubspotContract.actions).size).toBe(78);
  });

  it('Rejects missing or ambiguous operations rather than silently reducing the catalogue', () => {
    const doc = JSON.parse(inputs().deals.bytes.toString());
    const route = Object.keys(doc.paths)[0];
    const missing = structuredClone(doc);
    delete missing.paths[route];
    expect(() => normalizeSchema('deals', missing)).toThrow(/INCOMPATIBLE/);
    doc.paths[route.replace('/deals', '/0-3')] = doc.paths[route];
    expect(() => normalizeSchema('deals', doc)).toThrow(/exactly one/);
  });

  it('Detects changes to referenced inputs, outputs and presentation but ignores unrelated publication changes', () => {
    const original = normalizeSchema('companies', JSON.parse(inputs().companies.bytes.toString()));
    const expected = schemaCompatibilityDigest(original);
    const changedPublication = structuredClone(original);
    changedPublication.info.version = 'new publication';
    changedPublication.components.schemas.Unused = { type: 'integer' };
    // Canonical object ordering is independent of JSON serialization order.
    changedPublication.components.schemas.Result = { properties: { id: { type: 'string' } }, type: 'object' };
    expect(schemaCompatibilityDigest(changedPublication)).toBe(expected);
    for (const change of [
      (doc: typeof original) => { doc.components.schemas.Result.properties.id.type = 'integer'; },
      (doc: typeof original) => { doc.components.schemas.Result.required = ['id']; },
      (doc: typeof original) => { doc.components.schemas.Result.properties.id.description = 'New presentation'; },
      (doc: typeof original) => { doc.components.schemas.Result.properties.id.enum = ['limited']; },
      (doc: typeof original) => { doc.components.schemas.Result.properties.extra = { type: 'string' }; },
      (doc: typeof original) => { Object.values<any>(doc.paths)[0].get.parameters = [
        { name: 'newRequired', in: 'query', required: true, schema: { type: 'string' } },
      ]; },
    ]) {
      const changed = structuredClone(original);
      change(changed);
      expect(schemaCompatibilityDigest(changed)).not.toBe(expected);
    }
    // Local reference cycles terminate and remain deterministic.
    original.components.schemas.Result.properties.child = { $ref: '#/components/schemas/Result' };
    expect(schemaCompatibilityDigest(original)).toBe(schemaCompatibilityDigest(structuredClone(original)));
  });

  it('Does not activate an unreviewed schema surface even when its operation inventory matches', async () => {
    const first = await installSnapshot(directory, inputs(), async () => {});
    await expect(installSnapshot(directory, inputs('two'), async snapshot => {
      verifySchemaCompatibility(snapshot);
    })).rejects.toThrow(/supported operation metadata changed/);
    expect(activeSnapshot(directory)).toBe(first);
  });

  it('Rejects external and dangling references, unsupported formats and unexpected API servers', () => {
    for (const ref of ['https://example.org/schema.json', '#/components/schemas/Missing']) {
      const doc = JSON.parse(inputs().companies.bytes.toString());
      doc.components.schemas.Result = { $ref: ref };
      expect(() => normalizeSchema('companies', doc)).toThrow(/reference/);
    }
    const doc = JSON.parse(inputs().companies.bytes.toString());
    doc.servers[0].url = 'https://example.org';
    expect(() => normalizeSchema('companies', doc)).toThrow(/API server/);
    doc.openapi = '3.1.0';
    expect(() => normalizeSchema('companies', doc)).toThrow(/OpenAPI 3.0/);
  });

  it('Selects the supported generation rather than a dated LATEST API', () => {
    const catalogue = { results: schemaNames.map(name => ({
      name: hubspotContract.schemas[name].name, group: hubspotContract.schemas[name].group,
      versions: [{ version: '2026-09', stage: 'LATEST', openApi: 'wrong-generation' },
        { version: '3', stage: name === 'forms' ? 'DEVELOPER_PREVIEW' : 'STABLE', openApi: name }],
    })) };
    expect(Object.values(selectDownloads(catalogue))).toEqual(schemaNames);
    catalogue.results[0].versions = [catalogue.results[0].versions[0]];
    expect(() => selectDownloads(catalogue)).toThrow(/supported version missing/);
  });

  it('Rejects arbitrary download URLs before opening a connection', async () => {
    for (const url of ['http://api.hubspot.com/public/api/spec/v1/specs', 'https://example.org/schema',
      'https://user:password@api.hubspot.com/public/api/spec/v1/specs',
      'https://api.hubspot.com/public/api/spec/v2/specs/release/1/version/2026-09']) {
      await expect(download(url)).rejects.toThrow(/unexpected URL/);
    }
  });

  it('Activates only complete qualified snapshots and retains the previous selection on failure', async () => {
    const qualify = jest.fn(async () => {});
    const first = await withCacheLock(directory, () => installSnapshot(directory, inputs(), qualify));
    expect(qualify).toHaveBeenCalledWith(first);
    expect(activeSnapshot(directory)).toBe(first);
    const broken = inputs('two');
    delete broken.contacts;
    await expect(withCacheLock(directory, () => installSnapshot(directory, broken, qualify))).rejects.toThrow(/incomplete/);
    await expect(withCacheLock(directory, () => installSnapshot(directory, inputs('two'), async () => {
      throw new Error('runtime rejected types');
    }))).rejects.toThrow(/runtime rejected/);
    expect(activeSnapshot(directory)).toBe(first);
    const second = await withCacheLock(directory, () => installSnapshot(directory, inputs('two'), qualify));
    expect(second).not.toBe(first);
    expect(JSON.parse(readFile(path.join(directory, 'active.json')).toString()).previous).toBe(path.basename(first));
    await withCacheLock(directory, async () => activateSnapshot(directory, first));
    expect(activeSnapshot(directory)).toBe(first);
    expect(verifySnapshot(second)).toBe(second); // already-running processes can retain the old path
  });

  it('Detects tampering and symlinks and allows replacement of a corrupt older snapshot', async () => {
    const first = await withCacheLock(directory, () => installSnapshot(directory, inputs(), async () => {}));
    const filename = path.join(first, 'companies.json');
    fs.chmodSync(filename, 0o600);
    fs.appendFileSync(filename, ' ');
    expect(() => verifySnapshot(first)).toThrow(/checksum mismatch/);
    const second = await withCacheLock(directory, () => installSnapshot(directory, inputs('two'), async () => {}));
    expect(activeSnapshot(directory)).toBe(second);
    const alias = path.join(directory, 'alias'); fs.symlinkSync(second, alias);
    expect(() => verifySnapshot(alias)).toThrow(/not a symlink/);
    const link = path.join(directory, 'linked-file'); fs.symlinkSync(path.join(second, 'companies.json'), link);
    expect(() => readFile(link)).toThrow();
  });

  it('Serializes updates and releases the lock after an error', async () => {
    await withCacheLock(directory, async () => {
      await expect(withCacheLock(directory, async () => {})).rejects.toThrow(/another updater/);
    });
    await expect(withCacheLock(directory, async () => { throw new Error('test failure'); })).rejects.toThrow('test failure');
    await expect(withCacheLock(directory, async () => 42)).resolves.toBe(42);
  });
});
