import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Drive } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getSharepointDriveIdAllowedValues: TQoreGetAllowedValuesFunction<
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
      `All of the following ${missingValues.join(', ')} are required to get SharePoint drive id allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  let response: PageCollection = await client
    .api(`/sites/${siteId}/drives`)
    .select('id,name')
    .get();

  while (response.value.length > 0) {
    for (const drive of response.value as Drive[]) {
      allowedValues.push({
        display_name: drive.name!,
        value: drive.id!,
        short_desc:
          `Owner: ${drive.owner}\n\nDrive type: ${drive.driveType}\n\n` +
          `[Drive URL](${drive.webUrl})\n\n`,
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
