// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import contracts from './app-contracts.json';
import compatibility from './app-compatibility.json';

export type JsonObject = Record<string, any>;
export type AppContract = {
  app: string; sourceFile: string; schemaKey?: string; actions: string[];
  operations: Array<{ path: string; method: string; operationId: string }>;
  presentation: Record<string, { display_name: string; short_desc: string; desc: string }>;
};
export const appContracts = contracts.apps as Record<string, AppContract>;
export const appIds = Object.keys(appContracts).sort();
export const SNAPSHOTS_ENV = 'QORE_APP_SCHEMA_SNAPSHOTS';
export const MAX_BYTES = 16 * 1024 * 1024;
export const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

export function digest(bytes: string | Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function appContract(id: string): AppContract {
  if (!Object.hasOwn(appContracts, id)) throw new Error(`APP-SCHEMA-INVALID: unknown app ${id}`);
  return appContracts[id];
}

export function contractDigest(id: string): string {
  return digest(JSON.stringify({ version: contracts.version, contract: appContract(id),
    compatibility: (compatibility.apps as Record<string, string[]>)[id] }));
}

export function requireObject(value: unknown, context: string): asserts value is JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`APP-SCHEMA-INVALID: expected object at ${context}`);
  }
}

/** Bounded regular-file reads; pipes, symlinks and changing file sizes fail closed. */
export function readFile(filename: string, limit = MAX_BYTES): Buffer {
  const fd = fs.openSync(filename, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const info = fs.fstatSync(fd);
    if (!info.isFile() || info.size > limit) throw new Error('APP-SCHEMA-INVALID: invalid file');
    const bytes = Buffer.alloc(info.size + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = fs.readSync(fd, bytes, length, bytes.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length !== info.size) throw new Error('APP-SCHEMA-INVALID: file changed during read');
    return bytes.subarray(0, length);
  } finally { fs.closeSync(fd); }
}

function resolveReference(document: JsonObject, reference: unknown): unknown {
  if (typeof reference !== 'string' || !reference.startsWith('#/')) {
    throw new Error('APP-SCHEMA-INVALID: only local references are permitted');
  }
  let target: unknown = document;
  for (const segment of reference.slice(2).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))) {
    if (!target || typeof target !== 'object' || !Object.hasOwn(target, segment)) {
      throw new Error(`APP-SCHEMA-INVALID: unresolved reference ${reference}`);
    }
    target = (target as JsonObject)[segment];
  }
  return target;
}

/** Accept supported JSON OpenAPI formats without resolving any external resource. */
export function validateDocument(document: unknown): asserts document is JsonObject {
  requireObject(document, 'document');
  if (document.swagger !== '2.0' && !/^3\.0\.\d+$/.test(document.openapi)) {
    throw new Error('APP-SCHEMA-INVALID: Swagger 2.0 or OpenAPI 3.0 required');
  }
  requireObject(document.paths, 'paths');
  requireObject(document.info, 'info');
  const queue: Array<{ value: unknown; depth: number }> = [{ value: document, depth: 0 }];
  for (let i = 0; i < queue.length; ++i) {
    const { value, depth } = queue[i];
    if (depth > 96 || queue.length > 500000) throw new Error('APP-SCHEMA-INVALID: document too complex');
    if (!value || typeof value !== 'object') continue;
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref') resolveReference(document, child);
      if (child && typeof child === 'object') queue.push({ value: child, depth: depth + 1 });
    }
  }
}

