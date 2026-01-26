import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Slack message type for nested responses
 */
const SlackMessageType = {
  type: 'hash',
  fields: {
    type: {
      type: 'string',
      short_desc: 'Message type',
    },
    user: {
      type: 'string',
      short_desc: 'User ID who sent the message',
    },
    text: {
      type: 'string',
      short_desc: 'Message text content',
    },
    ts: {
      type: 'string',
      short_desc: 'Message timestamp (unique identifier)',
    },
    thread_ts: {
      type: 'string',
      short_desc: 'Parent thread timestamp',
    },
    reply_count: {
      type: 'integer',
      short_desc: 'Number of replies in thread',
    },
    bot_id: {
      type: 'string',
      short_desc: 'Bot ID if sent by a bot',
    },
  },
} satisfies TQoreResponseType;

/**
 * Send message response type
 */
export const SlackSendMessageResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the message was sent successfully',
    },
    channel: {
      type: 'string',
      short_desc: 'Channel where the message was sent',
    },
    ts: {
      type: 'string',
      short_desc: 'Timestamp of the sent message',
    },
    message: { type: SlackMessageType },
  },
} satisfies TQoreResponseType;

/**
 * Update message response type
 */
export const SlackUpdateMessageResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the message was updated successfully',
    },
    channel: {
      type: 'string',
      short_desc: 'Channel where the message was updated',
    },
    ts: {
      type: 'string',
      short_desc: 'Timestamp of the updated message',
    },
    text: {
      type: 'string',
      short_desc: 'Updated message text',
    },
  },
} satisfies TQoreResponseType;

/**
 * Channel history (messages list) response type
 */
export const SlackChannelHistoryResponseType = {
  type: 'hash',
  fields: {
    messages: {
      type: {
        type: 'list',
        element_type: SlackMessageType,
      },
      short_desc: 'List of messages in the channel',
    },
  },
} satisfies TQoreResponseType;

/**
 * Search messages response type
 */
export const SlackSearchMessagesResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the search was successful',
    },
    messages: {
      type: {
        type: 'hash',
        fields: {
          total: {
            type: 'integer',
            short_desc: 'Total number of matching messages',
          },
          matches: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  type: {
                    type: 'string',
                    short_desc: 'Match type',
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
                      },
                    },
                    short_desc: 'Channel info',
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
                    short_desc: 'Message timestamp',
                  },
                  permalink: {
                    type: 'string',
                    short_desc: 'Permanent link to the message',
                  },
                },
              },
            },
            short_desc: 'Matching messages',
          },
        },
      },
      short_desc: 'Search results',
    },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Slack message
 */
export type TSlackMessage = {
  type: string;
  user?: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  bot_id?: string;
};
