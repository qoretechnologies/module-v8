import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { asanaSubtaskEventInfoType } from '../response-types';
import { deregisterAsanaWebhook } from './helpers';
import { Debugger } from '../../../utils/Debugger';
import { asanaClient } from '../client';

const asanaNewCompletedSubtaskTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'subtask_completed',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    workspace: {
      type: 'string',
      required: true,
      rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
    },
    project: {
      type: 'string',
      required: true,
      depends_on: ['workspace'],
      get_allowed_values: getAsanaWorkspaceProjectIdAllowedValues,
    },
    task: {
      type: 'string',
      required: true,
      depends_on: ['project'],
      get_allowed_values: getAsanaTaskIdAllowedValues,
    },
  },
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const task = context?.opts?.task;

    if (!token) {
      throw new Error('Token is required to register New Completed Subtask Asana webhook');
    }

    if (!task) {
      throw new Error('Task is required to register New Completed Subtask Asana webhook');
    }

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          data: {
            resource: task,
            target: url,
            filters: [
              {
                resource_type: 'task',
                action: 'changed',
                fields: ['completed'],
              },
            ],
          },
        },
        path: '/api/1.0/webhooks',
      },
      {
        url: 'https://app.asana.com',
        endpointId: 'Asana',
      }
    );

    return { webhook: data.data };
  },
  format_event_data: async (context, eventData) => {
    const token = context.conn_opts?.token;

    if (!token) {
      return eventData;
    }

    try {
      const resourceGid = eventData.resource?.gid;
      const userGid = eventData.user?.gid;
      const parentGid = eventData.parent?.gid;

      const [resource, user, parent] = await Promise.all([
        resourceGid ? asanaClient.get(`tasks/${resourceGid}`, { token, objectPath: 'data' }) : null,
        userGid ? asanaClient.get(`users/${userGid}`, { token, objectPath: 'data' }) : null,
        parentGid ? asanaClient.get(`tasks/${parentGid}`, { token, objectPath: 'data' }) : null,
      ]);

      return {
        ...eventData,
        enriched: {
          resource,
          user,
          parent,
        },
      };
    } catch (error) {
      Debugger.log('Error enriching Asana event data:', error);
      return eventData;
    }
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const task = context?.opts?.task as string;

    const mockData = {
      action: 'changed',
      type: 'task',
      created_at: new Date().toISOString(),
      parent: {
        gid: task || '1209628887786464',
        resource_type: 'task',
      },
      resource: {
        gid: '1209732554321987',
        resource_type: 'task',
        name: 'Completed Subtask Example',
        resource_subtype: 'default_task',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
      },
      change: {
        field: 'completed',
        action: 'changed',
      },
      enriched: {
        resource: {
          gid: '1209732554321987',
          resource_type: 'task',
          name: 'Completed Subtask Example',
          completed: true,
        },
        parent: {
          gid: task || '1209628887786464',
          resource_type: 'task',
          name: 'Parent Task',
        },
        user: {
          gid: '1206353569757060',
          resource_type: 'user',
          name: 'Example User',
          email: 'user@example.com',
        },
      },
    };

    if (!token || !task) {
      return mockData;
    }

    try {
      const [userResult, parentResult, subtasksResult] = await Promise.allSettled([
        asanaClient.get('users/me', { token, objectPath: 'data' }),
        asanaClient.get(`tasks/${task}`, { token, objectPath: 'data' }),
        asanaClient.get(`tasks/${task}/subtasks`, { token, objectPath: 'data', params: { limit: '1' } }),
      ]);

      const event = { ...mockData };

      if (userResult.status === 'fulfilled' && userResult.value) {
        const userData = userResult.value as any;
        event.user.gid = userData.gid;
        event.enriched.user = userData;
      }

      if (parentResult.status === 'fulfilled' && parentResult.value) {
        const parentData = parentResult.value as any;
        event.parent.gid = parentData.gid;
        event.enriched.parent = parentData;
      }

      if (subtasksResult.status === 'fulfilled' && subtasksResult.value) {
        const subtasks = subtasksResult.value as any[];
        if (subtasks?.[0]) {
          const subtask = subtasks[0];
          event.resource.gid = subtask.gid;
          event.resource.name = subtask.name;
          event.enriched.resource = { ...subtask, completed: true };
        }
      }

      return event;
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
      return mockData;
    }
  },
  event_info: {
    desc: 'New completed subtask event data',
    type: asanaSubtaskEventInfoType,
  },
  webhook_deregister: deregisterAsanaWebhook,
  webhook_echo_header: asanaWebhookEchoHeader,
  webhook_event_loc: asanaWebhookInfoLocation,
});

export default asanaNewCompletedSubtaskTrigger;
