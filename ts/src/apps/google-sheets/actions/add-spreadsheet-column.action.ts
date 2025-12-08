import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { createGoogleSheetsClient } from '../helpers/constants';
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
  },
  column_title: {
    required: true,
    type: 'string',
  },
  column_index: {
    required: true,
    type: 'integer',
    default_value: 0,
  },
} satisfies TQoreOptions;

const createSpreadsheetColumn = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'create_spreadsheet_column',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, sheet_id, column_title, column_index } =
      getQoreContextRequiredValues<{
        token: string;
        spreadsheet_id: string;
        sheet_id: string;
        column_title: string;
        column_index: number;
      }>({
        context: { ...context, opts: obj },
        optionFields: ['spreadsheet_id', 'sheet_id', 'column_title', 'column_index'],
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

      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: [
            {
              insertDimension: {
                range: {
                  sheetId: parseInt(sheet_id),
                  dimension: 'COLUMNS',
                  startIndex: column_index,
                  endIndex: column_index + 1,
                },
                inheritFromBefore: column_index > 0,
              },
            },
          ],
        },
      });

      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: spreadsheet_id,
        range: `${sheetTitle}!${toColumnLetter(column_index + 1)}1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[column_title]],
        },
      });

      const headerRowFormatResponse = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        ranges: [`${sheetTitle}!1:1`],
        includeGridData: true,
      });

      const headerRowData = headerRowFormatResponse.data.sheets?.[0]?.data?.[0];

      if (headerRowData?.rowData && headerRowData.rowData.length > 0) {
        const sourceColumnIndex = column_index > 0 ? column_index - 1 : 1;
        const sourceCell = headerRowData.rowData[0]?.values?.[sourceColumnIndex];

        if (sourceCell && sourceCell.userEnteredFormat) {
          await sheetsClient.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheet_id,
            requestBody: {
              requests: [
                {
                  repeatCell: {
                    range: {
                      sheetId: parseInt(sheet_id),
                      startRowIndex: 0,
                      endRowIndex: 1,
                      startColumnIndex: column_index,
                      endColumnIndex: column_index + 1,
                    },
                    cell: {
                      userEnteredFormat: sourceCell.userEnteredFormat,
                    },
                    fields: 'userEnteredFormat',
                  },
                },
              ],
            },
          });
        }
      }

      return {
        success: true,
        spreadsheet_id,
        sheet_id,
        sheet_title: sheetTitle,
        column_title,
        column_index,
        column_letter: toColumnLetter(column_index + 1),
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to create column: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      spreadsheet_id: { type: 'string' },
      sheet_id: { type: 'string' },
      sheet_title: { type: 'string' },
      column_title: { type: 'string' },
      column_index: { type: 'integer' },
      column_letter: { type: 'string' },
    },
  },
});

export default createSpreadsheetColumn;
