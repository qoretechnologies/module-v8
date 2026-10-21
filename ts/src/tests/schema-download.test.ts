// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { DOWNLOAD_TIMEOUT_MS, downloadDocument, DownloadStatusError, isUnavailableStatus } from '../schema-cache/download';
import { download, CATALOG_URL } from '../schema-cache/hubspot-store';
import { downloadInput, downloadNetSuite, downloadSource } from '../schema-cache/app-store';
import { combinedExitStatus, EXIT_REFUSED, EXIT_UNAVAILABLE, EXIT_UNVERIFIED, exitStatus, SchemaRefusedError,
  SchemaSourceUnavailableError, SchemaUnverifiedError } from '../schema-cache/schema-errors';

const URL = 'https://schemas.example.test/openapi.json';
const options = { prefix: 'TEST-DOWNLOAD', limit: 64, userAgent: 'qore-test/1' };

type Reply = {
  status?: number; headers?: Record<string, string>; chunks?: string[]; complete?: boolean;
  /** an error of the request before any response */
  requestError?: NodeJS.ErrnoException;
  /** an error of the response after its chunks */
  responseError?: NodeJS.ErrnoException;
  /** no response at all */
  silent?: boolean;
};

function errno(code: string, message: string): NodeJS.ErrnoException {
  return Object.assign(new Error(message), { code });
}

/** Replaces https.get with a stand-in that answers each URL with the reply that the function returns for it. */
function serve(reply: (url: string) => Reply) {
  return jest.spyOn(require('node:https'), 'get').mockImplementation((...args: any[]) => {
    const request = new EventEmitter();
    Object.assign(request, { destroy() { process.nextTick(() => request.emit('close')); } });
    const answer = reply(args[0]);
    process.nextTick(() => {
      if (answer.silent) return;
      if (answer.requestError) {
        request.emit('error', answer.requestError);
        request.emit('close');
        return;
      }
      const response = Object.assign(new EventEmitter(), {
        statusCode: answer.status ?? 200, headers: answer.headers ?? {}, complete: answer.complete ?? true,
        resume() {}, destroy() {},
      });
      args[2](response);
      for (const chunk of answer.chunks ?? []) response.emit('data', Buffer.from(chunk));
      if (answer.responseError) response.emit('error', answer.responseError);
      else response.emit('end');
      request.emit('close');
    });
    return request;
  });
}

async function failure(promise: Promise<unknown>): Promise<Error> {
  const result = await promise.then(() => undefined, (error: Error) => error);
  if (!result) throw new Error('the download succeeded');
  return result;
}

