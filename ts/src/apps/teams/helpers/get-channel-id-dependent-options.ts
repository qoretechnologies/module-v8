import { Client } from '@microsoft/microsoft-graph-client';
import {
  TQoreAppActionOption,
  TQoreGetDependentOptionsFunction,
} from '@qoretechnologies/ts-toolkit';
import { getTeamsChannelMembersAllowedValues } from './get-channel-member-allowed-values';
import { getTeamsChannelAddableMembersAllowedValues } from './get-member-allowed-values';

export const getTeamsChannelIdDependentOptions: TQoreGetDependentOptionsFunction = async (
  context
): Promise<Record<string, TQoreAppActionOption>> => {
  const token = context?.conn_opts?.token;
  const teamId = context?.opts?.teamId;
  const channelId = context?.opts?.channelId;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!teamId) missingValues.push('teamId');
  if (!channelId) missingValues.push('channelId');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Channel dependent options`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const channelInfo = await client.api(`/teams/${teamId}/channels/${channelId}`).get();

  return channelInfo.membershipType === 'private'
    ? {
        addMembers: {
          required_groups: ['update'],
          get_allowed_values: getTeamsChannelAddableMembersAllowedValues,
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
          get_allowed_values: getTeamsChannelMembersAllowedValues,
          type: 'list',
          required: false,
        },
      }
    : {};
};
