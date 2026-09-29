// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import contract from './hubspot-contract.json';
import compatibility from './hubspot-compatibility.json';

type JsonObject = Record<string, any>;
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';
export type SchemaContract = {
  group: string; name: string; apiVersion: string; allowPreview: boolean;
  operations: Array<{ path: string; method: Method; action: string; sourcePaths: string[];
    presentation: { display_name: string; short_desc: string; desc: string } }>;
};
export const hubspotContract = contract as {
  version: number; app: string; schemas: Record<string, SchemaContract>; actions: string[];
};
export const contractDigest = digest(JSON.stringify({ contract, compatibility }));
export const schemaNames = Object.keys(hubspotContract.schemas).sort();
export const MAX_SCHEMA_BYTES = 8 * 1024 * 1024;
export const SNAPSHOT_ENV = 'QORE_HUBSPOT_SCHEMA_SNAPSHOT';
export const SETUP_MESSAGE = 'Run qore-hubspot-schemas update, then qore-hubspot-schemas run -- COMMAND '
  + '(or set QORE_HUBSPOT_SCHEMA_SNAPSHOT to a verified immutable snapshot).';

export function digest(bytes: string | Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function object(value: unknown, context: string): asserts value is JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`HUBSPOT-SCHEMA-INVALID: expected object at ${context}`);
  }
}

/** Validate bounded JSON and local references; schema parsing never fetches remote content. */
export function validateDocument(document: unknown): asserts document is JsonObject {
  object(document, 'document');
  if (!/^3\.0\.\d+$/.test(document.openapi)) throw new Error('HUBSPOT-SCHEMA-INVALID: OpenAPI 3.0 required');
  object(document.paths, 'paths');
  object(document.info, 'info');
  const queue: Array<{ value: unknown; depth: number }> = [{ value: document, depth: 0 }];
  for (let index = 0; index < queue.length; ++index) {
    const { value, depth } = queue[index];
    if (depth > 96 || queue.length > 500000) throw new Error('HUBSPOT-SCHEMA-INVALID: document too complex');
    if (!value || typeof value !== 'object') continue;
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref') {
        if (typeof child !== 'string' || !child.startsWith('#/')) {
          throw new Error('HUBSPOT-SCHEMA-INVALID: only local references are permitted');
        }
        let target: unknown = document;
        for (const segment of child.slice(2).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))) {
          if (!target || typeof target !== 'object' || !Object.hasOwn(target, segment)) {
            throw new Error(`HUBSPOT-SCHEMA-INVALID: unresolved reference ${child}`);
          }
          target = (target as JsonObject)[segment];
        }
      }
      if (key === 'servers') {
        if (!Array.isArray(child) || !child.length || child.some(server =>
          !server || server.url !== 'https://api.hubapi.com' || server.variables)) {
          throw new Error('HUBSPOT-SCHEMA-INVALID: unexpected API server');
        }
      }
      if (child && typeof child === 'object') queue.push({ value: child, depth: depth + 1 });
    }
  }
  if (!Array.isArray(document.servers) || !document.servers.length) {
    throw new Error('HUBSPOT-SCHEMA-INVALID: API server is required');
  }
}

/** Normalize one supported API generation to the versioned Qore action contract. */
export function normalizeSchema(name: string, input: unknown): JsonObject {
  const definition = hubspotContract.schemas[name];
  if (!definition) throw new Error(`HUBSPOT-SCHEMA-INVALID: unknown schema ${name}`);
  validateDocument(input);
  const document: JsonObject = JSON.parse(JSON.stringify(input));
  const paths: JsonObject = {};
  for (const operation of definition.operations) {
    const matches = operation.sourcePaths.filter(route =>
      Object.hasOwn(document.paths, route) && Object.hasOwn(document.paths[route], operation.method));
    if (matches.length !== 1) {
      throw new Error(`HUBSPOT-SCHEMA-INCOMPATIBLE: ${name}: expected exactly one ${operation.method} ${operation.path}`);
    }
    const source = document.paths[matches[0]];
    const target = paths[operation.path] ||= {};
    if (source.parameters) target.parameters = source.parameters;
    if (source.servers) target.servers = source.servers;
    object(source[operation.method], operation.action);
    object(source[operation.method].responses, `${operation.action}.responses`);
    target[operation.method] = { ...source[operation.method], operationId: operation.action };
  }
  document.paths = paths;
  validateDocument(document);
  return document;
}

/** Fingerprint selected operations and their transitive dependencies, not unrelated upstream APIs.
 * Object key ordering and document-level publication metadata do not affect compatibility.
 * Referenced fields, required flags, choices, descriptions and request/response constraints do.
 */
export function schemaCompatibilityDigest(document: JsonObject): string {
  validateDocument(document);
  const references: JsonObject = {};
  const surface = {
    paths: document.paths, servers: document.servers, security: document.security,
    securitySchemes: document.components?.securitySchemes, references,
  };
  const queue: unknown[] = [surface.paths, surface.servers, surface.security, surface.securitySchemes];
  const visited = new WeakSet<object>();
  for (let index = 0; index < queue.length; ++index) {
    const value = queue[index];
    if (!value || typeof value !== 'object' || visited.has(value)) continue;
    visited.add(value);
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref' && typeof child === 'string' && !Object.hasOwn(references, child)) {
        let target = document;
        for (const segment of child.slice(2).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))) {
          target = target[segment];
        }
        references[child] = target;
        queue.push(target);
      } else if (child && typeof child === 'object') queue.push(child);
    }
  }
  return digest(JSON.stringify(surface, (_key, value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value));
}

