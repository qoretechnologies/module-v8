import {
  IQoreAppActionWithFunction,
  IQoreTypeObjectList,
  IQoreTypeObjectNonList,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';

import { createGoogleDriveClient } from '../apps/google-drive/helpers/constants';
import {
  addSpreadsheetRows,
  clearSpreadsheetRows,
  copyWorksheet,
  createSpreadsheet,
  createWorksheet,
  findSpreadsheetRows,
  formatSpreadsheetRows,
  searchWorksheets,
  updateSpreadsheetRows,
} from '../apps/google-sheets/actions';
import createSpreadsheetColumn from '../apps/google-sheets/actions/add-spreadsheet-column.action';
import deleteRow from '../apps/google-sheets/actions/delete-spreadsheet-row.action';
import { createGoogleSheetsClient } from '../apps/google-sheets/helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../apps/google-sheets/helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetHeadersAllowedValues } from '../apps/google-sheets/helpers/get-headers-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../apps/google-sheets/helpers/get-sheet-id-allowed-values';
import { getSheetRowsOptions } from '../apps/google-sheets/helpers/get-sheet-rows-options';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

describe('Google Sheets', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_SHEETS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(
        `Please set the` +
          `GOOGLE_SHEETS_REFRESH_TOKEN, GOOGLE_SHEETS_CLIENT_ID, and GOOGLE_SHEETS_CLIENT_SECRET environment variables.`
      );
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  let spreadsheetId: string | undefined;
  let sheetId: string | undefined;
  let createdSheetId: number | undefined;
  let copiedSheetId: number | undefined;
  let createdSpreadsheetId: string | undefined;
  let copiedSpreadsheetId: string | undefined;
  let rowOptions: TQoreOptions | undefined;

  describe('Should test google sheets allowed values', () => {
    it('Should get file values', async () => {
      const allowed_values = await getGoogleDriveFileIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      spreadsheetId = allowed_values[0].value;
    });

    it('Should get spreadsheet values', async () => {
      const allowed_values = await getGoogleSheetIdAllowedValues({
        ...base_context,
        opts: { spreadsheet_id: spreadsheetId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      sheetId = allowed_values[0].value;
    });

    it('Should get header values', async () => {
      const allowed_values = await getGoogleSheetHeadersAllowedValues({
        ...base_context,
        opts: { spreadsheet_id: spreadsheetId, sheet_id: sheetId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get table headers', async () => {
      const headers = await getSheetRowsOptions({
        ...base_context,
        opts: { spreadsheet_id: spreadsheetId, sheet_id: sheetId },
      });

      expect(headers).toBeDefined();
      expect(headers.rows).toBeDefined();
      expect(headers.rows.type).toBeDefined();
      const type = headers.rows.type as IQoreTypeObjectList;
      expect(type.element_type).toBeDefined();
      const elementType = type.element_type as IQoreTypeObjectNonList;
      expect(elementType.fields).toBeDefined();
      rowOptions = elementType.fields as TQoreOptions;
    });
  });

  describe('Should test google sheets actions', () => {
    it('Should clear spreadsheet rows', async () => {
      const action = clearSpreadsheetRows as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          rows: [2, 3, 4],
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should search for worksheets', async () => {
      const action = searchWorksheets as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.worksheets).toBeDefined();
      expect(result.worksheets.length).toBeGreaterThan(0);
    });

    it('Should copy worksheet', async () => {
      const action = copyWorksheet as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          source_spreadsheet_id: spreadsheetId,
          source_sheet_id: sheetId,
          destination_spreadsheet_id: spreadsheetId,
          new_sheet_name: 'Copy of Sheet',
          insert_sheet_index: 0,
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.new_sheet_id).toBeDefined();
      copiedSheetId = result.new_sheet_id;
    });

    it('Should add spreadsheet rows', async () => {
      const action = addSpreadsheetRows as IQoreAppActionWithFunction;
      const rows: Record<string, string> = {};
      if (!rowOptions) {
        throw new Error('Row options are not defined');
      }
      Object.keys(rowOptions).forEach((key) => {
        rows[key] = 'Test';
      });
      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          rows: [rows],
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should create a copy of the spreadsheet', async () => {
      const action = createSpreadsheet as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          title: 'Test Spreadsheet',
          source_spreadsheet_id: spreadsheetId,
          headers: ['hah?', 'ahah!'],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.spreadsheet_id).toBeDefined();

      copiedSpreadsheetId = result.spreadsheet_id;
    });

    it('Should create a spreadsheet with headers', async () => {
      const action = createSpreadsheet as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          title: 'Another Test Spreadsheet',
          headers: ['hah?', 'ahah!'],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.spreadsheet_id).toBeDefined();
      createdSpreadsheetId = result.spreadsheet_id;
    });

    it('Should create a spreadsheet column', async () => {
      const action = createSpreadsheetColumn as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          column_title: 'Test Column',
          column_index: 3,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should create a worksheet', async () => {
      const action = createWorksheet as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          title: 'Test Worksheet',
          overwrite_existing: true,
          headers: ['hah?', 'ahah!'],
          insert_sheet_index: 0,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.sheet_id).toBeDefined();
      createdSheetId = result.sheet_id;
    });

    it('Should search for rows', async () => {
      const action = findSpreadsheetRows as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          limit: 1,
          search: {
            column: 'A',
            value: 'Test',
          },
          response_type: 'mapped-headers',
        },
        undefined,
        base_context
      );
      expect(result).toBeDefined();
      expect(result.rows_found).toBeDefined();
      expect(result.rows_found).toBeGreaterThan(0);
    });

    it('Should delete a row', async () => {
      const action = deleteRow as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          row_index: 2,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should format spreadsheet rows', async () => {
      const action = formatSpreadsheetRows as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          rows: [1, 3],
          background_color: {
            r: 1,
            g: 0,
            b: 0,
            a: 1,
          },
          text_color: {
            r: 0,
            g: 1,
            b: 0,
            a: 1,
          },
          horizontal_alignment: 'CENTER',
          vertical_alignment: 'MIDDLE',
          font_size: 15,
          wrap_text: true,
          bold: true,
          italic: true,
          strikethrough: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should update spreadsheet rows', async () => {
      const action = updateSpreadsheetRows as IQoreAppActionWithFunction;

      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          rows: [
            {
              row_index: 1,
              [Object.keys(rowOptions!).at(-1) as string]: 'Just The Updated value',
              [Object.keys(rowOptions!).at(0) as string]: 'Just The Updated value',
            },
          ],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Clean up', () => {
    it('Should delete copied spreadsheet', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: copiedSpreadsheetId,
      });
    });

    it('Should delete created spreadsheet', async () => {
      const client = createGoogleDriveClient(base_context.conn_opts.token);
      await client.files.delete({
        fileId: createdSpreadsheetId,
      });
    });

    it('Should delete copied worksheet', async () => {
      const client = createGoogleSheetsClient(base_context.conn_opts.token);

      await client.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteSheet: {
                sheetId: copiedSheetId!,
              },
            },
            {
              deleteSheet: {
                sheetId: createdSheetId!,
              },
            },
          ],
        },
      });
    });
  });
});
