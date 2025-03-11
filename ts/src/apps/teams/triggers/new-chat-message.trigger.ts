import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { ChatMessage } from '@microsoft/microsoft-graph-types';
import { getTeamsChatIdAllowedValues } from '../helpers/get-chat-id-allowed-values';

const options = {
  chatId: {
    type: 'string',
    get_allowed_values: getTeamsChatIdAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const TeamsNewChatMessageTrigger = QoreAppCreator.createLocalizedTrigger({
  app: TEAMS_APP_NAME,
  action: 'new-chat-message',
  options,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const chatId = context.opts?.chatId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!chatId) missingValues.push('chatId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the new chat message Teams trigger`
      );
    }

    const getItems = () => {
      return getLastTeamsChatMessages(token!, chatId!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'teams_new_chat_message',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const chatId = context?.opts?.chatId;

    if (!token || !chatId) {
      throw new Error('The token and chatId are required to get the new chat message example data');
    }

    const messages = await getLastTeamsChatMessages(token, chatId);

    return messages?.length > 0 ? messages[0] : null;
  },
  event_info: {
    desc: 'Teams New Chat Message Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        createdDateTime: { type: 'string' },
        lastModifiedDateTime: { type: 'string' },
        importance: { type: 'string' },
        subject: { type: 'string' },
        body: {
          type: {
            type: 'hash',
            fields: {
              contentType: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
        from: {
          type: {
            type: 'hash',
            fields: {
              user: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    displayName: { type: 'string' },
                    userIdentityType: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        attachments: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                contentType: { type: 'string' },
                contentUrl: { type: 'string' },
                name: { type: 'string' },
                size: { type: 'integer' },
              },
            },
          },
        },
        mentions: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'integer' },
                mentionText: { type: 'string' },
                mentioned: {
                  type: {
                    type: 'hash',
                    fields: {
                      user: {
                        type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            displayName: { type: 'string' },
                            userIdentityType: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        reactions: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                reactionType: { type: 'string' },
                createdDateTime: { type: 'string' },
                user: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      displayName: { type: 'string' },
                      userIdentityType: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

const getLastTeamsChatMessages = async (token: string, chatId: string) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  try {
    const response: PageCollection = await client
      .api(`/chats/${chatId}/messages`)
      .select(
        [
          'id',
          'createdDateTime',
          'lastModifiedDateTime',
          'importance',
          'subject',
          'body',
          'from',
          'attachments',
          'mentions',
          'reactions',
        ].join(',')
      )
      .top(DEFAULT_TRIGGER_POLL_ITEM_LIMIT)
      .orderby('createdDateTime desc')
      .get();

    return response.value as ChatMessage[];
  } catch (error) {
    throw new Error(`Failed to fetch Teams chat messages: ${error.message}`);
  }
};

export default TeamsNewChatMessageTrigger;
