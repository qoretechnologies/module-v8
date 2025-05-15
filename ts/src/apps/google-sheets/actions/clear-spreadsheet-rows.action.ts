import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { createGoogleSheetsClient } from '../helpers/constants';
import { sheets_v4 } from '@googleapis/sheets';

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
  },
  rows: {
    required: true,
    type: {
      type: 'list',
      element_type: 'integer',
    },
    desc: 'List of row indices to clear (1-based, as seen in the spreadsheet)',
  },
} satisfies TQoreOptions;

const clearSpreadsheetRows = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'clear_spreadsheet_rows',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, sheet_id, rows } = getQoreContextRequiredValues<{
      token: string;
      rows: number[];
      spreadsheet_id: string;
      sheet_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id', 'sheet_id', 'rows'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

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

      const clearRequests: sheets_v4.Schema$Request[] = rows.map((rowIndex) => {
        const zeroBasedRowIndex = rowIndex - 1;

        return {
          updateCells: {
            range: {
              sheetId: parseInt(sheet_id),
              startRowIndex: zeroBasedRowIndex,
              endRowIndex: zeroBasedRowIndex + 1,
            },
            fields: 'userEnteredValue',
          },
        };
      });

      const response = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: clearRequests,
        },
      });

      const result = {
        success: true,
        spreadsheet_id: spreadsheet_id,
        sheet_id: sheet_id,
        sheet_title: sheetTitle,
        cleared_rows: rows,
        response: response.data,
      };

      return result;
    } catch (error) {
      throw new GoogleSheetsError(`Failed to clear rows: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      spreadsheet_id: { type: 'string' },
      sheet_id: { type: 'string' },
      sheet_title: { type: 'string' },
      cleared_rows: {
        type: {
          type: 'list',
          element_type: 'integer',
        },
      },
      response: { type: 'any' },
    },
  },
});

export default clearSpreadsheetRows;
