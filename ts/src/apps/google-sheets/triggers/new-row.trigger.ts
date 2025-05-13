import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { createGoogleSheetsClient } from '../helpers/constants';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { toColumnLetter } from '../actions/constants';

const GoogleSheetsNewRowTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'new_spreadsheet_row',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    spreadsheet_id: {
      type: 'string',
      required: true,
      on_change: ['refetch'],
      get_allowed_values: getGoogleDriveFileIdAllowedValues,
    },
    sheet_id: {
      type: 'string',
      required: true,
      depends_on: ['spreadsheet_id'],
      on_change: ['refetch'],
      get_allowed_values: getGoogleSheetIdAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { sheet_id, spreadsheet_id, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['spreadsheet_id', 'sheet_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const getItems = () => {
      return fetchLatestRows(token, spreadsheet_id, sheet_id);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_sheets_new_spreadsheet_row',
      uniqueField: 'row_index',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { sheet_id, spreadsheet_id, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['spreadsheet_id', 'sheet_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const rows = await fetchLatestRows(token, spreadsheet_id, sheet_id);

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'Google Sheets New Spreadsheet Row Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        rowId: { type: 'string' },
        values: {
          type: 'hash',
        },
        rowNumber: { type: 'number' },
        sheetName: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  },
});

export default GoogleSheetsNewRowTrigger;

const fetchLatestRows = async (token: string, spreadsheetId: string, sheetId: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  try {
    const sheetsClient = createGoogleSheetsClient(token);

    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    });

    const sheets = spreadsheet.data.sheets || [];
    const targetSheet = sheets.find((s) => s.properties?.sheetId?.toString() === sheetId);
    if (!targetSheet) {
      throw new GoogleSheetsError(`Sheet with ID ${sheetId} not found in spreadsheet`);
    }

    const sheetTitle = targetSheet.properties?.title;
    if (!sheetTitle) {
      throw new GoogleSheetsError(`Sheet title not found for sheet ID ${sheetId}`);
    }

    const headersResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetTitle}'!A1:Z1`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const headers = headersResponse.data.values?.[0] || [];
    if (headers.length === 0) {
      return [];
    }

    const lastColumn = toColumnLetter(headers.length - 1);

    const countResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetTitle}'!A:A`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const actualRowCount = countResponse.data.values?.length || 0;

    if (actualRowCount <= 1) {
      return [];
    }

    const startRowForLatest = Math.max(1, Math.min(actualRowCount - limit, actualRowCount - 1));

    const dataResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetTitle}'!A${startRowForLatest + 1}:${lastColumn}${actualRowCount}`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const latestRows = dataResponse.data.values || [];

    return latestRows.map((row, index) => {
      const mappedRow: Record<string, any> = {
        row_index: startRowForLatest + index + 1,
      };
      headers.forEach((header, colIndex) => {
        if (header) {
          mappedRow[header] = colIndex < row.length ? row[colIndex] : '';
        }
      });

      return mappedRow;
    });
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch latest rows: ${error.message || error}`);
  }
};
