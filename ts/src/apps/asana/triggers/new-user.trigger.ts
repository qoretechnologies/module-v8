import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { deregisterAsanaWebhook } from './helpers';

const asanaNewUserTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'user_added',
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
    const token = context?.conn_opts?.token;
    const workspace = context?.opts?.workspace;

    if (!token) {
      throw new Error('Token is required to register New User Asana webhook');
    }

    if (!workspace) {
      throw new Error('Workspace is required to register New User Asana webhook');
    }

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
                resource_type: 'user',
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
    type: 'user',
    created_at: new Date().toISOString(),
    parent: {
      gid: '1208408525816938',
      resource_type: 'workspace',
      name: 'Workspace Name',
    },
    resource: {
      gid: '1206987654321098',
      resource_type: 'user',
      name: 'new.user@example.com',
    },
    user: {
      gid: '1206353569757060',
      resource_type: 'user',
      name: 'admin@example.com',
    },
  }),
  event_info: {
    desc: 'New user event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewUserTrigger;
