import { configDotenv } from 'dotenv';
import {
  ClearCompletedGoogleTasks,
  CreateGoogleTask,
  CreateGoogleTaskList,
  DeleteGoogleTaskList,
  GetGoogleTask,
  ListGoogleTasks,
  ListGoogleTasksLists,
  UpdateGoogleTask,
  UpdateGoogleTaskList,
} from '../apps/google-tasks/actions';
import { getGoogleTasksListAllowedValues } from '../apps/google-tasks/helpers/get-list-allowed-values';
import { getGoogleTaskAllowedValues } from '../apps/google-tasks/helpers/get-task-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Google Tasks', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_TASKS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_TASKS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_TASKS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the GOOGLE_TASKS_REFRESH_TOKEN, GOOGLE_TASKS_CLIENT_ID, 
        and GOOGLE_TASKS_CLIENT_SECRET environment variables.
      `);
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  describe('Should test allowed values', () => {
    let list: string | undefined;

    it('Should get tasklist allowed values', async () => {
      const allowed_values = await getGoogleTasksListAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      list = allowed_values[0].value;
    });

    it('Should get task allowed values', async () => {
      const allowed_values = await getGoogleTaskAllowedValues({
        ...base_context,
        opts: {
          taskList: list,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    let createdTaskList: string | undefined;
    let createdTask: string | undefined;

    it('Should list task lists', async () => {
      const action = ListGoogleTasksLists;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBeTruthy();
    });

    it('Should create task list', async () => {
      const action = CreateGoogleTaskList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          title: 'New Task List',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdTaskList = result.id;
    });

    it('Should update task list', async () => {
      const action = UpdateGoogleTaskList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          id: createdTaskList,
          title: 'Updated Task List',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Updated Task List');
    });

    it('Should create a task', async () => {
      const action = CreateGoogleTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          taskList: createdTaskList,
          title: 'Test Task',
          due: new Date().toISOString(),
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdTask = result.id;
    });

    it('Should list tasks', async () => {
      const action = ListGoogleTasks;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          taskList: createdTaskList,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBeTruthy();
    });

    it('Should get a task', async () => {
      const action = GetGoogleTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          taskList: createdTaskList,
          task: createdTask,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdTask);
    });

    it('Should update a task', async () => {
      const action = UpdateGoogleTask;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          taskList: createdTaskList,
          task: createdTask,
          status: 'completed',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdTask);
    });

    it('Should clear completed tasks', async () => {
      const action = ClearCompletedGoogleTasks;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          taskList: createdTaskList,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should delete a task list', async () => {
      const action = DeleteGoogleTaskList;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          id: createdTaskList,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdTaskList);
    });
  });
});
