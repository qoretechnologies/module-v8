import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from './constants';

export const getGoogleSheetIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const spreadsheetId = context?.opts?.spreadsheet_id;

  if (!token) {
    throw new GoogleSheetsError('Authentication token is required to get sheet IDs');
  }

  if (!spreadsheetId) {
    throw new GoogleSheetsError('Spreadsheet ID is required to get sheet IDs');
  }

  try {
    const sheetsClient = createGoogleSheetsClient(token);

    const response = await sheetsClient.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    });

    const sheetsData = response.data.sheets || [];

    if (!sheetsData || sheetsData.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = sheetsData.map((sheet) => {
      const properties = sheet.properties || {};
      const sheetId = properties.sheetId?.toString() || '';
      const title = properties.title || 'Unnamed Sheet';

      const index = properties.index;
      const rowCount = properties.gridProperties?.rowCount || 0;
      const columnCount = properties.gridProperties?.columnCount || 0;
      const hidden = properties.hidden ? 'Yes' : 'No';

      return {
        value: sheetId,
        display_name: title,
        desc: `ID: ${sheetId}\nIndex: ${index}\nSize: ${rowCount} rows × ${columnCount} columns\nHidden: ${hidden}`,
      };
    });

    return allowedValues;
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch sheets: ${error.message || error}`);
  }
};
