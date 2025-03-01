import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { ListItem } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getSharepointItemIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const siteId = context?.conn_opts?.site_id;
  const listId = context?.conn_opts?.list_id;
  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!siteId) missingValues.push('siteId');
  if (!listId) missingValues.push('listId');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get SharePoint list item id allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  let response: PageCollection = await client
    .api(`/sites/${siteId}/lists/${listId}/items?$select=id&$expand=fields($select=Title)`)
    .get();

  while (response.value.length > 0) {
    for (const item of response.value as ListItem[]) {
      allowedValues.push({
        display_name: (item.fields as any).Title ?? `Item ${item.id}`,
        value: item.id!,
        short_desc:
          `Item ID: ${item.id}\n\nURL: [item](${item.webUrl})\n\n` +
          `Description: ${item.description}\n\n`,
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
