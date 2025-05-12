import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';

const GoogleSheetsNewSheetTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'new_spreadsheet_sheet',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    spreadsheet_id: {
      type: 'string',
      required: true,
      get_allowed_values: getGoogleDriveFileIdAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { spreadsheet_id, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['spreadsheet_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const getItems = () => {
      return fetchLatestSheets(token, spreadsheet_id);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_sheets_new_spreadsheet_sheet',
      uniqueField: 'sheetId',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { spreadsheet_id, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['spreadsheet_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const sheets = await fetchLatestSheets(token, spreadsheet_id);

    return sheets?.length > 0 ? sheets[0] : null;
  },
  event_info: {
    desc: 'Google Sheets New Sheet Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        sheetId: { type: 'string' },
        title: { type: 'string' },
        index: { type: 'number' },
        rowCount: { type: 'number' },
        columnCount: { type: 'number' },
        timestamp: { type: 'string' },
      },
    },
  },
});

export default GoogleSheetsNewSheetTrigger;

const fetchLatestSheets = async (token: string, spreadsheetId: string) => {
  try {
    const sheetsClient = createGoogleSheetsClient(token);

    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    });

    const sheets = spreadsheet.data.sheets || [];

    return sheets.map((sheet) => {
      const properties = sheet.properties || {};

      return {
        sheetId: properties.sheetId?.toString() || '',
        title: properties.title || '',
        index: properties.index || 0,
        rowCount: properties.gridProperties?.rowCount || 0,
        columnCount: properties.gridProperties?.columnCount || 0,
        timestamp: new Date().toISOString(),
      };
    });
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch sheets: ${error.message || error}`);
  }
};
