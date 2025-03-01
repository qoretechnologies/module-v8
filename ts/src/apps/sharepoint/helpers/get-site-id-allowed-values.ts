import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Site } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getSharepointSiteIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const missingValues: string[] = [];

  if (!token) missingValues.push('token');

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
    .api('/sites?search=*&$select=displayName,id,name')
    .get();

  while (response.value.length > 0) {
    for (const site of response.value as Site[]) {
      allowedValues.push({ display_name: site.displayName!, value: site.id! });
    }
    if (response['@odata.nextLink']) {
      response = await client.api(response['@odata.nextLink']).get();
    } else {
      break;
    }
  }

  return allowedValues;
};
