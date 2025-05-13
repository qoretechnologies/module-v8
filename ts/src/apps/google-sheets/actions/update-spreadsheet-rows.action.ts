import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { getSheetRowsOptions } from '../helpers/get-sheet-rows-options';
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
    get_dependent_options: async (context) => {
      return await getSheetRowsOptions({
        ...context,
        opts: {
          ...context?.opts,
          add_row_index: true,
        },
      });
    },
  },
} satisfies TQoreOptions;

const additionalOptions = {
  rows: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          row_index: {
            type: 'integer',
            required: true,
            preselected: true,
            display_name: 'Row Index',
            short_desc: 'The index of the row to update (starting from 2, as row 1 is headers)',
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

const updateSpreadsheetRows = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'update_spreadsheet_rows',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, sheet_id, rows } = getQoreContextRequiredValues<{
      token: string;
      spreadsheet_id: string;
      sheet_id: string;
      rows: Array<Record<string, any> & { row_index: number }>;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id', 'sheet_id', 'rows'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new GoogleSheetsError('At least one row must be provided');
    }

    rows.forEach((row, index) => {
      if (!row.row_index || typeof row.row_index !== 'number') {
        throw new GoogleSheetsError(`Row at index ${index} is missing a valid row_index`);
      }
      if (row.row_index < 1) {
        throw new GoogleSheetsError(
          `Row index must be at least 1. Found ${row.row_index} at index ${index}`
        );
      }
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

      const allRows = dataResponse.data.values || [];
      const lastRowIndex = allRows.length;

      const outOfBoundsRows = rows.filter((row) => row.row_index > lastRowIndex);
      if (outOfBoundsRows.length > 0) {
        throw new GoogleSheetsError(
          `Row indices out of bounds:` +
            `${outOfBoundsRows.map((r) => r.row_index).join(', ')}. Sheet only has ${lastRowIndex} rows.`
        );
      }

      const batchUpdateRequests = [];

      for (const row of rows) {
        const { row_index: rowIndex, ...rowData } = row;

        for (const key in rowData) {
          const headerIndex = headers.indexOf(key);

          if (headerIndex === -1) {
            console.warn(`Header "${key}" not found in spreadsheet, skipping this update`);
            continue;
          }

          const columnLetter = toColumnLetter(headerIndex + 1);

          batchUpdateRequests.push({
            range: `${sheetTitle}!${columnLetter}${rowIndex}`,
            values: [[rowData[key]]],
          });
        }
      }

      if (batchUpdateRequests.length === 0) {
        return {
          success: true,
          spreadsheet_id,
          sheet_id,
          sheet_title: sheetTitle,
          rows_updated: 0,
          updated_cells: 0,
          updated_row_indices: rows.map((row) => row.row_index),
          message: 'No valid columns to update were found',
        };
      }

      const response = await sheetsClient.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: batchUpdateRequests,
        },
      });

      const totalUpdatedCells = response.data.totalUpdatedCells || 0;
      const totalUpdatedRows = new Set(rows.map((row) => row.row_index)).size;

      return {
        success: true,
        spreadsheet_id,
        sheet_id,
        sheet_title: sheetTitle,
        rows_updated: totalUpdatedRows,
        updated_cells: totalUpdatedCells,
        updated_row_indices: rows.map((row) => row.row_index),
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to update rows: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      spreadsheet_id: { type: 'string' },
      sheet_id: { type: 'string' },
      sheet_title: { type: 'string' },
      rows_updated: { type: 'integer' },
      updated_cells: { type: 'integer' },
      updated_row_indices: {
        type: {
          type: 'list',
          element_type: 'integer',
        },
      },
      message: { type: 'string' },
    },
  },
});

export default updateSpreadsheetRows;
