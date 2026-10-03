// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import axios from 'axios';
import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../utils/Debugger';

const failure = new Error('fixture upstream failure');
const item = { id: 'one' };
const next = 'https://example.invalid/items?cursor=next';
const context = {
  conn_opts: { token: 'fixture', cloud_id: 'fixture' },
  opts: { issueIdOrKey: 'T-1' },
};
const options = {
  token: 'fixture',
  path: 'items',
  url: 'https://example.invalid',
  username: 'fixture',
  account_id: 'fixture',
  query: 'select id from item',
  dynamics_env: 'fixture',
  limit: 1,
  fetchDelay: 0,
  mapItemToAllowedValue: (value: { id: string }) => ({ value: value.id }),
};

type Fixture = {
  app: string;
  file?: string;
  method: string;
  transport?: 'get' | 'post';
  args?: Record<string, unknown>;
  page: unknown;
  empty: unknown;
  single?: boolean;
};
const fixtures: Fixture[] = [
  {
    app: 'airtable',
    file: 'record-based/constants',
    method: 'fetchAirtablePaginatedRecords',
    page: { records: [item], offset: 'next' },
    empty: { records: [] },
  },
  {
    app: 'attio',
    file: 'client',
    method: 'fetchAttioPaginatedRecords',
    page: { data: [item], pagination: { next_cursor: 'next' } },
    empty: { data: [] },
  },
  {
    app: 'bigml',
    method: 'fetchBigMlPaginatedRecords',
    page: { objects: [item], meta: { next } },
    empty: { objects: [] },
  },
  {
    app: 'browse-ai',
    method: 'fetchBrowseAiPaginatedRecords',
    page: { result: { data: { items: [item], hasMore: true } } },
    empty: { result: { data: { items: [] } } },
  },
  {
    app: 'business-central',
    method: 'fetchBusinessCentralRecords',
    args: { ...options, object: 'items' },
    page: { value: [item] },
    empty: { value: [] },
  },
  {
    app: 'calendly',
    method: 'fetchCalendlyRecords',
    page: { collection: [item], pagination: { next_page_token: next } },
    empty: { collection: [] },
  },
  {
    app: 'canva',
    method: 'fetchCanvaPaginatedRecords',
    page: { items: [item], continuation: 'next' },
    empty: { items: [] },
  },
  {
    app: 'coppercrm',
    method: 'fetchCopperCrmPaginatedRecords',
    transport: 'post',
    page: { results: [item], totalResults: 2 },
    empty: { results: [] },
  },
  {
    app: 'craft',
    method: 'fetchCraftPaginatedRecords',
    page: { items: [item] },
    empty: { items: [] },
    single: true,
  },
  {
    app: 'figma',
    method: 'fetchFigmaPaginatedRecords',
    page: { items: [item], pagination: { next_page: next } },
    empty: { items: [] },
  },
  {
    app: 'firebase',
    method: 'fetchFirebasePaginatedData',
    page: { users: [item], nextPageToken: 'next' },
    empty: {},
  },
  {
    app: 'firestore',
    method: 'fetchFirestorePaginatedDocuments',
    page: { documents: [item], nextPageToken: 'next' },
    empty: {},
  },
  {
    app: 'helpscout',
    method: 'fetchHelpScoutPaginatedRecords',
    page: { _embedded: { results: [item] }, page: { total_pages: 2 } },
    empty: { _embedded: { results: [] } },
  },
  {
    app: 'hubspot',
    method: 'fetchHubspotRecords',
    transport: 'post',
    args: { ...options, object: 'contacts' },
    page: { results: [item], paging: { next: { after: 'next' } } },
    empty: { results: [] },
  },
  {
    app: 'hubspot',
    file: 'get-form-allowed-values',
    method: 'getHubspotFormAllowedValues',
    args: context,
    page: { results: [item], paging: { next: { after: 'next' } } },
    empty: { results: [] },
  },
  {
    app: 'hubspot',
    file: 'get-list-id-allowed-values',
    method: 'getHubspotListAllowedValues',
    transport: 'post',
    args: context,
    page: { lists: [item], hasMore: true, offset: 1 },
    empty: { lists: [], hasMore: false },
  },
  {
    app: 'magento',
    method: 'fetchMagentoAllowedValues',
    page: { items: [item], total_count: 2 },
    empty: { items: [], total_count: 0 },
  },
  {
    app: 'netsuite',
    method: 'fetchNetsuiteAllowedValues',
    transport: 'post',
    page: { items: [item], hasMore: true, count: 1 },
    empty: { items: [], hasMore: false, count: 0 },
  },
  {
    app: 'openrouter',
    method: 'fetchOpenRouterPaginatedRecords',
    page: { data: [item], meta: { total: 2 } },
    empty: { data: [] },
  },
  {
    app: 'paypal',
    method: 'fetchPayPalPaginatedRecords',
    page: { items: [item], page: 1, total_pages: 2 },
    empty: { items: [] },
  },
  {
    app: 'sentry',
    method: 'fetchSentryPaginatedRecords',
    page: { items: [item], links: { next: { results: 'true', cursor: 'next' } } },
    empty: { items: [] },
  },
  {
    app: 'todoist',
    method: 'fetchTodoistPaginatedRecords',
    page: { results: [item], next_cursor: 'next' },
    empty: { results: [] },
  },
  {
    app: 'zendesk',
    method: 'fetchZendeskPaginatedRecords',
    page: { results: [item], next_page: next },
    empty: { results: [], next_page: null },
  },
  {
    app: 'zohocrm',
    method: 'fetchZohoCrmPaginatedRecords',
    page: { results: [item], info: { more_records: true, next_page_token: 'next' } },
    empty: { results: [] },
  },
  {
    app: 'zoom',
    method: 'fetchZoomRecords',
    args: { ...options, object: 'items' },
    page: { items: [item], next_page_token: 'next' },
    empty: { items: [] },
  },
  ...['comment', 'issue', 'worklog'].map(
    (kind): Fixture => ({
      app: 'jira',
      file: `get-${kind}-id-allowed-values`,
      method: `getJira${kind[0].toUpperCase() + kind.slice(1)}IdAllowedValues`,
      args: context,
      page: { [kind + 's']: [item], total: 101 },
      empty: { [kind + 's']: [], total: 0 },
    })
  ),
];

