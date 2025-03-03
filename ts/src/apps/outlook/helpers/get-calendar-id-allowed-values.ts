import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Calendar } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getOutlookCalendarIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Outlook calendar id allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  let response: PageCollection = await client
    .api('/me/calendars')
    .select('id,name,owner,canShare,canEdit')
    .get();

  while (response.value.length > 0) {
    for (const calendar of response.value as Calendar[]) {
      allowedValues.push({
        display_name: calendar.name!,
        value: calendar.id!,
        short_desc:
          `Owner: ${calendar.owner?.address || 'Unknown'}\n\n` +
          `Can Share: ${calendar.canShare ? 'Yes' : 'No'}\n\n` +
          `Can Edit: ${calendar.canEdit ? 'Yes' : 'No'}\n\n`,
      });
    }
    if (response['@odata.nextLink']) {
      response = await client.api(response['@odata.nextLink']).get();
    } else {
      break;
    }
  }

  return allowedValues;
};
