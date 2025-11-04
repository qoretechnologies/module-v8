import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { GoogleSheetsError } from '../../constants';
import { createGoogleSheetsClient } from '../constants';
import { columnIndexToLetter, extractRowIds, getGoogleSheetsTableIdByName } from './constants';

export const searchGoogleSheetsRecords: TQoreSearchRecordsFunction = async (
  ctx,
  whereConditions,
  opts
) => {
  const { token, sheet_id } = getQoreContextRequiredValues({
    context: ctx,
    optionFields: ['sheet_id'],
    connectionFields: ['token'],
    ErrorClass: GoogleSheetsError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new GoogleSheetsError('Table name is required in opts.table');
  }

  const spreadsheetId = await getGoogleSheetsTableIdByName(token, tableName);

  if (!spreadsheetId) {
    throw new GoogleSheetsError(`Spreadsheet with name ${tableName} not found`);
  }

  try {
    const rowIds = extractRowIds(whereConditions);
    const sheetsClient = createGoogleSheetsClient(token);

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

    const lastColumn = columnIndexToLetter(headers.length - 1);
    const ranges = rowIds.map((rowId) => `${sheetTitle}!A${rowId}:${lastColumn}${rowId}`);

    const batchResponse = await sheetsClient.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
      majorDimension: 'ROWS',
    });

    const allRows: Record<string, any>[] = [];

    batchResponse.data.valueRanges?.forEach((valueRange, index) => {
      const rowId = rowIds[index];
      const values = valueRange.values;

      if (values && values.length > 0) {
        const rowData: Record<string, any> = {
          _rowId: rowId,
        };

        headers.forEach((header, colIndex) => {
          rowData[header] = values[0][colIndex] || '';
        });

        allRows.push(rowData);
      }
    });

    let currentIndex = 0;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (currentIndex >= allRows.length) {
        return null;
      }

      const endIndex = Math.min(currentIndex + blockSize, allRows.length);
      const chunk = allRows.slice(currentIndex, endIndex);

      currentIndex = endIndex;

      if (chunk.length === 0) {
        return null;
      }

      return mapObjectToColumnFormat(chunk);
    };

    return get_records;
  } catch (error) {
    if (error instanceof GoogleSheetsError) {
      throw error;
    }
    throw new GoogleSheetsError(
      `Failed to search records in spreadsheet ${tableName}: ${error.message || error}`
    );
  }
};
