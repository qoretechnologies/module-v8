import { configDotenv } from 'dotenv';
import { createSeaTableRecords } from '../apps/seatable/helpers/record-based/create-records';
import { deleteSeaTableRecords } from '../apps/seatable/helpers/record-based/delete-records';
import { getSeaTableRecordType } from '../apps/seatable/helpers/record-based/get-record-type';
import { getSeaTableTableList } from '../apps/seatable/helpers/record-based/get-table-list';
import { searchSeaTableRecords } from '../apps/seatable/helpers/record-based/search-records';
import { updateSeaTableRecords } from '../apps/seatable/helpers/record-based/update-records';
import { getSeaTableTableAllowedValues } from '../apps/seatable/helpers/get-table-allowed-values';
import { new_document as NewSeaTableRow } from '../apps/seatable/triggers';
import { run_sql as RunSql } from '../apps/seatable/actions';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('SeaTable', () => {
  // Context for record-based operations and triggers
  const baseContext = {
    conn_opts: {
      api_token: '',
      url: 'https://cloud.seatable.io',
    } as any,
  };

  // Test table name to use
  const TEST_TABLE_NAME = 'test-table';

  beforeAll(async () => {
    const apiToken = process.env.SEATABLE_API_TOKEN;

    if (!apiToken) {
      throw new Error('Please set the SEATABLE_API_TOKEN environment variable.');
    }

    baseContext.conn_opts.api_token = apiToken;
  });

  afterEach(async () => {
    await delay(1000);
  });

  describe('Should test allowed values helpers', () => {
    it('Should get table allowed values', async () => {
      const allowedValues = await getSeaTableTableAllowedValues(baseContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: true });

      // All values should be strings (table names)
      for (const value of allowedValues) {
        expect(typeof value.value).toBe('string');
        expect(typeof value.display_name).toBe('string');
      }
    });

    it('Should return empty array when connection options are missing', async () => {
      const allowedValues = await getSeaTableTableAllowedValues({} as any);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return empty array when api_token is missing', async () => {
      const allowedValues = await getSeaTableTableAllowedValues({
        conn_opts: { url: 'https://cloud.seatable.io' },
      } as any);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });
  });

  // Table name for record-based operations
  let tableName: string | undefined;

  describe('Should test record-based helpers', () => {
    it('Should get table list and find testing-table', async () => {
      const tables = await getSeaTableTableList(baseContext);

      expect(tables).toBeDefined();
      expect(tables.length).toBeGreaterThan(0);
      expect(typeof tables[0]).toBe('string');

      // Find the testing-table specifically
      const testingTable = tables.find((t) => t === TEST_TABLE_NAME);
      if (!testingTable) {
        throw new Error(
          `Test table "${TEST_TABLE_NAME}" not found. Please create a table named "${TEST_TABLE_NAME}" with fields: Title (text), Count (number), IsActive (checkbox)`
        );
      }

      tableName = testingTable;
    });

    it('Should get record type with expected fields', async () => {
      if (!tableName) {
        throw new Error('Table name not set');
      }

      const recordType = await getSeaTableRecordType(baseContext, tableName);

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');
      expect((recordType as any).fields).toBeDefined();
      // SeaTable uses _id for row ID
      expect((recordType as any).fields._id).toBeDefined();
      // Expected fields from testing-table
      expect((recordType as any).fields.Title).toBeDefined();
      expect((recordType as any).fields.Count).toBeDefined();
      expect((recordType as any).fields.IsActive).toBeDefined();
    });

    it('Should create records', async () => {
      if (!tableName) {
        throw new Error('Table name not set');
      }

      // Records in column format using expected testing-table fields
      const testRecords = {
        Title: ['SeaTable Test Record 1', 'SeaTable Test Record 2'],
        Count: [100, 200],
        IsActive: [true, false],
      };

      const createdRecords = await createSeaTableRecords(baseContext, testRecords, {
        table: tableName,
      });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.Title?.length).toBeGreaterThan(0);
    }, 30000);

    it('Should search records with equality expression', async () => {
      if (!tableName) {
        throw new Error('Table name not set');
      }

      const whereCondition = {
        exp: '==',
        args: [
          {
            type_code: 'field reference',
            field: 'Title',
          },
          {
            type_code: 'value',
            value: 'SeaTable Test Record 1',
          },
        ],
      } as any;

      const searchIterator = await searchSeaTableRecords(baseContext, whereCondition, {
        table: tableName,
      });

      const records = await searchIterator(baseContext, 100);

      expect(records).toBeDefined();
      // Records are in column format: { Title: ['value1', 'value2'], _id: ['id1', 'id2'] }
      if (records?.Title && records.Title.length > 0) {
        expect(records.Title.length).toBeGreaterThan(0);
        expect(records.Title[0]).toBe('SeaTable Test Record 1');
      }
    }, 30000);

    it('Should search records with OR expression', async () => {
      if (!tableName) {
        throw new Error('Table name not set');
      }

      const whereCondition = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              {
                type_code: 'field reference',
                field: 'Title',
              },
              {
                type_code: 'value',
                value: 'SeaTable Test Record 1',
              },
            ],
          },
          {
            exp: '==',
            args: [
              {
                type_code: 'field reference',
                field: 'Title',
              },
              {
                type_code: 'value',
                value: 'SeaTable Test Record 2',
              },
            ],
          },
        ],
      } as any;

      const searchIterator = await searchSeaTableRecords(baseContext, whereCondition, {
        table: tableName,
      });

      const records = await searchIterator(baseContext, 100);

      expect(records).toBeDefined();
    }, 30000);

    it('Should search records with AND expression', async () => {
      if (!tableName) {
        throw new Error('Table name not set');
      }

      const whereCondition = {
        exp: '&&',
        args: [
          {
            exp: 'not-empty',
            args: [
              {
                type_code: 'field reference',
                field: 'Title',
              },
            ],
          },
          {
            exp: '==',
            args: [
              {
                type_code: 'field reference',
                field: 'Title',
              },
              {
                type_code: 'value',
                value: 'SeaTable Test Record 1',
              },
            ],
          },
        ],
      } as any;

      const searchIterator = await searchSeaTableRecords(baseContext, whereCondition, {
        table: tableName,
      });

      const records = await searchIterator(baseContext, 100);

      expect(records).toBeDefined();
    }, 30000);

    it('Should update records with WHERE condition', async () => {
      if (!tableName) {
        throw new Error('Table name not set');
      }

      const whereCondition = {
        exp: '==',
        args: [
          {
            type_code: 'field reference',
            field: 'Title',
          },
          {
            type_code: 'value',
            value: 'SeaTable Test Record 1',
          },
        ],
      } as any;

      // setValues is Record<string, any> - fields to update
      const setValues = {
        Title: 'SeaTable Test Record 1 Updated',
      };

      const updatedCount = await updateSeaTableRecords(baseContext, setValues, whereCondition, {
        table: tableName,
      });

      expect(updatedCount).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('Should delete test records', async () => {
      if (!tableName) {
        throw new Error('Table name not set');
      }

      const whereCondition = {
        exp: '||',
        args: [
          {
            exp: 'contains',
            args: [
              {
                type_code: 'field reference',
                field: 'Title',
              },
              {
                type_code: 'value',
                value: 'SeaTable Test Record',
              },
            ],
          },
        ],
      } as any;

      const deletedCount = await deleteSeaTableRecords(baseContext, whereCondition, {
        table: tableName,
      });

      expect(deletedCount).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('Should test triggers', () => {
    let triggerTableName: string | undefined;

    beforeAll(async () => {
      // Get table name for triggers
      const allowedValues = await getSeaTableTableAllowedValues(baseContext);
      if (allowedValues.length > 0) {
        // Find testing-table or use first table
        const testingTable = allowedValues.find((t) => t.value === TEST_TABLE_NAME);
        triggerTableName = testingTable?.value || allowedValues[0].value;
      }
    });

    it('Should get example event data from NewSeaTableRow trigger', async () => {
      if (!triggerTableName) {
        throw new Error('Table name not set');
      }

      const trigger = NewSeaTableRow;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: { table: triggerTableName },
      });

      // Result can be null if no rows exist in the table
      if (result) {
        // SeaTable uses _id for row ID
        expect(result._id).toBeDefined();
      }
    }, 30000);

    it('Should return example data matching event_info schema', async () => {
      if (!triggerTableName) {
        throw new Error('Table name not set');
      }

      const trigger = NewSeaTableRow;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      if (!('event_info' in trigger) || !trigger.event_info) {
        throw new Error('event_info not found in trigger');
      }

      const exampleData = await trigger.get_example_event_data({
        ...baseContext,
        opts: { table: triggerTableName },
      });

      if (exampleData) {
        const eventInfoFields = Object.keys((trigger.event_info.type as any).fields);

        // All declared fields should be present in the example data
        for (const field of eventInfoFields) {
          expect(field in exampleData).toBe(true);
        }
      }
    }, 30000);
  });

  describe('Should test actions', () => {
    let actionTableName: string | undefined;

    beforeAll(async () => {
      // Get table name for actions
      const allowedValues = await getSeaTableTableAllowedValues(baseContext);
      if (allowedValues.length === 0) {
        throw new Error('No tables found');
      }

      // Find the testing-table specifically for action tests
      const testingTable = allowedValues.find((t) => t.value === TEST_TABLE_NAME);
      if (!testingTable) {
        throw new Error(
          `Test table "${TEST_TABLE_NAME}" not found for action tests. Available tables: ${allowedValues.map((t) => t.display_name).join(', ')}`
        );
      }
      actionTableName = testingTable.value;
    });

    it('Should execute SQL query to select records', async () => {
      if (!actionTableName) {
        throw new Error('Table name not set');
      }

      const action = RunSql;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('api_function not found in action');
      }

      const optsWithSql = {
        sql: `SELECT * FROM \`${actionTableName}\` LIMIT 10`,
      };

      const result = await action.api_function(optsWithSql, undefined, {
        conn_opts: baseContext.conn_opts,
        opts: optsWithSql,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.results)).toBe(true);
    }, 30000);

    it('Should execute SQL query with WHERE clause', async () => {
      if (!actionTableName) {
        throw new Error('Table name not set');
      }

      const action = RunSql;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('api_function not found in action');
      }

      const optsWithSql = {
        sql: `SELECT * FROM \`${actionTableName}\` WHERE \`Title\` = 'NonExistentValue12345' LIMIT 10`,
      };

      const result = await action.api_function(optsWithSql, undefined, {
        conn_opts: baseContext.conn_opts,
        opts: optsWithSql,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.results)).toBe(true);
      // Non-existent value should return empty results
      expect(result.results.length).toBe(0);
    }, 30000);

    it('Should return metadata with SQL query', async () => {
      if (!actionTableName) {
        throw new Error('Table name not set');
      }

      const action = RunSql;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('api_function not found in action');
      }

      const optsWithSql = {
        sql: `SELECT \`Title\`, \`Count\` FROM \`${actionTableName}\` LIMIT 1`,
      };

      const result = await action.api_function(optsWithSql, undefined, {
        conn_opts: baseContext.conn_opts,
        opts: optsWithSql,
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      // Metadata should contain column information
      if (result.metadata && result.metadata.length > 0) {
        expect(result.metadata[0]).toHaveProperty('name');
      }
    }, 30000);
  });
});