/** Reject unreviewed changes before the CLI qualifies or activates a candidate snapshot. */
export function verifySchemaCompatibility(directory: string): void {
  const expected = compatibility.schemas as Record<string, string>;
  if (compatibility.version !== 1 || JSON.stringify(Object.keys(expected).sort()) !== JSON.stringify(schemaNames)) {
    throw new Error('HUBSPOT-SCHEMA-INCOMPATIBLE: incomplete catalogue compatibility inventory');
  }
  for (const name of schemaNames) {
    const document = JSON.parse(readFile(path.join(directory, `${name}.json`)).toString());
    const actual = schemaCompatibilityDigest(document);
    if (actual !== expected[name]) {
      throw new Error(`HUBSPOT-SCHEMA-INCOMPATIBLE: ${name}: supported operation metadata changed `
        + `(expected ${expected[name]}, received ${actual}). Update the app catalogue before using these schemas; `
        + 'the active snapshot has not been changed.');
    }
  }
}

export type SnapshotManifest = {
  format: 1; contract: string;
  files: Record<string, { sha256: string; sourceSha256: string; source: string }>;
};

/** Read only regular, bounded files; never follow a replaced file to another location. */
export function readFile(filename: string, limit = MAX_SCHEMA_BYTES): Buffer {
  const fd = fs.openSync(filename, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const info = fs.fstatSync(fd);
    if (!info.isFile() || info.size > limit) throw new Error(`HUBSPOT-SCHEMA-INVALID: invalid file ${filename}`);
    const data = Buffer.alloc(info.size + 1);
    let length = 0;
    while (length < data.length) {
      const count = fs.readSync(fd, data, length, data.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length !== info.size) throw new Error(`HUBSPOT-SCHEMA-INVALID: file changed while reading ${filename}`);
    return data.subarray(0, length);
  } finally { fs.closeSync(fd); }
}

/** Verify an immutable snapshot and return its canonical absolute directory. */
export function verifySnapshot(directory: string, validateSchemas = true): string {
  if (!path.isAbsolute(directory)) throw new Error('HUBSPOT-SCHEMA-INVALID: snapshot path must be absolute');
  const resolved = fs.realpathSync(directory);
  if (resolved !== directory) throw new Error('HUBSPOT-SCHEMA-INVALID: use an immutable snapshot, not a symlink');
  const bytes = readFile(path.join(directory, 'manifest.json'), 128 * 1024);
  if (path.basename(directory) !== digest(bytes)) throw new Error('HUBSPOT-SCHEMA-INVALID: manifest digest mismatch');
  const manifest = JSON.parse(bytes.toString()) as SnapshotManifest;
  if (manifest.format !== 1 || manifest.contract !== contractDigest
      || JSON.stringify(Object.keys(manifest.files).sort()) !== JSON.stringify(schemaNames)) {
    throw new Error('HUBSPOT-SCHEMA-INCOMPATIBLE: snapshot contract differs from this catalogue');
  }
  for (const name of schemaNames) {
    const data = readFile(path.join(directory, `${name}.json`));
    if (digest(data) !== manifest.files[name].sha256) throw new Error(`HUBSPOT-SCHEMA-INVALID: checksum mismatch: ${name}`);
    if (!validateSchemas) continue;
    const document = JSON.parse(data.toString());
    // Validate the normalized boundary again on import/activation. Runtime callers
    // cache the verified directory; no schema is materialized by discovery.
    validateDocument(document);
    const actual = Object.entries(document.paths as JsonObject).flatMap(([route, methods]) =>
      Object.entries(methods as JsonObject).filter(([method]) =>
        ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(method))
        .map(([method, value]) => `${method} ${route} ${value.operationId}`)).sort();
    const expected = hubspotContract.schemas[name].operations.map(op => `${op.method} ${op.path} ${op.action}`).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`HUBSPOT-SCHEMA-INCOMPATIBLE: operation contract: ${name}`);
  }
  return directory;
}

let pinnedSnapshot: string | undefined;

/** Return app registration metadata; a missing cache is retained as a structured failure by Qore. */
export function hubspotSchemaMetadata(): {
  swagger_schema_map?: Record<string, { swagger: string }>;
  initialization_error?: { err: string; desc: string };
} {
  try {
    const directory = process.env[SNAPSHOT_ENV];
    if (!directory) throw new Error(`HUBSPOT-SCHEMAS-NOT-CONFIGURED: ${SETUP_MESSAGE}`);
    if (pinnedSnapshot && pinnedSnapshot !== directory) throw new Error('HUBSPOT-SCHEMA-INVALID: restart before switching snapshots');
    // Registration publishes stable identities before Qore materializes any schema.
    // Activation already checked the documents; here only verify their pinned bytes.
    pinnedSnapshot ||= verifySnapshot(directory, false);
    return { swagger_schema_map: Object.fromEntries(schemaNames.map(name =>
      [name, { swagger: path.join(pinnedSnapshot!, `${name}.json`) }])) };
  } catch (error) {
    return { initialization_error: { err: 'HUBSPOT-SCHEMAS-UNAVAILABLE', desc: `${String(error)} ${SETUP_MESSAGE}` } };
  }
}
