import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { GoogleSheetsError } from '../../constants';
import { createGoogleSheetsClient } from '../constants';
import { extractRowIds, getGoogleSheetsTableIdByName } from './constants';

export const deleteGoogleSheetsRecords: TQoreDeleteRecordsFunction = async (
  context,
  whereConditions,
  opts
) => {
  const { token, sheet_id } = getQoreContextRequiredValues({
    context,
    optionFields: ['sheet_id'],
    connectionFields: ['token'],
    ErrorClass: GoogleSheetsError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new GoogleSheetsError('Table name is required');
  }

  const spreadsheetId = await getGoogleSheetsTableIdByName(token, tableName);

  if (!spreadsheetId) {
    throw new GoogleSheetsError(`Spreadsheet with name ${tableName} not found`);
  }

  try {
    const rowIds = extractRowIds(whereConditions);
    const sheetsClient = createGoogleSheetsClient(token);

    if (rowIds.length === 0) {
      return 0;
    }

    const sortedRowIds = [...rowIds].sort((a, b) => b - a);
    const requests = sortedRowIds.map((rowId) => ({
      deleteDimension: {
        range: {
          sheetId: sheet_id,
          dimension: 'ROWS',
          startIndex: rowId - 1,
          endIndex: rowId,
        },
      },
    }));

    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests,
      },
    });

    return sortedRowIds.length;
  } catch (error) {
    if (error instanceof GoogleSheetsError) {
      throw error;
    }
    throw new GoogleSheetsError(`Failed to delete records: ${(error as Error).message}`);
  }
};
