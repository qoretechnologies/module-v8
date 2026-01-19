import { configDotenv } from 'dotenv';
import { CountRecords } from '../apps/nocodb/actions';
import { getNocoDBAttachmentFieldAllowedValues } from '../apps/nocodb/helpers/get-attachment-field-allowed-values';
import { getNocoDBBaseAllowedValues } from '../apps/nocodb/helpers/get-base-allowed-values';
import { getNocoDBButtonFieldAllowedValues } from '../apps/nocodb/helpers/get-button-field-allowed-values';
import { getNocoDBLinkFieldAllowedValues } from '../apps/nocodb/helpers/get-link-field-allowed-values';
import {
  getNocoDBTableAllowedValues,
  getNocoDBTableIdAllowedValues,
} from '../apps/nocodb/helpers/get-table-allowed-values';
import { getNocoDBWorkspaceAllowedValues } from '../apps/nocodb/helpers/get-workspace-allowed-values';
import { createNocoDBRecords } from '../apps/nocodb/helpers/record-based/create-records';
import { deleteNocoDBRecords } from '../apps/nocodb/helpers/record-based/delete-records';
import { getNocoDBRecordType } from '../apps/nocodb/helpers/record-based/get-record-type';
import {
  getNocoDBTableList,
  parseTablePath,
} from '../apps/nocodb/helpers/record-based/get-table-list';
import { searchNocoDBRecords } from '../apps/nocodb/helpers/record-based/search-records';
import { updateNocoDBRecords } from '../apps/nocodb/helpers/record-based/update-records';
import { NewNocoDBRow } from '../apps/nocodb/triggers';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues } from './utils';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('NocoDB', () => {
  // Context for record-based operations (only needs token and url)
  const recordBasedContext = {
    conn_opts: {
      token: '',
      url: 'https://app.nocodb.com',
    } as any,
  };

  // Context for trigger tests (needs workspace and base selection)
  const triggerContext = {
    conn_opts: {
      token: '',
      url: 'https://app.nocodb.com',
    } as any,
    opts: {
      workspaceId: '',
      baseId: '',
    } as any,
  };

  beforeAll(async () => {
    const token = process.env.NOCODB_TOKEN;

    if (!token) {
      throw new Error('Please set the NOCODB_TOKEN environment variable.');
    }

    recordBasedContext.conn_opts.token = token;
    triggerContext.conn_opts.token = token;
  });

  afterEach(async () => {
    await delay(2000);
  });

  describe('Should test allowed values helpers (for triggers)', () => {
    it('Should get workspace allowed values', async () => {
      const allowedValues = await getNocoDBWorkspaceAllowedValues(triggerContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: true });

      // Store first workspace for subsequent tests
      if (allowedValues.length > 0) {
        triggerContext.opts.workspaceId = allowedValues[0].value;
      }
    });

    it('Should get base allowed values', async () => {
      if (!triggerContext.opts.workspaceId) {
        throw new Error('Workspace ID not set from previous test');
      }

      const allowedValues = await getNocoDBBaseAllowedValues(triggerContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: true });

      // Store first base for subsequent tests
      if (allowedValues.length > 0) {
        triggerContext.opts.baseId = allowedValues[0].value;
      }
    });

    it('Should get table allowed values', async () => {
      if (!triggerContext.opts.baseId) {
        throw new Error('Base ID not set from previous test');
      }

      const allowedValues = await getNocoDBTableAllowedValues(triggerContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: true });
    });

    it('Should return empty array when connection options are missing for workspaces', async () => {
      const allowedValues = await getNocoDBWorkspaceAllowedValues({} as any);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return empty array when workspaceId is missing for bases', async () => {
      const allowedValues = await getNocoDBBaseAllowedValues({
        conn_opts: triggerContext.conn_opts,
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return empty array when baseId is missing for tables', async () => {
      const allowedValues = await getNocoDBTableAllowedValues({
        conn_opts: triggerContext.conn_opts,
        opts: { workspaceId: triggerContext.opts.workspaceId },
      });
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });
  });

  describe('Should test field type allowed values helpers', () => {
    let fieldTestContext: any;

    beforeAll(async () => {
      // Need workspace, base and table to get field-specific allowed values
      const workspaces = await getNocoDBWorkspaceAllowedValues(triggerContext);
      if (workspaces.length === 0) {
        throw new Error('No workspaces found');
      }
      const workspaceId = workspaces[0].value;

      const bases = await getNocoDBBaseAllowedValues({
        ...triggerContext,
        opts: { workspaceId },
      });
      if (bases.length === 0) {
        throw new Error('No bases found');
      }
      const baseId = bases[0].value;

      const tables = await getNocoDBTableIdAllowedValues({
        ...triggerContext,
        opts: { workspaceId, baseId },
      });
      if (tables.length === 0) {
        throw new Error('No tables found');
      }
      const table = tables[0].value;

      fieldTestContext = {
        conn_opts: triggerContext.conn_opts,
        opts: { workspaceId, baseId, table },
      };
    });

    it('Should get attachment field allowed values (may be empty if no attachment fields)', async () => {
      const allowedValues = await getNocoDBAttachmentFieldAllowedValues(fieldTestContext);
      // May be empty if table has no attachment fields - that's valid
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    });

    it('Should get link field allowed values (may be empty if no link fields)', async () => {
      const allowedValues = await getNocoDBLinkFieldAllowedValues(fieldTestContext);
      // May be empty if table has no link fields - that's valid
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    });

    it('Should get button field allowed values (may be empty if no button fields)', async () => {
      const allowedValues = await getNocoDBButtonFieldAllowedValues(fieldTestContext);
      // May be empty if table has no button fields - that's valid
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    });

    it('Should return empty array when context is missing for attachment fields', async () => {
      const allowedValues = await getNocoDBAttachmentFieldAllowedValues({} as any);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return empty array when context is missing for link fields', async () => {
      const allowedValues = await getNocoDBLinkFieldAllowedValues({} as any);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });

    it('Should return empty array when context is missing for button fields', async () => {
      const allowedValues = await getNocoDBButtonFieldAllowedValues({} as any);
      checkAllowedValues(allowedValues, { checkNonEmpty: false });
      expect(allowedValues.length).toBe(0);
    });
  });

  // Table path in format "workspace|base|table" - specifically for "testing-table"
  let tablePath: string | undefined;
  // Test table name to search for
  const TEST_TABLE_NAME = 'testing-table';

  describe('Should test record-based helpers', () => {
    it('Should get table list and find testing-table', async () => {
      const tables = await getNocoDBTableList(recordBasedContext);

      expect(tables).toBeDefined();
      expect(tables.length).toBeGreaterThan(0);
      expect(typeof tables[0]).toBe('string');

      // Table names should be in format "workspace|base|table"
      const parts = tables[0].split('|');
      expect(parts.length).toBe(3);

      // Find the testing-table specifically
      const testingTable = tables.find((t) => t.endsWith(`|${TEST_TABLE_NAME}`));
      if (!testingTable) {
        throw new Error(
          `Test table "${TEST_TABLE_NAME}" not found. Please create a table named "${TEST_TABLE_NAME}" with fields: Title (SingleLineText), Count (Number), IsActive (Checkbox)`
        );
      }

      tablePath = testingTable;
    });

    it('Should parse table path correctly', () => {
      if (!tablePath) {
        throw new Error('Table path not set');
      }

      const parsed = parseTablePath(tablePath);

      expect(parsed.workspaceTitle).toBeDefined();
      expect(parsed.baseTitle).toBeDefined();
      expect(parsed.tableName).toBe(TEST_TABLE_NAME);
    });

    it('Should parse table path with pipe separator format', () => {
      const testPath = 'MyWorkspace|MyBase|MyTable';
      const parsed = parseTablePath(testPath);

      expect(parsed.workspaceTitle).toBe('MyWorkspace');
      expect(parsed.baseTitle).toBe('MyBase');
      expect(parsed.tableName).toBe('MyTable');
    });

    it('Should throw error for invalid table path format', () => {
      // Missing parts
      expect(() => parseTablePath('workspace|base')).toThrow(
        'Invalid table path format: "workspace|base". Expected "workspace|base|table".'
      );

      // Old format with slashes should fail
      expect(() => parseTablePath('workspace/base/table')).toThrow(
        'Invalid table path format: "workspace/base/table". Expected "workspace|base|table".'
      );

      // Too many parts
      expect(() => parseTablePath('a|b|c|d')).toThrow(
        'Invalid table path format: "a|b|c|d". Expected "workspace|base|table".'
      );
    });

    it('Should get record type with expected fields', async () => {
      if (!tablePath) {
        throw new Error('Table path not set');
      }

      const recordType = await getNocoDBRecordType(recordBasedContext, tablePath);

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');
      expect((recordType as any).fields).toBeDefined();
      // v3 API uses lowercase 'id'
      expect((recordType as any).fields.id).toBeDefined();
      // Expected fields from testing-table
      expect((recordType as any).fields.Title).toBeDefined();
      expect((recordType as any).fields.Count).toBeDefined();
      expect((recordType as any).fields.IsActive).toBeDefined();
    });

    it('Should create records', async () => {
      if (!tablePath) {
        throw new Error('Table path not set');
      }

      // Records in column format using expected testing-table fields
      const testRecords = {
        Title: ['Test Record 1', 'Test Record 2'],
        Count: [10, 20],
        IsActive: [true, false],
      };

      const createdRecords = await createNocoDBRecords(recordBasedContext, testRecords, {
        table: tablePath,
      });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.Title?.length).toBeGreaterThan(0);
    }, 30000);

    it('Should search records with equality expression', async () => {
      if (!tablePath) {
        throw new Error('Table path not set');
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
            value: 'Test Record 1',
          },
        ],
      } as any;

      const searchIterator = await searchNocoDBRecords(recordBasedContext, whereCondition, {
        table: tablePath,
      });

      const records = await searchIterator(recordBasedContext, 100);

      expect(records).toBeDefined();
      // Records are in column format: { Title: ['value1', 'value2'], Id: ['id1', 'id2'] }
      if (records?.Title && records.Title.length > 0) {
        expect(records.Title.length).toBeGreaterThan(0);
        expect(records.Title[0]).toBe('Test Record 1');
      }
    }, 30000);

    it('Should search records with OR expression', async () => {
      if (!tablePath) {
        throw new Error('Table path not set');
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
                value: 'Test Record 1',
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
                value: 'Test Record 2',
              },
            ],
          },
        ],
      } as any;

      const searchIterator = await searchNocoDBRecords(recordBasedContext, whereCondition, {
        table: tablePath,
      });

      const records = await searchIterator(recordBasedContext, 100);

      expect(records).toBeDefined();
    }, 30000);

    it('Should search records with AND expression', async () => {
      if (!tablePath) {
        throw new Error('Table path not set');
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
                value: 'Test Record 1',
              },
            ],
          },
        ],
      } as any;

      const searchIterator = await searchNocoDBRecords(recordBasedContext, whereCondition, {
        table: tablePath,
      });

      const records = await searchIterator(recordBasedContext, 100);

      expect(records).toBeDefined();
    }, 30000);

    it('Should update records with WHERE condition', async () => {
      if (!tablePath) {
        throw new Error('Table path not set');
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
            value: 'Test Record 1',
          },
        ],
      } as any;

      // setValues is Record<string, any> - fields to update
      const setValues = {
        Title: 'Test Record 1 Updated',
      };

      const updatedCount = await updateNocoDBRecords(
        recordBasedContext,
        setValues,
        whereCondition,
        {
          table: tablePath,
        }
      );

      expect(updatedCount).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('Should delete test records', async () => {
      if (!tablePath) {
        throw new Error('Table path not set');
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
                value: 'Test Record',
              },
            ],
          },
        ],
      } as any;

      const deletedCount = await deleteNocoDBRecords(recordBasedContext, whereCondition, {
        table: tablePath,
      });

      expect(deletedCount).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('Should test triggers', () => {
    let triggerTableName: string | undefined;

    beforeAll(async () => {
      if (!triggerContext.opts.baseId) {
        throw new Error('Base ID not set - run allowed values tests first');
      }

      // Get table name (not path) for triggers
      const allowedValues = await getNocoDBTableIdAllowedValues(triggerContext);
      if (allowedValues.length > 0) {
        triggerTableName = allowedValues[0].value;
      }
    });

    it('Should get example event data from NewNocoDBRow trigger', async () => {
      if (!triggerTableName) {
        throw new Error('Table name not set');
      }

      const trigger = NewNocoDBRow;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...triggerContext,
        opts: { ...triggerContext.opts, table: triggerTableName },
      });

      // Result can be null if no rows exist in the table
      if (result) {
        // v3 API uses lowercase 'id'
        expect(result.id).toBeDefined();
      }
    }, 30000);

    it('Should return example data matching event_info schema', async () => {
      if (!triggerTableName) {
        throw new Error('Table name not set');
      }

      const trigger = NewNocoDBRow;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      if (!('event_info' in trigger) || !trigger.event_info) {
        throw new Error('event_info not found in trigger');
      }

      const exampleData = await trigger.get_example_event_data({
        ...triggerContext,
        opts: { ...triggerContext.opts, table: triggerTableName },
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
    let actionContext: any;
    let actionTableName: string | undefined;

    beforeAll(async () => {
      // Set up context with workspace, base and table for actions
      const workspaces = await getNocoDBWorkspaceAllowedValues(triggerContext);
      if (workspaces.length === 0) {
        throw new Error('No workspaces found');
      }
      const workspaceId = workspaces[0].value;

      const bases = await getNocoDBBaseAllowedValues({
        ...triggerContext,
        opts: { workspaceId },
      });
      if (bases.length === 0) {
        throw new Error('No bases found');
      }
      const baseId = bases[0].value;

      const tables = await getNocoDBTableAllowedValues({
        ...triggerContext,
        opts: { workspaceId, baseId },
      });
      if (tables.length === 0) {
        throw new Error('No tables found');
      }

      // Find the testing-table specifically for action tests
      const testingTable = tables.find((t) => t.display_name === TEST_TABLE_NAME);
      if (!testingTable) {
        throw new Error(
          `Test table "${TEST_TABLE_NAME}" not found for action tests. Available tables: ${tables.map((t) => t.display_name).join(', ')}`
        );
      }
      actionTableName = testingTable.value;

      actionContext = {
        conn_opts: triggerContext.conn_opts,
        opts: { workspaceId, baseId, table: actionTableName },
      };
    });

    it('Should count records in a table', async () => {
      if (!actionTableName) {
        throw new Error('Table name not set');
      }

      const action = CountRecords;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('api_function not found in action');
      }

      const result = await action.api_function(actionContext.opts, undefined, actionContext);

      expect(result).toBeDefined();
      expect(typeof result.count).toBe('number');
      expect(result.count).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('Should count records with where filter', async () => {
      if (!actionTableName) {
        throw new Error('Table name not set');
      }

      const action = CountRecords;

      if (!('api_function' in action) || !action.api_function) {
        throw new Error('api_function not found in action');
      }

      // Use a filter that should return 0 or more records
      const optsWithFilter = {
        ...actionContext.opts,
        where: '(Title,eq,NonExistentValue12345)',
      };

      const result = await action.api_function(optsWithFilter, undefined, {
        ...actionContext,
        opts: optsWithFilter,
      });

      expect(result).toBeDefined();
      expect(typeof result.count).toBe('number');
      // Filter for non-existent value should return 0
      expect(result.count).toBe(0);
    }, 30000);
  });
});
