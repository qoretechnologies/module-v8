import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getTeamsChannelMembersAllowedValues: TQoreGetAllowedValuesFunction<
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
      `All of the following ${missingValues.join(', ')} are required to get channel members allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    let response: PageCollection = await client
      .api(`/teams/${teamId}/channels/${channelId}/members`)
      .get();

    while (response.value.length > 0) {
      for (const member of response.value) {
        allowedValues.push({
          display_name: member.displayName || member.email,
          value: member.userId,
          short_desc: `Email: ${member.email || 'No email'}`,
        });
      }

      if (response['@odata.nextLink']) {
        response = await client.api(response['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to get channel members allowed values: ${error.message}`);
  }
};
