import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { ChatMessage } from '@microsoft/microsoft-graph-types';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TEAMS_APP_NAME } from '../constants';
import { getTeamsChannelIdAllowedValues } from '../helpers/get-channel-id-allowed-values';
import { getTeamsTeamIdAllowedValues } from '../helpers/get-team-id-allowed-values';

const options = {
  teamId: {
    type: 'string',
    get_allowed_values: getTeamsTeamIdAllowedValues,
    required: true,
  },
  channelId: {
    type: 'string',
    depends_on: ['teamId'],
    get_allowed_values: getTeamsChannelIdAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const TeamsNewChannelMessageTrigger = QoreAppCreator.createLocalizedTrigger({
  app: TEAMS_APP_NAME,
  action: 'new-channel-message',
  options,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const teamId = context.opts?.teamId;
    const channelId = context.opts?.channelId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!teamId) missingValues.push('teamId');
    if (!channelId) missingValues.push('channelId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the new channel message Teams trigger`
      );
    }

    const getItems = () => {
      return getLastTeamsChannelMessages(token!, teamId!, channelId!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'teams_new_channel_message',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const teamId = context?.opts?.teamId;
    const channelId = context?.opts?.channelId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!teamId) missingValues.push('teamId');
    if (!channelId) missingValues.push('channelId');

    if (missingValues.length) {
      throw new Error(
        'The token, team_id, and channel_id are required to get the new channel message example data'
      );
    }

    const messages = await getLastTeamsChannelMessages(token!, teamId!, channelId!);

    return messages?.length > 0 ? messages[0] : null;
  },
  event_info: {
    desc: 'Teams New Channel Message Trigger Event Info',
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

const getLastTeamsChannelMessages = async (token: string, teamId: string, channelId: string) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  try {
    const response: PageCollection = await client
      .api(`/teams/${teamId}/channels/${channelId}/messages`)
      .top(DEFAULT_TRIGGER_POLL_ITEM_LIMIT)
      .get();

    return response.value as ChatMessage[];
  } catch (error) {
    throw new Error(`Failed to fetch Teams channel messages: ${error.message}`);
  }
};

export default TeamsNewChannelMessageTrigger;
