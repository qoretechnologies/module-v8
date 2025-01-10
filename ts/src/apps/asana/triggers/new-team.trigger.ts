import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { asanaEventInfoType, asanaWebhookInfoLocation } from './constants';
import { deregisterAsanaWebhook } from './helpers';

export default {
  action: 'team_added',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    workspace: {
      type: 'string',
      required: true,
      rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
    },
  },
  webhook_register: async (context, url) => {
    const {
      conn_opts: { token },
      opts: { workspace },
    } = context;

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          data: {
            resource: workspace,
            target: url,
            filters: [
              {
                resource_type: 'team',
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
  webhook_event_loc: asanaWebhookInfoLocation,
  event_info: {
    desc: 'New team event data',
    type: asanaEventInfoType,
  },
} satisfies TQorePartialEventAction;
