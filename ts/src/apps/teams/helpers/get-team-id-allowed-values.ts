import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Team } from '@microsoft/microsoft-graph-types';
import {
  TQoreGetAllowedValuesFunction,
  TCustomConnOptions,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';

export const getTeamsTeamIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get Teams allowed values');
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    let response: PageCollection = await client
      .api('/me/joinedTeams')
      .select('id,displayName,description,visibility')
      .get();

    while (response.value.length > 0) {
      for (const team of response.value as Team[]) {
        allowedValues.push({
          display_name: team.displayName || 'Unnamed Team',
          value: team.id!,
          short_desc:
            `Description: ${team.description || 'No description'}\n\n` +
            `Visibility: ${team.visibility || 'Unknown'}`,
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
    throw new Error(`Failed to get Teams allowed values: ${error.message}`);
  }
};
