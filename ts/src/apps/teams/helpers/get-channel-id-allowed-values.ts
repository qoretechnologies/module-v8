import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Channel } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getTeamsChannelIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const teamId = context?.opts?.teamId;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!teamId) missingValues.push('teamId');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Team channels allowed values`
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
      .api(`/teams/${teamId}/channels`)
      .select('id,displayName,description,membershipType')
      .get();

    while (response.value.length > 0) {
      for (const channel of response.value as Channel[]) {
        allowedValues.push({
          display_name: channel.displayName || 'Unnamed Channel',
          value: channel.id!,
          short_desc:
            `Description: ${channel.description || 'No description'}\n\n` +
            `Type: ${channel.membershipType || 'Standard'}`,
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
    throw new Error(`Failed to get Team channels allowed values: ${error.message}`);
  }
};
