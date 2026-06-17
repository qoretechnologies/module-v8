import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { slackClient } from '../apps/slack/client';
import {
  clearSlackAllowedValuesCache,
  getCachedAllowedValues,
} from '../apps/slack/helpers/allowed-values-cache';
import { getSlackArchivedChannelsAllowedValues } from '../apps/slack/helpers/get-archived-channels-allowed-values';
import { getSlackChannelsAllowedValues } from '../apps/slack/helpers/get-channels-allowed-values';
import { getSlackUsersAllowedValues } from '../apps/slack/helpers/get-users-allowed-values';

const av = (value: string): IQoreAllowedValue<string> => ({ value, display_name: value });

describe('Slack allowed-values short-TTL cache', () => {
  beforeEach(() => {
    clearSlackAllowedValuesCache();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('getCachedAllowedValues', () => {
    it('serves a cache hit without re-invoking the fetcher', async () => {
      const fetcher = jest.fn().mockResolvedValue([av('C1'), av('C2')]);

      const first = await getCachedAllowedValues('channels', 'token-a', fetcher);
      const second = await getCachedAllowedValues('channels', 'token-a', fetcher);

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(first).toEqual([av('C1'), av('C2')]);
      expect(second).toEqual(first);
    });

    it('isolates entries by kind for the same token', async () => {
      const channels = jest.fn().mockResolvedValue([av('C1')]);
      const users = jest.fn().mockResolvedValue([av('U1')]);

      const ch = await getCachedAllowedValues('channels', 'token-a', channels);
      const us = await getCachedAllowedValues('users', 'token-a', users);

      expect(channels).toHaveBeenCalledTimes(1);
      expect(users).toHaveBeenCalledTimes(1);
      expect(ch).toEqual([av('C1')]);
      expect(us).toEqual([av('U1')]);
    });

    it('isolates entries by token for the same kind', async () => {
      const fetcherA = jest.fn().mockResolvedValue([av('A')]);
      const fetcherB = jest.fn().mockResolvedValue([av('B')]);

      const resultA = await getCachedAllowedValues('channels', 'token-a', fetcherA);
      const resultB = await getCachedAllowedValues('channels', 'token-b', fetcherB);

      expect(fetcherA).toHaveBeenCalledTimes(1);
      expect(fetcherB).toHaveBeenCalledTimes(1);
      expect(resultA).toEqual([av('A')]);
      expect(resultB).toEqual([av('B')]);
    });

    it('re-fetches after the TTL window elapses', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-17T00:00:00.000Z'));

      const fetcher = jest
        .fn()
        .mockResolvedValueOnce([av('stale')])
        .mockResolvedValueOnce([av('fresh')]);

      const first = await getCachedAllowedValues('channels', 'token-a', fetcher);
      expect(first).toEqual([av('stale')]);

      // still inside the 60s window -> cache hit
      jest.setSystemTime(new Date('2026-06-17T00:00:59.000Z'));
      const cached = await getCachedAllowedValues('channels', 'token-a', fetcher);
      expect(cached).toEqual([av('stale')]);
      expect(fetcher).toHaveBeenCalledTimes(1);

      // past the 60s window -> cache miss, re-fetch
      jest.setSystemTime(new Date('2026-06-17T00:01:01.000Z'));
      const refreshed = await getCachedAllowedValues('channels', 'token-a', fetcher);
      expect(refreshed).toEqual([av('fresh')]);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('does not cache failures and retries on the next call', async () => {
      const fetcher = jest
        .fn()
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce([av('recovered')]);

      await expect(getCachedAllowedValues('channels', 'token-a', fetcher)).rejects.toThrow('boom');

      const retried = await getCachedAllowedValues('channels', 'token-a', fetcher);
      expect(retried).toEqual([av('recovered')]);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('clearSlackAllowedValuesCache forces a re-fetch', async () => {
      const fetcher = jest.fn().mockResolvedValue([av('C1')]);

      await getCachedAllowedValues('channels', 'token-a', fetcher);
      clearSlackAllowedValuesCache();
      await getCachedAllowedValues('channels', 'token-a', fetcher);

      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe('resolver wiring', () => {
    const context = { conn_opts: { token: 'token-a' } as any };

    it('collapses repeated channel lookups into a single Slack scan', async () => {
      const spy = jest
        .spyOn(slackClient, 'fetchPaginatedPost')
        .mockResolvedValue([{ id: 'C1', name: 'general', is_archived: false }] as any);

      const first = await getSlackChannelsAllowedValues(context);
      const second = await getSlackChannelsAllowedValues(context);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(first).toEqual([{ value: 'C1', display_name: 'general' }]);
      expect(second).toEqual(first);
    });

    it('collapses repeated user lookups into a single Slack scan', async () => {
      const spy = jest
        .spyOn(slackClient, 'fetchPaginatedPost')
        .mockResolvedValue([
          { id: 'U1', deleted: false, is_bot: false, real_name: 'Alice' },
        ] as any);

      await getSlackUsersAllowedValues(context);
      await getSlackUsersAllowedValues(context);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('keeps active and archived channel lookups in separate cache slots', async () => {
      const spy = jest.spyOn(slackClient, 'fetchPaginatedPost').mockResolvedValue([
        { id: 'C1', name: 'general', is_archived: false },
        { id: 'C2', name: 'old', is_archived: true },
      ] as any);

      const active = await getSlackChannelsAllowedValues(context);
      const archived = await getSlackArchivedChannelsAllowedValues(context);

      // distinct kinds -> two scans, each filtered independently
      expect(spy).toHaveBeenCalledTimes(2);
      expect(active).toEqual([
        { value: 'C1', display_name: 'general' },
        { value: 'C2', display_name: 'old' },
      ]);
      expect(archived).toEqual([{ value: 'C2', display_name: 'old' }]);
    });

    it('does not cache across distinct connection tokens', async () => {
      const spy = jest
        .spyOn(slackClient, 'fetchPaginatedPost')
        .mockResolvedValue([{ id: 'C1', name: 'general', is_archived: false }] as any);

      await getSlackChannelsAllowedValues({ conn_opts: { token: 'token-a' } as any });
      await getSlackChannelsAllowedValues({ conn_opts: { token: 'token-b' } as any });

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('rejects when no authentication token is present', async () => {
      await expect(getSlackChannelsAllowedValues({ conn_opts: {} as any })).rejects.toThrow(
        'Missing authentication token'
      );
    });
  });
});
