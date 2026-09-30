// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import compatibility from '../schema-cache/app-compatibility.json';
import { appContract, appIds, appSchemaMetadata, contractDigest, normalizeSchema, readFile,
  schemaCompatibilityDigest, SNAPSHOTS_ENV, validateDocument, verifyCompatibility, verifySnapshot } from '../schema-cache/apps';
import { activeSnapshot, configuredSnapshots, downloadInput, downloadNetSuite, installSnapshot,
  rollback, withAppLock } from '../schema-cache/app-store';

// Tests approve only Qore-owned synthetic fixtures. No provider document is embedded or fetched.
jest.mock('../schema-cache/app-compatibility.json', () => ({ version: 1, apps: {} }));

function fixture(id: string, revision = 'one'): Record<string, any> {
  const paths: Record<string, any> = {};
  for (const op of appContract(id).operations) {
    (paths[op.path] ||= {})[op.method] = { operationId: `upstream-${revision}-${op.operationId}`,
      responses: { '200': { description: 'Synthetic result', schema: { $ref: '#/definitions/Result' } } } };
  }
  return { swagger: '2.0', info: { title: 'Qore synthetic fixture', version: revision },
    host: 'api.example.invalid', basePath: '/v1', schemes: ['https'], paths,
    definitions: { Result: { type: 'object', properties: { id: { type: 'string' } } } } };
}

function input(id: string, revision = 'one') {
  return { bytes: Buffer.from(JSON.stringify(fixture(id, revision))), source: `fixture:${revision}` };
}

for (const id of appIds) {
  (compatibility.apps as Record<string, string[]>)[id] = [schemaCompatibilityDigest(normalizeSchema(id, fixture(id)))];
}

