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
import { createSupabaseClient } from '../apps/supabase/helpers/constants';
import { getSupabaseBucketAllowedValues } from '../apps/supabase/helpers/get-bucket-allowed-values';
import { getSupabaseTableAllowedValues } from '../apps/supabase/helpers/get-table-allowed-values';
import {
  getSupabaseTableColumnAllowedValues,
  getSupabaseTableColumnOptions,
  getSupabaseTableColumnsResponseType,
} from '../apps/supabase/helpers/get-table-fields';
import { createSupabaseRecords } from '../apps/supabase/helpers/record-based/create-records';
import { deleteSupabaseRecords } from '../apps/supabase/helpers/record-based/delete-records';
import { searchSupabaseRecords } from '../apps/supabase/helpers/record-based/search-records';
import { updateSupabaseRecords } from '../apps/supabase/helpers/record-based/update-records';
import { upsertSupabaseRecord } from '../apps/supabase/helpers/record-based/upsert-records';
import { NewSupabaseTableRow } from '../apps/supabase/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

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

  describe('Should test record based methods with complex expressions', () => {
    const table = 'Test';

    it('Should search records without expressions', async () => {
      const getRecordsIterator = await searchSupabaseRecords(baseContext, undefined, {
        table,
      });

      const result = await getRecordsIterator(baseContext, 2);

      expect(result).toBeDefined();
      expect(Object.keys(result || {}).length).toBeGreaterThan(0);
      expect(Array.isArray(result!.id)).toBe(true);
      expect(result!.id.length).toBeLessThanOrEqual(2);
    });

    it('Should search records with a simple AND expression', async () => {
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            { exp: 'in', args: [{ field: 'id' }, { value: [1, 3] }] },
            { exp: '==', args: [{ field: 'bool' }, { value: true }] },
          ],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 5);

      expect(result).toBeDefined();
      expect(result!.id).not.toContain(1);
    });

    it('Should search records with OR expression', async () => {
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'id' }, { value: 1 }] },
            { exp: '==', args: [{ field: 'id' }, { value: 11 }] },
          ],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id).toContain(1);
      expect(result!.id).toContain(11);
      expect(result!.id.length).toBe(2);
    });

    it('Should search records with NOT expression', async () => {
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: 'NOT',
          args: [{ exp: '==', args: [{ field: 'bool' }, { value: true }] }],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id).toContain(1); // bool is false
      expect(result!.id).not.toContain(2); // bool is true
      expect(result!.id).not.toContain(3); // bool is true
    });

    it('Should search records with nested AND/OR expression', async () => {
      // Find records where: (id IN [1,2,3] AND bool=true) OR (id IN [11] AND bool=true)
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: '||',
          args: [
            {
              exp: '&&',
              args: [
                { exp: 'in', args: [{ field: 'id' }, { value: [1, 2, 3] }] },
                { exp: '==', args: [{ field: 'bool' }, { value: true }] },
              ],
            },
            {
              exp: '&&',
              args: [
                { exp: '==', args: [{ field: 'id' }, { value: 11 }] },
                { exp: '==', args: [{ field: 'bool' }, { value: true }] },
              ],
            },
          ],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id).toContain(2); // id in [1,2,3] and bool=true
      expect(result!.id).toContain(3); // id in [1,2,3] and bool=true
      expect(result!.id).toContain(11); // id=11 and bool=true
    });

    it('Should search records with deeply nested expression (3 levels)', async () => {
      // Complex query: ((id <= 3 OR id >= 11) AND bool = true) OR (id = 1)
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: '||',
          args: [
            {
              exp: '&&',
              args: [
                {
                  exp: '||',
                  args: [
                    { exp: '<=', args: [{ field: 'id' }, { value: 3 }] },
                    { exp: '>=', args: [{ field: 'id' }, { value: 11 }] },
                  ],
                },
                { exp: '==', args: [{ field: 'bool' }, { value: true }] },
              ],
            },
            { exp: '==', args: [{ field: 'id' }, { value: 1 }] },
          ],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id).toContain(1); // Matches id=1 condition
      expect(result!.id).toContain(2); // id<=3 AND bool=true
      expect(result!.id).toContain(3); // id<=3 AND bool=true
      expect(result!.id).toContain(11); // id>=11 AND bool=true
    });

    it('Should search records with comparison operators', async () => {
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            { exp: '>', args: [{ field: 'id' }, { value: 2 }] },
            { exp: '<', args: [{ field: 'id' }, { value: 11 }] },
          ],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id).toContain(3);
      expect(result!.id).not.toContain(1);
      expect(result!.id).not.toContain(2);
      expect(result!.id).not.toContain(11);
    });

    it('Should search records with LIKE operator', async () => {
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: 'like',
          args: [{ field: 'title' }, { value: '%Test%' }],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id.length).toBeGreaterThan(0);
      result!.title.forEach((title: string) => {
        expect(title.toLowerCase()).toContain('test');
      });
    });

    it('Should search records with very deep nested expression (4+ levels)', async () => {
      // (((id=1 OR id=2) AND bool=true) OR (id=3 AND NOT (bool=false))) AND id < 20
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: '||',
              args: [
                {
                  exp: '&&',
                  args: [
                    {
                      exp: '||',
                      args: [
                        { exp: '==', args: [{ field: 'id' }, { value: 1 }] },
                        { exp: '==', args: [{ field: 'id' }, { value: 2 }] },
                      ],
                    },
                    { exp: '==', args: [{ field: 'bool' }, { value: true }] },
                  ],
                },
                {
                  exp: '&&',
                  args: [
                    { exp: '==', args: [{ field: 'id' }, { value: 3 }] },
                    {
                      exp: 'NOT',
                      args: [{ exp: '==', args: [{ field: 'bool' }, { value: false }] }],
                    },
                  ],
                },
              ],
            },
            { exp: '<', args: [{ field: 'id' }, { value: 20 }] },
          ],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      // id=2 AND bool=true matches first branch
      expect(result!.id).toContain(2);
      // id=3 AND bool!=false matches second branch
      expect(result!.id).toContain(3);
    });

    it('Should handle pagination with complex expressions', async () => {
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: '||',
          args: [
            { exp: '<=', args: [{ field: 'id' }, { value: 3 }] },
            { exp: '>=', args: [{ field: 'id' }, { value: 11 }] },
          ],
        },
        { table }
      );

      const firstPage = await getRecordsIterator(baseContext, 2);
      expect(firstPage).toBeDefined();
      expect(firstPage!.id.length).toBe(2);

      const secondPage = await getRecordsIterator(baseContext, 2);
      expect(secondPage).toBeDefined();
      expect(secondPage!.id.length).toBeGreaterThan(0);

      const firstIds = new Set(firstPage!.id);
      secondPage!.id.forEach((id: number) => {
        expect(firstIds.has(id)).toBe(false);
      });
    });

    const createdTitle = 'Record created via createSupabaseRecords';
    const updatedTitle = 'Record updated via updateSupabaseRecords';
    const upsertedTitle = 'Record upserted via upsertSupabaseRecords';
    it('Should create a record', async () => {
      const result = await createSupabaseRecords(
        baseContext,
        {
          title: [createdTitle],
        },
        { table }
      );

      expect(result).toBeDefined();
      expect(result.title).toContain(createdTitle);
    });

    it('Should upsert a record', async () => {
      const result = await upsertSupabaseRecord(
        baseContext,
        {
          title: [upsertedTitle],
        },
        { table }
      );

      expect(result).toBeDefined();
    });

    it('Should update records', async () => {
      const result = await updateSupabaseRecords(
        baseContext,
        {
          title: updatedTitle,
        },
        { exp: 'in', args: [{ field: 'title' }, { value: [createdTitle] }] },
        { table }
      );

      expect(result).toBeDefined();
      expect(result).toBe(1);
    });

    it('Should delete records', async () => {
      const result = await deleteSupabaseRecords(
        baseContext,
        { exp: 'in', args: [{ field: 'title' }, { value: [updatedTitle, upsertedTitle] }] },
        { table }
      );

      expect(result).toBeDefined();
      expect(result).toBe(2);
    });

    it('Should search records using contains expression', async () => {
      const getRecordsIterator = await searchSupabaseRecords(
        baseContext,
        {
          exp: 'contains',
          args: [{ field: 'arr' }, { value: ['two'] }],
        },
        { table }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id).toContain(6);
    });
  });
});
