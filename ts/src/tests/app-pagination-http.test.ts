// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { BaserowApiClient } from '../apps/baserow/client';
import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { fetchFigmaPaginatedRecords } from '../apps/figma/helpers/constants';
import * as helpers from '../global/helpers';
import { fetchCalendlyRecords } from '../apps/calendly/helpers/constants';

interface Reply {
  status?: number;
  body: unknown;
}
let server: Server;
let baseUrl: string;
let replies: Reply[];
let requests: URL[];
beforeAll(async () => {
  server = createServer((req, res) => {
    requests.push(new URL(req.url!, baseUrl));
    const reply = replies.shift() ?? { status: 500, body: { desc: 'Unexpected request' } };
    res.writeHead(reply.status ?? 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reply.body));
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
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
});
afterEach(() => {
  jest.restoreAllMocks();
});

it.each([401, 429, 503])(
  'shared pagination propagates HTTP %s on a later page and permits immediate retry',
  async (status) => {
    const client = new BaserowApiClient();
    const lookup = () =>
      client.fetchAllowedValues<{ id: number }>({
        path: 'rows',
        connectionOptions: { url: baseUrl },
        token: 'fixture',
        fetchDelay: 0,
        mapItemToAllowedValue: (item) => ({ value: item.id }),
      });
    replies = [
      { body: { results: [{ id: 1 }], count: 2 } },
      { status, body: { err: 'UPSTREAM', desc: 'fixture upstream failure' } },
    ];
    await expect(lookup()).rejects.toThrow('fixture upstream failure');
    expect(requests.map((url) => url.searchParams.get('page'))).toEqual(['1', '2']);
    replies = [{ body: { results: [{ id: 2 }], count: 1 } }];
    await expect(lookup()).resolves.toEqual([{ value: 2 }]);
    expect(requests[2].searchParams.get('page')).toBe('1');
  }
);

it.each(['figma', 'calendly'])(
  '%s sends the continuation query through the real HTTP wrapper',
  async (app) => {
    const realGet = QorusRequest.get.bind(QorusRequest);
    jest
      .spyOn(QorusRequest, 'get')
      .mockImplementation((options, endpoint) =>
        realGet(options, { ...endpoint, endpointId: 'fixture', url: baseUrl })
      );
    const next = `${baseUrl}/items?cursor=opaque%2F%2B%3D`;
    const collection = app === 'figma' ? 'items' : 'collection';
    replies = [
      { body: { [collection]: [{ id: 'one' }], pagination: { next_page: next } } },
      { body: { [collection]: [] } },
    ];
    const options = {
      path: 'items',
      token: 'fixture',
      fetchDelay: 0,
      params: { filter: 'active' },
    };
    jest.spyOn(helpers, 'delay').mockResolvedValue(undefined);
    const result =
      app === 'figma' ? fetchFigmaPaginatedRecords(options) : fetchCalendlyRecords(options);
    await expect(result).resolves.toEqual([{ id: 'one' }]);
    expect(requests[1].searchParams.get('cursor')).toBe('opaque/+=');
    expect(requests[1].searchParams.get('filter')).toBe('active');
  }
);
