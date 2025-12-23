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
import { buildAirtableFilterFormula } from '../apps/airtable/helpers/record-based/apply-where-condition';
import { createAirtableRecords } from '../apps/airtable/helpers/record-based/create-records';
import { deleteAirtableRecords } from '../apps/airtable/helpers/record-based/delete-records';
import { getAirtableRecordType } from '../apps/airtable/helpers/record-based/get-record-type';
import { getAirtableTableList } from '../apps/airtable/helpers/record-based/get-table-list';
import { searchAirtableRecords } from '../apps/airtable/helpers/record-based/search-records';
import { updateAirtableRecords } from '../apps/airtable/helpers/record-based/update-records';
import { NewAirtableRecord } from '../apps/airtable/triggers';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

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
      const trigger = NewAirtableRecord;

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

  describe('Should test record based helpers', () => {
    afterEach(async () => {
      await delay(1000);
    });

    const tableName = 'Bug tracker/Bugs and issues';

    const testBugSources = [
      'test-alpha-source',
      'test-beta-source',
      'test-gamma-source',
      'test-delta-source',
    ];

    it('Should get tables', async () => {
      const result = await getAirtableTableList(base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get record type', async () => {
      const result = (await getAirtableRecordType(
        base_context,
        tableName
      )) as IQoreTypeObjectNonList;

      expect(result).toBeDefined();
      expect(result.type).toBe('hash');
      expect(result.fields).toBeDefined();
      expect(Object.keys(result.fields!).length).toBeGreaterThan(2);
    });

    it('Should create records', async () => {
      const result = await createAirtableRecords(
        base_context,
        {
          Name: ['Task Alpha', 'Task Beta', 'Task Gamma', 'Task Delta'],
          Description: [
            'Description for task alpha',
            'Description for task beta',
            'This is gamma record',
            'This is delta record',
          ],
          'Bug source': testBugSources,
        },
        { table: tableName }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result!.Name)).toBe(true);
      expect(result!.Name.length).toBe(4);
      expect(Array.isArray(result!.id)).toBe(true);
      expect(result!.id.length).toBe(4);
    });

    it('Should verify created records', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '||',
          args: testBugSources.map((source) => ({
            exp: '==',
            args: [{ field: 'Bug source' }, { value: source }],
          })),
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeDefined();
      expect(result!['Bug source'].length).toBe(4);

      const alphaIndex = result!['Bug source'].indexOf('test-alpha-source');
      expect(result!.Name[alphaIndex]).toBe('Task Alpha');

      const betaIndex = result!['Bug source'].indexOf('test-beta-source');
      expect(result!.Name[betaIndex]).toBe('Task Beta');
    });

    it('Should search records with simple expression', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '&&',
          args: [
            { exp: '==', args: [{ field: 'Name' }, { value: 'Task Alpha' }] },
            { exp: '==', args: [{ field: 'Bug source' }, { value: 'test-alpha-source' }] },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeDefined();
      expect(result!.Name.length).toBe(1);
      expect(result!.Name[0]).toBe('Task Alpha');
      expect(result!['Bug source'][0]).toBe('test-alpha-source');
    });

    it('Should search records with OR expression', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'Bug source' }, { value: 'test-gamma-source' }] },
            { exp: '==', args: [{ field: 'Bug source' }, { value: 'test-delta-source' }] },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeDefined();
      expect(result!['Bug source'].length).toBe(2);
      result!['Bug source'].forEach((source: string) => {
        expect(['test-gamma-source', 'test-delta-source']).toContain(source);
      });
    });

    it('Should search records with AND expression', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '&&',
          args: [
            { exp: 'not-empty', args: [{ field: 'Name' }] },
            {
              exp: '||',
              args: testBugSources.map((source) => ({
                exp: '==',
                args: [{ field: 'Bug source' }, { value: source }],
              })),
            },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeDefined();
      expect(result!.id.length).toBe(4);
      result!.Name.forEach((name: string) => {
        expect(name).toBeTruthy();
        expect(['Task Alpha', 'Task Beta', 'Task Gamma', 'Task Delta']).toContain(name);
      });
    });

    it('Should search records with contains expression', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '&&',
          args: [
            { exp: 'contains', args: [{ field: 'Description' }, { value: 'task' }] },
            {
              exp: '||',
              args: testBugSources.map((source) => ({
                exp: '==',
                args: [{ field: 'Bug source' }, { value: source }],
              })),
            },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeDefined();
      expect(result!.id.length).toBe(2);
      result!.Description.forEach((description: string) => {
        expect(description.toLowerCase()).toContain('task');
      });
      result!['Bug source'].forEach((source: string) => {
        expect(['test-alpha-source', 'test-beta-source']).toContain(source);
      });
    });

    it('Should search records with not-empty expression', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '&&',
          args: [
            { exp: 'not-empty', args: [{ field: 'Description' }] },
            {
              exp: '||',
              args: testBugSources.map((source) => ({
                exp: '==',
                args: [{ field: 'Bug source' }, { value: source }],
              })),
            },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeDefined();
      expect(result!.id.length).toBe(4);
      result!.Description.forEach((description: string) => {
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('Should search records with deeply nested expression (3 levels)', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '&&',
          args: [
            {
              exp: '||',
              args: testBugSources.map((source) => ({
                exp: '==',
                args: [{ field: 'Bug source' }, { value: source }],
              })),
            },
            {
              exp: '||',
              args: [
                {
                  exp: 'contains',
                  args: [{ field: 'Description' }, { value: 'task' }],
                },
                {
                  exp: '||',
                  args: [
                    { exp: 'contains', args: [{ field: 'Description' }, { value: 'gamma' }] },
                    { exp: 'contains', args: [{ field: 'Description' }, { value: 'delta' }] },
                  ],
                },
              ],
            },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeDefined();
      expect(result!.id.length).toBe(4);
      result!['Bug source'].forEach((source: string) => {
        expect(testBugSources).toContain(source);
      });
    });

    it('Should exclude records that do not match filter', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '&&',
          args: [
            { exp: 'contains', args: [{ field: 'Description' }, { value: 'nonexistent' }] },
            {
              exp: '||',
              args: testBugSources.map((source) => ({
                exp: '==',
                args: [{ field: 'Bug source' }, { value: source }],
              })),
            },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(base_context, 10);

      expect(result).toBeNull();
    });

    it('Should update records', async () => {
      const result = await updateAirtableRecords(
        base_context,
        {
          Description: 'Updated description',
        },
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'Bug source' }, { value: 'test-gamma-source' }] },
            { exp: '==', args: [{ field: 'Bug source' }, { value: 'test-delta-source' }] },
          ],
        },
        { table: tableName }
      );

      expect(result).toBeDefined();
      expect(result).toBe(2);
    });

    it('Should handle pagination with filters', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '||',
          args: testBugSources.map((source) => ({
            exp: '==',
            args: [{ field: 'Bug source' }, { value: source }],
          })),
        },
        { table: tableName }
      );

      const firstPage = await iterator(base_context, 2);

      expect(firstPage).toBeDefined();
      expect(firstPage!.id.length).toBeLessThanOrEqual(2);

      const secondPage = await iterator(base_context, 2);
      if (secondPage && secondPage.id.length > 0) {
        const firstIds = new Set(firstPage!.id);
        secondPage.id.forEach((id: string) => {
          expect(firstIds.has(id)).toBe(false);
        });
      }
    });

    it('Should combine filters with ordering', async () => {
      const iterator = await searchAirtableRecords(
        base_context,
        {
          exp: '||',
          args: testBugSources.map((source) => ({
            exp: '==',
            args: [{ field: 'Bug source' }, { value: source }],
          })),
        },
        {
          table: tableName,
          orderBy: {
            column: 'Name',
            ascending: true,
          },
        }
      );

      const result = await iterator(base_context, 10);
      expect(result).toBeDefined();
      expect(result!.id.length).toBe(4);

      const names = result!.Name;
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });

    it('Should clean up all test records', async () => {
      const result = await deleteAirtableRecords(
        base_context,
        {
          exp: '||',
          args: testBugSources.map((source) => ({
            exp: '==',
            args: [{ field: 'Bug source' }, { value: source }],
          })),
        },
        { table: tableName }
      );

      expect(result).toBe(4);
    });
  });

  describe('Should test Airtable formula building', () => {
    describe('Logical operators', () => {
      it('Should build AND formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '&&',
          args: [
            { exp: '==', args: [{ field: 'Name' }, { value: 'Test' }] },
            { exp: '==', args: [{ field: 'Status' }, { value: 'Active' }] },
          ],
        });

        expect(result).toBe("AND({Name} = 'Test', {Status} = 'Active')");
      });

      it('Should build OR formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'Status' }, { value: 'Active' }] },
            { exp: '==', args: [{ field: 'Status' }, { value: 'Pending' }] },
          ],
        });

        expect(result).toBe("OR({Status} = 'Active', {Status} = 'Pending')");
      });

      it('Should build NOT formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'not',
          args: [{ exp: '==', args: [{ field: 'Status' }, { value: 'Closed' }] }],
        });

        expect(result).toBe("NOT({Status} = 'Closed')");
      });

      it('Should build XOR formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'xor',
          args: [
            { exp: '==', args: [{ field: 'A' }, { value: 'yes' }] },
            { exp: '==', args: [{ field: 'B' }, { value: 'yes' }] },
          ],
        });

        expect(result).toBe("XOR({A} = 'yes', {B} = 'yes')");
      });

      it('Should handle single condition in AND', () => {
        const result = buildAirtableFilterFormula({
          exp: '&&',
          args: [{ exp: '==', args: [{ field: 'Name' }, { value: 'Test' }] }],
        });

        expect(result).toBe("{Name} = 'Test'");
      });
    });

    describe('Comparison operators', () => {
      it('Should build equals formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '==',
          args: [{ field: 'Name' }, { value: 'Test' }],
        });

        expect(result).toBe("{Name} = 'Test'");
      });

      it('Should build not equals formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '!=',
          args: [{ field: 'Name' }, { value: 'Test' }],
        });

        expect(result).toBe("{Name} != 'Test'");
      });

      it('Should build greater than formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '>',
          args: [{ field: 'Count' }, { value: 10 }],
        });

        expect(result).toBe('{Count} > 10');
      });

      it('Should build greater than or equal formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '>=',
          args: [{ field: 'Count' }, { value: 5 }],
        });

        expect(result).toBe('{Count} >= 5');
      });

      it('Should build less than formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '<',
          args: [{ field: 'Count' }, { value: 100 }],
        });

        expect(result).toBe('{Count} < 100');
      });

      it('Should build less than or equal formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '<=',
          args: [{ field: 'Count' }, { value: 50 }],
        });

        expect(result).toBe('{Count} <= 50');
      });
    });

    describe('String operators', () => {
      it('Should build contains formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'contains',
          args: [{ field: 'Description' }, { value: 'test' }],
        });

        expect(result).toBe("FIND('test', {Description}) > 0");
      });

      it('Should build contains-not formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'contains-not',
          args: [{ field: 'Description' }, { value: 'spam' }],
        });

        expect(result).toBe("FIND('spam', {Description}) = 0");
      });

      it('Should build starts-with formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'starts-with',
          args: [{ field: 'Name' }, { value: 'Pre' }],
        });

        expect(result).toBe("LEFT({Name}, 3) = 'Pre'");
      });

      it('Should build ends-with formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'ends-with',
          args: [{ field: 'Email' }, { value: '.com' }],
        });

        expect(result).toBe("RIGHT({Email}, 4) = '.com'");
      });

      it('Should build regex-match formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'regex-match',
          args: [{ field: 'Code' }, { value: '^[A-Z]{3}$' }],
        });

        expect(result).toBe("REGEX_MATCH({Code}, '^[A-Z]{3}$')");
      });
    });

    describe('String functions', () => {
      it('Should build FIND formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'find',
          args: [{ field: 'Text' }, { value: 'needle' }],
        });

        expect(result).toBe("FIND('needle', {Text})");
      });

      it('Should build SEARCH formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'search',
          args: [{ field: 'Text' }, { value: 'Needle' }],
        });

        expect(result).toBe("SEARCH('Needle', {Text})");
      });

      it('Should build LEN formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'len',
          args: [{ field: 'Name' }],
        });

        expect(result).toBe('LEN({Name})');
      });

      it('Should build LOWER formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'lower',
          args: [{ field: 'Name' }],
        });

        expect(result).toBe('LOWER({Name})');
      });

      it('Should build UPPER formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'upper',
          args: [{ field: 'Name' }],
        });

        expect(result).toBe('UPPER({Name})');
      });

      it('Should build TRIM formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'trim',
          args: [{ field: 'Name' }],
        });

        expect(result).toBe('TRIM({Name})');
      });
    });

    describe('Numeric functions', () => {
      it('Should build ABS formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'abs',
          args: [{ field: 'Difference' }],
        });

        expect(result).toBe('ABS({Difference})');
      });

      it('Should build ROUND formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'round',
          args: [{ field: 'Price' }, { value: 2 }],
        });

        expect(result).toBe('ROUND({Price}, 2)');
      });

      it('Should build FLOOR formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'floor',
          args: [{ field: 'Value' }],
        });

        expect(result).toBe('FLOOR({Value})');
      });

      it('Should build CEILING formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'ceiling',
          args: [{ field: 'Value' }],
        });

        expect(result).toBe('CEILING({Value})');
      });

      it('Should build MOD formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'mod',
          args: [{ field: 'Number' }, { value: 3 }],
        });

        expect(result).toBe('MOD({Number}, 3)');
      });
    });

    describe('Null check operators', () => {
      it('Should build empty formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'empty',
          args: [{ field: 'Notes' }],
        });

        expect(result).toBe("OR({Notes} = '', {Notes} = BLANK())");
      });

      it('Should build not-empty formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'not-empty',
          args: [{ field: 'Notes' }],
        });

        expect(result).toBe("AND({Notes} != '', {Notes} != BLANK())");
      });
    });

    describe('Date/time operators', () => {
      it('Should build is-before formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'is-before',
          args: [{ field: 'DueDate' }, { value: '2024-01-01' }],
        });

        expect(result).toBe("IS_BEFORE({DueDate}, '2024-01-01')");
      });

      it('Should build is-after formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'is-after',
          args: [{ field: 'CreatedAt' }, { value: '2024-06-01' }],
        });

        expect(result).toBe("IS_AFTER({CreatedAt}, '2024-06-01')");
      });

      it('Should build is-same formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'is-same',
          args: [{ field: 'Date' }, { value: '2024-12-25' }],
        });

        expect(result).toBe("IS_SAME({Date}, '2024-12-25')");
      });
    });

    describe('Boolean operators', () => {
      it('Should build boolean true formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'boolean',
          args: [{ field: 'IsActive' }, { value: true }],
        });

        expect(result).toBe('{IsActive}');
      });

      it('Should build boolean false formula', () => {
        const result = buildAirtableFilterFormula({
          exp: 'boolean',
          args: [{ field: 'IsActive' }, { value: false }],
        });

        expect(result).toBe('NOT({IsActive})');
      });
    });

    describe('Value escaping', () => {
      it('Should escape single quotes in strings', () => {
        const result = buildAirtableFilterFormula({
          exp: '==',
          args: [{ field: 'Name' }, { value: "O'Brien" }],
        });

        expect(result).toBe("{Name} = 'O\\'Brien'");
      });

      it('Should handle null values', () => {
        const result = buildAirtableFilterFormula({
          exp: '==',
          args: [{ field: 'Name' }, { value: null }],
        });

        expect(result).toBe('{Name} = BLANK()');
      });

      it('Should handle boolean values', () => {
        const result = buildAirtableFilterFormula({
          exp: '==',
          args: [{ field: 'Flag' }, { value: true }],
        });

        expect(result).toBe('{Flag} = TRUE()');
      });

      it('Should handle numeric values', () => {
        const result = buildAirtableFilterFormula({
          exp: '==',
          args: [{ field: 'Count' }, { value: 42 }],
        });

        expect(result).toBe('{Count} = 42');
      });
    });

    describe('Nested expressions', () => {
      it('Should build deeply nested formula', () => {
        const result = buildAirtableFilterFormula({
          exp: '&&',
          args: [
            {
              exp: '||',
              args: [
                { exp: '==', args: [{ field: 'Status' }, { value: 'Active' }] },
                { exp: '==', args: [{ field: 'Status' }, { value: 'Pending' }] },
              ],
            },
            {
              exp: 'not',
              args: [{ exp: 'empty', args: [{ field: 'Name' }] }],
            },
          ],
        });

        expect(result).toBe(
          "AND(OR({Status} = 'Active', {Status} = 'Pending'), NOT(OR({Name} = '', {Name} = BLANK())))"
        );
      });
    });
  });
});
