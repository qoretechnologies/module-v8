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
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Notion', () => {
  const base_context = {
    conn_opts: {
      token: '',
    },
  };

  beforeAll(() => {
    const token = process.env.NOTION_ACCESS_TOKEN!;
    expect(token).toBeDefined();

    base_context.conn_opts.token = token;
  });

  let page_id: string | undefined;
  let discussion_id: string | undefined;
  let data_source_id: string | undefined;
  let data_source_item_id: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get discussion allowed values', async () => {
      const allowed_values = await getNotionDiscussionsAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      discussion_id = allowed_values[0].value;
    });

    it('Should get page allowed values', async () => {
      const allowed_values = await getNotionPageAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      page_id = allowed_values[0].value;
    });

    it('Should get datasource allowed values', async () => {
      const allowed_values = await getNotionDataSourceAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      data_source_id = allowed_values[0].value;
    });

    it('Should get datasource item allowed values', async () => {
      const allowed_values = await getNotionDataSourceItemAllowedValues({
        ...base_context,
        opts: { data_source_id },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      data_source_item_id = allowed_values[0].value;
    });

    it('Should get datasource properties allowed values', async () => {
      const allowed_values = await getNotionDataSourcePropertiesAllowedValues({
        ...base_context,
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

      const result = await action.api_function(undefined, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should list pages', async () => {
      const action = ListNotionPages;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.pages).toBeDefined();
      expect(Array.isArray(result.pages)).toBe(true);
      expect(result.pages.length).toBeGreaterThan(0);
    });

    it('Should list users', async () => {
      const action = ListNotionUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('Should get datasource', async () => {
      const action = GetNotionDataSource;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ data_source_id }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBe(data_source_id);
    });

    it('Should get page', async () => {
      const action = GetNotionPage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ page_id }, undefined, base_context);

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
        base_context
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
        base_context
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
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should get database properties dynamic type', async () => {
      const result = (await getNotionDataSourceProperties({
        opts: { data_source_id },
        ...base_context,
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
        base_context
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
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(data_source_item_id);
    });
  });
});
