import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { asanaTaskMovedToSectionEventInfoType } from '../response-types';
import { deregisterAsanaWebhook } from './helpers';
import { Debugger } from '../../../utils/Debugger';
import { asanaClient } from '../client';

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
  format_event_data: async (context, eventData) => {
    const token = context.conn_opts?.token;

    if (!token) {
      return eventData;
    }

    try {
      const resourceGid = eventData.resource?.gid;
      const userGid = eventData.user?.gid;
      const parentGid = eventData.parent?.gid;

      const [resource, user, parent] = await Promise.all([
        resourceGid ? asanaClient.get(`tasks/${resourceGid}`, { token, objectPath: 'data' }) : null,
        userGid ? asanaClient.get(`users/${userGid}`, { token, objectPath: 'data' }) : null,
        parentGid ? asanaClient.get(`projects/${parentGid}`, { token, objectPath: 'data' }) : null,
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
    const projectId = context?.opts?.project as string;

    const mockData = {
      action: 'changed',
      type: 'task',
      created_at: new Date().toISOString(),
      parent: {
        gid: projectId || '1208499061475139',
        resource_type: 'project',
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
      },
      enriched: {
        resource: {
          gid: '1209628887786464',
          resource_type: 'task',
          name: 'Task Example',
        },
        parent: {
          gid: projectId || '1208499061475139',
          resource_type: 'project',
          name: 'Project Name',
        },
        user: {
          gid: '1206353569757060',
          resource_type: 'user',
          name: 'Example User',
          email: 'user@example.com',
        },
      },
    };

    if (!token || !projectId) {
      return mockData;
    }

    try {
      const [userResult, projectResult, tasksResult] = await Promise.allSettled([
        asanaClient.get('users/me', { token, objectPath: 'data' }),
        asanaClient.get(`projects/${projectId}`, { token, objectPath: 'data' }),
        asanaClient.get(`projects/${projectId}/tasks`, { token, objectPath: 'data', params: { limit: '1' } }),
      ]);

      const event = { ...mockData };

      if (userResult.status === 'fulfilled' && userResult.value) {
        const userData = userResult.value as any;
        event.user.gid = userData.gid;
        event.enriched.user = userData;
      }

      if (projectResult.status === 'fulfilled' && projectResult.value) {
        const projectData = projectResult.value as any;
        event.parent.gid = projectData.gid;
        event.enriched.parent = projectData;
      }

      if (tasksResult.status === 'fulfilled' && tasksResult.value) {
        const tasks = tasksResult.value as any[];
        if (tasks?.[0]) {
          const task = tasks[0];
          event.resource.gid = task.gid;
          event.resource.name = task.name;
          event.enriched.resource = task;
        }
      }

      return event;
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
      return mockData;
    }
  },
  event_info: {
    desc: 'Triggered when a task is moved to a section within a project.',
    type: asanaTaskMovedToSectionEventInfoType,
  },
});

export default asanaTaskMovedToSectionTrigger;
