import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { asanaAttachmentEventInfoType } from '../response-types';
import { deregisterAsanaWebhook } from './helpers';
import { asanaClient } from '../client';

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
  format_event_data: async (context, eventData) => {
    const token = context.conn_opts?.token;

    if (!token) {
      return eventData;
    }

    try {
      const resourceGid = eventData.resource?.gid;
      const userGid = eventData.user?.gid;
      const parentGid = eventData.parent?.gid;
      const parentType = eventData.parent?.resource_type;

      const [resource, user, parent] = await Promise.all([
        resourceGid ? asanaClient.get(`attachments/${resourceGid}`, { token, objectPath: 'data' }) : null,
        userGid ? asanaClient.get(`users/${userGid}`, { token, objectPath: 'data' }) : null,
        parentGid
          ? asanaClient.get(`${parentType === 'project' ? 'projects' : 'tasks'}/${parentGid}`, {
              token,
              objectPath: 'data',
            })
          : null,
      ]);

      return {
        ...eventData,
        enriched: {
          resource,
          user,
          parent,
        },
      };
    } catch (error) {
      Debugger.log('Error enriching Asana event data:', error);
      return eventData;
    }
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const project = context?.opts?.project as string;
    const task = context?.opts?.task as string;

    const parentGid = task || project || '1209628887786464';
    const parentType = task ? 'task' : 'project';

    const mockData = {
      action: 'added',
      type: 'attachment',
      created_at: new Date().toISOString(),
      parent: {
        gid: parentGid,
        resource_type: parentType,
      },
      resource: {
        gid: '1209876543210987',
        resource_type: 'attachment',
        name: 'document.pdf',
        resource_subtype: 'external',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
      },
      enriched: {
        resource: {
          gid: '1209876543210987',
          resource_type: 'attachment',
          name: 'document.pdf',
          download_url: 'https://example.com/document.pdf',
          view_url: 'https://example.com/document.pdf',
        },
        parent: {
          gid: parentGid,
          resource_type: parentType,
          name: task ? 'Example Task' : 'Example Project',
        },
        user: {
          gid: '1206353569757060',
          resource_type: 'user',
          name: 'Example User',
          email: 'user@example.com',
        },
      },
    };

    if (!token || !project) {
      Debugger.log(
        `Missing required values: ${[!token && 'token', !project && 'project'].filter(Boolean).join(', ')}`
      );
      return mockData;
    }

    try {
      const parentPath = task ? `tasks/${task}` : `projects/${project}`;
      const attachmentsPath = task ? `tasks/${task}/attachments` : `projects/${project}/attachments`;

      const [userResult, parentResult, attachmentsResult] = await Promise.allSettled([
        asanaClient.get('users/me', { token, objectPath: 'data' }),
        asanaClient.get(parentPath, { token, objectPath: 'data' }),
        asanaClient.get(attachmentsPath, { token, objectPath: 'data' }),
      ]);

      const event = { ...mockData };

      if (userResult.status === 'fulfilled' && userResult.value) {
        const userData = userResult.value as any;
        event.user.gid = userData.gid;
        event.enriched.user = userData;
      }

      if (parentResult.status === 'fulfilled' && parentResult.value) {
        const parentData = parentResult.value as any;
        event.parent.gid = parentData.gid;
        event.parent.resource_type = parentData.resource_type;
        event.enriched.parent = parentData;
      }

      if (attachmentsResult.status === 'fulfilled' && attachmentsResult.value) {
        const attachments = attachmentsResult.value as any[];
        if (attachments?.[0]) {
          const attachment = attachments[0];
          event.resource.gid = attachment.gid;
          event.resource.name = attachment.name;
          event.resource.resource_subtype = attachment.resource_subtype || 'external';
          event.enriched.resource = attachment;
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
    type: asanaAttachmentEventInfoType,
  },
});

export default asanaNewAttachmentTrigger;
