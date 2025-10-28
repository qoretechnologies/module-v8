import { IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  AddCommentToNotionDiscussion,
  CreateNotionDatabaseItem,
  GetNotionDataSource,
  GetNotionPage,
  ListNotionComments,
  ListNotionDataSourceItems,
  ListNotionDataSources,
  ListNotionPages,
  ListNotionUsers,
  UpdateNotionDatabaseItem,
} from '../apps/notion/actions';
import { getNotionDataSourceItemAllowedValues } from '../apps/notion/helpers/get-data-source-item-allowed-values';
import { getNotionDataSourceProperties } from '../apps/notion/helpers/get-data-source-properties';
import { getNotionDataSourcePropertiesAllowedValues } from '../apps/notion/helpers/get-data-source-properties-allowed-values';
import { getNotionDataSourceAllowedValues } from '../apps/notion/helpers/get-datasource-allowed-values';
import { getNotionDiscussionsAllowedValues } from '../apps/notion/helpers/get-discussion-allowed-values';
import { getNotionPageAllowedValues } from '../apps/notion/helpers/get-page-allowed-values';
import { createNotionRecords } from '../apps/notion/helpers/record-based/create-recrods';
import { deleteNotionRecords } from '../apps/notion/helpers/record-based/delete-records';
import { getNotionRecordType } from '../apps/notion/helpers/record-based/get-record-type';
import { getNotionTableList } from '../apps/notion/helpers/record-based/get-table-list';
import { searchNotionRecords } from '../apps/notion/helpers/record-based/search-records';
import { updateNotionRecords } from '../apps/notion/helpers/record-based/update-records';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Notion', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
  } as any;

  beforeAll(() => {
    const token = process.env.NOTION_ACCESS_TOKEN!;
    expect(token).toBeDefined();

    baseContext.conn_opts.token = token;
  });

  let page_id: string | undefined;
  let discussion_id: string | undefined;
  let data_source_id: string | undefined;
  let data_source_item_id: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get discussion allowed values', async () => {
      const allowed_values = await getNotionDiscussionsAllowedValues(baseContext);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      discussion_id = allowed_values[0].value;
    });

    it('Should get page allowed values', async () => {
      const allowed_values = await getNotionPageAllowedValues(baseContext);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      page_id = allowed_values[0].value;
    });

    it('Should get datasource allowed values', async () => {
      const allowed_values = await getNotionDataSourceAllowedValues(baseContext);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      data_source_id = allowed_values[0].value;
    });

    it('Should get datasource item allowed values', async () => {
      const allowed_values = await getNotionDataSourceItemAllowedValues({
        ...baseContext,
        opts: { data_source_id },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      data_source_item_id = allowed_values[0].value;
    });

    it('Should get datasource properties allowed values', async () => {
      const allowed_values = await getNotionDataSourcePropertiesAllowedValues({
        ...baseContext,
        opts: { data_source_id },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    it('Should list data sources', async () => {
      const action = ListNotionDataSources;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list pages', async () => {
      const action = ListNotionPages;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.pages).toBeDefined();
      expect(Array.isArray(result.pages)).toBe(true);
      expect(result.pages.length).toBeGreaterThan(0);
    });

    it('Should list users', async () => {
      const action = ListNotionUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('Should get datasource', async () => {
      const action = GetNotionDataSource;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ data_source_id }, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBe(data_source_id);
    });

    it('Should get page', async () => {
      const action = GetNotionPage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ page_id }, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBe(page_id);
    });

    it('Should add a comment to a discussion', async () => {
      const action = AddCommentToNotionDiscussion;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          discussion_id,
          text: `Test comment from Qore at ${new Date().toISOString()}`,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.discussion_id).toBe(discussion_id);
    });

    it('Should get comments', async () => {
      const action = ListNotionComments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!page_id) throw new Error('page_id is undefined');

      const result = await action.api_function(
        {
          block_id: page_id,
          page_size: 5,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });

    it('Should get datasource items', async () => {
      const action = ListNotionDataSourceItems;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!data_source_id) throw new Error('data_source_id is undefined');

      const result = await action.api_function(
        {
          data_source_id,
          page_size: 5,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
    });

    it('Should get database properties dynamic type', async () => {
      const result = (await getNotionDataSourceProperties({
        opts: { data_source_id },
        ...baseContext,
      })) as IQoreTypeObjectNonList;

      expect(result).toBeDefined();
      if (!('fields' in result) || !result.fields) throw new Error('Fields not found in result');

      expect(Object.keys(result.fields).length).toBeGreaterThan(0);
    });

    it('Should create a database item', async () => {
      if (!data_source_id) throw new Error('data_source_id is undefined');
      const action = CreateNotionDatabaseItem;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          data_source_id,
          properties: {
            Title: 'Some item created from Qore',
          },
          content: 'This is the content of the item created from Qore',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should update a database item', async () => {
      if (!data_source_id) throw new Error('data_source_id is undefined');
      if (!data_source_item_id) throw new Error('data_source_item_id is undefined');
      const action = UpdateNotionDatabaseItem;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          data_source_id,
          item_id: data_source_item_id,
          properties: {
            Title: 'Some item updated from Qore',
          },
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(data_source_item_id);
    });
  });

  describe('Should test record based helpers', () => {
    const table = 'Tasks';

    it('Should list table names', async () => {
      const result = await getNotionTableList(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should get record type for a table', async () => {
      const result = await getNotionRecordType(baseContext, 'Tasks');

      expect(result).toBeDefined();
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const now = new Date().toISOString();

    const names = [
      'Task from Qore 1',
      'Task from Qore 2',
      'Unassigned Task',
      'Blocked Task',
      'Overdue Task',
    ];

    const assignee = 'fe16ba92-b9bd-41ee-9496-ff853a1cd6d2';

    it('Should create records', async () => {
      const result = await createNotionRecords(
        baseContext,
        {
          Status: ['Done', 'In Progress', 'To Do', 'Blocked', 'In Progress'],
          Assignee: [assignee, assignee, null, assignee, assignee],
          'Due date': [now, now, nextWeek.toISOString(), now, lastWeek.toISOString()],
          Name: names,
        },
        { table }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.id)).toBe(true);
    });

    describe('Should test expressions for search', () => {
      it('Should search records with simple equality', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: '=',
            args: [{ field: 'Status' }, 'Done'],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.Status).toContain('Done');
        expect(result!.Name).toContain('Task from Qore 1');
      });

      it('Should search records with nested AND/OR expression', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'AND',
            args: [
              {
                exp: 'OR',
                args: [
                  { exp: '=', args: [{ field: 'Status' }, 'Done'] },
                  { exp: '=', args: [{ field: 'Status' }, 'In progress'] },
                ],
              },
              {
                exp: 'is_not_empty',
                args: [{ field: 'Assignee' }],
              },
            ],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.id.length).toBeGreaterThan(0);
        result!.Status.forEach((status: string) => {
          expect(['Done', 'In progress']).toContain(status);
        });
        expect(result!.Assignee.every((a: any) => a && a.length > 0)).toBe(true);
      });

      it('Should search records with date comparison operators', async () => {
        const before = '2025-10-28T00:00:00Z';

        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: '<=',
            args: [{ field: 'Due date' }, before],
          },
          { table }
        );

        const result = (await iterator(baseContext, 10)) as {
          'Due date': string[];
        };

        expect(result).toBeDefined();
        expect(result['Due date']).toBeDefined();
        result['Due date'].forEach((dueDate: string) => {
          expect(new Date(dueDate)).toBeInstanceOf(Date);
          expect(new Date(dueDate) <= new Date(before)).toBe(true);
        });
      });

      it('Should search records with is_empty operator', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'is_empty',
            args: [{ field: 'Assignee' }],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        if (result) {
          expect(result).toBeDefined();
          result!.Assignee.forEach((assignee: any) => {
            expect(assignee).toEqual([]);
          });
        }
      });

      it('Should search records with starts_with operator', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'starts_with',
            args: [{ field: 'Name' }, 'Task from'],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.Name.length).toBe(2);
        result!.Name.forEach((name: string) => {
          expect(name.startsWith('Task from')).toBe(true);
        });
      });

      it('Should search records with ends_with operator', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'ends_with',
            args: [{ field: 'Name' }, '1'],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.Name).toContain('Task from Qore 1');
        expect(result!.Name).not.toContain('Task from Qore 2');
      });

      it('Should search records with date relative operators (this_week)', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'this_week',
            args: [{ field: 'Due date' }],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        if (result) {
          expect(result).toBeDefined();
          expect(result!.id.length).toBeGreaterThan(0);
        }
      });

      it('Should search records with contains operator', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'contains',
            args: [{ field: 'Name' }, 'Qore'],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.Name.length).toBe(2);
        result!.Name.forEach((name: string) => {
          expect(name).toContain('Qore');
        });
      });

      it('Should search records with IN operator', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'in',
            args: [{ field: 'Name' }, names],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.id.length).toBe(5);
      });

      it('Should search records with complex date and status conditions', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'AND',
            args: [
              {
                exp: '!=',
                args: [{ field: 'Status' }, 'Done'],
              },
              {
                exp: 'OR',
                args: [
                  {
                    exp: 'this_week',
                    args: [{ field: 'Due date' }],
                  },
                  {
                    exp: 'next_week',
                    args: [{ field: 'Due date' }],
                  },
                ],
              },
            ],
          },
          { table }
        );

        const result = await iterator(baseContext, 10);

        if (result) {
          expect(result).toBeDefined();
          result!.Status.forEach((status: string) => {
            expect(status).not.toBe('Done');
          });
        }
      });

      it('Should handle pagination with complex expressions', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: 'OR',
            args: [
              { exp: '=', args: [{ field: 'Status' }, 'Done'] },
              { exp: '=', args: [{ field: 'Status' }, 'In progress'] },
            ],
          },
          { table }
        );

        const firstPage = await iterator(baseContext, 1);
        expect(firstPage).toBeDefined();
        expect(firstPage!.id.length).toBe(1);

        const secondPage = await iterator(baseContext, 1);
        expect(secondPage).toBeDefined();
        expect(secondPage!.id.length).toBe(1);

        expect(firstPage!.id[0]).not.toBe(secondPage!.id[0]);
      });

      it('Should search with ordering by created_time descending', async () => {
        const iterator = await searchNotionRecords(baseContext, undefined, {
          table,
          orderBy: {
            column: 'created_time',
            ascending: false,
          },
        });

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.id.length).toBeGreaterThan(0);
      });

      it('Should search with ordering by last_edited_time ascending', async () => {
        const iterator = await searchNotionRecords(baseContext, undefined, {
          table,
          orderBy: {
            column: 'last_edited_time',
            ascending: true,
          },
        });

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.id.length).toBeGreaterThan(0);
      });

      it('Should combine timestamp filtering with ordering', async () => {
        const iterator = await searchNotionRecords(
          baseContext,
          {
            exp: '>=',
            args: [{ field: 'created_time' }, '2025-10-27T00:00:00Z'],
          },
          {
            table,
            orderBy: {
              column: 'created_time',
              ascending: false,
            },
          }
        );

        const result = await iterator(baseContext, 10);

        expect(result).toBeDefined();
        expect(result!.id.length).toBeGreaterThan(0);
      });
    });

    it('Should update records', async () => {
      const result = await updateNotionRecords(
        baseContext,
        {
          Status: 'Done',
        },
        {
          exp: 'in',
          args: [{ field: 'Name' }, names],
        },
        {
          table,
        }
      );

      expect(result).toBeDefined();
      expect(result).toBe(5);
    });

    it('Should delete records', async () => {
      const result = await deleteNotionRecords(
        baseContext,
        {
          exp: 'in',
          args: [{ field: 'Name' }, names],
        },
        { table: 'Tasks' }
      );

      expect(result).toBeDefined();
      expect(result).toBe(5);
    });
  });
});
