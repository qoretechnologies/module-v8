import { configDotenv } from 'dotenv';
import {
  ArchiveMondayRecord,
  ClearMondayColumnValue,
  CreateMondayRecord,
  DeleteMondayRecord,
  GetMondayRecord,
  MoveMondayRecord,
  SearchMondayRecords,
  UpdateMondayRecord,
} from '../apps/monday/actions';
import { getMondayBoardDependentOptions } from '../apps/monday/helpers/get-board-fields';
import { getMondayBoardIdAllowedValues } from '../apps/monday/helpers/get-board-id-allowed-values';
import { getMondaySingleColumnAllowedValues } from '../apps/monday/helpers/get-column-allowed-values';
import { getMondayColumnIdAllowedValues } from '../apps/monday/helpers/get-column-id-allowed-values';
import { getMondayGroupIdAllowedValues } from '../apps/monday/helpers/get-group-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../apps/monday/helpers/get-record-id-allowed-values';
import { createMondayRecords } from '../apps/monday/helpers/record-based/create-records';
import { deleteMondayRecords } from '../apps/monday/helpers/record-based/delete-records';
import { getMondayRecordType } from '../apps/monday/helpers/record-based/get-record-type';
import { getMondayTableList } from '../apps/monday/helpers/record-based/get-table-list';
import { searchMondayRecords } from '../apps/monday/helpers/record-based/search-records';
import { updateMondayRecords } from '../apps/monday/helpers/record-based/update-records';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Monday', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
    opts: {},
  } as any;

  beforeAll(() => {
    const token = process.env.MONDAY_TOKEN;

    if (!token) {
      throw new Error('MONDAY_TOKEN is not defined in environment variables');
    }

    baseContext.conn_opts.token = token;
  });

  describe('Should test monday actions and allowed values', () => {
    let boardId: string;
    let groupId: string;
    let destinationGroupId: string;

    describe('Should test Monday app allowed values', () => {
      it('Should get board id allowed values', async () => {
        const allowedValues = await getMondayBoardIdAllowedValues(baseContext);

        expect(allowedValues).toBeDefined();
        expect(allowedValues.length).toBeGreaterThan(0);
        expect(allowedValues[0].value).not.toBeFalsy();

        boardId =
          allowedValues.find((data) => data.display_name === 'Testing Board')?.value ||
          allowedValues[0].value;
        baseContext.opts = { board_id: boardId };
      });
      it('Should get group id allowed values', async () => {
        const allowedValues = await getMondayGroupIdAllowedValues(baseContext);

        expect(allowedValues).toBeDefined();
        expect(allowedValues.length).toBeGreaterThan(0);
        expect(allowedValues[0].value).not.toBeFalsy();

        groupId = allowedValues[0].value;
        destinationGroupId = allowedValues[1].value;
      });

      it('Should get column id allowed values', async () => {
        const allowedValues = await getMondayColumnIdAllowedValues(baseContext);

        expect(allowedValues).toBeDefined();
        expect(allowedValues.length).toBeGreaterThan(0);
        expect(allowedValues[0].value).not.toBeFalsy();
      });

      it('Should get column allowed values', async () => {
        const allowedValues = await getMondaySingleColumnAllowedValues({
          ...baseContext,
          opts: { ...baseContext.opts, column_id: 'status' },
        });

        expect(allowedValues).toBeDefined();
        expect(allowedValues.length).toBeGreaterThan(0);
        expect(allowedValues[0].value).not.toBeFalsy();
      });
      it('Should get record id allowed values', async () => {
        const allowedValues = await getMondayRecordIdAllowedValues(baseContext);

        expect(allowedValues).toBeDefined();
        expect(allowedValues.length).toBeGreaterThan(0);
        expect(allowedValues[0].value).not.toBeFalsy();
      });

      it('Should get record fields', async () => {
        const options = await getMondayBoardDependentOptions(baseContext);

        expect(options).toBeDefined();
        expect(Object.keys(options).length).toBeGreaterThan(0);
      });
    });

    describe('Should test Monday app actions', () => {
      let itemId: string;
      it('Should create a new record', async () => {
        const action = CreateMondayRecord;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }

        const createRecord = action.api_function;

        const result = await createRecord(
          {
            board_id: boardId,
            group_id: groupId,
            column_values: { name: 'Test Item' },
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        itemId = result.id;
      });

      it('Should get the created record', async () => {
        const action = GetMondayRecord;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }

        const result = await action.api_function(
          {
            board_id: boardId,
            record_id: itemId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(itemId);
      });

      it('Should clear the column values of the created record', async () => {
        const action = ClearMondayColumnValue;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }

        const result = await action.api_function(
          {
            board_id: boardId,
            record_id: itemId,
            column_id: 'status',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('Should move the created record', async () => {
        const action = MoveMondayRecord;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }

        const result = await action.api_function(
          {
            board_id: boardId,
            record_id: itemId,
            destination_group_id: destinationGroupId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('Should search for the created record', async () => {
        const action = SearchMondayRecords;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }

        const result = await action.api_function(
          {
            board_id: boardId,
            columnId: 'name',
            limit: 10,
            query_text: 'Test Item',
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.items).toBeDefined();
        expect(result.items[0].id).toBe(itemId);
      });

      it('Should update the created record', async () => {
        const action = UpdateMondayRecord;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }

        const result = await action.api_function(
          {
            board_id: boardId,
            record_id: itemId,
            column_values: { name: 'Test Item Updated' },
          },
          undefined,
          baseContext
        );

        expect(result.id).toBeDefined();
      });

      it('Should archive the created record', async () => {
        const action = ArchiveMondayRecord;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }
        const result = await action.api_function(
          {
            board_id: boardId,
            record_id: itemId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
      });

      it('Should delete the created record', async () => {
        const action = DeleteMondayRecord;

        if (!('api_function' in action) || !action.api_function) {
          throw new Error('action does not have api_function');
        }

        const result = await action.api_function(
          {
            board_id: boardId,
            record_id: itemId,
          },
          undefined,
          baseContext
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(itemId);
      });
    });
  });

  const table = 'Testing Board';

  const testIdentifier = `MONDAY_TEST_${Date.now()}`;
  describe('Should test record based helpers', () => {
    it('Should get table list', async () => {
      const result = await getMondayTableList(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get record type', async () => {
      const recordType = (await getMondayRecordType(baseContext, table)) as any;

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');
      expect(recordType.fields).toBeDefined();
      expect(Object.keys(recordType.fields).length).toBeGreaterThan(0);
    });

    it('Should create test records', async () => {
      const result = await createMondayRecords(
        baseContext,
        {
          name: [
            `${testIdentifier}_Item_1`,
            `${testIdentifier}_Item_2`,
            `${testIdentifier}_Item_3`,
            `${testIdentifier}_Item_4`,
          ],
          status: ['Working on it', 'Done', 'Working on it', 'Stuck'],
          numeric_mky1y6dr: [10, 25, 50, 75],
          boolean_mky150jv: [true, false, true, false],
          date4: ['2025-12-01', '2025-12-05', '2025-12-10', '2025-12-15'],
          color_mky12g5z: ['Low', 'Medium', 'High', 'Critical ⚠️️'],
          dropdown_mky15tgy: [['test'], ['another'], ['test', 'another'], ['test']],
        },
        { table }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.name)).toBe(true);
      expect(result.name.length).toBe(4);
    });

    it('Should search records with simple equality', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: '==',
          args: [{ field: 'status' }, { value: 'Done' }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.status.filter((s: string) => s === 'Done').length).toBeGreaterThanOrEqual(1);
    });

    it('Should search with complex nested expression (3 levels)', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: '||',
              args: [
                {
                  exp: '==',
                  args: [{ field: 'status' }, { value: ['Working on it'] }],
                },
                {
                  exp: '==',
                  args: [{ field: 'status' }, { value: ['Done'] }],
                },
              ],
            },
            {
              exp: '>=',
              args: [{ field: 'numeric_mky1y6dr' }, { value: 25 }],
            },
            {
              exp: 'contains-text',
              args: [{ field: 'name' }, { value: testIdentifier }],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBeGreaterThanOrEqual(2);

      result!.name.forEach((name: string) => {
        expect(name).toContain(testIdentifier);
      });

      result!.status.forEach((status: string) => {
        expect(['Working on it', 'Done']).toContain(status);
      });

      result!.numeric_mky1y6dr.forEach((num: string) => {
        expect(Number(num)).toBeGreaterThanOrEqual(25);
      });
    });

    it('Should search with deeply nested expression (4 levels)', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: '&&',
              args: [
                {
                  exp: '||',
                  args: [
                    {
                      exp: '==',
                      args: [{ field: 'color_mky12g5z' }, { value: 'High' }],
                    },
                    {
                      exp: '==',
                      args: [{ field: 'color_mky12g5z' }, { value: 'Critical' }],
                    },
                  ],
                },
                {
                  exp: '||',
                  args: [
                    {
                      exp: '==',
                      args: [{ field: 'status' }, { value: 'Working on it' }],
                    },
                    {
                      exp: '==',
                      args: [{ field: 'status' }, { value: 'Stuck' }],
                    },
                  ],
                },
              ],
            },
            {
              exp: '>=',
              args: [{ field: 'numeric_mky1y6dr' }, { value: 50 }],
            },
            {
              exp: 'contains-text',
              args: [{ field: 'name' }, { value: testIdentifier }],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBeGreaterThanOrEqual(1);

      result!.name.forEach((name: string) => {
        expect(name).toContain(testIdentifier);
      });

      result!.color_mky12g5z.forEach((priority: string) => {
        expect(['High', 'Critical']).toContain(priority);
      });

      result!.status.forEach((status: string) => {
        expect(['Working on it', 'Stuck']).toContain(status);
      });

      result!.numeric_mky1y6dr.forEach((num: string) => {
        expect(Number(num)).toBeGreaterThanOrEqual(50);
      });
    });

    it('Should search with date range expressions', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: '>=',
              args: [{ field: 'date4' }, { value: '2025-12-05' }],
            },
            {
              exp: '<=',
              args: [{ field: 'date4' }, { value: '2025-12-15' }],
            },
            {
              exp: 'contains-text',
              args: [{ field: 'name' }, { value: testIdentifier }],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBeGreaterThanOrEqual(3);

      result!.date4.forEach((date: string) => {
        const dateValue = new Date(date);
        expect(dateValue >= new Date('2025-12-05')).toBe(true);
        expect(dateValue <= new Date('2025-12-15')).toBe(true);
      });
    });

    it('Should search with in operator', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: 'in',
              args: [{ field: 'status' }, { value: ['Working on it', 'Stuck'] }],
            },
            {
              exp: 'contains-text',
              args: [{ field: 'name' }, { value: testIdentifier }],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBeGreaterThanOrEqual(2);

      result!.status.forEach((status: string) => {
        expect(['Working on it', 'Stuck']).toContain(status);
      });
    });

    it('Should search with not-in operator', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: 'not-in',
              args: [{ field: 'status' }, { value: ['Done'] }],
            },
            {
              exp: 'contains-text',
              args: [{ field: 'name' }, { value: testIdentifier }],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBeGreaterThanOrEqual(2);

      result!.status.forEach((status: string) => {
        expect(status).not.toBe('Done');
      });
    });

    it('Should search with between operator', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: 'between',
              args: [{ field: 'date4' }, { value: '2025-12-05' }, { value: '2025-12-15' }],
            },
            {
              exp: 'contains-text',
              args: [{ field: 'name' }, { value: testIdentifier }],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBeGreaterThanOrEqual(2);

      result!.date4.forEach((date: string) => {
        const dateValue = new Date(date);
        expect(dateValue >= new Date('2025-12-05')).toBe(true);
        expect(dateValue <= new Date('2025-12-15')).toBe(true);
      });
    });

    it('Should search with starts-with operator', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: 'starts-with',
          args: [{ field: 'name' }, { value: testIdentifier }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBeGreaterThanOrEqual(4);

      result!.name.forEach((name: string) => {
        expect(name.startsWith(testIdentifier)).toBe(true);
      });
    });

    it('Should update test records', async () => {
      const count = await updateMondayRecords(
        baseContext,
        {
          status: 'Done',
          numeric_mky1y6dr: '100',
          boolean_mky150jv: true,
        },
        {
          exp: 'contains-text',
          args: [{ field: 'name' }, { value: testIdentifier }],
        },
        { table }
      );

      expect(count).toBe(4);
    });

    it('Should verify updated records', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: 'contains-text',
          args: [{ field: 'name' }, { value: testIdentifier }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBe(4);

      result!.status.forEach((status: string) => {
        expect(status).toBe('Done');
      });

      result!.numeric_mky1y6dr.forEach((num: string) => {
        expect(Number(num)).toBe(100);
      });

      result!.boolean_mky150jv.forEach((bool: boolean) => {
        expect(bool).toBe(true);
      });
    });

    it('Should search with ordering', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: 'contains-text',
          args: [{ field: 'name' }, { value: testIdentifier }],
        },
        {
          table,
          orderBy: {
            column: 'status',
            ascending: true,
          },
        }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.name.length).toBe(4);

      const dates = result!.created_at.map((d: string) => new Date(d).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
      }
    });

    it('Should handle pagination correctly', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: 'contains-text',
          args: [{ field: 'name' }, { value: testIdentifier }],
        },
        { table }
      );

      const firstPage = await iterator(baseContext, 2);
      expect(firstPage).toBeDefined();
      expect(firstPage!.id.length).toBe(2);

      const secondPage = await iterator(baseContext, 2);
      expect(secondPage).toBeDefined();
      expect(secondPage!.id.length).toBe(2);

      const firstIds = new Set(firstPage!.id);
      secondPage!.id.forEach((id: string) => {
        expect(firstIds.has(id)).toBe(false);
      });

      const thirdPage = await iterator(baseContext, 2);
      expect(thirdPage).toBeNull();
    });

    it('Should clean up test records', async () => {
      const count = await deleteMondayRecords(
        baseContext,
        {
          exp: 'contains-text',
          args: [{ field: 'name' }, { value: testIdentifier }],
        },
        { table }
      );

      expect(count).toBe(4);
    });

    it('Should verify records were deleted', async () => {
      const iterator = await searchMondayRecords(
        baseContext,
        {
          exp: 'contains-text',
          args: [{ field: 'name' }, { value: testIdentifier }],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeNull();
    });
  });
});
