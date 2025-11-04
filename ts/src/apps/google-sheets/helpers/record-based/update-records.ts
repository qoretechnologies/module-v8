import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { GoogleSheetsError } from '../../constants';
import { createGoogleSheetsClient } from '../constants';
import { columnIndexToLetter, extractRowIds, getGoogleSheetsTableIdByName } from './constants';

export const updateGoogleSheetsRecords: TQoreUpdateRecordsFunction = async (
  context,
  fields,
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

    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    });

    const sheets = spreadsheet.data.sheets || [];
    const targetSheet = sheets.find((s) => s.properties?.sheetId?.toString() === sheet_id);

    if (!targetSheet || !targetSheet.properties?.title) {
      throw new GoogleSheetsError(`Sheet with ID ${sheet_id} not found or has no title`);
    }

    const sheetTitle = targetSheet.properties.title;

    const headerResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!1:1`,
    });

    const headers = headerResponse.data.values?.[0] || [];

    if (headers.length === 0) {
      throw new GoogleSheetsError('No headers found in the first row of the sheet');
    }

    const columnsToUpdate: Array<{ columnIndex: number; columnLetter: string; value: any }> = [];

    for (const [fieldName, fieldValue] of Object.entries(fields)) {
      const columnIndex = headers.indexOf(fieldName);

      if (columnIndex === -1) {
        throw new GoogleSheetsError(
          `Field "${fieldName}" not found in sheet headers. Available headers: ${headers.join(', ')}`
        );
      }

      columnsToUpdate.push({
        columnIndex,
        columnLetter: columnIndexToLetter(columnIndex),
        value: fieldValue,
      });
    }

    if (columnsToUpdate.length === 0) {
      throw new GoogleSheetsError('No valid fields to update');
    }

    const updateData: Array<{ range: string; values: any[][] }> = [];

    for (const rowId of rowIds) {
      for (const column of columnsToUpdate) {
        updateData.push({
          range: `${sheetTitle}!${column.columnLetter}${rowId}`,
          values: [[column.value]],
        });
      }
    }

    const batchSize = 100;

    for (let i = 0; i < updateData.length; i += batchSize) {
      const batch = updateData.slice(i, i + batchSize);

      await sheetsClient.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: batch,
        },
      });
    }

    return rowIds.length;
  } catch (error) {
    if (error instanceof GoogleSheetsError) {
      throw error;
    }
    throw new GoogleSheetsError(
      `Failed to update records in spreadsheet ${tableName}: ${error.message || error}`
    );
  }
};
