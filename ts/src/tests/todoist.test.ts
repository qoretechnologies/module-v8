import { configDotenv } from 'dotenv';
import {
  AddCommentToTodoistProject,
  CompleteTodoistTask,
  CreateTodoistProject,
  CreateTodoistTask,
  DeleteTodoistTask,
  GetTodoistProject,
  GetTodoistProjectCollaborators,
  GetTodoistTask,
  ListTodoistLabels,
  ListTodoistProjects,
  ListTodoistSections,
  ListTodoistTasks,
  UpdateTodoistTask,
} from '../apps/todoist/actions';
import { todoistApiClient } from '../apps/todoist/helpers/constants';
import { getTodoistLabelAllowedValues } from '../apps/todoist/helpers/get-label-allowed-values';
import { getTodoistProjectAllowedValues } from '../apps/todoist/helpers/get-project-allowed-values';
import { getTodoistSectionAllowedValues } from '../apps/todoist/helpers/get-section-allowed-values';
import { getTodoistTaskAllowedValues } from '../apps/todoist/helpers/get-task-allowed-values';
import { getTodoistCollaboratorAllowedValues } from '../apps/todoist/helpers/get-collaborator-allowed-values';

configDotenv({ path: '.env' });
describe('Todoist', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
  };

  beforeAll(() => {
    const token = process.env.TODOIST_TOKEN;

    if (!token) throw new Error('No TODOIST_TOKEN env variable found');

    baseContext.conn_opts.token = token;
  });

  describe('Should test allowed values', () => {
    let projectId: string | undefined;

    it('Should get project allowed values', async () => {
      const result = await getTodoistProjectAllowedValues(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBeDefined();

      projectId = result[0].value;
    });

    it('Should get collaborator allowed values', async () => {
      if (!projectId) throw new Error('No project ID found from previous test');

      const result = await getTodoistCollaboratorAllowedValues({
        ...baseContext,
        opts: { project_id: projectId },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBeDefined();
    });

    it('Should get section allowed values', async () => {
      const result = await getTodoistSectionAllowedValues(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBeDefined();
    });

    it('Should get label allowed values', async () => {
      const result = await getTodoistLabelAllowedValues(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBeDefined();
    });

    it('Should get task allowed values', async () => {
      const result = await getTodoistTaskAllowedValues(baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    let createdProjectId: string | undefined;
    let createdTaskId: string | undefined;
    it('Should list projects', async () => {
      const action = ListTodoistProjects;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.projects)).toBe(true);
    });

    it('Should list sections', async () => {
      const action = ListTodoistSections;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.sections)).toBe(true);
    });

    it('Should list tasks', async () => {
      const action = ListTodoistTasks;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.tasks)).toBe(true);
    });

    it('Should create a task', async () => {
      const action = CreateTodoistTask;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const taskContent = `Test Task created at ${new Date().toISOString()}`;

      const result = await action.api_function({ content: taskContent }, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.content).toBe(taskContent);
      expect(result.id).toBeDefined();

      createdTaskId = result.id;
    });

    it('Should update a task', async () => {
      const action = UpdateTodoistTask;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');
      if (!createdTaskId) throw new Error('No task ID found from previous test');

      const updatedContent = `Test Task updated at ${new Date().toISOString()}`;

      const result = await action.api_function(
        { task_id: createdTaskId, content: updatedContent },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.content).toBe(updatedContent);
      expect(result.id).toBe(createdTaskId);
    });

    it('Should get a task', async () => {
      const action = GetTodoistTask;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');
      if (!createdTaskId) throw new Error('No task ID found from previous test');

      const result = await action.api_function({ task_id: createdTaskId }, undefined, baseContext);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdTaskId);
    });

    it('Should complete the task', async () => {
      const action = CompleteTodoistTask;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');
      if (!createdTaskId) throw new Error('No task ID found from previous test');

      await action.api_function({ task_id: createdTaskId }, undefined, baseContext);
    });

    it('Should list labels', async () => {
      const action = ListTodoistLabels;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result.labels)).toBe(true);
    });

    it('Should create a project', async () => {
      const action = CreateTodoistProject;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      const projectName = `Test Project ${Date.now()}`;

      const result = await action.api_function(
        { name: projectName, color: 'blue' },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(projectName);
      expect(result.id).toBeDefined();

      createdProjectId = result.id;
    });

    it('Should get a project', async () => {
      const action = GetTodoistProject;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');
      if (!createdProjectId) throw new Error('No project ID found from previous test');

      const result = await action.api_function(
        { project_id: createdProjectId },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdProjectId);
    });

    it('Should add a comment to a project', async () => {
      const action = AddCommentToTodoistProject;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');
      if (!createdProjectId) throw new Error('No project ID found from previous test');

      const commentContent = `This is a test comment added at ${new Date().toISOString()}`;

      const result = await action.api_function(
        { project_id: createdProjectId, content: commentContent },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.content).toBe(commentContent);
    });

    it('Should get project collaborators', async () => {
      const action = GetTodoistProjectCollaborators;

      if (!('api_function' in action) || !action.api_function)
        throw new Error('No api_function found in action');

      if (!createdProjectId) throw new Error('No project ID found from previous test');

      const result = await action.api_function(
        { project_id: createdProjectId },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.collaborators)).toBe(true);
    });

    describe('Cleanup', () => {
      it('Should delete the created project', async () => {
        if (!createdProjectId) return;

        await todoistApiClient({
          token: baseContext.conn_opts.token,
          path: `projects/${createdProjectId}`,
          method: 'DELETE',
        });
      });

      it('Should delete the created task', async () => {
        const action = DeleteTodoistTask;

        if (!('api_function' in action) || !action.api_function)
          throw new Error('No api_function found in action');
        if (!createdTaskId) return;

        await action.api_function({ task_id: createdTaskId }, undefined, baseContext);
      });
    });
  });
});
