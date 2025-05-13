import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { createGoogleSheetsClient } from '../helpers/constants';
import { sheets_v4 } from '@googleapis/sheets';

const options = {
  source_spreadsheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
    on_change: ['refetch'],
  },
  source_sheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleSheetIdAllowedValues,
    depends_on: ['source_spreadsheet_id'],
  },
  destination_spreadsheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  new_sheet_name: {
    required: false,
    type: 'string',
  },
  insert_sheet_index: {
    required: false,
    type: 'integer',
  },
} satisfies TQoreOptions;

const copyWorksheet = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'copy_worksheet',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, source_spreadsheet_id, source_sheet_id, destination_spreadsheet_id } =
      getQoreContextRequiredValues<{
        token: string;
        source_spreadsheet_id: string;
        source_sheet_id: string;
        destination_spreadsheet_id: string;
      }>({
        context: { ...context, opts: obj },
        optionFields: ['source_spreadsheet_id', 'source_sheet_id', 'destination_spreadsheet_id'],
        connectionFields: ['token'],
        ErrorClass: GoogleSheetsError,
      });

    const new_sheet_name = obj?.new_sheet_name;
    const insert_sheet_index = obj?.insert_sheet_index;

    try {
      const sheetsClient = createGoogleSheetsClient(token);

      const sourceSpreadsheet = await sheetsClient.spreadsheets.get({
        spreadsheetId: source_spreadsheet_id,
        fields: 'sheets.properties',
      });

      const sourceSheets = sourceSpreadsheet.data.sheets || [];
      const sourceSheet = sourceSheets.find(
        (s) => s.properties?.sheetId?.toString() === source_sheet_id
      );

      if (!sourceSheet) {
        throw new GoogleSheetsError(
          `Sheet with ID ${source_sheet_id} not found in source spreadsheet`
        );
      }

      const sourceSheetTitle = sourceSheet.properties?.title;

      if (!sourceSheetTitle) {
        throw new GoogleSheetsError(
          `Could not determine sheet title for source sheet ID ${source_sheet_id}`
        );
      }

      const copySheetRequest = {
        destinationSpreadsheetId: destination_spreadsheet_id,
      };

      const copyResponse = await sheetsClient.spreadsheets.sheets.copyTo({
        spreadsheetId: source_spreadsheet_id,
        sheetId: parseInt(source_sheet_id),
        requestBody: copySheetRequest,
      });

      const newSheetId = copyResponse.data.sheetId;

      if (!newSheetId) {
        throw new GoogleSheetsError('Failed to get new sheet ID after copy operation');
      }

      const updateRequests: sheets_v4.Schema$Request[] = [];

      if (new_sheet_name) {
        updateRequests.push({
          updateSheetProperties: {
            properties: {
              sheetId: newSheetId,
              title: new_sheet_name,
            },
            fields: 'title',
          },
        });
      }

      if (insert_sheet_index !== undefined) {
        updateRequests.push({
          updateSheetProperties: {
            properties: {
              sheetId: newSheetId,
              index: insert_sheet_index,
            },
            fields: 'index',
          },
        });
      }

      if (updateRequests.length > 0) {
        await sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: destination_spreadsheet_id,
          requestBody: {
            requests: updateRequests,
          },
        });
      }

      const destinationSpreadsheet = await sheetsClient.spreadsheets.get({
        spreadsheetId: destination_spreadsheet_id,
        fields: 'sheets.properties',
      });

      const destinationSheets = destinationSpreadsheet.data.sheets || [];
      const newSheet = destinationSheets.find((s) => s.properties?.sheetId === newSheetId);

      if (!newSheet) {
        throw new GoogleSheetsError(
          `Could not find the newly copied sheet with ID ${newSheetId} in destination spreadsheet`
        );
      }

      const finalSheetTitle =
        newSheet.properties?.title || new_sheet_name || `Copy of ${sourceSheetTitle}`;
      const finalSheetIndex = newSheet.properties?.index ?? null;

      return {
        success: true,
        source_spreadsheet_id,
        source_sheet_id,
        source_sheet_title: sourceSheetTitle,
        destination_spreadsheet_id,
        new_sheet_id: newSheetId.toString(),
        new_sheet_title: finalSheetTitle,
        sheet_index: finalSheetIndex,
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to copy worksheet: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      source_spreadsheet_id: { type: 'string' },
      source_sheet_id: { type: 'string' },
      source_sheet_title: { type: 'string' },
      destination_spreadsheet_id: { type: 'string' },
      new_sheet_id: { type: 'string' },
      new_sheet_title: { type: 'string' },
      sheet_index: { type: 'integer' },
    },
  },
});

export default copyWorksheet;
