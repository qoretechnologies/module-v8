import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from '../helpers/constants';

const GoogleSheetsNewSpreadsheetTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'new_spreadsheet',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const getItems = () => {
      return fetchLatestSpreadsheets(token);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_sheets_new_spreadsheet',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const spreadsheets = await fetchLatestSpreadsheets(token);

    return spreadsheets?.length > 0 ? spreadsheets[0] : null;
  },
  event_info: {
    desc: 'Google Sheets New Spreadsheet Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        url: { type: 'string' },
        createdTime: { type: 'string' },
        modifiedTime: { type: 'string' },
        owners: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                displayName: { type: 'string' },
                emailAddress: { type: 'string' },
              },
            },
          },
        },
        sheetCount: { type: 'number' },
      },
    },
  },
});

export default GoogleSheetsNewSpreadsheetTrigger;

const fetchLatestSpreadsheets = async (token: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  try {
    const driveClient = createGoogleDriveClient(token);
    const sheetsClient = createGoogleSheetsClient(token);

    const response = await driveClient.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize: limit,
      fields: 'files(id, name, webViewLink, createdTime, modifiedTime, owners)',
      orderBy: 'createdTime desc',
    });

    const files = response.data.files || [];

    const spreadsheets = await Promise.all(
      files.map(async (file) => {
        try {
          const spreadsheetData = await sheetsClient.spreadsheets.get({
            spreadsheetId: file.id || '',
            fields: 'sheets.properties',
          });

          const sheetCount = spreadsheetData.data.sheets?.length || 0;

          return {
            id: file.id || '',
            name: file.name || '',
            url: file.webViewLink || '',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
            owners: (file.owners || []).map((owner) => ({
              displayName: owner.displayName || '',
              emailAddress: owner.emailAddress || '',
            })),
            sheetCount,
          };
        } catch (error) {
          return {
            id: file.id || '',
            name: file.name || '',
            url: file.webViewLink || '',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
            owners: (file.owners || []).map((owner) => ({
              displayName: owner.displayName || '',
              emailAddress: owner.emailAddress || '',
            })),
            sheetCount: 0,
          };
        }
      })
    );

    return spreadsheets;
  } catch (error) {
    throw new GoogleSheetsError(`Failed to fetch spreadsheets: ${error.message || error}`);
  }
};
