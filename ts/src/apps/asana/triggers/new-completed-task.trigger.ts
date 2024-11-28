import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType } from './constants';
import { deregisterAsanaWebhook } from './helpers';

export default {
  action: 'task_completed',
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
  },
  webhook_register: async (context, url) => {
    const {
      conn_opts: { token },
      opts: { project },
    } = context;

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          data: {
            resource: project,
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
  event_info: {
    desc: 'New completed task event data',
    type: asanaEventInfoType,
  },
} satisfies TQorePartialEventAction;
