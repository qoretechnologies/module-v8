import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { slackClient } from '../client';
import { SlackError } from '../constants';
import { TSlackChannel } from '../response-types';
import { getCachedAllowedValues } from './allowed-values-cache';

/**
 * Fetch Slack channels for dropdown options
 *
 * Cached per connection for a short window (see allowed-values-cache) so the
 * IDE's burst of getOptions calls collapses to a single conversations.list scan.
 */
export const getSlackChannelsAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new SlackError('Missing authentication token');
  }

  return getCachedAllowedValues('channels', token, async () => {
    try {
      const channels = await slackClient.fetchPaginatedPost<TSlackChannel>({
        token,
        path: 'conversations.list',
        itemsPath: 'channels',
        params: {
          types: 'public_channel,private_channel',
          exclude_archived: true,
        },
        maxResults: 2000,
      });

      return channels.map((channel) => ({
        value: channel.id,
        display_name: channel.name || channel.id,
      }));
    } catch (error) {
      throw new SlackError(`Failed to fetch channels: ${error.message || error}`);
    }
  });
};
