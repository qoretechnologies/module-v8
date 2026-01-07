import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues } from '../helpers';

const action = 'new_reaction';

const options = {
  emojis: {
    type: 'list',
    required: false,
  },
  channel: {
    type: 'string',
    required: false,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
} satisfies TQoreOptions;

/**
 * Reaction event type
 */
const ReactionEventType = {
  type: 'hash',
  fields: {
    type: {
      type: 'string',
      short_desc: 'Event type',
    },
    user: {
      type: 'string',
      short_desc: 'User who added the reaction',
    },
    reaction: {
      type: 'string',
      short_desc: 'Reaction emoji name',
    },
    item_user: {
      type: 'string',
      short_desc: 'User who posted the item',
    },
    item: {
      type: {
        type: 'hash',
        fields: {
          type: {
            type: 'string',
            short_desc: 'Item type',
          },
          channel: {
            type: 'string',
            short_desc: 'Channel ID',
          },
          ts: {
            type: 'string',
            short_desc: 'Message timestamp',
          },
        },
      },
      short_desc: 'Item that received the reaction',
    },
    event_ts: {
      type: 'string',
      short_desc: 'Event timestamp',
    },
  },
} satisfies TQoreResponseType;

/**
 * Reaction item from API
 */
type TReactionItem = {
  type: string;
  user?: string;
  reaction: string;
  item_user?: string;
  item: {
    type: string;
    channel?: string;
    ts?: string;
  };
  event_ts: string;
  unique_id: string;
};

/**
 * Fetch recent reactions
 * Note: This uses the user token (authed_user.access_token) to list reactions
 */
const fetchRecentReactions = async (
  userToken: string,
  emojis?: string[],
  channel?: string
): Promise<TReactionItem[]> => {
  try {
    const response = await slackClient.post<{
      ok: boolean;
      items?: Array<{
        type: string;
        channel?: string;
        message?: {
          ts?: string;
          user?: string;
          reactions?: Array<{ name: string; users?: string[] }>;
        };
      }>;
    }>(
      'reactions.list',
      { limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT, full: true },
      { token: userToken }
    );

    if (!response.items) {
      return [];
    }

    const reactionEvents: TReactionItem[] = [];

    for (const item of response.items) {
      if (item.type !== 'message') continue;

      // Filter by channel if specified
      if (channel && item.channel !== channel) continue;

      if (!item.message?.reactions) continue;

      for (const reaction of item.message.reactions) {
        // Filter by emojis if specified
        if (emojis && emojis.length > 0 && !emojis.includes(reaction.name)) continue;

        for (const userId of reaction.users || []) {
          reactionEvents.push({
            type: 'reaction_added',
            user: userId,
            reaction: reaction.name,
            item_user: item.message.user,
            item: {
              type: 'message',
              channel: item.channel,
              ts: item.message.ts,
            },
            event_ts: item.message.ts || '',
            // Create unique ID for deduplication
            unique_id: `${item.channel}-${item.message.ts}-${reaction.name}-${userId}`,
          });
        }
      }
    }

    return reactionEvents;
  } catch (error) {
    throw new SlackError(`Failed to fetch reactions: ${error.message || error}`);
  }
};

const NewReaction = QoreAppCreator.createLocalizedTrigger({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    // Reactions list requires user token
    const userToken = context?.conn_opts?.authed_user?.access_token;

    if (!userToken) {
      throw new SlackError('Missing user token. Please re-authenticate with user scopes.');
    }

    const emojis = context?.opts?.emojis as string[] | undefined;
    const channel = context?.opts?.channel as string | undefined;

    const getItems = () => fetchRecentReactions(userToken, emojis, channel);

    await pollCreatedItemsForTrigger({
      trigger_name: `slack_${action}`,
      uniqueField: 'unique_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const userToken = context?.conn_opts?.authed_user?.access_token;

    if (!userToken) {
      throw new SlackError('Missing user token. Please re-authenticate with user scopes.');
    }

    const emojis = context?.opts?.emojis as string[] | undefined;
    const channel = context?.opts?.channel as string | undefined;

    const reactions = await fetchRecentReactions(userToken, emojis, channel);

    return reactions?.length > 0 ? reactions[0] : null;
  },
  event_info: {
    desc: 'Slack New Reaction Trigger Event Info',
    type: ReactionEventType,
  },
});

export default NewReaction;
