import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { createGoogleSheetsClient } from '../helpers/constants';
import { getSheetRowsOptions } from '../helpers/get-sheet-rows-options';
import { sheets_v4 } from '@googleapis/sheets';
import { toColumnLetter } from './constants';

const options = {
  spreadsheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
    on_change: ['refetch'],
  },
  sheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleSheetIdAllowedValues,
    depends_on: ['spreadsheet_id'],
    on_change: ['refetch'],
    get_dependent_options: getSheetRowsOptions,
  },
  insert_at_start: {
    required: false,
    type: 'boolean',
    preselected: true,
    default_value: false,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  rows: {
    required: true,
    type: {
      type: 'list',
      element_type: 'hash',
    },
  },
} satisfies TQoreOptions;

const addSpreadsheetRows = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'add_spreadsheet_rows',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, sheet_id, rows } = getQoreContextRequiredValues<{
      token: string;
      spreadsheet_id: string;
      sheet_id: string;
      rows: Record<string, any>[];
    }>({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id', 'sheet_id', 'rows'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const insert_at_start = obj?.insert_at_start || false;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new GoogleSheetsError('At least one row must be provided');
    }

    try {
      const sheetsClient = createGoogleSheetsClient(token);

      const spreadsheet = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
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
        spreadsheetId: spreadsheet_id,
        range: `${sheetTitle}!1:1`,
      });

      const headers = headerResponse.data.values?.[0] || [];

      if (headers.length === 0) {
        throw new GoogleSheetsError('No headers found in the first row of the sheet');
      }

      const dataResponse = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: spreadsheet_id,
        range: sheetTitle,
      });

      const lastRowIndex = dataResponse.data.values?.length || 1;

      const valuesToAppend = rows.map((row) => {
        return headers.map((header) => row[header] || '');
      });

      let startRowIndex, endRowIndex, response;

      if (insert_at_start) {
        const sheetId = parseInt(sheet_id);

        await sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheet_id,
          requestBody: {
            requests: [
              {
                insertDimension: {
                  range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: 1,
                    endIndex: 1 + rows.length,
                  },
                  inheritFromBefore: false,
                },
              },
            ],
          },
        });

        response = await sheetsClient.spreadsheets.values.update({
          spreadsheetId: spreadsheet_id,
          range: `${sheetTitle}!A2:${toColumnLetter(headers.length)}${1 + rows.length}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: valuesToAppend,
          },
        });

        startRowIndex = 2;
        endRowIndex = 2 + rows.length - 1;
      } else {
        response = await sheetsClient.spreadsheets.values.append({
          spreadsheetId: spreadsheet_id,
          range: `${sheetTitle}!A${lastRowIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: valuesToAppend,
          },
        });
      }

      const updatedRange =
        (response.data as sheets_v4.Schema$AppendValuesResponse).updates?.updatedRange || '';
      const updatedCells =
        (response.data as sheets_v4.Schema$AppendValuesResponse).updates?.updatedCells || 0;

      return {
        success: true,
        spreadsheet_id,
        sheet_id,
        sheet_title: sheetTitle,
        rows_added: rows.length,
        start_row: startRowIndex,
        end_row: endRowIndex,
        updated_range: insert_at_start
          ? `${sheetTitle}!A2:${toColumnLetter(headers.length)}${1 + rows.length}`
          : updatedRange || '',
        updated_cells: insert_at_start ? updatedCells || 0 : headers.length * rows.length,
        insert_at_start,
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to add rows: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      spreadsheet_id: { type: 'string' },
      sheet_id: { type: 'string' },
      sheet_title: { type: 'string' },
      rows_added: { type: 'integer' },
      start_row: { type: 'integer' },
      end_row: { type: 'integer' },
      updated_range: { type: 'string' },
      updated_cells: { type: 'integer' },
    },
  },
});

export default addSpreadsheetRows;
