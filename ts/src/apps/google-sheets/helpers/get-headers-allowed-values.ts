import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from './constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';

export const getGoogleSheetHeadersAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { sheet_id, spreadsheet_id, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['spreadsheet_id', 'sheet_id'],
  });

  try {
    const sheetsClient = createGoogleSheetsClient(token);

    const sheetResponse = await sheetsClient.spreadsheets.get({
      spreadsheetId: spreadsheet_id,
      fields: 'sheets.properties',
    });

    const sheets = sheetResponse.data.sheets || [];
    const targetSheet = sheets.find((s) => s.properties?.sheetId?.toString() === sheet_id);

    if (!targetSheet) {
      throw new GoogleSheetsError(`Sheet with ID ${sheet_id} not found in spreadsheet`);
    }

    const sheetTitle = targetSheet.properties?.title;

    if (!sheetTitle) {
      throw new GoogleSheetsError(`Could not determine sheet title for sheet ID ${sheet_id}`);
    }

    const headersResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: spreadsheet_id,
      range: `${sheetTitle}!1:1`,
    });

    const headers = headersResponse.data.values?.[0] || [];

    if (headers.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = headers
      .filter((header) => !!header)
      .map((header, index) => {
        const columnLetter = indexToColumnLetter(index);

        return {
          value: header,
          display_name: header,
          desc: `Column: ${columnLetter}\nPosition: ${index + 1}`,
        };
      })
      .filter(Boolean);

    return allowedValues;
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch sheet headers: ${error.message || error}`);
  }
};

const indexToColumnLetter = (index: number) => {
  let letter = '';
  let tempIndex = index;

  while (tempIndex >= 0) {
    letter = String.fromCharCode(65 + (tempIndex % 26)) + letter;
    tempIndex = Math.floor(tempIndex / 26) - 1;
  }

  return letter;
};