describe.each(fixtures)(
  '$app $method failure contract',
  ({ app, file, method, transport = 'get', args, page, empty, single }) => {
    const fetchRecords = require(`../apps/${app}/helpers/${file || 'constants'}`)[method] as (
      input: Record<string, unknown>
    ) => Promise<unknown[]>;
    const invoke = () => fetchRecords(args || options);
    const spyRequest = () =>
      jest.spyOn(app === 'sentry' || app === 'coppercrm' ? axios : QorusRequest, transport);
    const response = (data: unknown) => ({
      data,
      headers:
        app === 'sentry' && data === page
          ? {
              link: '<https://example.invalid/items?cursor=next>; rel="next"; results="true"; cursor="next"',
            }
          : {},
    });
    beforeEach(() => {
      jest.useFakeTimers();
      // Errors are expected; transport calls remain observable below.
      jest.spyOn(Debugger, 'log').mockImplementation(() => undefined);
    });
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('rejects a failed request', async () => {
      const request = spyRequest().mockRejectedValue(failure);
      await expect(invoke()).rejects.toThrow(failure.message);
      expect(request).toHaveBeenCalledTimes(1);
    });

    it('returns a successful empty collection', async () => {
      const request = spyRequest().mockResolvedValue(response(empty));
      await expect(invoke()).resolves.toEqual([]);
      expect(request).toHaveBeenCalledTimes(1);
    });

    if (!single) {
      it('rejects a later-page failure without returning accumulated results', async () => {
        const request = spyRequest()
          .mockResolvedValueOnce(response(page))
          .mockRejectedValueOnce(failure);
        await Promise.all([
          expect(invoke()).rejects.toThrow(failure.message),
          jest.runAllTimersAsync(),
        ]);
        expect(request).toHaveBeenCalledTimes(2);
      });

      it('rejects a response arriving after the scan deadline', async () => {
        spyRequest().mockImplementation(async () => {
          jest.setSystemTime(Date.now() + 120_000);
          return response(empty);
        });
        await expect(invoke()).rejects.toThrow(/timeout|timed out/i);
      });
    }
  }
);

describe('pagination boundaries exposed by failure propagation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('Calendly uses its opaque token as a parameter rather than parsing it as a URL', async () => {
    const { fetchCalendlyRecords } = require('../apps/calendly/helpers/constants');
    const get = jest
      .spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce({
        data: { collection: [item], pagination: { next_page_token: 'opaque-token' } },
      })
      .mockResolvedValueOnce({ data: { collection: [{ id: 'two' }] } });
    await Promise.all([
      expect(fetchCalendlyRecords(options)).resolves.toEqual([item, { id: 'two' }]),
      jest.runAllTimersAsync(),
    ]);
    expect(get.mock.calls[1][0].params).toMatchObject({ page_token: 'opaque-token' });
  });

  it('Calendly also follows its next-page URL', async () => {
    const { fetchCalendlyRecords } = require('../apps/calendly/helpers/constants');
    const get = jest
      .spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce({ data: { collection: [item], pagination: { next_page: next } } })
      .mockResolvedValueOnce({ data: { collection: [] } });
    await Promise.all([
      expect(fetchCalendlyRecords(options)).resolves.toEqual([item]),
      jest.runAllTimersAsync(),
    ]);
    expect(get.mock.calls[1][0].path).toBe('/items');
    expect(get.mock.calls[1][0].params).toMatchObject({ cursor: 'next' });
  });

  it('Figma accepts a non-paginated project response', async () => {
    const { fetchFigmaPaginatedRecords } = require('../apps/figma/helpers/constants');
    jest.spyOn(QorusRequest, 'get').mockResolvedValue({ data: { projects: [item] } });
    await Promise.all([
      expect(fetchFigmaPaginatedRecords({ ...options, object: 'projects' })).resolves.toEqual([
        item,
      ]),
      jest.runAllTimersAsync(),
    ]);
  });

  it('Figma retains the query string from its next-page URL', async () => {
    const { fetchFigmaPaginatedRecords } = require('../apps/figma/helpers/constants');
    const get = jest
      .spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce({ data: { items: [item], pagination: { next_page: next } } })
      .mockResolvedValueOnce({ data: { items: [] } });
    await Promise.all([
      expect(fetchFigmaPaginatedRecords(options)).resolves.toEqual([item]),
      jest.runAllTimersAsync(),
    ]);
    expect(get.mock.calls[1][0].path).not.toContain('?');
    expect(get.mock.calls[1][0].params).toMatchObject({ cursor: 'next' });
  });

  it('PayPal includes the last numbered page', async () => {
    const { fetchPayPalPaginatedRecords } = require('../apps/paypal/helpers/constants');
    const get = jest
      .spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce({ data: { items: [item], page: 1, total_pages: 2 } })
      .mockResolvedValueOnce({ data: { items: [{ id: 'two' }], page: 2, total_pages: 2 } });
    await Promise.all([
      expect(fetchPayPalPaginatedRecords(options)).resolves.toEqual([item, { id: 'two' }]),
      jest.runAllTimersAsync(),
    ]);
    expect(get).toHaveBeenCalledTimes(2);
  });
});