/** Pin supported routes and operation IDs; preserve request/response and security metadata. */
export function normalizeSchema(id: string, input: unknown): JsonObject {
  const contract = appContract(id);
  if (id === 'pipedrive' && input && typeof input === 'object' && Object.hasOwn(input, 'v1')) {
    input = composePipedriveSchemas(input);
  }
  validateDocument(input);
  const document: JsonObject = JSON.parse(JSON.stringify(input));
  const selected: JsonObject = Object.create(null);
  for (const operation of contract.operations) {
    const aliases = [operation.path];
    // Magento's upstream 2.2 schema retains slashes removed in the Qore action paths.
    if (id === 'magento' && ['/V1/invoices', '/V1/shipment'].includes(operation.path)) aliases.push(operation.path + '/');
    if (id === 'trello' && ['/boards', '/search/members'].includes(operation.path)) aliases.push(operation.path + '/');
    const matches = aliases.filter(route => {
      if (!Object.hasOwn(document.paths, route)) return false;
      requireObject(document.paths[route], route);
      return Object.hasOwn(document.paths[route], operation.method);
    });
    if (matches.length !== 1) throw new Error(`APP-SCHEMA-INCOMPATIBLE: ${id}: expected exactly one ${operation.method} ${operation.path}`);
    const source = document.paths[matches[0]];
    requireObject(source[operation.method], operation.operationId);
    requireObject(source[operation.method].responses, `${operation.operationId}.responses`);
    const target = selected[operation.path] ||= Object.create(null);
    for (const key of ['parameters', 'servers']) if (Object.hasOwn(source, key)) target[key] = source[key];
    target[operation.method] = { ...source[operation.method], operationId: operation.operationId };
  }
  document.paths = selected;
  // Account identity is connection configuration, not part of the generic NetSuite contract.
  if (id === 'netsuite' && typeof document.host === 'string'
      && /^[a-zA-Z0-9_-]+\.suitetalk\.api\.netsuite\.com$/.test(document.host)) {
    document.host = '{{account_id}}.suitetalk.api.netsuite.com';
  }
  // Match the existing reviewed Mailchimp correction; unrelated fields are untouched.
  if (id === 'mailchimp') {
    const queue: unknown[] = [document];
    for (let i = 0; i < queue.length; ++i) {
      const value = queue[i];
      if (!value || typeof value !== 'object') continue;
      for (const [key, child] of Object.entries(value)) {
        if (['notify_on_subscribe', 'notify_on_unsubscribe'].includes(key)
            && child && typeof child === 'object' && (child as JsonObject).type === 'string') {
          (child as JsonObject).type = 'boolean';
        }
        if (child && typeof child === 'object') queue.push(child);
      }
    }
  }
  validateDocument(document);
  return document;
}

/** Combine the official Pipedrive generations without changing their request/response contracts.
 * Imports use {v1: <document>, v2: <document>}; references and security names are scoped per document.
 */
