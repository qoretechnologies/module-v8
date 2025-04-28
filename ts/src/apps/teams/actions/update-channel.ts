import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { getTeamsChannelIdAllowedValues } from '../helpers/get-channel-id-allowed-values';
import { getTeamsTeamIdAllowedValues } from '../helpers/get-team-id-allowed-values';
import { getTeamsChannelIdDependentOptions } from '../helpers/get-channel-id-dependent-options';

const options = {
  teamId: {
    type: 'string',
    required: true,
    get_allowed_values: getTeamsTeamIdAllowedValues,
  },
  channelId: {
    type: 'string',
    depends_on: ['teamId'],
    on_change: ['refetch'],
    get_allowed_values: getTeamsChannelIdAllowedValues,
    get_dependent_options: getTeamsChannelIdDependentOptions,
    required: true,
  },
  displayName: {
    type: 'string',
    required_groups: ['update'],
    required: false,
  },
  description: {
    type: 'string',
    required_groups: ['update'],
    required: false,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  addMembers: {
    required_groups: ['update'],
    type: {
      type: 'list',
      element_type: {
        type: 'string',
      },
    },
    required: false,
  },
  removeMembers: {
    required_groups: ['update'],
    type: 'list',
    required: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    displayName: {
      type: 'string',
    },
    success: {
      type: 'boolean',
    },
    addedMembers: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
    },
    removedMembers: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
    },
    error: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

export const UpdateTeamsChannel = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  action: 'update-channel',
  app: TEAMS_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const teamId = data?.teamId;
    const channelId = data?.channelId;
    const displayName = data?.displayName;
    const description = data?.description;
    const addMembers = (data?.addMembers as string[] | undefined) || [];
    const removeMembers = (data?.removeMembers as string[] | undefined) || [];

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!teamId) missingValues.push('teamId');
    if (!channelId) missingValues.push('channelId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to update Teams channel`
      );
    }

    if (!displayName && !description && addMembers.length === 0 && removeMembers.length === 0) {
      throw new Error(
        'At least one update parameter (displayName, description, addMembers, or removeMembers) must be provided'
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    try {
      const channelInfo = await client.api(`/teams/${teamId}/channels/${channelId}`).get();

      let channelResponse = channelInfo;
      if (displayName || description !== undefined) {
        const updateBody: any = {};
        if (displayName) updateBody.displayName = displayName;
        if (description !== undefined) updateBody.description = description;

        await client.api(`/teams/${teamId}/channels/${channelId}`).patch(updateBody);
        channelResponse = await client.api(`/teams/${teamId}/channels/${channelId}`).get();
      }

      const addedMembers: string[] = [];
      const removedMembers: string[] = [];

      if (channelInfo.membershipType === 'private') {
        for (const userId of addMembers) {
          try {
            await client.api(`/teams/${teamId}/channels/${channelId}/members`).post({
              '@odata.type': '#microsoft.graph.aadUserConversationMember',
              roles: ['member'],
              'user@odata.bind': `https://graph.microsoft.com/v1.0/users/${userId}`,
            });
            addedMembers.push(userId);
          } catch (memberError) {
            console.error(`Failed to add member ${userId}: ${memberError.message}`);
          }
        }

        for (const userId of removeMembers) {
          try {
            const memberships = await client
              .api(`/teams/${teamId}/channels/${channelId}/members`)
              .filter(`microsoft.graph.aadUserConversationMember/userId eq '${userId}'`)
              .get();

            if (memberships.value && memberships.value.length > 0) {
              const membershipId = memberships.value[0].id;
              await client
                .api(`/teams/${teamId}/channels/${channelId}/members/${membershipId}`)
                .delete();
              removedMembers.push(userId);
            }
          } catch (memberError) {
            console.error(`Failed to remove member ${userId}: ${memberError.message}`);
          }
        }
      }

      return {
        id: channelResponse.id,
        displayName: channelResponse.displayName,
        success: true,
        addedMembers,
        removedMembers,
        error: '',
      };
    } catch (error) {
      throw new Error(`Failed to update Teams channel: ${error.message}`);
    }
  },
  options,
  response_type,
});
