// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import * as fs from 'node:fs';
import * as https from 'node:https';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  contractDigest, digest, hubspotContract, MAX_SCHEMA_BYTES, normalizeSchema, readFile,
  schemaNames, SnapshotManifest, verifySnapshot,
} from './hubspot';

export const CATALOG_URL = 'https://api.hubspot.com/public/api/spec/v1/specs';
export type SchemaInput = { bytes: Buffer; source: string };
export type Inputs = Record<string, SchemaInput>;

export function defaultCacheDir(): string {
  const base = process.env.XDG_CACHE_HOME;
  return path.join(base && path.isAbsolute(base) ? base : path.join(os.homedir(), '.cache'), 'qore', 'hubspot');
}

/** HTTPS-only public metadata retrieval. Redirects, credentials and arbitrary hosts are rejected. */
export function download(url: string): Promise<Buffer> {
  const parsed = new URL(url);
  if (parsed.origin !== 'https://api.hubspot.com' || parsed.username || parsed.password
      || parsed.search || parsed.hash || (url !== CATALOG_URL
        && !/^\/public\/api\/spec\/v2\/specs\/release\/\d+\/version\/3$/.test(parsed.pathname))) {
    return Promise.reject(new Error(`HUBSPOT-SCHEMA-DOWNLOAD: unexpected URL ${url}`));
  }
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { Accept: 'application/json', 'User-Agent': 'qore-hubspot-schemas/1' } }, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HUBSPOT-SCHEMA-DOWNLOAD: HTTP ${response.statusCode} from ${url}`));
        return;
      }
      let size = 0;
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_SCHEMA_BYTES) {
          response.destroy(new Error('HUBSPOT-SCHEMA-DOWNLOAD: response too large'));
        } else chunks.push(chunk);
      });
      response.on('error', reject);
      response.on('end', () => resolve(Buffer.concat(chunks)));
    });
    const timer = setTimeout(() => request.destroy(new Error('HUBSPOT-SCHEMA-DOWNLOAD: timeout')), 30000);
    request.on('close', () => clearTimeout(timer));
    request.on('error', reject);
  });
}

/** Select only the supported API generation; LATEST may mean a different API entirely. */
export function selectDownloads(catalogue: unknown): Record<string, string> {
  const results = (catalogue as { results?: unknown[] })?.results;
  if (!Array.isArray(results)) throw new Error('HUBSPOT-SCHEMA-DOWNLOAD: invalid catalogue');
  return Object.fromEntries(schemaNames.map(name => {
    const definition = hubspotContract.schemas[name];
    const matches = results.filter((entry: any) => entry?.name === definition.name && entry.group === definition.group) as
      Array<{ versions: Array<{ version: string; stage: string; openApi: string }> }>;
    if (matches.length !== 1 || !Array.isArray(matches[0].versions)) throw new Error(`HUBSPOT-SCHEMA-DOWNLOAD: ambiguous catalogue entry: ${name}`);
    const versions = matches[0].versions.filter(version => String(version.version) === definition.apiVersion
      && (['STABLE', 'LATEST'].includes(version.stage) || (definition.allowPreview && version.stage === 'DEVELOPER_PREVIEW')));
    if (versions.length !== 1 || typeof versions[0].openApi !== 'string') throw new Error(`HUBSPOT-SCHEMA-DOWNLOAD: supported version missing: ${name}`);
    return [name, versions[0].openApi];
  }));
}

export async function downloadInputs(): Promise<Inputs> {
  const urls = selectDownloads(JSON.parse((await download(CATALOG_URL)).toString()));
  const inputs: Inputs = {};
  // Ten small downloads; sequential requests avoid a burst against upstream.
  for (const name of schemaNames) inputs[name] = { bytes: await download(urls[name]), source: urls[name] };
  return inputs;
}

export function importInputs(directory: string): Inputs {
  return Object.fromEntries(schemaNames.map(name => {
    const filename = path.resolve(directory, `${name}.swagger.json`);
    return [name, { bytes: readFile(filename), source: `file:${filename}` }];
  }));
}

/** Serialize activation operations. A crashed writer leaves an explicit lock, never a partial current snapshot. */
export async function withCacheLock<T>(directory: string, operation: () => Promise<T>): Promise<T> {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  if (fs.realpathSync(directory) !== directory) throw new Error('HUBSPOT-SCHEMA-CACHE: cache directory must not be a symlink');
  const lock = path.join(directory, '.update-lock');
  let fd: number;
  try {
    fd = fs.openSync(lock, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, 0o600);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error('HUBSPOT-SCHEMA-CACHE: another updater holds .update-lock; '
        + 'confirm its recorded PID has stopped before removing a stale lock');
    }
    throw error;
  }
  try {
    fs.writeFileSync(fd, `${process.pid}\n`);
    return await operation();
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

function stateFile(directory: string): string { return path.join(directory, 'active.json'); }

export function activeSnapshot(directory: string): string {
  const active = JSON.parse(readFile(stateFile(directory), 4096).toString()) as { current: string };
  if (!/^[a-f0-9]{64}$/.test(active.current)) throw new Error('HUBSPOT-SCHEMA-CACHE: invalid active snapshot');
  return verifySnapshot(path.join(directory, 'snapshots', active.current));
}

/** Atomically select a complete verified snapshot, retaining the prior selection for rollback. */
export function activateSnapshot(directory: string, snapshot: string): void {
  verifySnapshot(snapshot);
  if (path.dirname(snapshot) !== path.join(directory, 'snapshots')) throw new Error('HUBSPOT-SCHEMA-CACHE: snapshot outside cache');
  const current = path.basename(snapshot);
  let previous: string | undefined;
  try {
    previous = JSON.parse(readFile(stateFile(directory), 4096).toString()).current;
    if (typeof previous !== 'string' || !/^[a-f0-9]{64}$/.test(previous)) throw new Error('HUBSPOT-SCHEMA-CACHE: invalid prior snapshot');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  if (previous === current) return;
  const temporary = path.join(directory, `.active-${process.pid}.tmp`);
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify({ current, previous }) + '\n');
    fs.fsyncSync(fd);
    fs.renameSync(temporary, stateFile(directory));
  } finally {
    fs.closeSync(fd);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

/** Stage all files, verify the contract, then qualify against the installed runtime before activation. */
export async function installSnapshot(directory: string, inputs: Inputs,
  qualify: (snapshot: string) => Promise<void>): Promise<string> {
  if (JSON.stringify(Object.keys(inputs).sort()) !== JSON.stringify(schemaNames)) throw new Error('HUBSPOT-SCHEMA-CACHE: incomplete input set');
  const parent = path.join(directory, 'snapshots');
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  if (fs.realpathSync(parent) !== parent) throw new Error('HUBSPOT-SCHEMA-CACHE: snapshots directory must not be a symlink');
  const stage = fs.mkdtempSync(path.join(parent, '.staging-'));
  let completed = false;
  try {
    const manifest: SnapshotManifest = { format: 1, contract: contractDigest, files: {} };
    for (const name of schemaNames) {
      const input = inputs[name];
      if (input.bytes.length > MAX_SCHEMA_BYTES) throw new Error(`HUBSPOT-SCHEMA-CACHE: oversized input ${name}`);
      const normalized = JSON.stringify(normalizeSchema(name, JSON.parse(input.bytes.toString()))) + '\n';
      fs.writeFileSync(path.join(stage, `${name}.json`), normalized, { mode: 0o444, flag: 'wx' });
      manifest.files[name] = { sha256: digest(normalized), sourceSha256: digest(input.bytes), source: input.source };
    }
    const bytes = JSON.stringify(manifest, null, 2) + '\n';
    fs.writeFileSync(path.join(stage, 'manifest.json'), bytes, { mode: 0o444, flag: 'wx' });
    const destination = path.join(parent, digest(bytes));
    if (fs.existsSync(destination)) {
      verifySnapshot(destination);
    } else {
      fs.renameSync(stage, destination);
      completed = true;
    }
    verifySnapshot(destination);
    await qualify(destination);
    activateSnapshot(directory, destination);
    return destination;
  } finally {
    if (!completed) fs.rmSync(stage, { recursive: true, force: true });
  }
}
