import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';

const action = 'search_messages';

const options = {
  query: {
    type: 'string',
    required: true,
  },
  count: {
    type: 'int',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

/**
 * Search messages response type
 */
const SearchMessagesResponseType = {
  type: 'hash',
  fields: {
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
            ts: {
              type: 'string',
              short_desc: 'Message timestamp',
            },
            user: {
              type: 'string',
              short_desc: 'User who sent the message',
            },
            text: {
              type: 'string',
              short_desc: 'Message text',
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
            permalink: {
              type: 'string',
              short_desc: 'Permanent link to the message',
            },
          },
        },
      },
      short_desc: 'Messages matching the search query',
    },
  },
} satisfies TQoreResponseType;

const SearchMessages = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SearchMessagesResponseType,
  api_function: async (obj, _opts, context) => {
    // Search messages requires user token, not bot token
    const userToken = context?.conn_opts?.authed_user?.access_token;

    if (!userToken) {
      throw new SlackError('Missing user token. Please re-authenticate with user scopes.');
    }

    const query = obj?.query;
    if (!query) {
      throw new SlackError('Missing required option: query');
    }

    const count = obj?.count ?? 100;

    try {
      const matches: any[] = [];

      // Slack search uses a special cursor-based pagination where first cursor is '*'
      let cursor: string | undefined = '*';

      type SearchResponse = {
        ok: boolean;
        messages?: {
          matches?: any[];
          pagination?: { next_cursor?: string };
        };
      };

      while (cursor) {
        const searchResponse: SearchResponse = await slackClient.post(
          'search.messages',
          {
            query,
            count,
            cursor,
          },
          { token: userToken }
        );

        if (searchResponse.messages?.matches) {
          matches.push(...searchResponse.messages.matches);
        }

        cursor = searchResponse.messages?.pagination?.next_cursor;
      }

      return { matches };
    } catch (error) {
      throw new SlackError(`Failed to search messages: ${error.message || error}`);
    }
  },
});

export default SearchMessages;