describe('App schema cache', () => {
  let directory: string;
  beforeEach(() => { directory = fs.mkdtempSync(path.join(os.tmpdir(), 'qore-app-schema-test-')); });
  afterEach(() => { fs.rmSync(directory, { recursive: true, force: true }); jest.restoreAllMocks(); delete process.env[SNAPSHOTS_ENV]; });

  it('Keeps every app/action identity and owned presentation without schemas or a cache', () => {
    delete process.env[SNAPSHOTS_ENV];
    let count = 0;
    for (const id of appIds) {
      const app = require(`../apps/${id}`).default('en');
      const contract = appContract(id);
      expect(app.actions.map((a: any) => a.action).sort()).toEqual(contract.actions);
      expect(app.initialization_error.err).toBe('APP-SCHEMAS-UNAVAILABLE');
      for (const action of app.actions.filter((a: any) => a.swagger_path)) {
        expect(action).toMatchObject(contract.presentation[action.action]);
      }
      count += app.actions.length;
    }
    expect(count).toBe(265);
  });

  it('Does not synthesize a template option unsupported by the webinar update schema', () => {
    const app = require('../apps/zoom').default('en');
    const update = app.actions.find((action: any) => action.action === 'webinarUpdate');
    const create = app.actions.find((action: any) => action.action === 'webinarCreate');
    expect(update.override_options).not.toHaveProperty('template_id');
    expect(create.override_options.template_id.get_allowed_values).toEqual(expect.any(Function));
  });

  it('Retains all 228 supported operations and overrides upstream operation IDs', () => {
    let count = 0;
    for (const id of appIds) {
      const normalized = normalizeSchema(id, fixture(id));
      for (const op of appContract(id).operations) {
        expect(normalized.paths[op.path][op.method].operationId).toBe(op.operationId); ++count;
      }
    }
    expect(count).toBe(228);
  });

  it('Rejects missing operations and ambiguous Magento path aliases', () => {
    const doc = fixture('magento');
    doc.paths['/V1/invoices/'] = structuredClone(doc.paths['/V1/invoices']);
    expect(() => normalizeSchema('magento', doc)).toThrow(/exactly one/);
    delete doc.paths['/V1/invoices'];
    expect(normalizeSchema('magento', doc).paths['/V1/invoices'].post).toBeTruthy();
    delete doc.paths['/V1/invoices/'];
    expect(() => normalizeSchema('magento', doc)).toThrow(/INCOMPATIBLE/);
  });

  it('Checks local references and bounds, rejecting remote and unresolved resources', () => {
    for (const reference of ['https://example.invalid/schema', 'file:///etc/passwd', '#/definitions/Absent']) {
      const doc = fixture('trello'); doc.definitions.Result = { $ref: reference };
      expect(() => validateDocument(doc)).toThrow(/reference/);
    }
    const doc = fixture('trello'); doc.swagger = '1.2';
    expect(() => validateDocument(doc)).toThrow(/Swagger 2.0 or OpenAPI 3.0/);
    delete doc.swagger; doc.openapi = '3.0.3'; expect(() => validateDocument(doc)).not.toThrow();
    doc.openapi = '3.1.0'; expect(() => validateDocument(doc)).toThrow(/Swagger 2.0 or OpenAPI 3.0/);
    let deep: any = {}; for (let i = 0; i < 100; i++) deep = { child: deep };
    expect(() => validateDocument({ ...fixture('trello'), deep })).toThrow(/complex/);
  });

  it('Pins types, requiredness, choices, presentation and server configuration, including reference cycles', () => {
    const base = normalizeSchema('trello', fixture('trello'));
    const expected = schemaCompatibilityDigest(base);
    const publication = structuredClone(base); publication.info.version = 'two';
    publication.definitions.Unused = { type: 'number' };
    expect(schemaCompatibilityDigest(publication)).toBe(expected);
    for (const change of [
      (doc: any) => { doc.definitions.Result.properties.id.type = 'number'; },
      (doc: any) => { doc.definitions.Result.required = ['id']; },
      (doc: any) => { doc.definitions.Result.properties.id.enum = ['one']; },
      (doc: any) => { doc.definitions.Result.properties.id.description = 'Changed field'; },
      (doc: any) => { doc.host = 'untrusted.example.invalid'; },
      (doc: any) => { doc.security = []; },
      (doc: any) => { doc.security = null; },
    ]) {
      const changed = structuredClone(base); change(changed);
      expect(schemaCompatibilityDigest(changed)).not.toBe(expected);
      expect(() => verifyCompatibility('trello', changed)).toThrow(/INCOMPATIBLE/);
    }
    base.definitions.Result.properties.child = { $ref: '#/definitions/Result' };
    expect(schemaCompatibilityDigest(base)).toBe(schemaCompatibilityDigest(structuredClone(base)));
  });

  it('Rejects pipes, oversized files and symlink imports', () => {
    const pipe = path.join(directory, 'pipe'); execFileSync('mkfifo', [pipe]);
    expect(() => readFile(pipe)).toThrow(/invalid file/);
    const file = path.join(directory, 'file'); fs.writeFileSync(file, 'test');
    expect(() => readFile(file, 3)).toThrow(/invalid file/);
    const alias = path.join(directory, 'alias'); fs.symlinkSync(file, alias);
    expect(() => readFile(alias)).toThrow();
  });

  it('Activates only qualified snapshots, preserving the active selection after every failure', async () => {
    const qualify = jest.fn(async () => {});
    const first = await installSnapshot(directory, 'trello', input('trello'), qualify);
    expect(qualify).toHaveBeenCalledWith('trello', first);
    const changed = fixture('trello'); changed.definitions.Result.properties.id.type = 'integer';
    await expect(installSnapshot(directory, 'trello', { source: 'fixture:changed', bytes: Buffer.from(JSON.stringify(changed)) }, qualify))
      .rejects.toThrow(/INCOMPATIBLE/);
    await expect(installSnapshot(directory, 'trello', input('trello', 'two'), async () => {
      throw new Error('installed runtime rejected candidate');
    })).rejects.toThrow(/runtime rejected/);
    expect(activeSnapshot(directory, 'trello')).toBe(first);
    const second = await installSnapshot(directory, 'trello', input('trello', 'two'), qualify);
    expect(second).not.toBe(first);
    expect(await rollback(directory, 'trello', undefined, qualify)).toBe(first);
    expect(verifySnapshot('trello', second)).toBe(second);
    expect(configuredSnapshots(directory)).toEqual({ trello: first });
    expect(() => verifySnapshot('magento', first)).toThrow(/contract/);
  });

  it('Detects corruption, contract changes and missing selected files without silently dropping the app', async () => {
    const snapshot = await installSnapshot(directory, 'trello', input('trello'), async () => {});
    const alias = path.join(directory, 'alias'); fs.symlinkSync(snapshot, alias);
    expect(() => verifySnapshot('trello', alias)).toThrow(/symlink/);
    const file = path.join(snapshot, 'schema.json'); fs.chmodSync(file, 0o600); fs.appendFileSync(file, ' ');
    expect(() => configuredSnapshots(directory)).toThrow(/checksum/);
    fs.unlinkSync(file); expect(() => configuredSnapshots(directory)).toThrow(/ENOENT/);
    const previous = contractDigest('trello');
    (compatibility.apps as Record<string, string[]>).trello.push('new-reviewed-revision');
    expect(contractDigest('trello')).not.toBe(previous);
    (compatibility.apps as Record<string, string[]>).trello.pop();
  });

  it('Refreshes missing and invalid selections in the same app instance', async () => {
    const app = require('../apps/trello').default('en');
    expect(app.initialization_error.err).toBe('APP-SCHEMAS-UNAVAILABLE');
    expect(app.schema_metadata().initialization_error.desc).toMatch(/update trello/);
    process.env[SNAPSHOTS_ENV] = JSON.stringify({ trello: path.join(directory, 'missing') });
    expect(app.schema_metadata().initialization_error.err).toBe('APP-SCHEMAS-UNAVAILABLE');
    const snapshot = await installSnapshot(directory, 'trello', input('trello'), async () => {});
    process.env[SNAPSHOTS_ENV] = JSON.stringify({ trello: snapshot });
    expect(app.schema_metadata()).toEqual({ swagger: path.join(snapshot, 'schema.json') });
  });

  it('Keeps a running app pinned and reports a malformed or switched snapshot structurally', async () => {
    const first = await installSnapshot(directory, 'zoom', input('zoom'), async () => {});
    const second = await installSnapshot(directory, 'zoom', input('zoom', 'two'), async () => {});
    process.env[SNAPSHOTS_ENV] = JSON.stringify({ zoom: first });
    expect(appSchemaMetadata('zoom').swagger_schema_map?.meetings.swagger).toBe(path.join(first, 'schema.json'));
    process.env[SNAPSHOTS_ENV] = JSON.stringify({ zoom: second });
    expect(appSchemaMetadata('zoom').initialization_error?.desc).toMatch(/Restart/);
    process.env[SNAPSHOTS_ENV] = '[]';
    expect(appSchemaMetadata('freshdesk').initialization_error?.err).toBe('APP-SCHEMAS-UNAVAILABLE');
  });

  it('Serializes writers per app while allowing another app to update', async () => {
    await withAppLock(directory, 'trello', async () => {
      await expect(withAppLock(directory, 'trello', async () => {})).rejects.toThrow(/another updater/);
      await expect(withAppLock(directory, 'magento', async () => 42)).resolves.toBe(42);
    });
    await expect(withAppLock(directory, 'trello', async () => { throw new Error('failure'); })).rejects.toThrow('failure');
    await expect(withAppLock(directory, 'trello', async () => 42)).resolves.toBe(42);
  });

  it('Rejects unknown apps and import-only downloads before connecting', async () => {
    const get = jest.spyOn(require('node:https'), 'get');
    for (const id of ['../trello', 'constructor', 'freshdesk', 'netsuite', 'zendesk', 'zoom']) {
      await expect(downloadInput(id)).rejects.toThrow(/INVALID|IMPORT-REQUIRED/);
    }
    expect(get).not.toHaveBeenCalled();
  });

  it('Protects NetSuite credentials and rejects redirects without forwarding the token', async () => {
    const token = path.join(directory, 'token'); fs.writeFileSync(token, 'synthetic-token', { mode: 0o600 });
    const get = jest.spyOn(require('node:https'), 'get').mockImplementation((...args: any[]) => {
      const request = new EventEmitter();
      Object.assign(request, { destroy(error: Error) { request.emit('error', error); request.emit('close'); } });
      process.nextTick(() => {
        const response = Object.assign(new EventEmitter(), { statusCode: 302, resume() {} });
        args[2](response); request.emit('close');
      });
      return request;
    });
    for (const account of ['evil.example.com', 'x@evil', '../x']) {
      await expect(downloadNetSuite(account, token)).rejects.toThrow(/account/);
    }
    fs.chmodSync(token, 0o644);
    await expect(downloadNetSuite('test_sb1', token)).rejects.toThrow(/owner-only/);
    expect(get).not.toHaveBeenCalled(); fs.chmodSync(token, 0o600);
    await expect(downloadNetSuite('test_sb1', token)).rejects.toThrow('HTTP 302');
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][0]).toBe('https://test_sb1.suitetalk.api.netsuite.com/services/rest/record/v1/metadata-catalog');
    expect((get.mock.calls[0][1] as any).headers.Authorization).toBe('Bearer synthetic-token');
  });
});
