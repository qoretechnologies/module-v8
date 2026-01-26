import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { GoogleSheetsError } from '../../constants';
import { getGoogleSheetsTableIdByName } from './constants';
import { createGoogleSheetsClient } from '../constants';

export const createGoogleSheetsRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  createOpts
) => {
  const { token, sheet_id } = getQoreContextRequiredValues({
    context,
    optionFields: ['sheet_id'],
    connectionFields: ['token'],
    ErrorClass: GoogleSheetsError,
  });

  const tableName = createOpts?.table;

  if (!tableName) {
    throw new GoogleSheetsError('Table name is required');
  }

  const spreadsheetId = await getGoogleSheetsTableIdByName(token, tableName);

  if (!spreadsheetId) {
    throw new GoogleSheetsError(`Spreadsheet with name ${tableName} not found`);
  }

  try {
    const sheetsClient = createGoogleSheetsClient(token);
    const data = mapColumnFormatToObject(records);

    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    });

    const sheets = spreadsheet.data.sheets || [];
    const targetSheet = sheets.find((s) => s.properties?.sheetId?.toString() === sheet_id);

    if (!targetSheet) {
      throw new GoogleSheetsError(`Sheet with ID ${sheet_id} not found in spreadsheet`);
    }

    const sheetTitle = targetSheet.properties?.title;

    if (!sheetTitle) {
      throw new GoogleSheetsError(`Could not determine sheet title for sheet ID ${sheet_id}`);
    }

    const headerResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!1:1`,
    });

    const headers = headerResponse.data.values?.[0] || [];

    if (headers.length === 0) {
      throw new GoogleSheetsError('No headers found in the first row of the sheet');
    }

    const dataResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: sheetTitle,
    });

    const lastRowIndex = dataResponse.data.values?.length || 1;

    const valuesToAppend = data.map((row) => {
      return headers.map((header) => row[header] || '');
    });

    await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTitle}!A${lastRowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: valuesToAppend,
      },
    });

    return records;
  } catch (error) {
    if (error instanceof GoogleSheetsError) {
      throw error;
    }
    throw new GoogleSheetsError(`Failed to create records: ${error.message || error}`);
  }
};
