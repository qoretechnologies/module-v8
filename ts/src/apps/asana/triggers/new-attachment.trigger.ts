import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { deregisterAsanaWebhook } from './helpers';

const asanaNewAttachmentTrigger = QoreAppCreator.createLocalizedTrigger({
  action: 'attachment_added',
  app: ASANA_APP_NAME,
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
    const token = context?.conn_opts?.token;
    const project = context?.opts?.project;

    if (!token) {
      throw new Error('Token is required to register New Attachment Asana webhook');
    }

    if (!project) {
      throw new Error('Project is required to register New Attachment Asana webhook');
    }

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
                resource_type: 'attachment',
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
  webhook_event_loc: asanaWebhookInfoLocation,
  webhook_echo_header: asanaWebhookEchoHeader,
  webhook_deregister: deregisterAsanaWebhook,
  event_info: {
    desc: 'New attachment event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewAttachmentTrigger;
