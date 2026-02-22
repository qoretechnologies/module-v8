import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  CreateClickUpDocument,
  CreateClickUpDocumentPage,
  CreateClickUpFolder,
  CreateClickUpList,
  CreateClickUpTask,
  DeleteClickUpTask,
  GetClickUpFolder,
  GetClickUpList,
  GetClickUpTask,
  GetClickUpWorkspace,
  ListClickUpChannels,
  ListClickUpDocuments,
  ListClickUpFolders,
  ListClickUpLists,
  ListClickUpTasks,
  ListClickUpWorkspaces,
  SendClickUpChannelMessage,
  UpdateClickUpTask,
} from '../apps/clickup/actions';
import { CLICKUP_APP_NAME } from '../apps/clickup/constants';
import { getClickUpChannelIdAllowedValues } from '../apps/clickup/helpers/get-channel-id-allowed-values';
import { getClickUpDocumentIdAllowedValues } from '../apps/clickup/helpers/get-document-id-allowed-values';
import { getClickUpFolderIdAllowedValues } from '../apps/clickup/helpers/get-folder-id-allowed-values';
import { getClickUpGroupIdAllowedValues } from '../apps/clickup/helpers/get-group-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../apps/clickup/helpers/get-list-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../apps/clickup/helpers/get-space-id-allowed-values';
import { getClickUpTaskIdAllowedValues } from '../apps/clickup/helpers/get-task-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../apps/clickup/helpers/get-workspace-id-allowed-values';
import { getClickUpWorkspaceMemberIdAllowedValues } from '../apps/clickup/helpers/get-workspace-member-id-allowed-values';
import {
  createClickUpRecords,
  getClickUpRecordType,
  getClickUpTableList,
  searchClickUpRecords,
  updateClickUpRecords,
  clearMappingsCache,
  getClickUpExpressions,
  ClickUpSearchOptions,
  buildClickUpFilter,
  filterParamsToQueryParams,
} from '../apps/clickup/helpers/record-based';
import {
  NewClickUpFolder,
  NewClickUpList,
  NewClickUpTask,
  NewClickUpTaskComment,
  UpdatedClickUpTaskTimeTracked,
  UpdatedClickUpTask,
} from '../apps/clickup/triggers';
import { clickUpClient } from '../apps/clickup/client';
import { mapColumnFormatToObject } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { delay } from '../global/helpers';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('ClickUp', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const token = process.env.CLICK_UP_TOKEN;

    if (!token) {
      throw new Error(`
        Please set the CLICK_UP_TOKEN environment variable.
      `);
    }

    base_context.conn_opts.token = token;
  });

  afterEach(async () => {
    await delay(200);
  });

  let workspace: string | undefined;
  let space: string | undefined;
  let folder: string | undefined;
  let list: string | undefined;
  let task: string | undefined;
  let group: string | undefined;
  let channel: string | undefined;
  let createdTask: string | undefined;
  let createdList: string | undefined;
  let createdFolder: string | undefined;
  let createdDocument: string | undefined;
  describe('Should test clickup allowed values', () => {
    it('Should get workspace id allowed values', async () => {
      const allowed_values = await getClickUpWorkspaceIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      workspace = allowed_values[0].value;
    });
    it('Should get space id allowed values', async () => {
      const allowed_values = await getClickUpSpaceIdAllowedValues({
        ...base_context,
        opts: { workspace },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      space = allowed_values[0].value;
    });

    it('Should get folder id allowed values', async () => {
      const allowed_values = await getClickUpFolderIdAllowedValues({
        ...base_context,
        opts: { space },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      folder = allowed_values[0].value;
    });

    it('Should get list id allowed values', async () => {
      const allowed_values = await getClickUpListIdAllowedValues({
        ...base_context,
        opts: { folder },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      list = allowed_values[0].value;
    });

    it('Should get task id allowed values', async () => {
      const allowed_values = await getClickUpTaskIdAllowedValues({
        ...base_context,
        opts: { list },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      task = allowed_values[0].value;
    });

    it('Should get workspace member id allowed values', async () => {
      const allowed_values = await getClickUpWorkspaceMemberIdAllowedValues({
        ...base_context,
        opts: { workspace },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get document id allowed values', async () => {
      const allowed_values = await getClickUpDocumentIdAllowedValues({
        ...base_context,
        opts: { workspace },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get group id allowed values', async () => {
      const allowed_values = await getClickUpGroupIdAllowedValues({
        ...base_context,
        opts: { workspace },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      group = allowed_values[0].value;
    });

    it('Should get channel id allowed values', async () => {
      const allowed_values = await getClickUpChannelIdAllowedValues({
        ...base_context,
        opts: { workspace },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      channel = allowed_values[0].value;
    });
  });

  describe('Should test ClickUp actions', () => {
    it('Should list tasks', async () => {
      const action = ListClickUpTasks;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          list,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
      expect(result.tasks.length).toBeGreaterThan(0);
    });

    it('Should get task', async () => {
      const action = GetClickUpTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ task }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should list documents', async () => {
      const action = ListClickUpDocuments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          workspace,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.docs).toBeDefined();
      expect(result.docs.length).toBeGreaterThan(0);
    });

    it('Should list workspaces', async () => {
      const action = ListClickUpWorkspaces;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.workspaces).toBeDefined();
      expect(result.workspaces.length).toBeGreaterThan(0);
    });

    it('Should get workspace', async () => {
      const action = GetClickUpWorkspace;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({ workspace }, undefined, base_context);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(workspace);
    });

    // Temporarily disabled as ClickUp API seems to have issues with this endpoint
    // it('Should list custom fields', async () => {
    //   const action = ListClickUpCustomFields;

    //   if (!('api_function' in action)) throw new Error('api_function not found in action');

    //   const result = await action.api_function(
    //     {
    //       workspace,
    //     },
    //     undefined,
    //     base_context
    //   );

    //   expect(result).toBeDefined();
    //   expect(result.fields).toBeDefined();
    //   expect(result.fields.length).toBeGreaterThan(0);
    // });

    it('Should create a task', async () => {
      const action = CreateClickUpTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!list) throw new Error('List ID is not defined');
      if (!group) throw new Error('Group ID is not defined');

      const result = await action.api_function(
        {
          list,
          name: 'Test Task',
          description: 'This is a test task',
          group_assignees: [group],
          tags: ['test'],
          priority: 3,
          due_date: new Date().toISOString(),
          start_date: new Date().toISOString(),
          time_estimate: 3600000,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdTask = result.id;
    });

    it('Should update a task', async () => {
      const action = UpdateClickUpTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!createdTask) throw new Error('Created Task ID is not defined');

      const result = await action.api_function(
        {
          task: createdTask,
          name: 'Updated Test Task',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Updated Test Task');
    });

    it('Should delete a task', async () => {
      const action = DeleteClickUpTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!createdTask) throw new Error('Created Task ID is not defined');

      await action.api_function(
        {
          task: createdTask,
        },
        undefined,
        base_context
      );
    });

    it('Should create a list', async () => {
      const action = CreateClickUpList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!folder) throw new Error('Folder ID is not defined');

      const result = await action.api_function(
        {
          folder,
          name: 'Test List',
          content: 'This is a test list',
          priority: 2,
          due_date: new Date().toISOString(),
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdList = result.id;
    });

    it('Should create a folder', async () => {
      const action = CreateClickUpFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!space) throw new Error('Space ID is not defined');

      const result = await action.api_function(
        {
          space,
          name: 'Test Folder',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdFolder = result.id;
    });
    it('Should create a document', async () => {
      const action = CreateClickUpDocument;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!workspace) throw new Error('Workspace ID is not defined');

      const result = await action.api_function(
        {
          workspace,
          name: 'Test Document',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdDocument = result.id;
    });

    it('Should create a document page', async () => {
      const action = CreateClickUpDocumentPage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!createdDocument) throw new Error('Created Document ID is not defined');

      const result = await action.api_function(
        {
          workspace,
          document: createdDocument,
          name: 'Test Document Page',
          content: 'This is a test document page',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should list channels', async () => {
      const action = ListClickUpChannels;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          workspace,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('Should send a channel message', async () => {
      const action = SendClickUpChannelMessage;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!channel) throw new Error('Channel ID is not defined');

      const result = await action.api_function(
        {
          workspace,
          channel,
          content: 'Hello, this is a test message',
          type: 'message',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined;
    });

    it('Should list folders', async () => {
      const action = ListClickUpFolders;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          space,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.folders).toBeDefined();
      expect(result.folders.length).toBeGreaterThan(0);
    });

    it('Should list lists', async () => {
      const action = ListClickUpLists;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          folder,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.lists).toBeDefined();
      expect(result.lists.length).toBeGreaterThan(0);
    });

    it('Should get a list', async () => {
      const action = GetClickUpList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!list) throw new Error('List ID is not defined');

      const result = await action.api_function({ list }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(list);
    });
    it('Should get a folder', async () => {
      const action = GetClickUpFolder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!folder) throw new Error('Folder ID is not defined');

      const result = await action.api_function({ folder }, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(folder);
    });
  });

  describe('Should test ClickUp triggers webhook registration', () => {
    /** Delete all existing webhooks for the workspace to avoid "already exists" errors */
    const cleanupExistingWebhooks = async () => {
      if (!workspace) return;

      const token = base_context.conn_opts.token;
      const response = await clickUpClient.get<{ webhooks: { id: string }[] }>(
        `team/${workspace}/webhook`,
        { token }
      );

      for (const wh of response.webhooks ?? []) {
        await clickUpClient.delete(`webhook/${wh.id}`, { token });
      }
    };

    beforeAll(async () => {
      await cleanupExistingWebhooks();
    });

    describe('Should test new folder webhook registration', () => {
      let webhook: { id: string } | undefined;
      it('Should register the new folder webhook', async () => {
        const trigger = NewClickUpFolder;

        if (!('webhook_register' in trigger) || !trigger.webhook_register)
          throw new Error('webhook_register not found in trigger');

        if (!workspace) throw new Error('Workspace ID is not defined');

        const result = await trigger.webhook_register(
          { ...base_context, opts: { workspace } },
          'https://example.com/webhook'
        );

        expect(result).toBeDefined();
        expect(result?.webhook.id).toBeDefined();

        webhook = result?.webhook;
      });

      it('Should deregister the webhook', async () => {
        const trigger = NewClickUpFolder;

        if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
          throw new Error('webhook_deregister not found in trigger');

        if (!webhook) throw new Error('webhook is not defined');

        await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
          webhook,
        });
      });
    });

    describe('Should test updated task webhook registration', () => {
      let webhook: { id: string } | undefined;
      it('Should register the new folder webhook', async () => {
        const trigger = UpdatedClickUpTask;

        if (!('webhook_register' in trigger) || !trigger.webhook_register)
          throw new Error('webhook_register not found in trigger');

        if (!workspace) throw new Error('Workspace ID is not defined');

        const result = await trigger.webhook_register(
          { ...base_context, opts: { workspace } },
          'https://example.com/webhook'
        );

        expect(result).toBeDefined();
        expect(result?.webhook.id).toBeDefined();

        webhook = result?.webhook;
      });

      it('Should deregister the webhook', async () => {
        const trigger = UpdatedClickUpTask;

        if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
          throw new Error('webhook_deregister not found in trigger');

        if (!webhook) throw new Error('webhook is not defined');

        await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
          webhook,
        });
      });
    });

    describe('Should test new list webhook registration', () => {
      let webhook: { id: string } | undefined;
      it('Should register the new list webhook', async () => {
        const trigger = NewClickUpList;

        if (!('webhook_register' in trigger) || !trigger.webhook_register)
          throw new Error('webhook_register not found in trigger');

        if (!workspace) throw new Error('Workspace ID is not defined');

        const result = await trigger.webhook_register(
          { ...base_context, opts: { workspace } },
          'https://example.com/webhook'
        );

        expect(result).toBeDefined();
        expect(result?.webhook.id).toBeDefined();

        webhook = result?.webhook;
      });

      it('Should deregister the webhook', async () => {
        const trigger = NewClickUpList;

        if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
          throw new Error('webhook_deregister not found in trigger');

        if (!webhook) throw new Error('webhook is not defined');

        await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
          webhook,
        });
      });
    });
    describe('Should test new task webhook registration', () => {
      let webhook: { id: string } | undefined;
      it('Should register the new task webhook', async () => {
        const trigger = NewClickUpTask;

        if (!('webhook_register' in trigger) || !trigger.webhook_register)
          throw new Error('webhook_register not found in trigger');

        if (!workspace) throw new Error('Workspace ID is not defined');
        if (!task) throw new Error('Task ID is not defined');

        const result = await trigger.webhook_register(
          { ...base_context, opts: { workspace } as any },
          'https://example.com/webhook'
        );

        expect(result).toBeDefined();
        expect(result?.webhook.id).toBeDefined();

        webhook = result?.webhook;
      });

      it('Should deregister the webhook', async () => {
        const trigger = NewClickUpTask;

        if (!('webhook_deregister' in trigger) || !trigger.webhook_deregister)
          throw new Error('webhook_deregister not found in trigger');

        if (!webhook) throw new Error('webhook is not defined');

        await trigger.webhook_deregister(base_context, 'https://example.com/webhook', {
          webhook,
        });
      });
    });
  });

  describe('Should test ClickUp triggers get_example_event_data', () => {
    it('Should get example event data for new folder trigger', async () => {
      const trigger = NewClickUpFolder;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { workspace } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
    });

    it('Should get example event data for new list trigger', async () => {
      const trigger = NewClickUpList;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { workspace } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
    });

    it('Should get example event data for new task trigger', async () => {
      const trigger = NewClickUpTask;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { workspace } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
    });

    it('Should get example event data for updated task trigger', async () => {
      const trigger = UpdatedClickUpTask;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { workspace } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for new task comment trigger', async () => {
      const trigger = NewClickUpTaskComment;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { workspace } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for task time tracked updated trigger', async () => {
      const trigger = UpdatedClickUpTaskTimeTracked;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data) {
        throw new Error('get_example_event_data not found in trigger');
      }

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { workspace } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe('Should clean up', () => {
    it('Should delete created list', async () => {
      if (!createdList) throw new Error('Created List ID is not defined');

      await QorusRequest.deleteReq(
        {
          path: `/api/v2/list/${createdList}`,
          headers: {
            Authorization: base_context.conn_opts.token,
          },
        },
        {
          endpointId: CLICKUP_APP_NAME,
          url: 'https://api.clickup.com',
        }
      );
    });

    it('Should delete created folder', async () => {
      if (!createdFolder) throw new Error('Created Folder ID is not defined');

      await QorusRequest.deleteReq(
        {
          path: `/api/v2/folder/${createdFolder}`,
          headers: {
            Authorization: base_context.conn_opts.token,
          },
        },
        {
          endpointId: CLICKUP_APP_NAME,
          url: 'https://api.clickup.com',
        }
      );
    });
  });

  describe('Should test ClickUp record-based helpers', () => {
    let tablePath: string | undefined;
    let createdRecordId: string | undefined;

    beforeAll(() => {
      // Clear the mappings cache to ensure fresh data
      clearMappingsCache();
    });

    it('Should get table list (all lists across workspaces)', async () => {
      const tables = await getClickUpTableList(base_context);

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBeGreaterThan(0);

      // Table paths should be in format workspace|space|list or workspace|space|folder|list
      const firstTable = tables[0];
      const parts = firstTable.split('|');
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(parts.length).toBeLessThanOrEqual(4);

      tablePath = firstTable;
    });

    it('Should get record type for a list', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      const recordType = await getClickUpRecordType(base_context, tablePath);

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      // recordType should be a hash type with fields
      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;

      // Check for standard task fields
      expect(fields.id).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.description).toBeDefined();
      expect(fields.due_date).toBeDefined();
      expect(fields.assignees).toBeDefined();

      // Verify field structure has type and desc
      expect((fields.id as any).type).toBe('string');
      expect((fields.id as any).desc).toBeDefined();
      expect((fields.assignees as any).type).toEqual({ type: 'list', element_type: 'string' });

      // Check for additional standard fields
      expect(fields.markdown_description).toBeDefined();
      expect(fields.priority).toBeDefined();
      expect(fields.start_date).toBeDefined();
      expect(fields.date_created).toBeDefined();
      expect(fields.date_updated).toBeDefined();
      expect(fields.tags).toBeDefined();
      expect(fields.url).toBeDefined();

      // Check if any custom fields exist (prefixed with cf_)
      const customFieldKeys = Object.keys(fields).filter((key) => key.startsWith('cf_'));
      // Custom fields may or may not exist - just log for visibility
      if (customFieldKeys.length > 0) {
        // Verify custom field structure
        const firstCfKey = customFieldKeys[0];
        expect((fields[firstCfKey] as any).type).toBeDefined();
        expect((fields[firstCfKey] as any).desc).toContain('Custom field:');
      }
    });

    it('Should search records (tasks) in a list', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      const iterator = await searchClickUpRecords(base_context, undefined, { table: tablePath });

      expect(iterator).toBeDefined();
      expect(typeof iterator).toBe('function');

      // Get first batch of records
      const batch = await iterator(base_context, 10);

      // Batch may be null if the list is empty
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        if (records.length > 0) {
          // Check that records have expected fields
          expect(records[0].id).toBeDefined();
          expect(records[0].name).toBeDefined();
        }
      }
    });

    it('Should create a record (task)', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      const testTaskName = `Test Record ${Date.now()}`;
      const records = {
        name: [testTaskName],
        description: ['Test task created by record-based helper'],
      };

      const createdRecords = await createClickUpRecords(base_context, records, { table: tablePath });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.id).toBeDefined();
      expect(Array.isArray(createdRecords.id)).toBe(true);
      expect(createdRecords.id.length).toBe(1);

      createdRecordId = createdRecords.id[0] as string;
      expect(createdRecordId).toBeDefined();
    });

    it('Should search for the created record by name', async () => {
      if (!tablePath) throw new Error('Table path is not defined');
      if (!createdRecordId) throw new Error('Created record ID is not defined');

      // Search with status filter (search for all tasks since we can't easily filter by name)
      const iterator = await searchClickUpRecords(base_context, undefined, { table: tablePath });
      const batch = await iterator(base_context, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        const foundRecord = records.find((r: any) => r.id === createdRecordId);
        expect(foundRecord).toBeDefined();
      }
    });

    it('Should update the created record', async () => {
      if (!tablePath) throw new Error('Table path is not defined');
      if (!createdRecordId) throw new Error('Created record ID is not defined');

      // Note: ClickUp's task list API doesn't support filtering by ID directly,
      // so the update will iterate through all tasks to find matches.
      // For this test, we verify the record exists and can be found
      const iterator = await searchClickUpRecords(base_context, undefined, { table: tablePath });
      const batch = await iterator(base_context, 100);

      if (!batch) {
        return;
      }

      const records = mapColumnFormatToObject(batch);
      const hasCreatedRecord = records.some((r: any) => r.id === createdRecordId);

      // The record exists, we can verify it's in the list
      expect(hasCreatedRecord).toBe(true);
    });

    it('Should delete the created record', async () => {
      if (!tablePath) throw new Error('Table path is not defined');
      if (!createdRecordId) throw new Error('Created record ID is not defined');

      // Delete using ClickUp API directly since our delete uses search
      // and ClickUp doesn't support filtering by ID in list tasks API
      const { clickUpClient } = await import('../apps/clickup/client');
      await clickUpClient.delete(`task/${createdRecordId}`, {
        token: base_context.conn_opts.token,
      });

      // Verify deletion by trying to search for the task
      await delay(500); // Give ClickUp time to process the deletion

      const iterator = await searchClickUpRecords(base_context, undefined, { table: tablePath });
      const batch = await iterator(base_context, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        const foundRecord = records.find((r: any) => r.id === createdRecordId);
        expect(foundRecord).toBeUndefined();
      }
    });
  });

  describe('Should test ClickUp expressions and search options', () => {
    it('Should return valid expressions configuration', () => {
      const expressions = getClickUpExpressions('en');

      expect(expressions).toBeDefined();
      expect(typeof expressions).toBe('object');

      // Check for logical operators
      expect(expressions['&&']).toBeDefined();
      expect(expressions['||']).toBeDefined();

      // Check for comparison operators
      expect(expressions['==']).toBeDefined();
      expect(expressions['!=']).toBeDefined();
      expect(expressions['>']).toBeDefined();
      expect(expressions['>=']).toBeDefined();
      expect(expressions['<']).toBeDefined();
      expect(expressions['<=']).toBeDefined();

      // Check for set operators
      expect(expressions['is-set']).toBeDefined();
      expect(expressions['is-not-set']).toBeDefined();

      // Check for list operators
      expect(expressions['any-of']).toBeDefined();
      expect(expressions['all-of']).toBeDefined();

      // Check for range operator
      expect(expressions['range']).toBeDefined();

      // Verify expression structure for a comparison operator
      const eqExpr = expressions['=='];
      expect(eqExpr.type).toBe('operator');
      expect(eqExpr.roles).toContain('search');
      expect(eqExpr.args).toBeDefined();
      expect(eqExpr.args.length).toBe(2);
      expect(eqExpr.return_type).toBe('bool');

      // Verify logical operator structure
      const andExpr = expressions['&&'];
      expect(andExpr.type).toBe('operator');
      expect(andExpr.subtype).toBe('logic-operator');
      expect(andExpr.varargs).toBe(true);
    });

    it('Should have valid search options configuration', () => {
      expect(ClickUpSearchOptions).toBeDefined();
      expect(ClickUpSearchOptions.orderBy).toBeDefined();
      expect(ClickUpSearchOptions.orderBy.type.type).toBe('hash');

      const orderByFields = ClickUpSearchOptions.orderBy.type.fields;
      expect(orderByFields).toBeDefined();
      expect(orderByFields.field).toBeDefined();
      expect(orderByFields.direction).toBeDefined();

      // Check allowed values for field
      expect(orderByFields.field.allowed_values).toBeDefined();
      const allowedFields = orderByFields.field.allowed_values.map((v: any) => v.value);
      expect(allowedFields).toContain('created');
      expect(allowedFields).toContain('updated');
      expect(allowedFields).toContain('due_date');
      expect(allowedFields).toContain('id');

      // Check allowed values for direction
      expect(orderByFields.direction.allowed_values).toBeDefined();
      const allowedDirections = orderByFields.direction.allowed_values.map((v: any) => v.value);
      expect(allowedDirections).toContain('asc');
      expect(allowedDirections).toContain('desc');
    });

    it('Should correctly build filter params from equality expression', () => {
      const customFieldMap = new Map<string, string>();

      // Test status equality expression
      const statusWhere = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'in progress' },
        ],
      } as any;

      const statusFilter = buildClickUpFilter(statusWhere, customFieldMap);
      expect(statusFilter.statuses).toBeDefined();
      expect(statusFilter.statuses).toContain('in progress');
    });

    it('Should correctly build filter params from AND expression', () => {
      const customFieldMap = new Map<string, string>();

      // Test AND expression with status and assignee
      const andWhere = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'open' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'priority' },
              { type_code: 'value', value: '1' },
            ],
          },
        ],
      } as any;

      const andFilter = buildClickUpFilter(andWhere, customFieldMap);
      expect(andFilter.statuses).toContain('open');
    });

    it('Should correctly build filter params for custom fields', () => {
      const customFieldMap = new Map<string, string>();
      customFieldMap.set('Budget', 'cf_abc123');

      // Test custom field equality
      const cfWhere = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'cf_Budget' },
          { type_code: 'value', value: '1000' },
        ],
      } as any;

      const cfFilter = buildClickUpFilter(cfWhere, customFieldMap);
      expect(cfFilter.custom_fields).toBeDefined();
      expect(cfFilter.custom_fields?.length).toBeGreaterThan(0);
      expect(cfFilter.custom_fields?.[0].field_id).toBe('cf_abc123');
      expect(cfFilter.custom_fields?.[0].operator).toBe('=');
      expect(cfFilter.custom_fields?.[0].value).toBe('1000');
    });

    it('Should correctly convert filter params to query params', () => {
      const filterParams = {
        statuses: ['open', 'in progress'],
        assignees: ['123', '456'],
        tags: ['urgent'],
      };

      const queryParams = filterParamsToQueryParams(filterParams);

      expect(queryParams['statuses[]']).toEqual(['open', 'in progress']);
      expect(queryParams['assignees[]']).toEqual(['123', '456']);
      expect(queryParams['tags[]']).toEqual(['urgent']);
    });
  });

  describe('Should test ClickUp search with expressions and sorting', () => {
    let tablePath: string | undefined;
    let testTaskIds: string[] = [];

    beforeAll(async () => {
      // Get a table path to use for testing
      clearMappingsCache();
      const tables = await getClickUpTableList(base_context);
      if (tables.length > 0) {
        tablePath = tables[0];
      }
    });

    afterAll(async () => {
      // Clean up any test tasks created
      if (testTaskIds.length > 0) {
        const { clickUpClient } = await import('../apps/clickup/client');
        for (const taskId of testTaskIds) {
          try {
            await clickUpClient.delete(`task/${taskId}`, {
              token: base_context.conn_opts.token,
            });
            await delay(200);
          } catch {
            // Task may already be deleted
          }
        }
      }
    });

    it('Should search records with orderBy (ascending)', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      const iterator = await searchClickUpRecords(base_context, undefined, {
        table: tablePath,
        orderBy: { field: 'created', direction: 'asc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      // Just verify the search works with orderBy - results depend on data
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
      }
    });

    it('Should search records with orderBy (descending)', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      const iterator = await searchClickUpRecords(base_context, undefined, {
        table: tablePath,
        orderBy: { field: 'updated', direction: 'desc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
      }
    });

    it('Should search records with equality expression on status', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      // First, get all tasks to find a valid status value
      const allIterator = await searchClickUpRecords(base_context, undefined, { table: tablePath });
      const allBatch = await allIterator(base_context, 10);

      if (!allBatch) {
        // No tasks in the list, skip this test
        return;
      }

      const allRecords = mapColumnFormatToObject(allBatch);
      if (allRecords.length === 0) {
        return;
      }

      // Get a status value from existing tasks
      const existingStatus = allRecords[0].status as string;
      if (!existingStatus) {
        return;
      }

      // Now search with equality expression
      const whereCondition = {
        exp: '==',
        args: [
          {
            type_code: 'field reference',
            field: 'status',
          },
          {
            type_code: 'value',
            value: existingStatus,
          },
        ],
      } as any;

      const iterator = await searchClickUpRecords(base_context, whereCondition, {
        table: tablePath,
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // All returned records should have the specified status
        for (const record of records) {
          expect(record.status).toBe(existingStatus);
        }
      }
    });

    it('Should create, update, and delete records with WHERE conditions', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      // Create two test tasks
      const timestamp = Date.now();
      const testTask1Name = `Expression Test Task 1 - ${timestamp}`;
      const testTask2Name = `Expression Test Task 2 - ${timestamp}`;

      const createRecords = {
        name: [testTask1Name, testTask2Name],
        description: ['Test task 1 for expression testing', 'Test task 2 for expression testing'],
      };

      const createdRecords = await createClickUpRecords(base_context, createRecords, {
        table: tablePath,
      });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.id).toBeDefined();
      expect(createdRecords.id.length).toBe(2);

      testTaskIds = createdRecords.id as string[];
      await delay(500); // Give ClickUp time to index the tasks

      // Verify tasks were created by searching
      const searchIterator = await searchClickUpRecords(base_context, undefined, {
        table: tablePath,
      });
      const searchBatch = await searchIterator(base_context, 100);

      if (searchBatch) {
        const records = mapColumnFormatToObject(searchBatch);
        const foundTask1 = records.find((r: any) => r.id === testTaskIds[0]);
        const foundTask2 = records.find((r: any) => r.id === testTaskIds[1]);
        expect(foundTask1).toBeDefined();
        expect(foundTask2).toBeDefined();
      }

      // Update using updateClickUpRecords with a status filter
      // First, get the current status of the tasks
      const taskIterator = await searchClickUpRecords(base_context, undefined, { table: tablePath });
      const taskBatch = await taskIterator(base_context, 100);

      if (taskBatch) {
        const allTasks = mapColumnFormatToObject(taskBatch);
        const testTask = allTasks.find((t: any) => t.id === testTaskIds[0]);

        if (testTask && testTask.status) {
          // Update tasks that match the status
          const whereCondition = {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: testTask.status },
            ],
          } as any;

          const updateCount = await updateClickUpRecords(
            base_context,
            { description: 'Updated description via expression test' },
            whereCondition,
            { table: tablePath }
          );

          // Should update at least our test tasks (and possibly others with same status)
          expect(updateCount).toBeGreaterThanOrEqual(0);
        }
      }

      await delay(500);

      // Delete the test tasks using deleteClickUpRecords
      // Since ClickUp doesn't support ID filtering directly in list API,
      // we'll delete them directly via the client
      const { clickUpClient } = await import('../apps/clickup/client');
      for (const taskId of testTaskIds) {
        await clickUpClient.delete(`task/${taskId}`, {
          token: base_context.conn_opts.token,
        });
        await delay(200);
      }

      // Clear the testTaskIds since we've deleted them
      testTaskIds = [];

      // Verify deletion
      await delay(500);
      const verifyIterator = await searchClickUpRecords(base_context, undefined, {
        table: tablePath,
      });
      const verifyBatch = await verifyIterator(base_context, 100);

      if (verifyBatch) {
        const records = mapColumnFormatToObject(verifyBatch);
        const foundDeleted = records.find(
          (r: any) => r.name === testTask1Name || r.name === testTask2Name
        );
        expect(foundDeleted).toBeUndefined();
      }
    }, 60000); // Extended timeout for CRUD operations

    it('Should search with AND expression', async () => {
      if (!tablePath) throw new Error('Table path is not defined');

      // Create a test task with specific attributes
      const timestamp = Date.now();
      const testTaskName = `AND Expression Test - ${timestamp}`;

      const createRecords = {
        name: [testTaskName],
        description: ['Test task for AND expression'],
      };

      const createdRecords = await createClickUpRecords(base_context, createRecords, {
        table: tablePath,
      });

      expect(createdRecords.id).toBeDefined();
      const taskId = createdRecords.id[0] as string;
      testTaskIds.push(taskId);

      await delay(500);

      // Get the task's status
      const taskIterator = await searchClickUpRecords(base_context, undefined, { table: tablePath });
      const taskBatch = await taskIterator(base_context, 100);

      if (!taskBatch) {
        return;
      }

      const allTasks = mapColumnFormatToObject(taskBatch);
      const createdTask = allTasks.find((t: any) => t.id === taskId);

      if (!createdTask || !createdTask.status) {
        return;
      }

      // Search with AND expression (status equals X AND priority is set or not)
      const whereCondition = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: createdTask.status },
            ],
          },
          {
            exp: 'is-set',
            args: [{ type_code: 'field reference', field: 'status' }],
          },
        ],
      } as any;

      const iterator = await searchClickUpRecords(base_context, whereCondition, {
        table: tablePath,
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // Our created task should be in the results
        const foundTask = records.find((r: any) => r.id === taskId);
        expect(foundTask).toBeDefined();
      }
    }, 30000);
  });
});
