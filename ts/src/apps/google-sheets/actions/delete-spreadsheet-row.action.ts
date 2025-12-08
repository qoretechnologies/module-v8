import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { createGoogleSheetsClient } from '../helpers/constants';

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
  row_index: {
    required: true,
    type: 'integer',
    default_value: 1,
  },
} satisfies TQoreOptions;

const deleteRow = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'delete_row',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, sheet_id, row_index } = getQoreContextRequiredValues<{
      token: string;
      spreadsheet_id: string;
      sheet_id: string;
      row_index: number;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id', 'sheet_id', 'row_index'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    if (row_index < 1) {
      throw new GoogleSheetsError('Row index must be at least 1');
    }

    try {
      const sheetsClient = createGoogleSheetsClient(token);

      const zeroBasedRowIndex = row_index - 1;

      const deleteRequest = {
        deleteDimension: {
          range: {
            sheetId: parseInt(sheet_id),
            dimension: 'ROWS',
            startIndex: zeroBasedRowIndex,
            endIndex: zeroBasedRowIndex + 1,
          },
        },
      };

      const response = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: [deleteRequest],
        },
      });

      const sheetDetails = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        ranges: [],
        fields: 'sheets.properties',
      });

      const sheet = sheetDetails.data.sheets?.find(
        (s) => s.properties?.sheetId?.toString() === sheet_id
      );

      if (!sheet) {
        throw new GoogleSheetsError(`Could not find sheet with ID ${sheet_id}`);
      }

      const sheetTitle = sheet.properties?.title || '';

      return {
        success: true,
        spreadsheet_id,
        sheet_id,
        sheet_title: sheetTitle,
        deleted_row_index: row_index,
        response_status: response.status,
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to delete row: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      spreadsheet_id: { type: 'string' },
      sheet_id: { type: 'string' },
      sheet_title: { type: 'string' },
      deleted_row_index: { type: 'integer' },
      response_status: { type: 'integer' },
    },
  },
});

export default deleteRow;
