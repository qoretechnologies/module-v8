import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from './constants';

export const getGoogleDriveFolderIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleDriveError('Authentication token is required to get folders');
  }

  try {
    const driveClient = createGoogleDriveClient(token);

    const queryParams: any = {
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink, owners, parents)',
      orderBy: 'name',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    };

    const response = await driveClient.files.list(queryParams);

    const folders = response.data.files || [];

    if (!folders || folders.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = folders.map((folder) => {
      const owner =
        folder.owners && folder.owners.length > 0
          ? folder.owners[0].displayName || folder.owners[0].emailAddress
          : 'Unknown';

      const modified = folder.modifiedTime
        ? new Date(folder.modifiedTime).toLocaleString()
        : 'Unknown';

      const created = folder.createdTime
        ? new Date(folder.createdTime).toLocaleString()
        : 'Unknown';

      const parentInfo =
        folder.parents && folder.parents.length > 0
          ? `Parent Folder ID: ${folder.parents[0]}\n`
          : '';

      return {
        value: folder.id!,
        display_name: folder.name || 'Unnamed Folder',
        desc: `ID: ${folder.id}\n${parentInfo}Owner: ${owner}\nModified: ${modified}\nCreated: ${created}`,
        ...(folder.webViewLink && { short_desc: `(Link To Folder)[${folder.webViewLink}]` }),
      };
    });

    return allowedValues;
  } catch (error) {
    throw new GoogleDriveError(`Failed to fetch folders: ${error.message || error}`);
  }
};
