// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import * as https from 'node:https';
import { SchemaSourceUnavailableError } from './schema-errors';

/** The longest one download may take, from sending the request to the last byte of the response, in milliseconds. */
export const DOWNLOAD_TIMEOUT_MS = 30000;

/**
 * Connection failures: the source could not be reached, or it closed the connection before the response was
 * complete.  Any other failure (a certificate the host does not trust, for example) is an error, not unavailability.
 */
const UNAVAILABLE_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ECONNABORTED', 'ETIMEDOUT', 'EPIPE', 'ENOTFOUND',
  'EAI_AGAIN', 'ENETUNREACH', 'ENETDOWN', 'EHOSTUNREACH', 'EHOSTDOWN']);

/** Returns True for an HTTP status with which a source says that it cannot answer now: 408, 429 or 5xx. */
export function isUnavailableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

/** A response with an HTTP status other than 200 that is not {@link isUnavailableStatus unavailability}. */
export class DownloadStatusError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'DownloadStatusError';
  }
}

export type DownloadOptions = {
  /** The error code that starts every message, for example APP-SCHEMA-DOWNLOAD. */
  prefix: string;
  /** The largest response accepted, in bytes. */
  limit: number;
  /** The User-Agent request header. */
  userAgent: string;
  /** Further request headers; their values are never part of a message. */
  headers?: Record<string, string>;
  /** The bound of the download in milliseconds; {@link DOWNLOAD_TIMEOUT_MS} by default. */
  timeoutMs?: number;
};

/**
 * Downloads one document over HTTPS and returns its bytes.
 *
 * Each request opens a connection of its own and closes it afterwards.  A connection that an earlier request left
 * open can be closed by the server just as the next request is sent on it; that request then fails with ECONNRESET
 * ("socket hang up") although the server is available.  A new connection for every request rules that out, and costs
 * one TLS handshake per document.  Redirects are not followed and nothing is retried.
 *
 * @throws SchemaSourceUnavailableError if the source could not be reached, closed the connection before the response
 * was complete, did not answer completely within the bound, or answered HTTP 408, 429 or 5xx; the message names the
 * URL, the error code or HTTP status, and the Retry-After header if the source sent one
 * @throws DownloadStatusError for any other HTTP status than 200 (a redirect, for example), as the same request would
 * get it again
 * @throws Error for an invalid source, a response larger than the limit, or any other failure; the message names the
 * URL of a valid source
 */
export function downloadDocument(url: string, options: DownloadOptions): Promise<Buffer> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Promise.reject(new Error(`${options.prefix}: invalid HTTPS source`));
  }
  // an invalid source is never echoed: it may carry credentials
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    return Promise.reject(new Error(`${options.prefix}: invalid HTTPS source`));
  }
  const timeout = options.timeoutMs ?? DOWNLOAD_TIMEOUT_MS;
  const unavailable = (detail: string) => new SchemaSourceUnavailableError(`${options.prefix}: ${url}: ${detail}; `
    + 'nothing was changed, and the source may answer later');
  const describe = (error: Error) => {
    const code = (error as NodeJS.ErrnoException).code;
    // a connection to every address of a host failing is an AggregateError without a message of its own
    const text = error.message || (error instanceof AggregateError
      ? error.errors.map(item => (item instanceof Error ? item.message : String(item))).join('; ') : '');
    return code && UNAVAILABLE_CODES.has(code) ? unavailable(`${code}: ${text}`)
      : new Error(`${options.prefix}: ${url}: ${code ? `${code}: ` : ''}${text}`);
  };
  return new Promise<Buffer>((resolve, reject) => {
    let settled = false;
    const settle = (error?: Error, bytes?: Buffer) => {
      if (settled) return;
      settled = true;
      if (error) reject(error); else resolve(bytes!);
    };
    // agent: false gives the request a connection of its own, which is closed after the response
    const request = https.get(url, { agent: false, headers: {
      Accept: 'application/json', 'User-Agent': options.userAgent, ...options.headers,
    } }, response => {
      response.on('error', error => settle(describe(error)));
      const status = response.statusCode ?? 0;
      if (status !== 200) {
        const retryAfter = response.headers?.['retry-after'];
        const detail = `HTTP ${status}${typeof retryAfter === 'string' && retryAfter
          ? ` (Retry-After: ${retryAfter.slice(0, 64)})` : ''}`;
        settle(isUnavailableStatus(status) ? unavailable(detail) : new DownloadStatusError(`${options.prefix}: ${url}: `
          + `${detail}${status >= 300 && status <= 399 ? '; redirects are not followed' : ''}`, status));
        response.resume();
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        if (settled) return;
        size += chunk.length;
        if (size > options.limit) {
          settle(new Error(`${options.prefix}: ${url}: response larger than ${options.limit} bytes`));
          response.destroy();
        } else chunks.push(chunk);
      });
      response.on('end', () => {
        if (response.complete === false) settle(unavailable('the connection closed before the response was complete'));
        else settle(undefined, Buffer.concat(chunks));
      });
    });
    const timer = setTimeout(() => {
      settle(unavailable(`no complete response within ${timeout / 1000} s`));
      request.destroy();
    }, timeout);
    request.on('close', () => clearTimeout(timer));
    request.on('error', error => settle(describe(error)));
  });
}
