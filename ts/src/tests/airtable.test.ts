import { configDotenv } from 'dotenv';
import {
  CreateAirtableRecord,
  DeleteAirtableRecord,
  GetAirtableRecord,
  ListAirtableBases,
  ListAirtableRecords,
  ListAirtableTables,
} from '../apps/airtable/actions';
import { getAirtableBaseIdAllowedValues } from '../apps/airtable/helpers/get-base-id-allowed-values';
import { getAirtableRecordAllowedValues } from '../apps/airtable/helpers/get-record-id-allowed-values';
import { getAirtableTableFieldsAllowedValues } from '../apps/airtable/helpers/get-table-fields-allowed-values';
import { getAirtableTableIdAllowedValues } from '../apps/airtable/helpers/get-table-id-allowed-values';
import { getAirtableViewsAllowedValues } from '../apps/airtable/helpers/get-view-id-allowed-values';
import { AirtableNewRecordTrigger } from '../apps/airtable/triggers';

configDotenv({ path: '.env' });

describe('Test Airtable Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.AIRTABLE_TOKEN;

    if (!token) {
      throw new Error(`Please set the AIRTABLE_TOKEN environment variable.`);
    }

    base_context.conn_opts.token = token;
  });

  let base_id: string | undefined;
  let table_id: string | undefined;
  let record_id: string | undefined;
  let created_record_id: string | undefined;
  describe('Should test Airtable allowed values', () => {
    it('Should get base id allowed values', async () => {
      const allowed_values = await getAirtableBaseIdAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      base_id = allowed_values[0].value;
    });

    it('Should get table id allowed values', async () => {
      const allowed_values = await getAirtableTableIdAllowedValues({
        ...base_context,
        opts: { base_id },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      table_id = allowed_values[0].value;
    });

    it('Should get table fields allowed values', async () => {
      const allowed_values = await getAirtableTableFieldsAllowedValues({
        ...base_context,
        opts: { base_id, table_id },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get record id allowed values', async () => {
      const allowed_values = await getAirtableRecordAllowedValues({
        ...base_context,
        opts: { base_id, table_id },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      record_id = allowed_values[0].value;
    });

    it('Should get views allowed values', async () => {
      const allowed_values = await getAirtableViewsAllowedValues({
        ...base_context,
        opts: { base_id, table_id },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Airtable actions', () => {
    it('Should list records', async () => {
      const action = ListAirtableRecords;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          base_id,
          table_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get record', async () => {
      const action = GetAirtableRecord;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const record = await action.api_function(
        {
          base_id,
          table_id,
          record_id,
        },
        undefined,
        base_context
      );

      expect(record).toBeDefined();
      expect(record.id).toBe(record_id);
    });

    it('Should create a record', async () => {
      const action = CreateAirtableRecord;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          base_id,
          table_id,
          Name: 'Test Record',
        } as any,
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      created_record_id = result.id;
    });

    it('Should delete a record', async () => {
      const action = DeleteAirtableRecord;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!created_record_id) throw new Error('created_record_id is not defined');

      const result = await action.api_function(
        {
          base_id,
          table_id,
          record_id: created_record_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should list bases', async () => {
      const action = ListAirtableBases;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.bases).toBeDefined();
      expect(result.bases.length).toBeGreaterThan(0);
    });

    it('Should list tables', async () => {
      const action = ListAirtableTables;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          base_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.tables).toBeDefined();
      expect(result.tables.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Airtable triggers event example data', () => {
    it('Should get example event data for new record trigger', async () => {
      const trigger = AirtableNewRecordTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { base_id, table_id } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
