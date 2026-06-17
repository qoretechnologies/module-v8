import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { slackClient } from '../client';
import { SlackError } from '../constants';
import { TSlackUser } from '../response-types';
import { getCachedAllowedValues } from './allowed-values-cache';

/**
 * Fetch Slack users for dropdown options
 *
 * Cached per connection for a short window (see allowed-values-cache) so the
 * IDE's burst of getOptions calls collapses to a single users.list scan.
 */
export const getSlackUsersAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new SlackError('Missing authentication token');
  }

  return getCachedAllowedValues('users', token, async () => {
    try {
      const users = await slackClient.fetchPaginatedPost<TSlackUser>({
        token,
        path: 'users.list',
        itemsPath: 'members',
        maxResults: 2000,
      });

      return users
        .filter((user) => !user.deleted && !user.is_bot)
        .map((user) => ({
          value: user.id,
          display_name: user.profile?.display_name || user.real_name || user.name || user.id,
        }));
    } catch (error) {
      throw new SlackError(`Failed to fetch users: ${error.message || error}`);
    }
  });
};