describe('schema downloads', () => {
  afterEach(() => jest.restoreAllMocks());

  it('Opens a connection of its own for every request and returns the complete document', async () => {
    const get = serve(() => ({ chunks: ['{"a":', '1}'] }));
    expect((await downloadDocument(URL, options)).toString()).toBe('{"a":1}');
    expect((await download(CATALOG_URL)).toString()).toBe('{"a":1}');
    expect((await downloadSource('trello', 'schema')).toString()).toBe('{"a":1}');
    expect(get).toHaveBeenCalledTimes(3);
    for (const call of get.mock.calls) {
      // no keep-alive agent, so a request is never sent on a connection that an earlier one left open
      expect((call[1] as any).agent).toBe(false);
    }
    expect((get.mock.calls[1][1] as any).headers['User-Agent']).toBe('qore-hubspot-schemas/1');
    expect((get.mock.calls[2][1] as any).headers['User-Agent']).toBe('qore-app-schemas/1');
  });

  it('Reports a connection that the source closed before answering as unavailable, with the URL', async () => {
    serve(() => ({ requestError: errno('ECONNRESET', 'socket hang up') }));
    const error = await failure(download(CATALOG_URL));
    expect(error).toBeInstanceOf(SchemaSourceUnavailableError);
    expect(error.message).toBe(`HUBSPOT-SCHEMA-DOWNLOAD: ${CATALOG_URL}: ECONNRESET: socket hang up; nothing was `
      + 'changed, and the source may answer later');
    expect(exitStatus(error)).toBe(EXIT_UNAVAILABLE);
  });

  it('Reports every connection failure as unavailable', async () => {
    for (const code of ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ENETUNREACH', 'EHOSTUNREACH', 'EPIPE']) {
      serve(() => ({ requestError: errno(code, `synthetic ${code}`) }));
      const error = await failure(downloadDocument(URL, options));
      expect(exitStatus(error)).toBe(EXIT_UNAVAILABLE);
      expect(error.message).toContain(`TEST-DOWNLOAD: ${URL}: ${code}: synthetic ${code}`);
      jest.restoreAllMocks();
    }
  });

  it('Names every address of a host that refused the connection', async () => {
    const refused = Object.assign(new AggregateError([errno('ECONNREFUSED', 'connect ECONNREFUSED ::1:443'),
      errno('ECONNREFUSED', 'connect ECONNREFUSED 127.0.0.1:443')], ''), { code: 'ECONNREFUSED' });
    serve(() => ({ requestError: refused }));
    const error = await failure(downloadDocument(URL, options));
    expect(exitStatus(error)).toBe(EXIT_UNAVAILABLE);
    expect(error.message).toContain(`${URL}: ECONNREFUSED: connect ECONNREFUSED ::1:443; connect ECONNREFUSED `
      + '127.0.0.1:443; nothing was changed');
  });

  it('Reports a response that ends early as unavailable', async () => {
    serve(() => ({ chunks: ['{"a":'], responseError: errno('ECONNRESET', 'aborted') }));
    const aborted = await failure(downloadDocument(URL, options));
    expect(exitStatus(aborted)).toBe(EXIT_UNAVAILABLE);
    expect(aborted.message).toContain(`${URL}: ECONNRESET: aborted`);
    jest.restoreAllMocks();
    serve(() => ({ chunks: ['{"a":'], complete: false }));
    const incomplete = await failure(downloadDocument(URL, options));
    expect(exitStatus(incomplete)).toBe(EXIT_UNAVAILABLE);
    expect(incomplete.message).toContain(`${URL}: the connection closed before the response was complete`);
  });

  it('Reports HTTP 408, 429 and 5xx as unavailable with the Retry-After the source sent', async () => {
    for (const status of [408, 429, 500, 502, 503, 504]) {
      const headers: Record<string, string> = status === 503 || status === 429 ? { 'retry-after': '120' } : {};
      serve(() => ({ status, headers }));
      const error = await failure(downloadDocument(URL, options));
      expect(error).toBeInstanceOf(SchemaSourceUnavailableError);
      expect(exitStatus(error)).toBe(EXIT_UNAVAILABLE);
      expect(error.message).toBe(`TEST-DOWNLOAD: ${URL}: HTTP ${status}`
        + `${status === 503 || status === 429 ? ' (Retry-After: 120)' : ''}; nothing was changed, and the source may `
        + 'answer later');
      jest.restoreAllMocks();
    }
    expect([407, 408, 428, 429, 499, 500, 599, 600].map(isUnavailableStatus))
      .toEqual([false, true, false, true, false, true, true, false]);
  });

  it('Reports any other HTTP status as an error, as the same request would get it again', async () => {
    for (const [status, message] of [[404, 'HTTP 404 (Retry-After: 5)'], [403, 'HTTP 403 (Retry-After: 5)'],
      [302, 'HTTP 302 (Retry-After: 5); redirects are not followed']] as Array<[number, string]>) {
      serve(() => ({ status, headers: { 'retry-after': '5', location: 'https://elsewhere.example.test/' } }));
      const error = await failure(downloadDocument(URL, options));
      expect(error).toBeInstanceOf(DownloadStatusError);
      expect((error as DownloadStatusError).status).toBe(status);
      expect(exitStatus(error)).toBe(1);
      expect(error.message).toBe(`TEST-DOWNLOAD: ${URL}: ${message}`);
      jest.restoreAllMocks();
    }
  });

  it('Reports other connection failures and oversized responses as errors with the URL', async () => {
    serve(() => ({ requestError: errno('CERT_HAS_EXPIRED', 'certificate has expired') }));
    const certificate = await failure(downloadDocument(URL, options));
    expect(exitStatus(certificate)).toBe(1);
    expect(certificate.message).toBe(`TEST-DOWNLOAD: ${URL}: CERT_HAS_EXPIRED: certificate has expired`);
    jest.restoreAllMocks();
    serve(() => ({ chunks: ['x'.repeat(40), 'y'.repeat(40)] }));
    const oversized = await failure(downloadDocument(URL, options));
    expect(exitStatus(oversized)).toBe(1);
    expect(oversized.message).toBe(`TEST-DOWNLOAD: ${URL}: response larger than 64 bytes`);
  });

  it('Reports a source that does not answer within the bound as unavailable', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask'] });
    try {
      serve(() => ({ silent: true }));
      const pending = failure(downloadDocument(URL, { ...options, timeoutMs: 5000 }));
      jest.advanceTimersByTime(5000);
      const error = await pending;
      expect(exitStatus(error)).toBe(EXIT_UNAVAILABLE);
      expect(error.message).toContain(`${URL}: no complete response within 5 s`);
    } finally {
      jest.useRealTimers();
    }
    expect(DOWNLOAD_TIMEOUT_MS).toBe(30000);
  });

  it('Never puts credentials or header values in a message', async () => {
    const token = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'qore-download-')), 'token');
    try {
      fs.writeFileSync(token, 'synthetic-secret-token', { mode: 0o600 });
      serve(() => ({ status: 401 }));
      const refused = await failure(downloadNetSuite('test_sb1', token));
      expect(refused.message).toContain('HTTP 401');
      expect(refused.message).not.toContain('synthetic-secret-token');
      jest.restoreAllMocks();
      const get = serve(() => ({}));
      const invalid = await failure(downloadDocument('https://user:synthetic-password@schemas.example.test/x', options));
      expect(invalid.message).toBe('TEST-DOWNLOAD: invalid HTTPS source');
      for (const url of ['http://schemas.example.test/x', 'https://schemas.example.test/x?a=1', 'not a URL']) {
        expect((await failure(downloadDocument(url, options))).message).toBe('TEST-DOWNLOAD: invalid HTTPS source');
      }
      expect(get).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(path.dirname(token), { recursive: true, force: true });
    }
  });

  it('Downloads an app input from its catalogue sources', async () => {
    const get = serve(url => ({ chunks: [JSON.stringify({ source: url.includes('/v1/') ? 'v1' : 'v2' })] }));
    const input = await downloadInput('pipedrive');
    expect(JSON.parse(input.bytes.toString())).toEqual({ v1: { source: 'v1' }, v2: { source: 'v2' } });
    expect(get.mock.calls.map(call => call[0])).toEqual(['https://developers.pipedrive.com/docs/api/v1/openapi.json',
      'https://developers.pipedrive.com/docs/api/v2/openapi.json']);
    await expect(downloadSource('pipedrive', 'v3')).rejects.toThrow('APP-SCHEMA-DOWNLOAD: pipedrive has no source v3');
    await expect(downloadSource('zoom', 'schema')).rejects.toThrow(/APP-SCHEMA-IMPORT-REQUIRED: zoom/);
  });

  it('Exits with the unavailable status from the schema commands', async () => {
    const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'qore-download-cli-')));
    const messages = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      serve(() => ({ requestError: errno('ECONNRESET', 'socket hang up') }));
      const hubspot = require('../schema-cache/hubspot-cli');
      expect(await hubspot.cli(['--cache-dir', path.join(directory, 'hubspot'), 'update'])).toBe(EXIT_UNAVAILABLE);
      expect(messages.mock.calls.flat().join('\n')).toContain(`qore-hubspot-schemas: HUBSPOT-SCHEMA-DOWNLOAD: ${CATALOG_URL}: `
        + 'ECONNRESET: socket hang up');
      const apps = require('../schema-cache/app-cli');
      const cache = path.join(directory, 'apps');
      expect(await apps.cli(['--cache-dir', cache, 'update', 'pipedrive', 'trello'])).toBe(EXIT_UNAVAILABLE);
      jest.restoreAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {});
      // one source unavailable and another one refusing the request: different failures
      serve(url => (url.includes('trello') ? { status: 503 } : { status: 404 }));
      expect(await apps.cli(['--cache-dir', cache, 'update', 'pipedrive', 'trello'])).toBe(1);
    } finally {
      process.exitCode = undefined;
      jest.restoreAllMocks();
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('Combines the statuses of several failures', () => {
    const unavailable = new SchemaSourceUnavailableError('unavailable');
    const unverified = new SchemaUnverifiedError('unverified');
    const refused = new SchemaRefusedError('refused');
    expect(combinedExitStatus([])).toBe(0);
    expect(combinedExitStatus([unavailable, unavailable])).toBe(EXIT_UNAVAILABLE);
    expect(combinedExitStatus([unverified, unverified])).toBe(EXIT_UNVERIFIED);
    expect(combinedExitStatus([unavailable, unverified])).toBe(1);
    expect(combinedExitStatus([unavailable, new Error('other')])).toBe(1);
    expect(combinedExitStatus([unavailable, refused, unverified])).toBe(EXIT_REFUSED);
    expect([EXIT_REFUSED, EXIT_UNAVAILABLE, EXIT_UNVERIFIED]).toEqual([2, 69, 75]);
  });
});
