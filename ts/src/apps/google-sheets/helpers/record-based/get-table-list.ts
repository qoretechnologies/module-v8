import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { createGoogleDriveClient } from '../../../google-drive/helpers/constants';
import { GoogleSheetsError } from '../../constants';

export const getGoogleSheetsTableList: TQoreGetTableListFunction = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: GoogleSheetsError,
  });

  try {
    const driveClient = createGoogleDriveClient(token);

    const response = await driveClient.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink, owners)',
      orderBy: 'modifiedTime desc',
      pageSize: 1000,
    });

    const files = response.data.files || [];

    if (!files.length) {
      return [];
    }

    const tables = files.map((file) => file.name || 'File ID: ' + file.id);

    return tables;
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch spreadsheets: ${error.message || error}`);
  }
};
