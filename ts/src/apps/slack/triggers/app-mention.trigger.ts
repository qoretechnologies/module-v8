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

const action = 'app_mention';

const options = {
  channel: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
} satisfies TQoreOptions;

/**
 * App mention event response type
 */
const AppMentionEventType = {
  type: 'hash',
  fields: {
    type: {
      type: 'string',
      short_desc: 'Event type',
    },
    user: {
      type: 'string',
      short_desc: 'User who mentioned the app',
    },
    text: {
      type: 'string',
      short_desc: 'Message text containing the mention',
    },
    ts: {
      type: 'string',
      short_desc: 'Message timestamp (unique identifier)',
    },
    channel: {
      type: 'string',
      short_desc: 'Channel ID where the mention occurred',
    },
    event_ts: {
      type: 'string',
      short_desc: 'Event timestamp',
    },
  },
} satisfies TQoreResponseType;

type TAppMentionEvent = TSlackMessage & {
  channel: string;
  event_ts: string;
};

/**
 * Get the bot user ID via auth.test
 */
const getBotUserId = async (token: string): Promise<string> => {
  const response = await slackClient.post<{ ok: boolean; user_id: string }>(
    'auth.test',
    {},
    { token }
  );

  return response.user_id;
};

/**
 * Fetch messages that mention the bot
 */
const fetchAppMentions = async (
  token: string,
  channel: string,
  botUserId: string
): Promise<TAppMentionEvent[]> => {
  try {
    const messages = await slackClient.fetchPaginatedPost<TSlackMessage>({
      token,
      path: 'conversations.history',
      itemsPath: 'messages',
      params: { channel },
      maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
    });

    const mentionPattern = `<@${botUserId}>`;

    return messages
      .filter((msg) => (!msg.type || msg.type === 'message') && msg.text?.includes(mentionPattern))
      .map((msg) => ({
        ...msg,
        type: 'app_mention',
        channel,
        event_ts: msg.ts,
      }));
  } catch (error) {
    throw new SlackError(`Failed to fetch app mentions: ${error.message || error}`);
  }
};

const AppMention = QoreAppCreator.createLocalizedTrigger({
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

    const botUserId = await getBotUserId(token);
    const getItems = () => fetchAppMentions(token, channel, botUserId);

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

    const botUserId = await getBotUserId(token);
    const mentions = await fetchAppMentions(token, channel, botUserId);

    return mentions?.length > 0 ? mentions[0] : null;
  },
  event_info: {
    desc: 'Slack App Mention Trigger Event Info',
    type: AppMentionEventType,
  },
});

export default AppMention;
