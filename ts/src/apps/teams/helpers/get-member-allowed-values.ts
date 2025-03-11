import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getTeamsChannelMembersAllowedValues } from './get-channel-member-allowed-values';

export const getTeamsChannelAddableMembersAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const teamId = context?.opts?.teamId;
  const channelId = context?.opts?.channelId;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!teamId) missingValues.push('teamId');
  if (!channelId) missingValues.push('channelId');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Team members allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    let teamMembersResponse: PageCollection = await client.api(`/teams/${teamId}/members`).get();

    while (teamMembersResponse.value.length > 0) {
      for (const member of teamMembersResponse.value) {
        allowedValues.push({
          display_name: member.displayName || 'Unknown User',
          value: member.userId,
          short_desc: `Email: ${member.mail || 'No email'}`,
        });
      }

      if (teamMembersResponse['@odata.nextLink']) {
        teamMembersResponse = await client.api(teamMembersResponse['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    const channelMembers = await getTeamsChannelMembersAllowedValues({
      conn_opts: { token } as any,
      opts: { teamId, channelId },
    });

    const filteredAllowedValues = allowedValues.filter((member) => {
      return !channelMembers.some((channelMember) => channelMember.value === member.value);
    });

    return filteredAllowedValues;
  } catch (error) {
    throw new Error(`Failed to get Teams members allowed values: ${error.message}`);
  }
};
