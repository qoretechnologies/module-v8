import { configDotenv } from 'dotenv';
import {
  CreateBaserowRow,
  DeleteBaserowRow,
  GetBaserowTableFields,
  ListBaserowRows,
  ListBaserowTables,
  UpdateBaserowRow,
  UploadBaserowFile,
} from '../apps/baserow/actions';
import { getBaserowTableAllowedValues } from '../apps/baserow/helpers/get-table-allowed-values';
import {
  getBaserowTableColumnOptions,
  getBaserowTableColumnsResponseType,
} from '../apps/baserow/helpers/get-table-fields';
import { getBaserowTableFieldsAllowedValues } from '../apps/baserow/helpers/get-table-fields-allowed-values';
import { getBaserowTableRowsAllowedValues } from '../apps/baserow/helpers/get-table-row-allowed-values';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { getBaserowTableList } from '../apps/baserow/helpers/record-based/get-table-list';
import { getBaserowRecordType } from '../apps/baserow/helpers/record-based/get-record-type';
import { createBaserowRecords } from '../apps/baserow/helpers/record-based/create-records';
import { updateBaserowRecords } from '../apps/baserow/helpers/record-based/update-records';
import { deleteBaserowRecords } from '../apps/baserow/helpers/record-based/delete-records';
import { searchBaserowRecords } from '../apps/baserow/helpers/record-based/search-records';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Baserow', () => {
  const baseContext = {
    conn_opts: {
      token: '',
      url: 'https://api.baserow.io',
    } as any,
  };

  beforeAll(async () => {
    const token = process.env.BASEROW_TOKEN;

    if (!token) {
      throw new Error('Please set the BASEROW_TOKEN environment variable.');
    }

    baseContext.conn_opts.token = token;
  });

  afterEach(async () => {
    await delay(2000);
  });

  let table: number | undefined;

  describe('Should test allowed values', () => {
    it('Should get table allowed values', async () => {
      const allowedValues = await getBaserowTableAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
      expect(allowedValues[0].display_name).toBeDefined();

      table = allowedValues[0].value;
    });

    it('Should list table fields allowed values', async () => {
      const allowedValues = await getBaserowTableFieldsAllowedValues({
        ...baseContext,
        opts: {
          table,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
      expect(allowedValues[0].display_name).toBeDefined();
    });

    it('Should get options', async () => {
      const options = await getBaserowTableColumnOptions({
        ...baseContext,
        opts: {
          table,
        },
      });

      expect(options).toBeDefined();
    });

    it('Should get response type', async () => {
      const responseType = await getBaserowTableColumnsResponseType({
        ...baseContext,
        opts: {
          table,
        },
      });

      expect(responseType).toBeDefined();
    });

    it('Should get row allowed values', async () => {
      const allowedValues = await getBaserowTableRowsAllowedValues({
        ...baseContext,
        opts: {
          table,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
      expect(allowedValues[0].display_name).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    let createdRowId: number | undefined;

    it('Should list tables', async () => {
      const action = ListBaserowTables;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list table fields', async () => {
      const action = GetBaserowTableFields;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ table }, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list rows', async () => {
      const action = ListBaserowRows;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        { table, order: { field: 'Name', direction: '-' } },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();

      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBeTruthy();
      expect(result.results.length).toBeGreaterThan(0);
    });

    let uploadedFileName: string | undefined;
    it('Should upload a file', async () => {
      const action = UploadBaserowFile;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          file: {
            content: `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`,
            name: 'cool_photo.png',
            mime_type: 'image/png',
          },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      uploadedFileName = result.name;
    });

    it('Should create row with all field types', async () => {
      const action = CreateBaserowRow;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const testDate = new Date();
      const isoDate = testDate.toISOString();

      const result = await action.api_function(
        {
          table,
          data: {
            Name: 'Test Task Name',
            Details:
              'This is a detailed description\nwith multiple lines\n\n**Bold text** and *italic*',
            'Estimated days': 5,
            Rating: 7,
            Completed: true,
            Duration: '2:30:45',
            Tasks: [1234, 5678],
            Date: isoDate,
            File: [{ name: uploadedFileName! }],
            URL: 'https://www.example.com/task',
            Email: 'task@example.com',
            'Single select': 4327841,
            'Multiple select': [4327843, 4327845],
            'Phone number': '+1 (555) 123-4567',
            Collaborators: [{ id: 141483 }],
            Password: 'SecurePassword123!',
          },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdRowId = result.id;
    });

    it('Should update the created row', async () => {
      const action = UpdateBaserowRow;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          table,
          row: createdRowId,
          data: {
            Name: 'Updated Task Name',
          },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.Name).toBe('Updated Task Name');
    });

    it('Should delete the created row', async () => {
      const action = DeleteBaserowRow;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdRowId) throw new Error('No row created to delete');

      const result = await action.api_function(
        {
          table,
          row: createdRowId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeUndefined();
    });
  });

  describe('Should test record based helpers', () => {
    afterEach(async () => {
      await delay(2000);
    });

    const tableName = 'Tasks';

    it('Should get tables', async () => {
      const result = await getBaserowTableList(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should get record type', async () => {
      const result = await getBaserowRecordType(baseContext, tableName);

      expect(result).toBeDefined();
    });

    const emails = [
      'alpha@testbaserow.com',
      'beta@testbaserow.com',
      'gamma@testbaserow.com',
      'delta@testbaserow.com',
    ];

    it('Should create records', async () => {
      const result = await createBaserowRecords(
        baseContext,
        {
          Name: ['Task Alpha', 'Task Beta', 'Task Gamma', 'Task Delta'],
          'Estimated days': [3, 7, 5, 10],
          Completed: [false, true, false, true],
          Details: [
            'Details for task alpha',
            'Details for task beta',
            'Details for task gamma',
            'Details for task delta',
          ],
          Duration: ['1:00:00', '3:30:00', '2:15:00', '5:45:00'],
          Rating: [5, 9, 7, 8],
          Email: emails,
          Date: ['2024-01-15', '2024-02-20', '2024-03-10', '2024-04-05'],
        },
        { table: tableName }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result!.Name)).toBe(true);
      expect(result!.Name.length).toBe(4);
    });

    it('Should verify created records', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: '||',
          args: emails.map((email) => ({
            exp: '==',
            args: [{ field: 'Email' }, { value: email }],
          })),
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.Email.length).toBe(4);

      const alphaIndex = result!.Email.indexOf('alpha@testbaserow.com');
      expect(result!.Name[alphaIndex]).toBe('Task Alpha');
      expect(result!['Estimated days'][alphaIndex]).toBe('3');
      expect(result!.Rating[alphaIndex]).toBe(5);

      const betaIndex = result!.Email.indexOf('beta@testbaserow.com');
      expect(result!.Name[betaIndex]).toBe('Task Beta');
      expect(result!.Completed[betaIndex]).toBe(true);
      expect(result!.Rating[betaIndex]).toBe(9);
    });

    it('Should search records with simple expression', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: '==',
          args: [{ field: 'Name' }, { value: 'Task Alpha' }],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.Name.length).toBeGreaterThan(0);
      expect(result!.Name[0]).toBe('Task Alpha');
    });

    it('Should search records with OR expression', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'Email' }, { value: 'gamma@testbaserow.com' }] },
            { exp: '==', args: [{ field: 'Email' }, { value: 'delta@testbaserow.com' }] },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.Email.length).toBe(2);
      result!.Email.forEach((email: string) => {
        expect(['gamma@testbaserow.com', 'delta@testbaserow.com']).toContain(email);
      });
    });

    it('Should search records with AND expression', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            { exp: '==', args: [{ field: 'Completed' }, { value: true }] },
            { exp: '>=', args: [{ field: 'Rating' }, { value: 8 }] },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Completed.forEach((completed: boolean) => {
          expect(completed).toBe(true);
        });
        result.Rating.forEach((rating: number) => {
          expect(rating).toBeGreaterThanOrEqual(8);
        });
      }
    });

    it('Should search records with comparison operators', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            { exp: '>', args: [{ field: 'Rating' }, { value: 5 }] },
            { exp: '<', args: [{ field: 'Estimated days' }, { value: 9 }] },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Rating.forEach((rating: number) => {
          expect(rating).toBeGreaterThan(5);
        });
        result['Estimated days'].forEach((days: number) => {
          expect(Number(days)).toBeLessThan(9);
        });
      }
    });

    it('Should search records with contains expression', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: 'contains',
          args: [{ field: 'Details' }, { value: 'task' }],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Details.forEach((detail: string) => {
          expect(detail.toLowerCase()).toContain('task');
        });
      }
    });

    it('Should search records with empty/not_empty expressions', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: 'not_empty',
          args: [{ field: 'Email' }],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Email.forEach((email: string) => {
          expect(email).toBeTruthy();
          expect(email.length).toBeGreaterThan(0);
        });
      }
    });

    it('Should search records with date comparison', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: 'date_is_after',
          args: [{ field: 'Date' }, { value: '2024-02-01' }],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Date.forEach((date: string) => {
          expect(new Date(date).getTime()).toBeGreaterThan(new Date('2024-02-01').getTime());
        });
      }
    });

    it('Should search records with deeply nested expression (3 levels)', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: '||',
              args: [
                { exp: '==', args: [{ field: 'Name' }, { value: 'Task Alpha' }] },
                { exp: '==', args: [{ field: 'Name' }, { value: 'Task Beta' }] },
                { exp: '==', args: [{ field: 'Name' }, { value: 'Task Gamma' }] },
              ],
            },
            {
              exp: '||',
              args: [
                {
                  exp: '&&',
                  args: [
                    { exp: '>=', args: [{ field: 'Rating' }, { value: 8 }] },
                    { exp: '==', args: [{ field: 'Completed' }, { value: true }] },
                  ],
                },
                {
                  exp: '&&',
                  args: [
                    { exp: '<=', args: [{ field: 'Estimated days' }, { value: 5 }] },
                    { exp: '==', args: [{ field: 'Completed' }, { value: false }] },
                  ],
                },
              ],
            },
          ],
        },
        { table: tableName }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Name.forEach((name: string) => {
          expect(['Task Alpha', 'Task Beta', 'Task Gamma']).toContain(name);
        });

        // Verify each record matches one of the complex conditions
        for (let i = 0; i < result.id.length; i++) {
          const rating = result.Rating[i];
          const completed = result.Completed[i];
          const estimatedDays = result['Estimated days'][i];

          const matchesFirstCondition = rating >= 8 && completed === true;
          const matchesSecondCondition = estimatedDays <= 5 && completed === false;

          expect(matchesFirstCondition || matchesSecondCondition).toBe(true);
        }
      }
    });

    it('Should update records', async () => {
      const result = await updateBaserowRecords(
        baseContext,
        {
          Rating: 10,
        },
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'Name' }, { value: 'Task Gamma' }] },
            { exp: '==', args: [{ field: 'Name' }, { value: 'Task Delta' }] },
          ],
        },
        { table: tableName }
      );

      expect(result).toBeDefined();
      expect(result).toBe(2);
    });

    it('Should handle pagination with filters', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: 'not_empty',
          args: [{ field: 'Email' }],
        },
        { table: tableName }
      );

      const firstPage = await iterator(baseContext, 2);

      expect(firstPage).toBeDefined();
      expect(firstPage!.id.length).toBeLessThanOrEqual(2);

      const secondPage = await iterator(baseContext, 2);
      if (secondPage && secondPage.id.length > 0) {
        const firstIds = new Set(firstPage!.id);
        secondPage.id.forEach((id: string) => {
          expect(firstIds.has(id)).toBe(false);
        });
      }
    });

    it('Should combine filters with ordering', async () => {
      const iterator = await searchBaserowRecords(
        baseContext,
        {
          exp: 'not_empty',
          args: [{ field: 'Name' }],
        },
        {
          table: tableName,
          orderBy: {
            column: 'Rating',
            ascending: true,
          },
        }
      );

      const result = await iterator(baseContext, 10);
      expect(result).toBeDefined();

      if (result && result.id.length > 1) {
        const ratings = result.Rating;
        for (let i = 1; i < ratings.length; i++) {
          expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i - 1]);
        }
      }
    });

    it('Should clean up all test records', async () => {
      const result = await deleteBaserowRecords(
        baseContext,
        {
          exp: '||',
          args: emails.map((email) => ({
            exp: '==',
            args: [{ field: 'Email' }, { value: email }],
          })),
        },
        { table: tableName }
      );

      expect(result).toBe(4);
    });
  });
});
