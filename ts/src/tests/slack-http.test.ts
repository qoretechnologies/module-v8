// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { SlackApiClient } from '../apps/slack/client';
import {
  clearSlackAllowedValuesCache,
  getCachedAllowedValues,
} from '../apps/slack/helpers/allowed-values-cache';

interface Reply {
  status?: number;
  headers?: Record<string, string>;
  body: unknown;
}

describe('Slack HTTP transport, pagination and cache integration', () => {
  let server: Server;
  let baseUrl: string;
  let replies: Reply[];
  let requests: { method?: string; url: URL; authorization?: string }[];
  const client = new SlackApiClient();

  beforeAll(async () => {
    server = createServer((req, res) => {
      requests.push({
        method: req.method,
        url: new URL(req.url!, baseUrl),
        authorization: req.headers.authorization,
      });
      const reply = replies.shift() ?? {
        status: 500,
        body: { ok: false, error: 'unexpected_request' },
      };
      res.writeHead(reply.status ?? 200, { 'Content-Type': 'application/json', ...reply.headers });
      res.end(JSON.stringify(reply.body));
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        server.removeListener('error', reject);
        resolve();
      });
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  });

  beforeEach(() => {
    replies = [];
    requests = [];
    clearSlackAllowedValuesCache();
  });

  const lookup = () =>
    getCachedAllowedValues('channels', 'test-token', async () => {
      const channels = await client.fetchPaginatedPost<{ id: string; name: string }>({
        token: 'test-token',
        baseUrl,
        path: 'conversations.list',
        itemsPath: 'channels',
        fetchDelay: 0,
        params: { exclude_archived: true, types: 'public_channel,private_channel' },
      });
      return channels.map((channel) => ({ value: channel.id, display_name: channel.name }));
    });

  it('encodes cursors in GET queries and retries HTTP 429 after an empty page', async () => {
    replies = [
      { body: { ok: true, channels: [], response_metadata: { next_cursor: 'page/+==' } } },
      { status: 429, headers: { 'Retry-After': '0' }, body: { ok: false, error: 'ratelimited' } },
      { body: { ok: true, channels: [{ id: 'C1', name: 'general' }] } },
    ];
    await expect(lookup()).resolves.toEqual([{ value: 'C1', display_name: 'general' }]);
    await expect(lookup()).resolves.toEqual([{ value: 'C1', display_name: 'general' }]);
    expect(requests).toHaveLength(3);
    expect(replies).toHaveLength(0);
    expect(requests.map((request) => request.url.searchParams.get('cursor'))).toEqual([
      null,
      'page/+==',
      'page/+==',
    ]);
    for (const request of requests) {
      expect(request.method).toBe('GET');
      expect(request.url.pathname).toBe('/api/conversations.list');
      expect(request.url.searchParams.get('exclude_archived')).toBe('true');
      expect(request.url.searchParams.get('types')).toBe('public_channel,private_channel');
      expect(request.authorization).toBe('Bearer test-token');
    }
  });

  it.each([
    { status: 503, body: { ok: false, error: 'unavailable' }, message: '503' },
    { status: 200, body: { ok: false, error: 'missing_scope' }, message: 'missing_scope' },
    { status: 200, body: { ok: true }, message: 'expected channels array' },
    { status: 429, headers: { 'Retry-After': '60' }, body: { ok: false }, message: '429' },
  ])('rejects failed scans and starts fresh on retry: $message', async (failure) => {
    replies = [
      {
        body: {
          ok: true,
          channels: [{ id: 'C0', name: 'partial' }],
          response_metadata: { next_cursor: 'next' },
        },
      },
      failure,
      { body: { ok: true, channels: [{ id: 'C1', name: 'recovered' }] } },
    ];
    await expect(lookup()).rejects.toThrow(failure.message);
    await expect(lookup()).resolves.toEqual([{ value: 'C1', display_name: 'recovered' }]);
    await expect(lookup()).resolves.toEqual([{ value: 'C1', display_name: 'recovered' }]);
    expect(requests).toHaveLength(3);
    expect(requests[2].url.searchParams.has('cursor')).toBe(false);
  });
});