export function composePipedriveSchemas(input: unknown): JsonObject {
  requireObject(input, 'Pipedrive bundle');
  if (Object.keys(input).sort().join(',') !== 'v1,v2') {
    throw new Error('APP-SCHEMA-INVALID: Pipedrive requires exactly v1 and v2 documents');
  }
  const result: JsonObject = { openapi: '3.0.1', info: { title: 'Pipedrive', version: 'v1+v2' },
    servers: [{ url: 'https://api.pipedrive.com' }], paths: {}, components: Object.create(null) };
  const supported = new Set(appContract('pipedrive').operations.map(operation => operation.path));
  for (const version of ['v1', 'v2']) {
    const source = input[version];
    validateDocument(source);
    const prefix = version === 'v1' ? '/v1' : '/api/v2';
    if (source.openapi !== '3.0.1' || JSON.stringify(source.servers)
        !== JSON.stringify([{ url: `https://api.pipedrive.com${prefix}` }])) {
      throw new Error(`APP-SCHEMA-INCOMPATIBLE: Pipedrive ${version}: unexpected API server or version`);
    }
    // Validate before traversing; JSON round-trip also guarantees caller-owned documents stay untouched.
    const document: JsonObject = JSON.parse(JSON.stringify(source));
    const queue: JsonObject[] = [document];
    for (let i = 0; i < queue.length; ++i) {
      const value = queue[i];
      for (const [key, child] of Object.entries(value)) {
        if (key === '$ref') {
          if (typeof child !== 'string' || !/^#\/components\/[^/]+\/[^/]+/.test(child)) {
            throw new Error('APP-SCHEMA-INCOMPATIBLE: Pipedrive references must target components');
          }
          value[key] = child.replace(/^(#\/components\/[^/]+\/)/, `$1${version}_`);
        } else if (key === 'security') {
          if (!Array.isArray(child)) {
            throw new Error('APP-SCHEMA-INVALID: Pipedrive security must be an array');
          }
          value[key] = child.map(requirement => {
            requireObject(requirement, 'security requirement');
            return Object.fromEntries(Object.entries(requirement).map(([name, scopes]) => [`${version}_${name}`, scopes]));
          });
        } else if (child && typeof child === 'object') {
          queue.push(child);
        }
      }
    }
    for (const [kind, entries] of Object.entries(document.components || {})) {
      requireObject(entries, `components.${kind}`);
      result.components[kind] ||= Object.create(null);
      for (const [name, value] of Object.entries(entries)) {
        result.components[kind][`${version}_${name}`] = value;
      }
    }
    for (const [route, item] of Object.entries(document.paths)) {
      if (!supported.has(prefix + route)) {
        continue;
      }
      requireObject(item, route);
      // The explicit version is in the path. Unreviewed operation/path server overrides must fail closed.
      if (item.servers || methods.some(method => item[method]?.servers)) {
        throw new Error('APP-SCHEMA-INCOMPATIBLE: Pipedrive path/operation server override');
      }
      for (const method of methods) {
        if (item[method] && !Object.hasOwn(item[method], 'security') && document.security) {
          item[method].security = document.security;
        }
      }
      result.paths[prefix + route] = item;
    }
  }
  validateDocument(result);
  return result;
}

/** Fingerprint the supported surface and reference closure, including field presentation. */
export function schemaCompatibilityDigest(document: JsonObject): string {
  validateDocument(document);
  const surface: JsonObject = {};
  for (const key of ['swagger', 'openapi', 'paths', 'servers', 'host', 'basePath', 'schemes',
    'consumes', 'produces', 'security', 'securityDefinitions']) {
    if (Object.hasOwn(document, key)) surface[key] = document[key];
  }
  if (document.components?.securitySchemes) surface.securitySchemes = document.components.securitySchemes;
  const references: JsonObject = Object.create(null);
  const queue: unknown[] = [surface];
  const visited = new WeakSet<object>();
  for (let i = 0; i < queue.length; ++i) {
    const value = queue[i];
    if (!value || typeof value !== 'object' || visited.has(value)) continue;
    visited.add(value);
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref' && typeof child === 'string' && !Object.hasOwn(references, child)) {
        references[child] = resolveReference(document, child);
        queue.push(references[child]);
      } else if (child && typeof child === 'object') queue.push(child);
    }
  }
  return digest(JSON.stringify({ ...surface, references }, (_key, value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value));
}

export function verifyCompatibility(id: string, document: JsonObject): void {
  appContract(id);
  const approved = (compatibility.apps as Record<string, string[]>)[id];
  const actual = schemaCompatibilityDigest(document);
  if (compatibility.version !== 1 || !approved?.includes(actual)) {
    throw new Error(`APP-SCHEMA-INCOMPATIBLE: ${id}: supported metadata changed (${actual}). `
      + 'Use a compatible export or update the app catalogue; the active snapshot has not changed.');
  }
}

export type SnapshotManifest = {
  format: 1; app: string; contract: string; sha256: string; sourceSha256: string; source: string;
};

/** Verify one immutable, app-specific snapshot; discovery checks bytes without parsing schemas. */
export function verifySnapshot(id: string, directory: string, parse = true): string {
  appContract(id);
  if (!path.isAbsolute(directory) || fs.realpathSync(directory) !== directory) {
    throw new Error('APP-SCHEMA-INVALID: use an absolute immutable snapshot, not a symlink');
  }
  const raw = readFile(path.join(directory, 'manifest.json'), 128 * 1024);
  if (path.basename(directory) !== digest(raw)) throw new Error('APP-SCHEMA-INVALID: manifest digest mismatch');
  const manifest = JSON.parse(raw.toString()) as SnapshotManifest;
  if (manifest.format !== 1 || manifest.app !== id || manifest.contract !== contractDigest(id)) {
    throw new Error(`APP-SCHEMA-INCOMPATIBLE: ${id}: snapshot contract differs from this catalogue`);
  }
  const bytes = readFile(path.join(directory, 'schema.json'));
  if (digest(bytes) !== manifest.sha256) throw new Error('APP-SCHEMA-INVALID: schema checksum mismatch');
  if (parse) {
    const document = JSON.parse(bytes.toString());
    validateDocument(document);
    verifyCompatibility(id, document);
  }
  return directory;
}

const pinned = new Map<string, string>();

export type AppSchemaMetadata = {
  swagger?: string; swagger_schema_map?: Record<string, { swagger: string }>;
  initialization_error?: { err: string; desc: string };
};

/** Keep identities available and let the runtime refresh unsuccessful schema selections. */
export function appSchemaMetadata(id: string): AppSchemaMetadata & {
  schema_metadata: () => AppSchemaMetadata;
} {
  return { ...resolveAppSchemaMetadata(id), schema_metadata: () => resolveAppSchemaMetadata(id) };
}

/** Retry unsuccessful selections; only a verified snapshot pins the running process. */
function resolveAppSchemaMetadata(id: string): AppSchemaMetadata {
  const contract = appContract(id);
  try {
    const snapshots = JSON.parse(process.env[SNAPSHOTS_ENV] || '{}');
    requireObject(snapshots, SNAPSHOTS_ENV);
    const directory = Object.hasOwn(snapshots, id) ? snapshots[id] : undefined;
    if (typeof directory !== 'string') throw new Error('No snapshot configured');
    if (pinned.has(id) && pinned.get(id) !== directory) throw new Error('Restart before switching snapshots');
    if (!pinned.has(id)) pinned.set(id, verifySnapshot(id, directory, false));
    const swagger = path.join(directory, 'schema.json');
    return contract.schemaKey ? { swagger_schema_map: { [contract.schemaKey]: { swagger } } } : { swagger };
  } catch (error) {
    return { initialization_error: { err: 'APP-SCHEMAS-UNAVAILABLE', desc: `${contract.app}: ${String(error)}. `
      + `Run qore-app-schemas update ${id} or qore-app-schemas import ${id} FILE, `
      + 'then qore-app-schemas run -- COMMAND.' } };
  }
}
