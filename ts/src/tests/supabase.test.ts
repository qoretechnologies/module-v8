import { configDotenv } from 'dotenv';
import {
  CreateSupabaseBucket,
  CreateSupabaseRow,
  DeleteSupabaseRows,
  GetSupabaseBucket,
  GetSupabaseTable,
  ListSupabaseBuckets,
  ListSupabaseRows,
  ListSupabaseTables,
  UpsertSupabaseRow,
} from '../apps/supabase/actions';
import { getSupabaseTableAllowedValues } from '../apps/supabase/helpers/get-table-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';
import {
  getSupabaseTableColumnAllowedValues,
  getSupabaseTableColumnOptions,
  getSupabaseTableColumnsResponseType,
} from '../apps/supabase/helpers/get-table-fields';
import { getSupabaseBucketAllowedValues } from '../apps/supabase/helpers/get-bucket-allowed-values';
import { createSupabaseClient } from '../apps/supabase/helpers/constants';
import { NewSupabaseTableRow } from '../apps/supabase/triggers';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Supabase', () => {
  const baseContext = {
    conn_opts: {
      token: '',
      projectId: '',
    },
  };

  let table: string | undefined;
  let createdRowId: string | undefined;
  let createdBucketId: string | undefined;

  beforeAll(() => {
    const token = process.env.SUPABASE_TOKEN;
    const projectId = process.env.SUPABASE_PROJECT_ID;

    if (!token) throw new Error('No SUPABASE_TOKEN env variable found');
    if (!projectId) throw new Error('No SUPABASE_PROJECT_ID env variable found');

    baseContext.conn_opts.token = token;
    baseContext.conn_opts.projectId = projectId;
  });

  describe('Should test allowed values', () => {
    it('Should get table allowed values', async () => {
      const allowedValues = await getSupabaseTableAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();

      table = allowedValues.at(-1)?.value;
    });

    it('Should get table fields allowed values', async () => {
      if (!table) throw new Error('No table found from previous test');

      const allowedValues = await getSupabaseTableColumnAllowedValues({
        ...baseContext,
        opts: { tableName: table },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });

    it('Should get bucket allowed values', async () => {
      const allowedValues = await getSupabaseBucketAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    it('Should list tables', async () => {
      const action = ListSupabaseTables;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.tables)).toBe(true);
      expect(result.tables.length).toBeGreaterThan(0);
    });

    it('Should get a table', async () => {
      const action = GetSupabaseTable;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!table) throw new Error('No table found from previous test');

      const result = await action.api_function({ tableName: table }, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.name).toBe(table);
    });

    it('Should get column options for a table', async () => {
      const options = await getSupabaseTableColumnOptions({
        ...baseContext,
        opts: { tableName: table },
      });

      expect(options).toBeDefined();
      expect(Object.keys(options).length).toBeGreaterThan(0);
    });

    it('Should get table row response type', async () => {
      const options = await getSupabaseTableColumnsResponseType({
        ...baseContext,
        opts: { tableName: table },
      });

      expect(options).toBeDefined();
      expect(Object.keys(options).length).toBeGreaterThan(0);
    });

    it('Should create a row in a table', async () => {
      const action = CreateSupabaseRow;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!table) throw new Error('No table found from previous test');

      const result = await action.api_function(
        {
          tableName: table,
          values: {
            title: 'Test from Qore',
            date: new Date().toISOString(),
            timestamp: new Date().toISOString(),
          },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdRowId = result.id;
    });

    it('Should upsert a row in a table', async () => {
      const action = UpsertSupabaseRow;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!table) throw new Error('No table found from previous test');
      if (!createdRowId) throw new Error('No createdRowId found from previous test');

      const result = await action.api_function(
        {
          tableName: table,
          values: {
            id: createdRowId,
            title: 'Test from Qore - updated',
          },
          onConflict: 'id',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdRowId);
      expect(result.title).toBe('Test from Qore - updated');
    });

    it('Should list rows in a table', async () => {
      const action = ListSupabaseRows;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!table) throw new Error('No table found from previous test');

      const result = await action.api_function(
        {
          tableName: table,
          limit: 5,
          offset: 0,
          orderBy: { column: 'created_at', ascending: false },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('Should delete a row in a table', async () => {
      const action = DeleteSupabaseRows;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!table) throw new Error('No table found from previous test');
      if (!createdRowId) throw new Error('No createdRowId found from previous test');

      const result = await action.api_function(
        {
          tableName: table,
          filter: { field: 'id', value: createdRowId, operator: 'is' },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });

    it('Should create a bucket', async () => {
      const action = CreateSupabaseBucket;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const bucketName = `test-bucket-${Date.now()}`;

      const result = await action.api_function(
        {
          name: bucketName,
          public_access: false,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.bucket_id).toBe(bucketName);

      createdBucketId = result.bucket_id;
    });

    it('Should list buckets', async () => {
      const action = ListSupabaseBuckets;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.buckets)).toBe(true);
      expect(result.buckets.length).toBeGreaterThan(0);
    });

    it('Should get a bucket', async () => {
      const action = GetSupabaseBucket;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!createdBucketId) throw new Error('No createdBucketId found from previous test');

      const result = await action.api_function(
        { bucket_id: createdBucketId },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });

    describe('Clean Up', () => {
      it('Should delete a created bucket', async () => {
        const client = createSupabaseClient({
          token: baseContext.conn_opts.token,
          projectId: baseContext.conn_opts.projectId,
        });

        if (!createdBucketId) throw new Error('No createdBucketId found from previous test');

        const { error } = await client.storage.deleteBucket(createdBucketId);

        if (error) throw new Error(`Failed to delete bucket: ${error.message}`);
      });
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new table row trigger', async () => {
      const trigger = NewSupabaseTableRow;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      if (!table) throw new Error('No table found from previous test');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: { tableName: table } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
