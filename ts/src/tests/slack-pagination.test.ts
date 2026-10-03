// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { SlackApiClient, SlackCursorOptions } from '../apps/slack/client';

const options: SlackCursorOptions = {
  token: 'test-token',
  path: 'conversations.list',
  itemsPath: 'channels',
  fetchDelay: 0,
};

describe('Slack cursor pagination', () => {
  let client: SlackApiClient;

  beforeEach(() => {
    client = new SlackApiClient();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('propagates a failed first page', async () => {
    jest.spyOn(client, 'get').mockRejectedValue(new Error('connection reset'));
    await expect(client.fetchPaginatedPost(options)).rejects.toThrow('connection reset');
  });

  it('rejects a failed later page instead of returning partial results', async () => {
    jest
      .spyOn(client, 'get')
      .mockResolvedValueOnce({
        channels: [{ id: 'C1' }],
        response_metadata: { next_cursor: 'next' },
      })
      .mockRejectedValueOnce(new Error('missing_scope'));
    const result = expect(client.fetchPaginatedPost(options)).rejects.toThrow('missing_scope');
    await Promise.all([result, jest.runAllTimersAsync()]);
  });

  it('follows the cursor past an empty page', async () => {
    const get = jest
      .spyOn(client, 'get')
      .mockResolvedValueOnce({ channels: [], response_metadata: { next_cursor: 'next' } })
      .mockResolvedValueOnce({ channels: [{ id: 'C1' }] });
    const result = client.fetchPaginatedPost(options);
    await jest.runAllTimersAsync();
    await expect(result).resolves.toEqual([{ id: 'C1' }]);
    expect(get).toHaveBeenLastCalledWith(
      'conversations.list',
      expect.objectContaining({
        params: { limit: 200, cursor: 'next' },
      })
    );
  });

  it.each([undefined, null, {}, 'channels'])('rejects invalid items: %p', async (channels) => {
    jest.spyOn(client, 'get').mockResolvedValue({ channels });
    await expect(client.fetchPaginatedPost(options)).rejects.toThrow('channels');
  });

  it('rejects an expired scan instead of returning partial results', async () => {
    jest.spyOn(client, 'get').mockResolvedValue({
      channels: [{ id: 'C1' }],
      response_metadata: { next_cursor: 'next' },
    });
    const result = expect(
      client.fetchPaginatedPost({ ...options, timeout: 100, fetchDelay: 100 })
    ).rejects.toThrow(/timed out/i);
    await Promise.all([result, jest.runAllTimersAsync()]);
  });

  it('returns a successful empty collection', async () => {
    jest.spyOn(client, 'get').mockResolvedValue({ channels: [] });
    await expect(client.fetchPaginatedPost(options)).resolves.toEqual([]);
  });

  it('truncates at maxResults without fetching another page', async () => {
    const get = jest.spyOn(client, 'get').mockResolvedValue({
      channels: [{ id: 'C1' }, { id: 'C2' }],
      response_metadata: { next_cursor: 'next' },
    });
    await expect(client.fetchPaginatedPost({ ...options, maxResults: 1 })).resolves.toEqual([
      { id: 'C1' },
    ]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('does not fetch when maxResults is zero', async () => {
    const get = jest.spyOn(client, 'get');
    await expect(client.fetchPaginatedPost({ ...options, maxResults: 0 })).resolves.toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it('rejects cyclic cursors, including empty pages', async () => {
    const get = jest
      .spyOn(client, 'get')
      .mockResolvedValueOnce({ channels: [], response_metadata: { next_cursor: 'a' } })
      .mockResolvedValueOnce({ channels: [], response_metadata: { next_cursor: 'b' } })
      .mockResolvedValueOnce({ channels: [], response_metadata: { next_cursor: 'a' } });
    await expect(client.fetchPaginatedPost(options)).rejects.toThrow('cursor');
    expect(get).toHaveBeenCalledTimes(3);
  });

  it.each([42, false, {}])('rejects invalid cursors: %p', async (next_cursor) => {
    jest
      .spyOn(client, 'get')
      .mockResolvedValue({ channels: [], response_metadata: { next_cursor } });
    await expect(client.fetchPaginatedPost(options)).rejects.toThrow('cursor');
  });

  it('uses the same deadline for all pages', async () => {
    const get = jest
      .spyOn(client, 'get')
      .mockResolvedValueOnce({
        channels: [{ id: 'C1' }],
        response_metadata: { next_cursor: 'next' },
      })
      .mockResolvedValueOnce({ channels: [{ id: 'C2' }] });
    const result = client.fetchPaginatedPost({ ...options, fetchDelay: 300, timeout: 1000 });
    await jest.advanceTimersByTimeAsync(300);
    await expect(result).resolves.toEqual([{ id: 'C1' }, { id: 'C2' }]);
    expect(get.mock.calls.map((call) => call[1]?.timeout)).toEqual([1000, 700]);
  });

  it('rejects a response that arrives after the deadline', async () => {
    jest.spyOn(client, 'get').mockImplementation(async () => {
      jest.setSystemTime(Date.now() + 1000);
      return { channels: [] };
    });
    await expect(client.fetchPaginatedPost({ ...options, timeout: 1000 })).rejects.toThrow(
      'timed out'
    );
  });

  it.each([
    { timeout: -1 },
    { timeout: NaN },
    { timeout: Infinity },
    { fetchDelay: -1 },
    { fetchDelay: NaN },
    { maxResults: -1 },
    { maxResults: 0.5 },
    { maxResults: Infinity },
  ])('rejects invalid pagination options: %p', async (invalid) => {
    const get = jest.spyOn(client, 'get');
    await expect(client.fetchPaginatedPost({ ...options, ...invalid })).rejects.toThrow(
      'Invalid Slack'
    );
    expect(get).not.toHaveBeenCalled();
  });
});
