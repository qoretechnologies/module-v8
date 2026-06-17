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
import { getSlackChannelsAllowedValues } from '../helpers';
import { TSlackMessage } from '../response-types';

const action = 'new_message';

const options = {
  channel: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
} satisfies TQoreOptions;

/**
 * New message event response type
 */
const NewMessageEventType = {
  type: 'hash',
  fields: {
    type: {
      type: 'string',
      short_desc: 'Message type',
    },
    user: {
      type: 'string',
      short_desc: 'User who sent the message',
    },
    text: {
      type: 'string',
      short_desc: 'Message text',
    },
    ts: {
      type: 'string',
      short_desc: 'Message timestamp (unique identifier)',
    },
    channel: {
      type: 'string',
      short_desc: 'Channel ID',
    },
    channel_type: {
      type: 'string',
      short_desc: 'Channel type',
    },
  },
} satisfies TQoreResponseType;

/**
 * Fetch latest messages from a channel
 */
const fetchLatestMessages = async (
  token: string,
  channel: string
): Promise<(TSlackMessage & { channel: string })[]> => {
  try {
    const messages = await slackClient.fetchPaginatedPost<TSlackMessage>({
      token,
      path: 'conversations.history',
      itemsPath: 'messages',
      params: { channel },
      maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    });

    // Add channel info to messages and filter out subtypes (only regular messages)
    return messages
      .filter((msg) => !msg.type || msg.type === 'message')
      .map((msg) => ({
        ...msg,
        channel,
        channel_type: 'channel',
      }));
  } catch (error) {
    throw new SlackError(`Failed to fetch messages: ${error.message || error}`);
  }
};

const NewMessage = QoreAppCreator.createLocalizedTrigger({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, channel } = getQoreContextRequiredValues({
      context,
      optionFields: ['channel'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const getItems = () => fetchLatestMessages(token, channel);

    await pollCreatedItemsForTrigger({
      trigger_name: `slack_${action}`,
      uniqueField: 'ts',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, channel } = getQoreContextRequiredValues({
      context,
      optionFields: ['channel'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const messages = await fetchLatestMessages(token, channel);

    return messages?.length > 0 ? messages[0] : null;
  },
  event_info: {
    desc: 'Slack New Message Trigger Event Info',
    type: NewMessageEventType,
  },
});

export default NewMessage;
