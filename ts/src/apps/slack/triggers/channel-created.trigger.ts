import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { TSlackChannel } from '../response-types';

const action = 'channel_created';

const options = {} satisfies TQoreOptions;

/**
 * Channel created event type
 */
const ChannelCreatedEventType = {
  type: 'hash',
  fields: {
    type: {
      type: 'string',
      short_desc: 'Event type',
    },
    channel: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            short_desc: 'Channel ID',
          },
          name: {
            type: 'string',
            short_desc: 'Channel name',
          },
          created: {
            type: 'integer',
            short_desc: 'Creation timestamp',
          },
          creator: {
            type: 'string',
            short_desc: 'Creator user ID',
          },
        },
      },
      short_desc: 'Channel information',
    },
  },
} satisfies TQoreResponseType;

type TChannelCreatedEvent = {
  type: string;
  channel: {
    id: string;
    name: string;
    created: number;
    creator?: string;
  };
};

/**
 * Fetch recently created channels
 */
const fetchRecentChannels = async (token: string): Promise<TChannelCreatedEvent[]> => {
  try {
    const channels = await slackClient.fetchPaginatedPost<TSlackChannel>({
      token,
      path: 'conversations.list',
      itemsPath: 'channels',
      params: {
        types: 'public_channel,private_channel',
        exclude_archived: true,
      },
      maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT * 2,
    });

    // Sort by created timestamp descending (newest first)
    channels.sort((a, b) => (b.created || 0) - (a.created || 0));

    // Map to event format
    return channels.slice(0, DEFAULT_TRIGGER_POLL_ITEM_LIMIT).map((channel) => ({
      type: 'channel_created',
      channel: {
        id: channel.id,
        name: channel.name,
        created: channel.created || 0,
        creator: (channel as any).creator,
      },
    }));
  } catch (error) {
    throw new SlackError(`Failed to fetch channels: ${error.message || error}`);
  }
};

const ChannelCreated = QoreAppCreator.createLocalizedTrigger({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      optionFields: [],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const getItems = () => fetchRecentChannels(token);

    await pollCreatedItemsForTrigger({
      trigger_name: `slack_${action}`,
      uniqueField: 'channel.id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      optionFields: [],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const channels = await fetchRecentChannels(token);

    return channels?.length > 0 ? channels[0] : null;
  },
  event_info: {
    desc: 'Slack Channel Created Trigger Event Info',
    type: ChannelCreatedEventType,
  },
});

export default ChannelCreated;
