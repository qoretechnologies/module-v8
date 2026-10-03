// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ActiveCampaignApiClient } from '../apps/active-campaign/client';
import { BaserowApiClient } from '../apps/baserow/client';
import { ClickUpApiClient } from '../apps/clickup/client';
import { FrontApiClient } from '../apps/front/client';
import { MauticApiClient } from '../apps/mautic/client';
import { SurveyMonkeyApiClient } from '../apps/survey-monkey/client';
import { QoreApiClient } from '../global/helpers/QoreApiClient';

const failure = new Error('fixture upstream failure');
const item = { id: 'one' };

const clients = [
  {
    name: 'ActiveCampaign',
    client: new ActiveCampaignApiClient(),
    field: 'data',
    page: { data: [item], meta: { total: 2 } },
    empty: { data: [], meta: { total: 0 } },
  },
  {
    name: 'Baserow',
    client: new BaserowApiClient(),
    field: 'results',
    page: { results: [item], count: 2 },
    empty: { results: [], count: 0 },
  },
  {
    name: 'ClickUp',
    client: new ClickUpApiClient(),
    field: 'tasks',
    page: { tasks: [item], last_page: false },
    empty: { tasks: [], last_page: true },
  },
  {
    name: 'Front',
    client: new FrontApiClient(),
    field: '_results',
    page: {
      _results: [item],
      _pagination: { next: 'https://example.invalid/items?page_token=next' },
    },
    empty: { _results: [] },
  },
  {
    name: 'Mautic',
    client: new MauticApiClient(),
    field: 'contacts',
    page: { contacts: { one: item }, total: 2 },
    empty: { contacts: {}, total: 0 },
  },
  {
    name: 'SurveyMonkey',
    client: new SurveyMonkeyApiClient(),
    field: 'data',
    page: { data: [item], total: 2 },
    empty: { data: [], total: 0 },
  },
];

describe.each(clients)(
  '$name shared pagination failure contract',
  ({ client, field, page, empty }) => {
    const options = {
      path: 'items',
      itemsPath: field,
      fetchDelay: 0,
      token: 'fixture-token',
      baseUrl: 'https://example.invalid',
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('rejects a failed first page through the allowed-values API', async () => {
      const get = jest.spyOn(QorusRequest, 'get').mockRejectedValue(failure);
      await expect(
        client.fetchAllowedValues({
          ...options,
          mapItemToAllowedValue: (value: { id: string }) => ({ value: value.id }),
        })
      ).rejects.toThrow(failure.message);
      expect(get).toHaveBeenCalledTimes(1);
    });

    it('rejects a later failure without returning the first page', async () => {
      const get = jest
        .spyOn(QorusRequest, 'get')
        .mockResolvedValueOnce({ data: page })
        .mockRejectedValueOnce(failure);
      await Promise.all([
        expect(client.fetchPaginated(options)).rejects.toThrow(failure.message),
        jest.runAllTimersAsync(),
      ]);
      expect(get).toHaveBeenCalledTimes(2);
    });

    it('keeps successful empty collections valid', async () => {
      jest.spyOn(QorusRequest, 'get').mockResolvedValue({ data: empty });
      await expect(client.fetchPaginated(options)).resolves.toEqual([]);
    });

    it('rejects a response with no collection field', async () => {
      jest.spyOn(QorusRequest, 'get').mockResolvedValue({ data: { error: 'upstream error' } });
      await expect(client.fetchPaginated(options)).rejects.toThrow(/response/i);
    });

    it('rejects a scan whose response arrives past the deadline', async () => {
      jest.spyOn(QorusRequest, 'get').mockImplementation(async () => {
        jest.setSystemTime(Date.now() + 1000);
        return { data: page };
      });
      await Promise.all([
        expect(client.fetchPaginated({ ...options, timeout: 1000 })).rejects.toThrow(
          /timeout|timed out/i
        ),
        jest.runAllTimersAsync(),
      ]);
    });
  }
);

describe('shared pagination boundaries', () => {
  const client = new (class extends QoreApiClient {})({
    baseUrl: 'https://example.invalid',
    appName: 'fixture',
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('accepts an unpaginated top-level array', async () => {
    jest.spyOn(QorusRequest, 'get').mockResolvedValue({ data: [item] });
    await expect(client.fetchPaginated({ path: 'items' })).resolves.toEqual([item]);
  });

  it('does not fetch for an explicitly zero result limit', async () => {
    const get = jest.spyOn(QorusRequest, 'get').mockRejectedValue(failure);
    await expect(client.fetchPaginated({ path: 'items', maxResults: 0 })).resolves.toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });
});

describe('shared pagination continuation and validation', () => {
  const client = new FrontApiClient();
  const options = { path: 'items', fetchDelay: 0 };
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('advances across an empty page when a cursor is present', async () => {
    const get = jest
      .spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce({
        data: {
          _results: [],
          _pagination: { next: 'https://example.invalid/items?page_token=two' },
        },
      })
      .mockResolvedValueOnce({ data: { _results: [item] } });
    await expect(client.fetchPaginated(options)).resolves.toEqual([item]);
    expect(get).toHaveBeenCalledTimes(2);
    expect(get.mock.calls[1][0].params).toMatchObject({ page_token: 'two' });
  });

  it.each(['bad-url', 'https://example.invalid/items'])(
    'rejects unusable continuation %s',
    async (next) => {
      jest
        .spyOn(QorusRequest, 'get')
        .mockResolvedValue({ data: { _results: [item], _pagination: { next } } });
      await expect(client.fetchPaginated(options)).rejects.toThrow(/continuation/i);
    }
  );

  it('rejects a repeated cursor before fetching the same page again', async () => {
    const get = jest.spyOn(QorusRequest, 'get').mockResolvedValue({
      data: {
        _results: [item],
        _pagination: { next: 'https://example.invalid/items?page_token=two' },
      },
    });
    await expect(client.fetchPaginated(options)).rejects.toThrow(/repeated/i);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('applies the result cap within a page', async () => {
    jest
      .spyOn(QorusRequest, 'get')
      .mockResolvedValue({ data: { _results: [item, { id: 'two' }] } });
    await expect(client.fetchPaginated({ ...options, maxResults: 1 })).resolves.toEqual([item]);
  });

  it.each([
    { timeout: 0 },
    { timeout: NaN },
    { fetchDelay: -1 },
    { maxResults: -1 },
    { maxResults: 0.5 },
  ])('rejects invalid pagination settings %j before I/O', async (invalid) => {
    const get = jest.spyOn(QorusRequest, 'get');
    await expect(client.fetchPaginated({ ...options, ...invalid })).rejects.toThrow(/invalid/i);
    expect(get).not.toHaveBeenCalled();
  });
});
