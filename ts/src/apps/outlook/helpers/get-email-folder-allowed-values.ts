import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { MailFolder } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getOutlookMailFoldersAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Outlook mail folder allowed values`
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
      .api('/me/mailFolders')
      .select('id,displayName,childFolderCount,totalItemCount,unreadItemCount')
      .top(100)
      .get();

    while (response.value.length > 0) {
      for (const folder of response.value as MailFolder[]) {
        allowedValues.push({
          display_name: folder.displayName || 'Unnamed Folder',
          value: folder.id!,
          short_desc:
            `Total Items: ${folder.totalItemCount || 0}\n` +
            `Unread Items: ${folder.unreadItemCount || 0}\n` +
            `Child Folders: ${folder.childFolderCount || 0}`,
        });

        if (folder.childFolderCount && folder.childFolderCount > 0) {
          try {
            const childFoldersResponse = await client
              .api(`/me/mailFolders/${folder.id}/childFolders`)
              .select('id,displayName,childFolderCount,totalItemCount,unreadItemCount')
              .top(100)
              .get();

            for (const childFolder of childFoldersResponse.value as MailFolder[]) {
              allowedValues.push({
                display_name: `↳ ${childFolder.displayName || 'Unnamed Folder'}`,
                value: childFolder.id!,
                short_desc:
                  `Parent: ${folder.displayName}\n` +
                  `Total Items: ${childFolder.totalItemCount || 0}\n` +
                  `Unread Items: ${childFolder.unreadItemCount || 0}\n` +
                  `Child Folders: ${childFolder.childFolderCount || 0}`,
              });
            }
          } catch (error) {
            console.error(
              `Failed to fetch child folders for ${folder.displayName}: ${error.message}`
            );
          }
        }
      }

      if (response['@odata.nextLink']) {
        response = await client.api(response['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    allowedValues.unshift({
      display_name: 'All Folders',
      value: 'all',
      short_desc: 'Search across all mail folders',
    });

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to fetch Outlook mail folders: ${error.message}`);
  }
};
