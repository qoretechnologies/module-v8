import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  CreateClickUpDocument,
  CreateClickUpDocumentPage,
  CreateClickUpFolder,
  CreateClickUpList,
  CreateClickUpTask,
  DeleteClickUpTask,
  GetClickUpTask,
  GetClickUpWorkspace,
  ListClickUpChannels,
  ListClickUpCustomFields,
  ListClickUpDocuments,
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
import { Debugger, DebugLevels } from '../utils/Debugger';

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

    it('Should list custom fields', async () => {
      const action = ListClickUpCustomFields;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          workspace,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.fields).toBeDefined();
      expect(result.fields.length).toBeGreaterThan(0);
    });

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
});
