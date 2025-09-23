import { configDotenv } from 'dotenv';
import {
  CreateAzureDevOpsWorkItem,
  DeleteAzureDevOpsWorkItem,
  GetAzureDevOpsWorkItem,
  ListAzureDevOpsProjects,
  ListAzureDevOpsUsers,
  ListAzureDevOpsWorkItems,
  UpdateAzureDevOpsWorkItem,
} from '../apps/azure-devops/actions';
import { getAzureDevOpsProjectAllowedValues } from '../apps/azure-devops/helpers/get-project-allowed-values';
import { getAzureDevOpsUserAllowedValues } from '../apps/azure-devops/helpers/get-user-allowed-values';
import { getAzureDevOpsWorkItemAllowedValues } from '../apps/azure-devops/helpers/get-work-item-allowed-values';
import { getAzureDevOpsWorkItemFieldOptions } from '../apps/azure-devops/helpers/get-work-item-fields';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { NewAzureDevOpsWorkItem, UpdatedAzureDevOpsWorkItem } from '../apps/azure-devops/triggers';
import { TQoreAppActionWithWebhook } from '@qoretechnologies/ts-toolkit';
configDotenv({ path: '.env' });

describe('Should test Azure DevOps actions', () => {
  Debugger.level = DebugLevels.Verbose;
  const refreshToken = process.env.AZURE_DEVOPS_REFRESH_TOKEN;
  const clientId = process.env.AZURE_DEVOPS_CLIENT_ID;
  const clientSecret = process.env.AZURE_DEVOPS_CLIENT_SECRET;

  const base_context = {
    conn_opts: {
      token: '',
      organization: 'devqoretechnologies',
    } as any,
  };

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Azure DevOps credentials are not provided');
    }

    const data: {
      client_id: string;
      client_secret: string;
      refresh_token: string;
      grant_type: string;
    } = {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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

  let project: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get project allowed values', async () => {
      const allowedValues = await getAzureDevOpsProjectAllowedValues(base_context);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();

      project = allowedValues[0].value;
    });

    it('Should get work item allowed values', async () => {
      const allowedValues = await getAzureDevOpsWorkItemAllowedValues({
        ...base_context,
        opts: { project },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });

    it('Should get user allowed values', async () => {
      const allowedValues = await getAzureDevOpsUserAllowedValues({
        ...base_context,
        opts: { project },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });
  });

  describe('Should test actions', () => {
    let createdItem: number | undefined;

    it('Should list projects', async () => {
      const action = ListAzureDevOpsProjects;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBeDefined();
    });

    it('Should list work items', async () => {
      const action = ListAzureDevOpsWorkItems;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!project) throw new Error('Project not defined');

      const result = await action.api_function(
        {
          project,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBeDefined();
    });

    it('Should get work item', async () => {
      const action = GetAzureDevOpsWorkItem;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          id: 2,
          project,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should list users', async () => {
      const action = ListAzureDevOpsUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.users).toBeDefined();
      expect(result.users.length).toBeGreaterThan(0);
    });

    it('Should get workItem options', async () => {
      const result = await getAzureDevOpsWorkItemFieldOptions({
        ...base_context,
        opts: { project, itemType: 'Task' },
      });

      expect(result).toBeDefined();
    });

    it('Should create a work item', async () => {
      const action = CreateAzureDevOpsWorkItem;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!project) throw new Error('Project not defined');

      const result = await action.api_function(
        {
          project,
          itemType: 'Task',
          properties: {
            'System.Title': 'Test from API',
            'System.Description': 'This is a test work item created from API',
          } as any,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdItem = result.id;
    });

    it('Should update a work item', async () => {
      const action = UpdateAzureDevOpsWorkItem;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!project) throw new Error('Project not defined');
      if (!createdItem) throw new Error('Created item not defined');

      const result = await action.api_function(
        {
          project,
          itemId: createdItem,
          properties: {
            'System.Description': 'This is a test work item created from API - Updated',
          } as any,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.Description).toBe('This is a test work item created from API - Updated');
    });

    it('Should delete a work item', async () => {
      const action = DeleteAzureDevOpsWorkItem;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!project) throw new Error('Project not defined');
      if (!createdItem) throw new Error('Created item not defined');

      const result = await action.api_function(
        {
          project,
          id: createdItem,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdItem);
      expect(result.project).toBe(project);
      expect(result.success).toBe(true);
    });

    describe('Should test triggers', () => {
      describe('New Work Item Trigger', () => {
        let regInfo: Record<string, any> | undefined | void;

        it('Should register New Work Item trigger', async () => {
          const trigger = NewAzureDevOpsWorkItem;

          if (!('webhook_register' in trigger))
            throw new Error('webhook_register not found in trigger');

          if (!project) throw new Error('Project not defined');

          regInfo = await trigger.webhook_register(
            { ...base_context, opts: { project, itemType: 'Task' } },
            'https://webhook.site/deee24af-96cb-44ad-a37d-5e1817bcf905'
          );

          expect(regInfo).toBeDefined();
          expect(regInfo?.subscriptionId).toBeDefined();
        });

        it('Should deregister New Work Item trigger', async () => {
          const trigger = NewAzureDevOpsWorkItem as TQoreAppActionWithWebhook;
          await trigger.webhook_deregister(base_context, 'https://example.com/webhook', regInfo!);
          regInfo = undefined;
        });

        it('Should get example event data for new group trigger', async () => {
          const trigger = NewAzureDevOpsWorkItem;

          if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
            throw new Error('get_example_event_data not found in trigger');

          const result = await trigger.get_example_event_data({
            ...base_context,
            opts: { project } as any,
          });

          expect(result).toBeDefined();
          expect(result.eventType).toBe('workitem.created');
        });
      });

      describe('Updated Work Item Trigger', () => {
        let regInfo: Record<string, any> | undefined | void;

        it('Should register trigger', async () => {
          const trigger = UpdatedAzureDevOpsWorkItem;

          if (!('webhook_register' in trigger))
            throw new Error('webhook_register not found in trigger');

          if (!project) throw new Error('Project not defined');

          regInfo = await trigger.webhook_register(
            {
              ...base_context,
              opts: { project, itemType: 'Task', changedFields: ['System.Title'] },
            },
            'https://webhook.site/deee24af-96cb-44ad-a37d-5e1817bcf905'
          );

          expect(regInfo).toBeDefined();
          expect(regInfo?.subscriptionId).toBeDefined();
        });

        it('Should deregister New Work Item trigger', async () => {
          const trigger = UpdatedAzureDevOpsWorkItem as TQoreAppActionWithWebhook;
          await trigger.webhook_deregister(base_context, 'https://example.com/webhook', regInfo!);
          regInfo = undefined;
        });

        it('Should get example event data for new group trigger', async () => {
          const trigger = UpdatedAzureDevOpsWorkItem;

          if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
            throw new Error('get_example_event_data not found in trigger');

          if (!project) throw new Error('Project not defined');

          const result = await trigger.get_example_event_data({
            ...base_context,
            opts: { project, itemType: 'Task', changedFields: ['System.Title'] },
          });

          expect(result).toBeDefined();
          expect(result.eventType).toBe('workitem.updated');
        });
      });
    });
  });
});
