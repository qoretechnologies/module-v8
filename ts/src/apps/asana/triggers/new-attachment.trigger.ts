import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import {
  deregisterAsanaWebhook,
  getAsanaProject,
  getAsanaTask,
  getAsasnaAttachments,
  getCurrentAsanaUser,
} from './helpers';

const asanaNewAttachmentTrigger = QoreAppCreator.createLocalizedTrigger({
  action: 'attachment_added',
  app: ASANA_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    workspace: {
      type: 'string',
      required: true,
      on_change: ['refetch'],
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
      required: false,
      preselected: true,
      depends_on: ['project'],
      get_allowed_values: getAsanaTaskIdAllowedValues,
    },
  },
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const project = context?.opts?.project;
    const task = context?.opts?.task;

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
            resource: task || project,
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
    const task = context?.opts?.task;

    const mockData = {
      action: 'added',
      type: 'attachment',
      created_at: new Date().toISOString(),
      parent: {
        gid: 'example-task-gid',
        resource_type: 'task',
        name: 'Example Task',
      },
      resource: {
        gid: 'example-attachment-gid',
        resource_type: 'attachment',
        name: 'document.pdf',
        resource_subtype: 'pdf',
      },
      user: {
        gid: 'example-user-gid',
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
      const [parent, user, attachments] = await Promise.all([
        task ? getAsanaTask(token, task) : getAsanaProject(token, project),
        getCurrentAsanaUser(token),
        getAsasnaAttachments(token, task || project, task ? 'tasks' : 'projects'),
      ]);

      if (parent) {
        mockData.parent.gid = parent.gid;
        mockData.parent.name = parent.name;
        mockData.parent.resource_type = parent.resource_type;
      }

      if (user) {
        mockData.user.gid = user.gid;
        mockData.user.name = user.name;
      }

      const attachment = attachments?.[0];
      if (attachment) {
        mockData.resource.gid = attachment.gid;
        mockData.resource.name = attachment.name;
        mockData.resource.resource_type = attachment.resource_type;
        mockData.resource.resource_subtype = attachment.resource_subtype;
      }
    } catch (error) {
      Debugger.log('Error fetching attachment event data:', error);
    } finally {
      return mockData;
    }
  },
  event_info: {
    desc: 'New attachment event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewAttachmentTrigger;
