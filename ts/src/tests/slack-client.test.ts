// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import axios, { AxiosError, AxiosHeaders } from 'axios';
import { SlackApiClient } from '../apps/slack/client';

const httpError = (status: number, retryAfter?: string) =>
  new AxiosError(`Request failed with status code ${status}`, undefined, undefined, undefined, {
    status,
    statusText: 'error',
    data: { ok: false, error: 'ratelimited' },
    headers: new AxiosHeaders(retryAfter === undefined ? {} : { 'Retry-After': retryAfter }),
    config: { headers: new AxiosHeaders() },
  });

describe('Slack read requests', () => {
  let client: SlackApiClient;
  let get: jest.SpiedFunction<typeof axios.get>;

  beforeEach(() => {
    client = new SlackApiClient();
    get = jest.spyOn(axios, 'get');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('preserves request options and response extraction', async () => {
    get.mockResolvedValue({
      data: { ok: true, channels: [{ id: 'C1' }] },
      headers: { test: 'value' },
    });
    await expect(
      client.get('/conversations.list', {
        token: 'test-token',
        params: { cursor: 'page==', exclude_archived: true },
        baseUrl: 'https://example.invalid/api/',
        headers: { 'X-Test': 'value' },
        objectPath: 'channels',
        includeHeaders: true,
      })
    ).resolves.toEqual({ data: [{ id: 'C1' }], headers: { test: 'value' } });
    expect(get).toHaveBeenCalledWith('https://example.invalid/api/conversations.list', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer test-token',
        'X-Test': 'value',
      },
      params: { cursor: 'page==', exclude_archived: true },
      timeout: 60_000,
    });
  });

  it.each(['missing_scope', 'invalid_auth', 'ratelimited'])(
    'throws a Slack API error: %s',
    async (error) => {
      get.mockResolvedValue({ data: { ok: false, error } });
      await expect(client.get('conversations.list')).rejects.toThrow(error);
      expect(get).toHaveBeenCalledTimes(1);
    }
  );

  it.each([null, {}, 'not json', { ok: false }])(
    'rejects malformed responses: %p',
    async (data) => {
      get.mockResolvedValue({ data });
      await expect(client.get('conversations.list')).rejects.toThrow(/Slack/);
    }
  );

  it.each([401, 403, 500, 503])('propagates HTTP %i without retrying', async (status) => {
    get.mockRejectedValue(httpError(status));
    await expect(client.get('conversations.list')).rejects.toThrow(String(status));
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('propagates transport errors', async () => {
    get.mockRejectedValue(new Error('socket closed'));
    await expect(client.get('conversations.list')).rejects.toThrow('socket closed');
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('honors Retry-After and retries the same page with the remaining budget', async () => {
    get
      .mockRejectedValueOnce(httpError(429, '2'))
      .mockResolvedValueOnce({ data: { ok: true, channels: [{ id: 'C1' }] } });
    const result = client.get('conversations.list', {
      token: 'test-token',
      params: { cursor: 'next==' },
      timeout: 5000,
    });
    await Promise.all([
      expect(result).resolves.toEqual({ ok: true, channels: [{ id: 'C1' }] }),
      (async () => {
        await jest.advanceTimersByTimeAsync(1999);
        expect(get).toHaveBeenCalledTimes(1);
        await jest.advanceTimersByTimeAsync(1);
      })(),
    ]);
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenLastCalledWith('https://slack.com/api/conversations.list', {
      headers: { Accept: 'application/json', Authorization: 'Bearer test-token' },
      params: { cursor: 'next==' },
      timeout: 3000,
    });
  });

  it('bounds repeated rate limits to three retries', async () => {
    get.mockRejectedValue(httpError(429, '0'));
    const result = expect(client.get('conversations.list')).rejects.toThrow('429');
    await Promise.all([result, jest.runAllTimersAsync()]);
    expect(get).toHaveBeenCalledTimes(4);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('recognizes plain response headers without depending on their case', async () => {
    const error = httpError(429);
    error.response!.headers = { 'rEtRy-AfTeR': '0' };
    get.mockRejectedValueOnce(error).mockResolvedValueOnce({ data: { ok: true, channels: [] } });
    await Promise.all([
      expect(client.get('conversations.list')).resolves.toEqual({ ok: true, channels: [] }),
      jest.runAllTimersAsync(),
    ]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('rejects a response delivered after the total request deadline', async () => {
    get.mockImplementation(async () => {
      jest.setSystemTime(Date.now() + 1000);
      return { data: { ok: true } };
    });
    await expect(client.get('conversations.list', { timeout: 1000 })).rejects.toThrow('timed out');
  });

  it('preserves a SlackError even when a transport rejects without an Error object', async () => {
    get.mockRejectedValue(null);
    await expect(client.get('conversations.list')).rejects.toMatchObject({ name: 'SlackError' });
  });

  it.each([undefined, '', '-1', 'NaN', '1.5', '9999999999999999999999999999999999999999', '60'])(
    'does not retry early when Retry-After is invalid or exceeds the deadline: %p',
    async (retryAfter) => {
      get.mockRejectedValue(httpError(429, retryAfter));
      await expect(client.get('conversations.list')).rejects.toThrow('429');
      expect(get).toHaveBeenCalledTimes(1);
      expect(jest.getTimerCount()).toBe(0);
    }
  );

  it('stops when the deadline expires during rate-limit backoff', async () => {
    get.mockRejectedValue(httpError(429, '2'));
    const result = expect(client.get('conversations.list', { timeout: 3000 })).rejects.toThrow(
      /timed out/
    );
    await Promise.all([
      result,
      (async () => {
        await jest.advanceTimersByTimeAsync(0);
        jest.setSystemTime(Date.now() + 3000);
        await jest.runAllTimersAsync();
      })(),
    ]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1, 0.5, NaN, Infinity, 2 ** 31])(
    'rejects an invalid timeout: %p',
    async (timeout) => {
      await expect(client.get('conversations.list', { timeout })).rejects.toThrow('timeout');
      expect(get).not.toHaveBeenCalled();
    }
  );
});
