// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import * as fs from 'node:fs';
import * as https from 'node:https';
import * as os from 'node:os';
import * as path from 'node:path';
import sources from './app-sources.json';
import { appContract, appIds, contractDigest, digest, MAX_BYTES, normalizeSchema, readFile,
  SnapshotManifest, verifyCompatibility, verifySnapshot } from './apps';

export const appSources = sources.apps as Record<string, {
  url?: string; sha256?: string; importHelp?: string; documentation: string;
}>;
export type SchemaInput = { bytes: Buffer; source: string };

export function defaultCacheDir(): string {
  const base = process.env.XDG_CACHE_HOME;
  return path.join(base && path.isAbsolute(base) ? base : path.join(os.homedir(), '.cache'), 'qore', 'app-schemas');
}

function appDirectory(root: string, id: string): string { appContract(id); return path.join(root, id); }

/** Fetch a bounded JSON response. Redirects and URL credentials are never followed. */
function requestJson(url: string, headers: Record<string, string> = {}): Promise<Buffer> {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    return Promise.reject(new Error('APP-SCHEMA-DOWNLOAD: invalid HTTPS source'));
  }
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: {
      Accept: 'application/json', 'User-Agent': 'qore-app-schemas/1', ...headers,
    } }, response => {
      response.on('error', reject);
      response.on('aborted', () => reject(new Error('APP-SCHEMA-DOWNLOAD: incomplete response')));
      if (response.statusCode !== 200) {
        response.resume(); reject(new Error(`APP-SCHEMA-DOWNLOAD: HTTP ${response.statusCode}`)); return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BYTES) response.destroy(new Error('APP-SCHEMA-DOWNLOAD: response too large'));
        else chunks.push(chunk);
      });
      response.on('end', () => resolve(Buffer.concat(chunks)));
    });
    const timer = setTimeout(() => request.destroy(new Error('APP-SCHEMA-DOWNLOAD: timeout')), 30000);
    request.on('close', () => clearTimeout(timer));
    request.on('error', reject);
  });
}

/** Download only the source declared by this catalogue, checking immutable-source hashes. */
export async function downloadInput(id: string): Promise<SchemaInput> {
  appContract(id);
  const source = appSources[id];
  if (!source.url) throw new Error(`APP-SCHEMA-IMPORT-REQUIRED: ${id}: ${source.importHelp}`);
  const bytes = await requestJson(source.url);
  if (source.sha256 && digest(bytes) !== source.sha256) throw new Error('APP-SCHEMA-DOWNLOAD: pinned source checksum mismatch');
  return { bytes, source: source.url };
}

/** Read a bearer token from an owner-only file, never from command arguments or a persisted manifest. */
export async function downloadNetSuite(account: string, tokenFile: string): Promise<SchemaInput> {
  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(account)) throw new Error('APP-SCHEMA-DOWNLOAD: invalid NetSuite account');
  const fd = fs.openSync(tokenFile, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  let token: string;
  try {
    const info = fs.fstatSync(fd);
    if (!info.isFile() || (info.mode & 0o077) || info.uid !== process.getuid?.() || info.size > 16384) {
      throw new Error('APP-SCHEMA-DOWNLOAD: token file must be a regular owner-only file (chmod 600)');
    }
    const bytes = Buffer.alloc(info.size + 1);
    let count = 0;
    while (count < bytes.length) {
      const size = fs.readSync(fd, bytes, count, bytes.length - count, null);
      if (!size) break;
      count += size;
    }
    if (count !== info.size) throw new Error('APP-SCHEMA-DOWNLOAD: token file changed during read');
    token = bytes.subarray(0, count).toString().trim();
    if (!token || !/^[A-Za-z0-9._~+\/-]+=*$/.test(token)) throw new Error('APP-SCHEMA-DOWNLOAD: invalid bearer token');
  } finally { fs.closeSync(fd); }
  const source = `https://${account}.suitetalk.api.netsuite.com/services/rest/record/v1/metadata-catalog`;
  return { bytes: await requestJson(source, { Accept: 'application/swagger+json', Authorization: `Bearer ${token}` }), source };
}

function ensureDirectory(directory: string): void {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  if (fs.realpathSync(directory) !== directory) throw new Error('APP-SCHEMA-CACHE: directory must not be a symlink');
}

