import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreRgbColor,
} from '@qoretechnologies/ts-toolkit';
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
  rows: {
    required: true,
    type: {
      type: 'list',
      element_type: 'number',
    },
  },
  background_color: {
    required: false,
    type: 'rbgcolor',
  },
  text_color: {
    required: false,
    type: 'rbgcolor',
  },
  bold: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  italic: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  strikethrough: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  underline: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  horizontal_alignment: {
    required: false,
    type: 'string',
    allowed_values: [
      { value: 'LEFT', display_name: 'Left' },
      { value: 'CENTER', display_name: 'Center' },
      { value: 'RIGHT', display_name: 'Right' },
    ],
  },
  vertical_alignment: {
    required: false,
    type: 'string',
    allowed_values: [
      { value: 'TOP', display_name: 'Top' },
      { value: 'MIDDLE', display_name: 'Middle' },
      { value: 'BOTTOM', display_name: 'Bottom' },
    ],
  },
  font_size: {
    required: false,
    type: 'number',
    desc: 'Font size in points',
  },
  wrap_text: {
    required: false,
    type: 'boolean',
    default_value: false,
    desc: 'Whether to wrap text in cells',
  },
} satisfies TQoreOptions;

const formatSpreadsheetRows = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'format_spreadsheet_rows',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, sheet_id, rows } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id', 'sheet_id', 'rows'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new GoogleSheetsError('At least one row number must be provided');
    }

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

      const dataResponse = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: spreadsheet_id,
        range: sheetTitle,
      });

      const sheetData = dataResponse.data.values || [];
      const columnCount = Math.max(...sheetData.map((row) => row.length), 1);

      const backgroundColor = obj?.background_color;
      const textColor = obj?.text_color;
      const bold = obj?.bold;
      const italic = obj?.italic;
      const strikethrough = obj?.strikethrough;
      const underline = obj?.underline;
      const horizontalAlignment = obj?.horizontal_alignment;
      const verticalAlignment = obj?.vertical_alignment;
      const fontSize = obj?.font_size;
      const wrapText = obj?.wrap_text;

      const requests = rows
        .map((rowIndex) => {
          const zeroBasedRowIndex = rowIndex - 1;

          const userEnteredFormat: any = {};

          if (backgroundColor) {
            userEnteredFormat.backgroundColor = qoreRgbToGoogleRgb(backgroundColor);
          }

          if (textColor) {
            if (!userEnteredFormat.textFormat) userEnteredFormat.textFormat = {};
            userEnteredFormat.textFormat.foregroundColor = qoreRgbToGoogleRgb(textColor);
          }

          if (bold || italic || strikethrough || underline) {
            if (!userEnteredFormat.textFormat) userEnteredFormat.textFormat = {};
            if (bold) userEnteredFormat.textFormat.bold = true;
            if (italic) userEnteredFormat.textFormat.italic = true;
            if (strikethrough) userEnteredFormat.textFormat.strikethrough = true;
            if (underline) userEnteredFormat.textFormat.underline = true;
          }

          if (horizontalAlignment) {
            userEnteredFormat.horizontalAlignment = horizontalAlignment;
          }

          if (verticalAlignment) {
            userEnteredFormat.verticalAlignment = verticalAlignment;
          }

          if (fontSize) {
            if (!userEnteredFormat.textFormat) userEnteredFormat.textFormat = {};
            userEnteredFormat.textFormat.fontSize = fontSize;
          }

          if (wrapText !== undefined) {
            userEnteredFormat.wrapStrategy = wrapText ? 'WRAP' : 'OVERFLOW_CELL';
          }

          if (Object.keys(userEnteredFormat).length === 0) {
            return null;
          }

          return {
            repeatCell: {
              range: {
                sheetId: parseInt(sheet_id),
                startRowIndex: zeroBasedRowIndex,
                endRowIndex: zeroBasedRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: columnCount,
              },
              cell: {
                userEnteredFormat: userEnteredFormat,
              },
              fields: 'userEnteredFormat(' + Object.keys(userEnteredFormat).join(',') + ')',
            },
          };
        })
        .filter((request) => request !== null);

      if (requests.length === 0) {
        throw new GoogleSheetsError('No formatting options specified');
      }

      const response = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests,
        },
      });

      return {
        success: true,
        spreadsheet_id,
        sheet_id,
        sheet_title: sheetTitle,
        rows_formatted: rows.length,
        rows,
        formatting_applied: {
          background_color: backgroundColor,
          text_color: textColor,
          bold,
          italic,
          strikethrough,
          underline,
          horizontal_alignment: horizontalAlignment,
          vertical_alignment: verticalAlignment,
          font_size: fontSize,
          wrap_text: wrapText,
        },
        response_status: response.status,
      };
    } catch (error) {
      throw new GoogleSheetsError(`Failed to format rows: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      spreadsheet_id: { type: 'string' },
      sheet_id: { type: 'string' },
      sheet_title: { type: 'string' },
      rows_formatted: { type: 'integer' },
      rows: {
        type: {
          type: 'list',
          element_type: 'number',
        },
      },
      formatting_applied: {
        type: {
          type: 'hash',
          fields: {
            background_color: { type: 'string' },
            text_color: { type: 'string' },
            bold: { type: 'boolean' },
            italic: { type: 'boolean' },
            strikethrough: { type: 'boolean' },
            underline: { type: 'boolean' },
            horizontal_alignment: { type: 'string' },
            vertical_alignment: { type: 'string' },
            font_size: { type: 'number' },
            wrap_text: { type: 'boolean' },
          },
        },
      },
      response_status: { type: 'integer' },
    },
  },
});

const qoreRgbToGoogleRgb = (rgbColor: TQoreRgbColor) => {
  return { red: rgbColor.r, green: rgbColor.g, blue: rgbColor.b };
};

export default formatSpreadsheetRows;
