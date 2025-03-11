import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { deregisterAsanaWebhook, getAsanaProjectTasks, getCurrentAsanaUser } from './helpers';
import { Debugger } from '../../../utils/Debugger';

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
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const project = context?.opts?.project;

    const mockData = {
      action: 'added',
      type: 'attachment',
      created_at: new Date().toISOString(),
      parent: {
        gid: '1209628887786464',
        resource_type: 'task',
        name: 'Example Task',
      },
      resource: {
        gid: '1209732554654321',
        resource_type: 'attachment',
        name: 'document.pdf',
        resource_subtype: 'pdf',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
        name: 'user@example.com',
      },
    };

    if (!token || !project) {
      Debugger.log(
        `Missing required values: ${[!token && 'token', !project && 'task'].filter(Boolean).join(', ')}`
      );

      return mockData;
    }

    try {
      const [taskResult, userResult] = await Promise.allSettled([
        getAsanaProjectTasks(token, project),
        getCurrentAsanaUser(token),
      ]);

      const event = { ...mockData };

      if (taskResult.status === 'fulfilled' && taskResult.value) {
        const taskData = taskResult.value[0];
        if (taskData?.name) {
          event.parent.name = taskData.name;
        }
      }

      if (userResult.status === 'fulfilled' && userResult.value) {
        const userData = userResult.value;
        if (userData) {
          event.user.gid = userData.gid;
          event.user.name = userData.email || userData.name;
        }
      }

      return event;
    } catch (error) {
      Debugger.log('Error fetching attachment event data:', error);

      return mockData;
    }
  },
  event_info: {
    desc: 'New attachment event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewAttachmentTrigger;
