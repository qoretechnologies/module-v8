import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { asanaStoryEventInfoType } from '../response-types';
import { deregisterAsanaWebhook } from './helpers';
import { Debugger } from '../../../utils/Debugger';
import { asanaClient } from '../client';

const asanaNewTaskStoryTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'task_story_added',
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
      throw new Error('Token is required to register New Task Story Asana webhook');
    }

    if (!task) {
      throw new Error('Task is required to register New Task Story Asana webhook');
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
                resource_type: 'story',
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
        resourceGid ? asanaClient.get(`stories/${resourceGid}`, { token, objectPath: 'data' }) : null,
        userGid ? asanaClient.get(`users/${userGid}`, { token, objectPath: 'data' }) : null,
        parentGid ? asanaClient.get(`tasks/${parentGid}`, { token, objectPath: 'data' }) : null,
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
    const task = context?.opts?.task as string;

    const mockData = {
      action: 'added',
      type: 'story',
      created_at: new Date().toISOString(),
      parent: {
        gid: task || '1209628887786464',
        resource_type: 'task',
      },
      resource: {
        gid: '1209843667890123',
        resource_type: 'story',
        resource_subtype: 'system',
        text: 'Task was moved from Project A to Project B',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
      },
      enriched: {
        resource: {
          gid: '1209843667890123',
          resource_type: 'story',
          resource_subtype: 'system',
          text: 'Task was moved from Project A to Project B',
          type: 'system',
        },
        parent: {
          gid: task || '1209628887786464',
          resource_type: 'task',
          name: 'Task Name',
        },
        user: {
          gid: '1206353569757060',
          resource_type: 'user',
          name: 'Example User',
          email: 'user@example.com',
        },
      },
    };

    if (!token || !task) {
      return mockData;
    }

    try {
      const [userResult, parentResult, storiesResult] = await Promise.allSettled([
        asanaClient.get('users/me', { token, objectPath: 'data' }),
        asanaClient.get(`tasks/${task}`, { token, objectPath: 'data' }),
        asanaClient.get(`tasks/${task}/stories`, { token, objectPath: 'data' }),
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
        event.enriched.parent = parentData;
      }

      if (storiesResult.status === 'fulfilled' && storiesResult.value) {
        const stories = storiesResult.value as any[];
        if (stories?.[0]) {
          const story = stories[0];
          event.resource.gid = story.gid;
          event.resource.text = story.text;
          event.resource.resource_subtype = story.resource_subtype || 'system';
          event.enriched.resource = story;
        }
      }

      return event;
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
      return mockData;
    }
  },
  event_info: {
    desc: 'New task story event data',
    type: asanaStoryEventInfoType,
  },
});

export default asanaNewTaskStoryTrigger;
