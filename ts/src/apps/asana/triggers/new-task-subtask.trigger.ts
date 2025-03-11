import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { deregisterAsanaWebhook } from './helpers';

const asanaNewTaskSubtaskTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'task_subtask_added',
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
      throw new Error('Token is required to register New Task Subtask Asana webhook');
    }

    if (!task) {
      throw new Error('Task is required to register New Task Subtask Asana webhook');
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
                action: 'added',
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
  webhook_deregister: deregisterAsanaWebhook,
  webhook_echo_header: asanaWebhookEchoHeader,
  webhook_event_loc: asanaWebhookInfoLocation,
  get_example_event_data: () => ({
    action: 'added',
    type: 'task',
    created_at: new Date().toISOString(),
    parent: {
      gid: '1209628887786464',
      resource_type: 'task',
      name: 'Parent Task',
    },
    resource: {
      gid: '1209732554321987',
      resource_type: 'task',
      name: 'Subtask Example',
      resource_subtype: 'default_task',
    },
    user: {
      gid: '1206353569757060',
      resource_type: 'user',
      name: 'user@example.com',
    },
  }),
  event_info: {
    desc: 'New task subtask event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewTaskSubtaskTrigger;
