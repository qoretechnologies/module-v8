import {
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';
import { createGoogleDriveClient } from '../../../google-drive/helpers/constants';
import { GoogleSheetsError } from '../../constants';

export const getGoogleSheetsTableNameToIdMap = async (
  token: string
): Promise<Record<string, string>> => {
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
      return {};
    }

    const tableNameToIdMap: Record<string, string> = {};

    files.forEach((file) => {
      if (file.name && file.id) {
        tableNameToIdMap[file.name] = file.id;
      }
    });

    return tableNameToIdMap;
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch spreadsheets: ${error.message || error}`);
  }
};

export const getGoogleSheetsTableIdByName = async (
  token: string,
  tableName: string
): Promise<string | null> => {
  const tableNameToIdMap = await getGoogleSheetsTableNameToIdMap(token);
  return tableNameToIdMap[tableName] || null;
};

export const extractRowIds = (where?: TQoreSearchRecordsWhereConditions): number[] => {
  if (!where) {
    throw new GoogleSheetsError(
      'Google Sheets requires row IDs to be specified using the row_ids expression. ' +
        'Example: { exp: "row_ids", args: [{ value: [1, 5, 10] }] }'
    );
  }

  if (where.exp !== 'row_ids') {
    throw new GoogleSheetsError(
      `Unsupported expression "${where.exp}". ` +
        'Google Sheets only supports the "row_ids" expression for filtering. ' +
        'Example: { exp: "row_ids", args: [{ value: [1, 5, 10] }] }'
    );
  }

  if (!where.args || where.args.length === 0) {
    throw new GoogleSheetsError(
      'The row_ids expression requires a list of row numbers as an argument'
    );
  }

  const valueArg = where.args[0] as TQoreSearchRecordsValue;

  if (!valueArg || !('value' in valueArg)) {
    throw new GoogleSheetsError(
      'The row_ids expression argument must be a value containing an array of row numbers'
    );
  }

  const value = valueArg.value;

  if (!Array.isArray(value)) {
    throw new GoogleSheetsError(
      'The row_ids expression requires an array of row numbers. Example: [1, 5, 10, 23]'
    );
  }

  const rowIds = value.filter((id): id is number => typeof id === 'number' && id > 0);

  if (rowIds.length === 0) {
    throw new GoogleSheetsError(
      'The row_ids expression requires at least one valid row number (positive integer)'
    );
  }

  return [...new Set(rowIds)].sort((a, b) => a - b);
};

export const columnIndexToLetter = (index: number): string => {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};
