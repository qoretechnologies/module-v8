import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { deregisterAsanaWebhook } from './helpers';

const asanaTaskMovedToSectionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'task_moved_to_section',
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
      throw new Error('Token is required to register Task Moved To Section Asana webhook');
    }

    if (!project) {
      throw new Error('Project is required to register Task Moved To Section Asana webhook');
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
                resource_type: 'story',
                action: 'added',
                resource_subtype: 'section_changed',
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
    action: 'changed',
    type: 'task',
    created_at: new Date().toISOString(),
    parent: {
      gid: '1208499061475139',
      resource_type: 'project',
      name: 'Project Name',
    },
    resource: {
      gid: '1209628887786464',
      resource_type: 'task',
      name: 'Task Example',
    },
    change: {
      field: 'section',
      action: 'changed',
    },
    user: {
      gid: '1206353569757060',
      resource_type: 'user',
      name: 'user@example.com',
    },
  }),
  event_info: {
    desc: 'Triggered when a task is moved to a section within a project.',
    type: asanaEventInfoType,
  },
});

export default asanaTaskMovedToSectionTrigger;
