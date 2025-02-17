import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { deregisterAsanaWebhook } from './helpers';

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
  webhook_deregister: deregisterAsanaWebhook,
  webhook_echo_header: asanaWebhookEchoHeader,
  webhook_event_loc: asanaWebhookInfoLocation,
  event_info: {
    desc: 'New completed subtask event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewCompletedSubtaskTrigger;
