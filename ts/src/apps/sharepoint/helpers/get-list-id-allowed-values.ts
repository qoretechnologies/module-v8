import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { List } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getSharepointListIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const siteId = context?.conn_opts?.site_id;
  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!siteId) missingValues.push('siteId');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get SharePoint list list id allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  let response: PageCollection = await client
    .api(`/sites/${siteId}/lists`)
    .select('displayName,id')
    .get();

  while (response.value.length > 0) {
    for (const list of response.value as List[]) {
      allowedValues.push({
        display_name: list.displayName!,
        value: list.id!,
        short_desc: `ID: ${list.id}\n\nDescription: ${list.description}`,
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
