import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { slackClient } from '../client';
import { SlackError } from '../constants';
import { TSlackChannel } from '../response-types';

/**
 * Fetch archived Slack channels for dropdown options (used by unarchive_channel)
 */
export const getSlackArchivedChannelsAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new SlackError('Missing authentication token');
  }

  try {
    const channels = await slackClient.fetchPaginatedPost<TSlackChannel>({
      token,
      path: 'conversations.list',
      itemsPath: 'channels',
      params: {
        types: 'public_channel,private_channel',
        exclude_archived: false,
      },
      maxResults: 2000,
    });

    return channels
      .filter((channel) => channel.is_archived)
      .map((channel) => ({
        value: channel.id,
        display_name: channel.name || channel.id,
      }));
  } catch (error) {
    throw new SlackError(`Failed to fetch archived channels: ${error.message || error}`);
  }
};
