import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';

const options = {
  title: {
    required: true,
    type: 'string',
  },
  source_spreadsheet_id: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  headers: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
} satisfies TQoreOptions;

const createSpreadsheet = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'create_spreadsheet',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, title } = getQoreContextRequiredValues<{
      token: string;
      title: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['title'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const source_spreadsheet_id = obj?.source_spreadsheet_id;
    const headers = obj?.headers;

    try {
      const sheetsClient = createGoogleSheetsClient(token);

      if (source_spreadsheet_id) {
        const driveClient = createGoogleDriveClient(token);
        const copyResponse = await driveClient.files.copy({
          fileId: source_spreadsheet_id,
          requestBody: {
            name: title,
          },
        });

        const newSpreadsheetId = copyResponse.data.id;

        if (!newSpreadsheetId) {
          throw new GoogleSheetsError('Failed to create a copy of the spreadsheet');
        }

        return {
          success: true,
          spreadsheet_id: newSpreadsheetId,
          title,
          source_spreadsheet_id,
          copied: true,
          created_from_scratch: false,
        };
      }

      const createResponse = await sheetsClient.spreadsheets.create({
        requestBody: {
          properties: {
            title: title,
          },
          sheets: [
            {
              properties: {
                title: 'Sheet1',
              },
            },
          ],
        },
      });

      const spreadsheetId = createResponse.data.spreadsheetId;
      const sheetId = createResponse.data.sheets?.[0]?.properties?.sheetId;

      if (headers && headers.length > 0 && spreadsheetId && sheetId) {
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!A1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });

        await sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: headers.length,
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: {
                        bold: true,
                      },
                      backgroundColor: {
                        red: 0.95,
                        green: 0.95,
                        blue: 0.95,
                      },
                    },
                  },
                  fields: 'userEnteredFormat(textFormat,backgroundColor)',
                },
              },
              {
                updateBorders: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: headers.length,
                  },
                  top: {
                    style: 'SOLID',
                    width: 1,
                  },
                  bottom: {
                    style: 'SOLID',
                    width: 1,
                  },
                  left: {
                    style: 'SOLID',
                    width: 1,
                  },
                  right: {
                    style: 'SOLID',
                    width: 1,
                  },
                  innerHorizontal: {
                    style: 'SOLID',
                    width: 1,
                  },
                  innerVertical: {
                    style: 'SOLID',
                    width: 1,
                  },
                },
              },
              {
                autoResizeDimensions: {
                  dimensions: {
                    sheetId,
                    dimension: 'COLUMNS',
                    startIndex: 0,
                    endIndex: headers.length,
                  },
                },
              },
              {
                updateSheetProperties: {
                  properties: {
                    sheetId,
                    gridProperties: {
                      frozenRowCount: 1,
                    },
                  },
                  fields: 'gridProperties.frozenRowCount',
                },
              },
            ],
          },
        });
      }

      return {
        success: true,
        spreadsheet_id: spreadsheetId,
        title,
        sheet_id: sheetId,
        headers: headers || [],
        created_from_scratch: true,
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to create spreadsheet: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      spreadsheet_id: { type: 'string' },
      title: { type: 'string' },
      sheet_id: { type: 'string', desc: 'ID of the first sheet' },
      headers: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        desc: 'Headers added to the spreadsheet (if provided)',
      },
      source_spreadsheet_id: {
        type: 'string',
        desc: 'ID of the source spreadsheet (if copied)',
      },
      copied: {
        type: 'boolean',
        desc: 'Whether the spreadsheet was created by copying an existing one',
      },
      created_from_scratch: {
        type: 'boolean',
        desc: 'Whether the spreadsheet was created from scratch',
      },
    },
  },
});

export default createSpreadsheet;
