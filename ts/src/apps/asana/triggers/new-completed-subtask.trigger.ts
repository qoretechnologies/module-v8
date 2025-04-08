import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import {
  deregisterAsanaWebhook,
  getAsanaTask,
  getAsasnaTaskSubtask,
  getCurrentAsanaUser,
} from './helpers';
import { Debugger } from '../../../utils/Debugger';

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
  get_example_event_data: async (context) => {
    const mockData = {
      action: 'changed',
      type: 'task',
      created_at: new Date().toISOString(),
      parent: {
        gid: 'example-task-gid',
        resource_type: 'task',
        name: 'Parent Task',
      },
      resource: {
        gid: 'example-subtask-gid',
        resource_type: 'task',
        name: 'Completed Subtask Example',
        resource_subtype: 'default_task',
      },
      user: {
        gid: 'example-user-gid',
        resource_type: 'user',
        name: 'user@example.com',
      },
      change: {
        field: 'completed',
        action: 'changed',
      },
    };

    const token = context?.conn_opts?.token;
    const task = context?.opts?.task as string;

    if (!token || !task) {
      return mockData;
    }

    try {
      const [user, parent, subtask] = await Promise.all([
        getCurrentAsanaUser(token),
        getAsanaTask(token, task),
        getAsasnaTaskSubtask(token, task),
      ]);

      if (parent) {
        mockData.parent.gid = parent.gid;
        mockData.parent.name = parent.name;
      }

      if (user) {
        mockData.user.gid = user.gid;
        mockData.user.name = user.name;
      }

      if (subtask) {
        mockData.resource.gid = subtask.gid;
        mockData.resource.name = subtask.name;
      }
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
    } finally {
      return mockData;
    }
  },
  event_info: {
    desc: 'New completed subtask event data',
    type: asanaEventInfoType,
  },
  webhook_deregister: deregisterAsanaWebhook,
  webhook_echo_header: asanaWebhookEchoHeader,
  webhook_event_loc: asanaWebhookInfoLocation,
});

export default asanaNewCompletedSubtaskTrigger;