/** Serialize writers per app; a stale PID lock is reported, never removed speculatively. */
export async function withAppLock<T>(root: string, id: string, operation: () => Promise<T>): Promise<T> {
  ensureDirectory(root);
  const directory = appDirectory(root, id);
  ensureDirectory(directory);
  const lock = path.join(directory, '.update-lock');
  let fd: number;
  try { fd = fs.openSync(lock, 'wx', 0o600); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error('APP-SCHEMA-CACHE: another updater holds .update-lock; verify its PID before removing a stale lock');
    }
    throw error;
  }
  try { fs.writeFileSync(fd, `${process.pid}\n`); return await operation(); }
  finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}

function state(root: string, id: string): { current: string; previous?: string } {
  const value = JSON.parse(readFile(path.join(appDirectory(root, id), 'active.json'), 4096).toString());
  if (!value || typeof value.current !== 'string' || !/^[a-f0-9]{64}$/.test(value.current)
      || (value.previous !== undefined && !/^[a-f0-9]{64}$/.test(value.previous))) {
    throw new Error('APP-SCHEMA-CACHE: invalid active snapshot');
  }
  return value;
}

export function activeSnapshot(root: string, id: string): string {
  return verifySnapshot(id, path.join(appDirectory(root, id), 'snapshots', state(root, id).current));
}

export function configuredSnapshots(root: string): Record<string, string> {
  const snapshots: Record<string, string> = {};
  for (const id of appIds) {
    // Only an absent selection means unconfigured; a selected but missing/corrupt snapshot must fail.
    try { readFile(path.join(appDirectory(root, id), 'active.json'), 4096); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue; throw error; }
    snapshots[id] = activeSnapshot(root, id);
  }
  return snapshots;
}

function activate(root: string, id: string, snapshot: string): void {
  verifySnapshot(id, snapshot);
  const directory = appDirectory(root, id);
  if (path.dirname(snapshot) !== path.join(directory, 'snapshots')) throw new Error('APP-SCHEMA-CACHE: snapshot outside cache');
  let previous: string | undefined;
  try { previous = state(root, id).current; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const current = path.basename(snapshot);
  if (previous === current) return;
  const temporary = path.join(directory, `.active-${process.pid}.tmp`);
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify({ current, previous }) + '\n');
    fs.fsyncSync(fd);
    fs.renameSync(temporary, path.join(directory, 'active.json'));
    const parentFd = fs.openSync(directory, 'r');
    try { fs.fsyncSync(parentFd); } finally { fs.closeSync(parentFd); }
  } finally { fs.closeSync(fd); if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

/** Normalize, check the versioned contract, and qualify the runtime before changing active.json. */
export async function installSnapshot(root: string, id: string, input: SchemaInput,
  qualify: (id: string, snapshot: string) => Promise<void>): Promise<string> {
  return withAppLock(root, id, async () => {
    if (input.bytes.length > MAX_BYTES) throw new Error('APP-SCHEMA-INVALID: oversized schema');
    const document = normalizeSchema(id, JSON.parse(input.bytes.toString()));
    verifyCompatibility(id, document);
    const parent = path.join(appDirectory(root, id), 'snapshots');
    ensureDirectory(parent);
    const stage = fs.mkdtempSync(path.join(parent, '.staging-'));
    try {
      const schema = JSON.stringify(document) + '\n';
      const manifest: SnapshotManifest = { format: 1, app: id, contract: contractDigest(id),
        sha256: digest(schema), sourceSha256: digest(input.bytes), source: input.source };
      const bytes = JSON.stringify(manifest, null, 2) + '\n';
      for (const [name, content] of [['schema.json', schema], ['manifest.json', bytes]]) {
        const fd = fs.openSync(path.join(stage, name), 'wx', 0o444);
        try { fs.writeFileSync(fd, content); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
      }
      const snapshot = path.join(parent, digest(bytes));
      if (!fs.existsSync(snapshot)) fs.renameSync(stage, snapshot);
      verifySnapshot(id, snapshot);
      await qualify(id, snapshot);
      activate(root, id, snapshot);
      return snapshot;
    } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  });
}

export async function rollback(root: string, id: string, revision: string | undefined,
  qualify: (id: string, snapshot: string) => Promise<void>): Promise<string> {
  return withAppLock(root, id, async () => {
    const previous = revision ?? state(root, id).previous;
    if (typeof previous !== 'string' || !/^[a-f0-9]{64}$/.test(previous)) throw new Error('APP-SCHEMA-CACHE: no valid previous snapshot');
    const snapshot = path.join(appDirectory(root, id), 'snapshots', previous);
    verifySnapshot(id, snapshot);
    await qualify(id, snapshot);
    activate(root, id, snapshot);
    return snapshot;
  });
}
