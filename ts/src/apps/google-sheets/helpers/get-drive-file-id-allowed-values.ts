import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleSheetsError } from '../constants';

import { createDriveClient } from './constants';

export const getGoogleDriveFileIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleSheetsError('Authentication token is required to get spreadsheet files');
  }

  try {
    const driveClient = await createDriveClient(token);

    const response = await driveClient.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink, owners)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    const files = response.data.files || [];

    if (!files || files.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = files.map((file) => {
      const owner =
        file.owners && file.owners.length > 0
          ? file.owners[0].displayName || file.owners[0].emailAddress
          : 'Unknown';

      const modified = file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : 'Unknown';

      const created = file.createdTime ? new Date(file.createdTime).toLocaleString() : 'Unknown';

      return {
        value: file.id!,
        display_name: file.name || 'Unnamed Spreadsheet',
        desc: `ID: ${file.id}\nOwner: ${owner}\nModified: ${modified}\nCreated: ${created}`,
        ...(file.webViewLink && { short_desc: file.webViewLink }),
      };
    });

    return allowedValues;
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch spreadsheets: ${error.message || error}`);
  }
};
