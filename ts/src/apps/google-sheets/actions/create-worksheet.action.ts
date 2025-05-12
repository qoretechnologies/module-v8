import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { createGoogleSheetsClient } from '../helpers/constants';
import { sheets_v4 } from '@googleapis/sheets';

const options = {
  spreadsheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  title: {
    required: true,
    type: 'string',
  },
  overwrite_existing: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  headers: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  insert_sheet_index: {
    required: false,
    type: 'integer',
  },
} satisfies TQoreOptions;

const createWorksheet = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'create_worksheet',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, title } = getQoreContextRequiredValues<{
      token: string;
      spreadsheet_id: string;
      title: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id', 'title'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const overwrite_existing = obj?.overwrite_existing ?? false;
    const headers = obj?.headers || [];
    const insert_sheet_index = obj?.insert_sheet_index;

    try {
      const sheetsClient = createGoogleSheetsClient(token);

      const spreadsheet = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.properties',
      });

      const sheets = spreadsheet.data.sheets || [];
      const existingSheet = sheets.find((s) => s.properties?.title === title);

      if (existingSheet && overwrite_existing) {
        await sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheet_id,
          requestBody: {
            requests: [
              {
                deleteSheet: {
                  sheetId: existingSheet.properties!.sheetId!,
                },
              },
            ],
          },
        });
      } else if (existingSheet && !overwrite_existing) {
        throw new GoogleSheetsError(
          `Worksheet with title "${title}" already exists. Set overwrite_existing to true to replace it.`
        );
      }

      const addSheetRequest: sheets_v4.Schema$Request = {
        addSheet: {
          properties: {
            title: title,
            ...(insert_sheet_index !== undefined ? { index: insert_sheet_index } : {}),
          },
        },
      };

      const addSheetResponse = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: [addSheetRequest],
        },
      });

      const newSheetId = addSheetResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;

      if (!newSheetId) {
        throw new GoogleSheetsError('Failed to get new sheet ID after creation');
      }

      if (headers.length > 0) {
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId: spreadsheet_id,
          range: `${title}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });

        await sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheet_id,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: newSheetId,
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
                    },
                  },
                  fields: 'userEnteredFormat.textFormat.bold',
                },
              },
            ],
          },
        });
      }

      const updatedSpreadsheet = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.properties',
      });

      const newSheet = updatedSpreadsheet.data.sheets?.find(
        (s) => s.properties?.sheetId === newSheetId
      );

      if (!newSheet) {
        throw new GoogleSheetsError('Could not find the newly created sheet');
      }

      return {
        success: true,
        spreadsheet_id,
        sheet_id: newSheetId.toString(),
        title,
        headers: headers,
        sheet_index: newSheet.properties?.index ?? 0,
        overwritten: existingSheet ? true : false,
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to create worksheet: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      spreadsheet_id: { type: 'string' },
      sheet_id: { type: 'string' },
      title: { type: 'string' },
      headers: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      sheet_index: { type: 'integer' },
      overwritten: { type: 'boolean' },
    },
  },
});

export default createWorksheet;
