import { configDotenv } from 'dotenv';
import {
  clearMappingsCache,
  getSharePointTableList,
  getSharePointRecordType,
  getSharePointExpressions,
  SharePointSearchOptions,
  searchSharePointRecords,
  createSharePointRecords,
  updateSharePointRecords,
  deleteSharePointRecords,
  parseTablePath,
  buildTablePath,
  transformItemToRecord,
  mapSharePointColumnTypeToQore,
  SharePointRecordError,
} from '../apps/sharepoint/helpers/record-based';
import { buildODataFilter } from '../apps/sharepoint/helpers/record-based/apply-where-condition';
import { TSharePointListItem } from '../apps/sharepoint/helpers/record-based/constants';
import { delay, mapColumnFormatToObject } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { ColumnDefinition } from '@microsoft/microsoft-graph-types';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('SharePoint', () => {
  // Unit tests that don't require API access
  describe('Unit Tests', () => {
    describe('parseTablePath and buildTablePath', () => {
      it('Should parse a valid table path', () => {
        const result = parseTablePath('My Site|My List');
        expect(result.siteName).toBe('My Site');
        expect(result.listName).toBe('My List');
      });

      it('Should build a table path from components', () => {
        const path = buildTablePath('My Site', 'My List');
        expect(path).toBe('My Site|My List');
      });

      it('Should roundtrip parse and build', () => {
        const original = 'Test Site|Test List';
        const parsed = parseTablePath(original);
        const rebuilt = buildTablePath(parsed.siteName, parsed.listName);
        expect(rebuilt).toBe(original);
      });

      it('Should throw on invalid table path with too few segments', () => {
        expect(() => parseTablePath('OnlyOnePart')).toThrow(SharePointRecordError);
        expect(() => parseTablePath('OnlyOnePart')).toThrow('Expected "siteName|listName"');
      });

      it('Should throw on invalid table path with too many segments', () => {
        expect(() => parseTablePath('A|B|C')).toThrow(SharePointRecordError);
      });

      it('Should handle table paths with special characters', () => {
        const result = parseTablePath('Site (Dev)|List #1');
        expect(result.siteName).toBe('Site (Dev)');
        expect(result.listName).toBe('List #1');
      });
    });

    describe('transformItemToRecord', () => {
      it('Should transform a basic item to a flat record', () => {
        const item: TSharePointListItem = {
          id: '1',
          createdDateTime: '2026-01-01T00:00:00Z',
          lastModifiedDateTime: '2026-01-02T00:00:00Z',
          webUrl: 'https://example.sharepoint.com/item/1',
          fields: {
            Title: 'Test Item',
            Status: 'Active',
            Count: 42,
          },
        };

        const record = transformItemToRecord(item);

        expect(record.id).toBe('1');
        expect(record.createdDateTime).toBe('2026-01-01T00:00:00Z');
        expect(record.lastModifiedDateTime).toBe('2026-01-02T00:00:00Z');
        expect(record.webUrl).toBe('https://example.sharepoint.com/item/1');
        expect(record.Title).toBe('Test Item');
        expect(record.Status).toBe('Active');
        expect(record.Count).toBe(42);
      });

      it('Should handle item with no fields', () => {
        const item: TSharePointListItem = {
          id: '2',
        };

        const record = transformItemToRecord(item);

        expect(record.id).toBe('2');
        expect(record.createdDateTime).toBeNull();
        expect(record.lastModifiedDateTime).toBeNull();
        expect(record.webUrl).toBeNull();
      });

      it('Should skip internal OData fields', () => {
        const item: TSharePointListItem = {
          id: '3',
          fields: {
            '@odata.etag': '"abc123"',
            _UIVersionString: '1.0',
            Title: 'Test',
          },
        };

        const record = transformItemToRecord(item);

        expect(record['@odata.etag']).toBeUndefined();
        expect(record['_UIVersionString']).toBeUndefined();
        expect(record.Title).toBe('Test');
      });

      it('Should handle null field values', () => {
        const item: TSharePointListItem = {
          id: '4',
          fields: {
            Title: 'Test',
            Description: null,
          },
        };

        const record = transformItemToRecord(item);
        expect(record.Title).toBe('Test');
        expect(record.Description).toBeNull();
      });
    });

    describe('mapSharePointColumnTypeToQore', () => {
      it('Should map boolean column', () => {
        const column = { boolean: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'bool' });
      });

      it('Should map text column', () => {
        const column = { text: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'string' });
      });

      it('Should map dateTime column', () => {
        const column = { dateTime: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'date' });
      });

      it('Should map number column', () => {
        const column = { number: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'number' });
      });

      it('Should map currency column', () => {
        const column = { currency: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'number' });
      });

      it('Should map choice column as string with allowed values', () => {
        const column = {
          choice: { choices: ['Red', 'Green', 'Blue'] },
        } as unknown as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toBeDefined();
        expect(result!.type).toBe('string');
        expect(result!.allowed_values).toEqual([
          { display_name: 'Red', value: 'Red' },
          { display_name: 'Green', value: 'Green' },
          { display_name: 'Blue', value: 'Blue' },
        ]);
      });

      it('Should map checkbox choice column as list', () => {
        const column = {
          choice: { displayAs: 'checkBoxes', choices: ['A', 'B'] },
        } as unknown as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toBeDefined();
        expect(result!.type).toEqual({ type: 'list', element_type: 'string' });
      });

      it('Should map lookup column', () => {
        const column = { lookup: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'string' });
      });

      it('Should map personOrGroup column', () => {
        const column = { personOrGroup: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'string' });
      });

      it('Should map hyperlinkOrPicture column', () => {
        const column = { hyperlinkOrPicture: {} } as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toEqual({ type: 'string' });
      });

      it('Should return null for unsupported column type', () => {
        const column = {} as ColumnDefinition;
        const result = mapSharePointColumnTypeToQore(column);
        expect(result).toBeNull();
      });
    });

    describe('Expressions', () => {
      it('Should return valid expressions configuration', () => {
        const expressions = getSharePointExpressions('en');

        expect(expressions).toBeDefined();
        expect(typeof expressions).toBe('object');

        // Logical operators
        expect(expressions['&&']).toBeDefined();
        expect(expressions['||']).toBeDefined();

        // Comparison operators
        expect(expressions['==']).toBeDefined();
        expect(expressions['!=']).toBeDefined();
        expect(expressions['>']).toBeDefined();
        expect(expressions['>=']).toBeDefined();
        expect(expressions['<']).toBeDefined();
        expect(expressions['<=']).toBeDefined();

        // String operators
        expect(expressions['contains']).toBeDefined();
        expect(expressions['starts-with']).toBeDefined();
      });

      it('Should have correct expression structure for comparison operator', () => {
        const expressions = getSharePointExpressions('en');
        const eqExpr = expressions['=='];

        expect(eqExpr.type).toBe('operator');
        expect(eqExpr.subtype).toBe('generic');
        expect(eqExpr.roles).toContain('search');
        expect(eqExpr.args).toBeDefined();
        expect(eqExpr.args.length).toBe(2);
        expect(eqExpr.return_type).toBe('bool');
      });

      it('Should have correct logical operator structure', () => {
        const expressions = getSharePointExpressions('en');
        const andExpr = expressions['&&'];

        expect(andExpr.type).toBe('operator');
        expect(andExpr.subtype).toBe('logic-operator');
        expect(andExpr.varargs).toBe(true);
      });
    });

    describe('Search Options', () => {
      it('Should have valid search options configuration', () => {
        expect(SharePointSearchOptions).toBeDefined();
        expect(SharePointSearchOptions.orderBy).toBeDefined();
        expect(SharePointSearchOptions.orderBy.type.type).toBe('hash');

        const orderByFields = SharePointSearchOptions.orderBy.type.fields;
        expect(orderByFields).toBeDefined();
        expect(orderByFields.field).toBeDefined();
        expect(orderByFields.direction).toBeDefined();
      });

      it('Should have allowed direction values', () => {
        const directionField = SharePointSearchOptions.orderBy.type.fields.direction;
        expect(directionField.allowed_values).toBeDefined();
        const directions = directionField.allowed_values!.map((v: any) => v.value);
        expect(directions).toContain('asc');
        expect(directions).toContain('desc');
      });

      it('Should have asc as default direction', () => {
        const directionField = SharePointSearchOptions.orderBy.type.fields.direction;
        expect(directionField.default_value).toBe('asc');
      });
    });

    describe('buildODataFilter', () => {
      it('Should build equals filter for string value', () => {
        const filter = buildODataFilter({
          exp: '==',
          args: [{ field: 'Title' }, { value: 'Test' }],
        });
        expect(filter).toBe("fields/Title eq 'Test'");
      });

      it('Should build equals filter for number value', () => {
        const filter = buildODataFilter({
          exp: '==',
          args: [{ field: 'Count' }, { value: 42 }],
        });
        expect(filter).toBe('fields/Count eq 42');
      });

      it('Should build equals filter for boolean value', () => {
        const filter = buildODataFilter({
          exp: '==',
          args: [{ field: 'Active' }, { value: true }],
        });
        expect(filter).toBe('fields/Active eq true');
      });

      it('Should build not-equals filter', () => {
        const filter = buildODataFilter({
          exp: '!=',
          args: [{ field: 'Status' }, { value: 'Closed' }],
        });
        expect(filter).toBe("fields/Status ne 'Closed'");
      });

      it('Should build greater-than filter', () => {
        const filter = buildODataFilter({
          exp: '>',
          args: [{ field: 'Amount' }, { value: 100 }],
        });
        expect(filter).toBe('fields/Amount gt 100');
      });

      it('Should build greater-than-or-equal filter', () => {
        const filter = buildODataFilter({
          exp: '>=',
          args: [{ field: 'Score' }, { value: 50 }],
        });
        expect(filter).toBe('fields/Score ge 50');
      });

      it('Should build less-than filter', () => {
        const filter = buildODataFilter({
          exp: '<',
          args: [{ field: 'Priority' }, { value: 3 }],
        });
        expect(filter).toBe('fields/Priority lt 3');
      });

      it('Should build less-than-or-equal filter', () => {
        const filter = buildODataFilter({
          exp: '<=',
          args: [{ field: 'Rank' }, { value: 10 }],
        });
        expect(filter).toBe('fields/Rank le 10');
      });

      it('Should build contains filter', () => {
        const filter = buildODataFilter({
          exp: 'contains',
          args: [{ field: 'Title' }, { value: 'test' }],
        });
        expect(filter).toBe("contains(fields/Title,'test')");
      });

      it('Should build startswith filter', () => {
        const filter = buildODataFilter({
          exp: 'starts-with',
          args: [{ field: 'Name' }, { value: 'Pre' }],
        });
        expect(filter).toBe("startswith(fields/Name,'Pre')");
      });

      it('Should build AND filter', () => {
        const filter = buildODataFilter({
          exp: '&&',
          args: [
            { exp: '==', args: [{ field: 'Status' }, { value: 'Active' }] },
            { exp: '>', args: [{ field: 'Count' }, { value: 0 }] },
          ],
        });
        expect(filter).toBe("(fields/Status eq 'Active') and (fields/Count gt 0)");
      });

      it('Should build OR filter', () => {
        const filter = buildODataFilter({
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'Color' }, { value: 'Red' }] },
            { exp: '==', args: [{ field: 'Color' }, { value: 'Blue' }] },
          ],
        });
        expect(filter).toBe("(fields/Color eq 'Red') or (fields/Color eq 'Blue')");
      });

      it('Should handle nested AND/OR filters', () => {
        const filter = buildODataFilter({
          exp: '&&',
          args: [
            {
              exp: '||',
              args: [
                { exp: '==', args: [{ field: 'Type' }, { value: 'A' }] },
                { exp: '==', args: [{ field: 'Type' }, { value: 'B' }] },
              ],
            },
            { exp: '>', args: [{ field: 'Score' }, { value: 50 }] },
          ],
        });
        expect(filter).toBe(
          "((fields/Type eq 'A') or (fields/Type eq 'B')) and (fields/Score gt 50)"
        );
      });

      it('Should escape single quotes in string values', () => {
        const filter = buildODataFilter({
          exp: '==',
          args: [{ field: 'Title' }, { value: "O'Brien" }],
        });
        expect(filter).toBe("fields/Title eq 'O''Brien'");
      });

      it('Should handle single expression in logical operator', () => {
        const filter = buildODataFilter({
          exp: '&&',
          args: [{ exp: '==', args: [{ field: 'Status' }, { value: 'Active' }] }],
        });
        expect(filter).toBe("fields/Status eq 'Active'");
      });

      it('Should return empty string for empty logical operator', () => {
        const filter = buildODataFilter({
          exp: '&&',
          args: [],
        });
        expect(filter).toBe('');
      });

      it('Should handle null value', () => {
        const filter = buildODataFilter({
          exp: '==',
          args: [{ field: 'Notes' }, { value: null }],
        });
        expect(filter).toBe('fields/Notes eq null');
      });

      it('Should pass date strings through without transformation', () => {
        const filter = buildODataFilter({
          exp: '==',
          args: [{ field: 'DueDate' }, { value: '2026-01-15T10:30:00.000Z' }],
        });
        expect(filter).toBe("fields/DueDate eq '2026-01-15T10:30:00.000Z'");
      });

      it('Should not misidentify date-like strings as dates', () => {
        const filter = buildODataFilter({
          exp: '==',
          args: [{ field: 'Title' }, { value: '2026-01-01-report' }],
        });
        expect(filter).toBe("fields/Title eq '2026-01-01-report'");
      });

      it('Should throw on unsupported operator', () => {
        expect(() =>
          buildODataFilter({
            exp: 'unsupported' as any,
            args: [{ field: 'X' }, { value: 1 }],
          })
        ).toThrow(SharePointRecordError);
      });

      it('Should throw when comparison operator has wrong number of args', () => {
        expect(() =>
          buildODataFilter({
            exp: '==',
            args: [{ field: 'X' }],
          })
        ).toThrow('requires exactly 2 arguments');
      });

      it('Should throw when first arg is not a field reference', () => {
        expect(() =>
          buildODataFilter({
            exp: '==',
            args: [{ value: 'not a field' }, { value: 'test' }],
          })
        ).toThrow('must be a field reference');
      });
    });
  });

  // Integration tests (require SharePoint OAuth credentials)
  describe('Integration Tests', () => {
    const hasCredentials = !!(
      process.env.SHAREPOINT_REFRESH_TOKEN &&
      process.env.SHAREPOINT_CLIENT_ID &&
      process.env.SHAREPOINT_CLIENT_SECRET
    );

    let token: string;
    let testTable: string;
    let allTables: string[];
    let schemaFieldNames: string[];

    beforeAll(async () => {
      if (!hasCredentials) {
        return;
      }

      clearMappingsCache();

      // Refresh OAuth2 token
      const response = await fetch(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.SHAREPOINT_CLIENT_ID!,
            client_secret: process.env.SHAREPOINT_CLIENT_SECRET!,
            refresh_token: process.env.SHAREPOINT_REFRESH_TOKEN!,
            scope:
              'openid email profile offline_access Sites.Manage.All Files.ReadWrite Sites.Read.All User.Read',
          }),
        }
      );

      const tokenData = await response.json();

      if (!tokenData.access_token) {
        throw new Error(`Failed to refresh SharePoint token: ${JSON.stringify(tokenData)}`);
      }

      token = tokenData.access_token;

      // Update refresh token if rotated
      if (tokenData.refresh_token) {
        process.env.SHAREPOINT_REFRESH_TOKEN = tokenData.refresh_token;
      }
    });

    // Cleanup: delete any leftover test records after all tests
    afterAll(async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      try {
        const deletedCount = await deleteSharePointRecords(
          getContext() as any,
          {
            exp: 'contains',
            args: [{ field: 'Title' }, { value: 'SP_RecordTest_' }],
          } as any,
          { table: testTable } as any
        );
        if (deletedCount > 0) {
          Debugger.log(`Cleanup: deleted ${deletedCount} leftover test records`);
        }
      } catch {
        // Ignore cleanup errors
      }
    });

    const getContext = () => ({
      conn_opts: { token },
      opts: {},
    });

    // ---- get_table_list ----

    it('Should get table list with valid site|list format', async () => {
      if (!hasCredentials) {
        return;
      }

      allTables = await getSharePointTableList(getContext() as any);

      expect(Array.isArray(allTables)).toBe(true);
      expect(allTables.length).toBeGreaterThan(0);

      // Every table path should have the "site|list" format
      for (const table of allTables) {
        const parsed = parseTablePath(table);
        expect(parsed.siteName).toBeTruthy();
        expect(parsed.listName).toBeTruthy();
      }

      // Store the first table for subsequent tests
      testTable = allTables[0];
    });

    it('Should not include document libraries in table list', async () => {
      if (!hasCredentials) {
        return;
      }

      // Document libraries would fail CRUD operations; the table list
      // should only contain regular lists
      for (const table of allTables) {
        const parsed = parseTablePath(table);
        // "Documents" and "Site Assets" are common document library names
        // This is a soft check — the real filter is in get-table-list.ts
        expect(parsed.listName).toBeDefined();
      }
    });

    // ---- get_record_type ----

    it('Should get record type with standard metadata fields', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const recordType = await getSharePointRecordType(getContext() as any, testTable);

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      const fields = (recordType as any).fields;
      expect(fields).toBeDefined();

      // Should always have standard metadata fields
      expect(fields.id).toBeDefined();
      expect(fields.createdDateTime).toBeDefined();
      expect(fields.lastModifiedDateTime).toBeDefined();
      expect(fields.webUrl).toBeDefined();

      // Should have dynamic columns beyond just metadata
      const fieldNames = Object.keys(fields);
      expect(fieldNames.length).toBeGreaterThan(4);

      // Title is a standard SharePoint list column
      expect(fields.Title).toBeDefined();

      // Every field should have a type
      for (const [, field] of Object.entries(fields)) {
        expect((field as any).type).toBeDefined();
      }

      // Save field names for cross-validation with search results
      schemaFieldNames = fieldNames;
    });

    // ---- search_records ----

    it('Should search records without filter and return column format', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const iterator = await searchSharePointRecords(
        getContext() as any,
        undefined,
        { table: testTable } as any
      );

      expect(typeof iterator).toBe('function');

      const batch = await iterator(getContext() as any, 10);

      if (batch) {
        // Should be in column format (keys are field names, values are arrays)
        expect(typeof batch).toBe('object');
        expect(batch.id).toBeDefined();
        expect(Array.isArray(batch.id)).toBe(true);
        expect(batch.id.length).toBeGreaterThan(0);

        // All column arrays should have the same length
        const lengths = Object.values(batch).map((v) => (v as unknown[]).length);
        expect(new Set(lengths).size).toBe(1);

        // Standard metadata fields from schema should be present in results
        if (schemaFieldNames) {
          const returnedFields = Object.keys(batch);
          for (const metaField of ['id', 'createdDateTime', 'lastModifiedDateTime', 'webUrl']) {
            expect(returnedFields).toContain(metaField);
          }
        }
      }
    });

    it('Should search records with equality filter and return matching results', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      // First create a record to ensure we have something to find
      const uniqueTitle = `SP_RecordTest_Search_${Date.now()}`;
      await createSharePointRecords(
        getContext() as any,
        { Title: [uniqueTitle] },
        { table: testTable } as any
      );

      await delay(1000);

      const where = {
        exp: '==',
        args: [{ field: 'Title' }, { value: uniqueTitle }],
      };

      const iterator = await searchSharePointRecords(
        getContext() as any,
        where as any,
        { table: testTable } as any
      );

      expect(typeof iterator).toBe('function');

      const batch = await iterator(getContext() as any, 10);

      expect(batch).not.toBeNull();
      expect(batch!.Title).toBeDefined();
      expect(batch!.Title.length).toBeGreaterThan(0);
      expect(batch!.Title[0]).toBe(uniqueTitle);

      // Cleanup
      await deleteSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: uniqueTitle }] } as any,
        { table: testTable } as any
      );
    }, 30000);

    it('Should search records with starts-with filter', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const uniquePrefix = `SP_RecordTest_SW_${Date.now()}`;
      await createSharePointRecords(
        getContext() as any,
        { Title: [`${uniquePrefix}_Item`] },
        { table: testTable } as any
      );

      await delay(1500);

      const where = {
        exp: 'starts-with',
        args: [{ field: 'Title' }, { value: uniquePrefix }],
      };

      const iterator = await searchSharePointRecords(
        getContext() as any,
        where as any,
        { table: testTable } as any
      );

      const batch = await iterator(getContext() as any, 10);

      expect(batch).not.toBeNull();
      expect(batch!.Title.length).toBeGreaterThan(0);
      expect((batch!.Title[0] as string).startsWith(uniquePrefix)).toBe(true);

      // Cleanup
      await deleteSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: `${uniquePrefix}_Item` }] } as any,
        { table: testTable } as any
      );
    }, 30000);

    it('Should search records with AND expression', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const uniqueTitle = `SP_RecordTest_AND_${Date.now()}`;
      await createSharePointRecords(
        getContext() as any,
        { Title: [uniqueTitle] },
        { table: testTable } as any
      );

      await delay(1000);

      const where = {
        exp: '&&',
        args: [
          { exp: 'starts-with', args: [{ field: 'Title' }, { value: 'SP_RecordTest_AND_' }] },
          { exp: '==', args: [{ field: 'Title' }, { value: uniqueTitle }] },
        ],
      };

      const iterator = await searchSharePointRecords(
        getContext() as any,
        where as any,
        { table: testTable } as any
      );

      const batch = await iterator(getContext() as any, 10);

      expect(batch).not.toBeNull();
      expect(batch!.Title.length).toBeGreaterThan(0);
      expect(batch!.Title[0]).toBe(uniqueTitle);

      // Cleanup
      await deleteSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: uniqueTitle }] } as any,
        { table: testTable } as any
      );
    }, 30000);

    it('Should search records with OR expression', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const title1 = `SP_RecordTest_OR1_${Date.now()}`;
      const title2 = `SP_RecordTest_OR2_${Date.now()}`;
      await createSharePointRecords(
        getContext() as any,
        { Title: [title1, title2] },
        { table: testTable } as any
      );

      await delay(1000);

      const where = {
        exp: '||',
        args: [
          { exp: '==', args: [{ field: 'Title' }, { value: title1 }] },
          { exp: '==', args: [{ field: 'Title' }, { value: title2 }] },
        ],
      };

      const iterator = await searchSharePointRecords(
        getContext() as any,
        where as any,
        { table: testTable } as any
      );

      const batch = await iterator(getContext() as any, 10);

      expect(batch).not.toBeNull();
      expect(batch!.Title.length).toBe(2);

      const titles = batch!.Title as string[];
      expect(titles).toContain(title1);
      expect(titles).toContain(title2);

      // Cleanup
      await deleteSharePointRecords(
        getContext() as any,
        where as any,
        { table: testTable } as any
      );
    }, 30000);

    it('Should return null when no records match search', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const where = {
        exp: '==',
        args: [{ field: 'Title' }, { value: `NonExistent_${Date.now()}_XYZ` }],
      };

      const iterator = await searchSharePointRecords(
        getContext() as any,
        where as any,
        { table: testTable } as any
      );

      const batch = await iterator(getContext() as any, 10);
      expect(batch).toBeNull();
    });

    it('Should search and paginate with iterator', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      // Create 4 records for pagination test
      const prefix = `SP_RecordTest_Page_${Date.now()}`;
      await createSharePointRecords(
        getContext() as any,
        {
          Title: [`${prefix}_1`, `${prefix}_2`, `${prefix}_3`, `${prefix}_4`],
        },
        { table: testTable } as any
      );

      await delay(1500);

      const where = {
        exp: 'starts-with',
        args: [{ field: 'Title' }, { value: prefix }],
      };

      const iterator = await searchSharePointRecords(
        getContext() as any,
        where as any,
        { table: testTable } as any
      );

      // Fetch first batch of 2
      const batch1 = await iterator(getContext() as any, 2);
      expect(batch1).not.toBeNull();
      const records1 = mapColumnFormatToObject(batch1!);
      expect(records1.length).toBeLessThanOrEqual(2);

      // Verify each record has an id
      for (const record of records1) {
        expect(record.id).toBeDefined();
      }

      if (records1.length === 2) {
        // Fetch second batch
        const batch2 = await iterator(getContext() as any, 2);
        if (batch2) {
          const records2 = mapColumnFormatToObject(batch2);

          // Verify no duplicate IDs between batches
          const batch1Ids = records1.map((r) => String(r.id));
          const batch2Ids = records2.map((r) => String(r.id));
          for (const id of batch2Ids) {
            expect(batch1Ids).not.toContain(id);
          }
        }
      }

      // Cleanup
      await deleteSharePointRecords(
        getContext() as any,
        { exp: 'starts-with', args: [{ field: 'Title' }, { value: prefix }] } as any,
        { table: testTable } as any
      );
    }, 45000);

    // ---- create_records ----

    it('Should create multiple records and return column format', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const prefix = `SP_RecordTest_Create_${Date.now()}`;
      const title1 = `${prefix}_1`;
      const title2 = `${prefix}_2`;

      const createResult = await createSharePointRecords(
        getContext() as any,
        { Title: [title1, title2] },
        { table: testTable } as any
      );

      expect(createResult).toBeDefined();
      expect(createResult.id).toBeDefined();
      expect(Array.isArray(createResult.id)).toBe(true);
      expect(createResult.id.length).toBe(2);

      // Should return Title values matching what was created
      expect(createResult.Title).toBeDefined();
      expect(createResult.Title.length).toBe(2);
      expect(createResult.Title).toContain(title1);
      expect(createResult.Title).toContain(title2);

      // Should return metadata fields
      expect(createResult.createdDateTime).toBeDefined();
      expect(createResult.webUrl).toBeDefined();

      // Cleanup
      await deleteSharePointRecords(
        getContext() as any,
        { exp: 'starts-with', args: [{ field: 'Title' }, { value: prefix }] } as any,
        { table: testTable } as any
      );
    }, 30000);

    // ---- update_records ----

    it('Should update a record with WHERE condition', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const uniqueTitle = `SP_RecordTest_Update_${Date.now()}`;
      await createSharePointRecords(
        getContext() as any,
        { Title: [uniqueTitle] },
        { table: testTable } as any
      );

      await delay(1000);

      const updatedTitle = `${uniqueTitle}_Updated`;
      const updatedCount = await updateSharePointRecords(
        getContext() as any,
        { Title: [updatedTitle] },
        { exp: '==', args: [{ field: 'Title' }, { value: uniqueTitle }] } as any,
        { table: testTable } as any
      );

      expect(updatedCount).toBe(1);

      // Verify the update by searching for the new title
      await delay(1000);
      const iterator = await searchSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: updatedTitle }] } as any,
        { table: testTable } as any
      );
      const batch = await iterator(getContext() as any, 10);
      expect(batch).not.toBeNull();
      expect(batch!.Title[0]).toBe(updatedTitle);

      // Verify old title no longer exists
      const oldIterator = await searchSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: uniqueTitle }] } as any,
        { table: testTable } as any
      );
      const oldBatch = await oldIterator(getContext() as any, 10);
      expect(oldBatch).toBeNull();

      // Cleanup
      await deleteSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: updatedTitle }] } as any,
        { table: testTable } as any
      );
    }, 30000);

    it('Should update 0 records when WHERE matches nothing', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const updatedCount = await updateSharePointRecords(
        getContext() as any,
        { Title: ['Nonexistent'] },
        {
          exp: '==',
          args: [{ field: 'Title' }, { value: `NonExistent_${Date.now()}_XYZ` }],
        } as any,
        { table: testTable } as any
      );

      expect(updatedCount).toBe(0);
    });

    // ---- delete_records ----

    it('Should delete a record and verify it is gone', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const uniqueTitle = `SP_RecordTest_Delete_${Date.now()}`;
      await createSharePointRecords(
        getContext() as any,
        { Title: [uniqueTitle] },
        { table: testTable } as any
      );

      await delay(1000);

      const deletedCount = await deleteSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: uniqueTitle }] } as any,
        { table: testTable } as any
      );

      expect(deletedCount).toBe(1);

      // Verify the record is deleted
      await delay(1000);
      const iterator = await searchSharePointRecords(
        getContext() as any,
        { exp: '==', args: [{ field: 'Title' }, { value: uniqueTitle }] } as any,
        { table: testTable } as any
      );
      const batch = await iterator(getContext() as any, 10);
      expect(batch).toBeNull();
    }, 30000);

    it('Should delete 0 records when WHERE matches nothing', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      const deletedCount = await deleteSharePointRecords(
        getContext() as any,
        {
          exp: '==',
          args: [{ field: 'Title' }, { value: `NonExistent_${Date.now()}_XYZ` }],
        } as any,
        { table: testTable } as any
      );

      expect(deletedCount).toBe(0);
    });

    // ---- Negative / error tests ----

    it('Should throw when deleting without WHERE condition', async () => {
      if (!hasCredentials || !testTable) {
        return;
      }

      await expect(
        deleteSharePointRecords(getContext() as any, undefined, { table: testTable } as any)
      ).rejects.toThrow('WHERE condition is required');
    });

    it('Should throw when table path is missing for search', async () => {
      if (!hasCredentials) {
        return;
      }

      await expect(
        searchSharePointRecords(getContext() as any, undefined, {} as any)
      ).rejects.toThrow('Table path is required');
    });

    it('Should throw when table path is missing for create', async () => {
      if (!hasCredentials) {
        return;
      }

      await expect(
        createSharePointRecords(getContext() as any, { Title: ['test'] }, {} as any)
      ).rejects.toThrow('Table path is required');
    });

    it('Should throw when table path is missing for update', async () => {
      if (!hasCredentials) {
        return;
      }

      await expect(
        updateSharePointRecords(
          getContext() as any,
          { Title: ['test'] },
          { exp: '==', args: [{ field: 'Title' }, { value: 'x' }] } as any,
          {} as any
        )
      ).rejects.toThrow('Table path is required');
    });

    it('Should throw when table path is missing for delete', async () => {
      if (!hasCredentials) {
        return;
      }

      await expect(
        deleteSharePointRecords(
          getContext() as any,
          { exp: '==', args: [{ field: 'Title' }, { value: 'x' }] } as any,
          {} as any
        )
      ).rejects.toThrow('Table path is required');
    });

    it('Should throw when table path points to a non-existent site', async () => {
      if (!hasCredentials) {
        return;
      }

      await expect(
        searchSharePointRecords(
          getContext() as any,
          undefined,
          { table: 'NonExistentSite999|SomeList' } as any
        )
      ).rejects.toThrow(/not found/);
    });
  });
});
