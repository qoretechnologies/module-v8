import {
  IQoreAppActionWithFunction,
  IQoreTypeObjectList,
  IQoreTypeObjectNonList,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';

import { configDotenv } from 'dotenv';
import { createGoogleDriveClient } from '../apps/google-drive/helpers/constants';
import {
  AddGoogleSheetsSpreadsheetRows,
  ClearGoogleSheetsSpreadsheetRows,
  CopyGoogleSheetsWorksheet,
  CreateGoogleSheetsSpreadsheet,
  CreateGoogleSheetsSpreadsheetColumn,
  CreateGoogleSheetsWorksheet,
  DeleteGoogleSheetsSpreadsheetRow,
  FindGoogleSheetsSpreadsheetRows,
  FormatGoogleSheetsSpreadsheetRows,
  SearchGoogleSheetsWorksheets,
  UpdateGoogleSheetsSpreadsheetRows,
} from '../apps/google-sheets/actions';
import { createGoogleSheetsClient } from '../apps/google-sheets/helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../apps/google-sheets/helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetHeadersAllowedValues } from '../apps/google-sheets/helpers/get-headers-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../apps/google-sheets/helpers/get-sheet-id-allowed-values';
import { getSheetRowsOptions } from '../apps/google-sheets/helpers/get-sheet-rows-options';
import { createGoogleSheetsRecords } from '../apps/google-sheets/helpers/record-based/create-records';
import { getGoogleSheetsRecordType } from '../apps/google-sheets/helpers/record-based/get-record-type';
import { getGoogleSheetsTableList } from '../apps/google-sheets/helpers/record-based/get-table-list';
import { GoogleSheetsUpdateOptions } from '../apps/google-sheets/helpers/record-based/options';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { deleteGoogleSheetsRecords } from '../apps/google-sheets/helpers/record-based/delete-records';
import { searchGoogleSheetsRecords } from '../apps/google-sheets/helpers/record-based/search-records';
import { updateGoogleSheetsRecords } from '../apps/google-sheets/helpers/record-based/update-records';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Google Sheets', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_INTEGRATIONS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_INTEGRATIONS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_INTEGRATIONS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the GOOGLE_INTEGRATIONS_REFRESH_TOKEN, GOOGLE_INTEGRATIONS_CLIENT_ID, 
        and GOOGLE_INTEGRATIONS_CLIENT_SECRET environment variables.
      `);
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
      const action = ClearGoogleSheetsSpreadsheetRows as IQoreAppActionWithFunction;
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
      const action = SearchGoogleSheetsWorksheets as IQoreAppActionWithFunction;

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
      const action = CopyGoogleSheetsWorksheet as IQoreAppActionWithFunction;
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
      const action = AddGoogleSheetsSpreadsheetRows as IQoreAppActionWithFunction;
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
      const action = CreateGoogleSheetsSpreadsheet as IQoreAppActionWithFunction;

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
      const action = CreateGoogleSheetsSpreadsheet as IQoreAppActionWithFunction;

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
      const action = CreateGoogleSheetsSpreadsheetColumn as IQoreAppActionWithFunction;
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
      const action = CreateGoogleSheetsWorksheet as IQoreAppActionWithFunction;
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
      const action = FindGoogleSheetsSpreadsheetRows as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          limit: 1,
          search: {
            column: 'A',
            type: 'contains',
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
      const action = DeleteGoogleSheetsSpreadsheetRow as IQoreAppActionWithFunction;

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
      const action = FormatGoogleSheetsSpreadsheetRows as IQoreAppActionWithFunction;

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
      const action = UpdateGoogleSheetsSpreadsheetRows as IQoreAppActionWithFunction;

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

  describe('Should test record based helpers', () => {
    const table = 'Shopify Orders and Customers';
    const sheet = '75472539';

    it('Should get tables list', async () => {
      const result = await getGoogleSheetsTableList(base_context);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get sheet id allowed values', async () => {
      const result = await GoogleSheetsUpdateOptions.sheet_id.get_allowed_values({
        ...base_context,
        opts: { spreadsheet_id: spreadsheetId, table },
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get record type', async () => {
      const result = await getGoogleSheetsRecordType(
        {
          ...base_context,
          opts: { sheet_id: sheet },
        },
        table
      );

      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('Should create records', async () => {
      const result = await createGoogleSheetsRecords(
        {
          ...base_context,
          opts: { sheet_id: sheet },
        },
        {
          'First Name': ['Isaac', 'Pam', 'Courtney'],
          'Last Name': ['Newton', 'Anderson', 'Smith'],
        },
        { table }
      );

      expect(result).toBeDefined();
      expect(result['First Name']).toBeDefined();
      expect(Array.isArray(result['First Name'])).toBe(true);
    });

    it('Should update records', async () => {
      const result = await updateGoogleSheetsRecords(
        {
          ...base_context,
          opts: { sheet_id: sheet },
        },
        {
          'First Name': 'Isaac Updated',
        },
        {
          exp: 'row_ids',
          args: [{ value: [8] }],
        },
        { table }
      );

      expect(result).toBe(1);
    });

    it('Should search specific customer rows', async () => {
      const iterator = await searchGoogleSheetsRecords(
        {
          ...base_context,
          opts: { sheet_id: sheet },
        },
        {
          exp: 'row_ids',
          args: [{ value: [2, 3, 4] }],
        },
        { table }
      );

      const result = await iterator(base_context, 100);

      expect(result).toBeDefined();
      expect(result!._rowId).toContain(2);
      expect(result!._rowId).toContain(3);
      expect(result!._rowId).toContain(4);
      expect(result!['First Name']).toBeDefined();
      expect(result!['Last Name']).toBeDefined();
      expect(result!['Email']).toBeDefined();
    });

    it('Should delete records', async () => {
      const result = await deleteGoogleSheetsRecords(
        {
          ...base_context,
          opts: { sheet_id: sheet },
        },
        {
          exp: 'row_ids',
          args: [{ value: [8, 9, 10] }],
        },
        { table }
      );

      expect(result).toBe(3);
    });
  });
});
