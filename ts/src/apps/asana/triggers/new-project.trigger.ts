import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import { asanaProjectEventInfoType } from '../response-types';
import { deregisterAsanaWebhook } from './helpers';
import { Debugger } from '../../../utils/Debugger';
import { asanaClient } from '../client';

const asanaNewProjectTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'project_added',
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
      throw new Error('Token is required to register New Project Asana webhook');
    }

    if (!workspace) {
      throw new Error('Workspace is required to register New Project Asana webhook');
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
                resource_type: 'project',
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
        resourceGid ? asanaClient.get(`projects/${resourceGid}`, { token, objectPath: 'data' }) : null,
        userGid ? asanaClient.get(`users/${userGid}`, { token, objectPath: 'data' }) : null,
        parentGid ? asanaClient.get(`workspaces/${parentGid}`, { token, objectPath: 'data' }) : null,
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
    const workspaceId = context?.opts?.workspace as string;

    const mockData = {
      action: 'added',
      type: 'project',
      created_at: new Date().toISOString(),
      parent: {
        gid: workspaceId || '1208408525816938',
        resource_type: 'workspace',
      },
      resource: {
        gid: '1208499061475139',
        resource_type: 'project',
        name: 'New Project Example',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
      },
      enriched: {
        resource: {
          gid: '1208499061475139',
          resource_type: 'project',
          name: 'New Project Example',
          color: 'light-green',
          archived: false,
        },
        parent: {
          gid: workspaceId || '1208408525816938',
          resource_type: 'workspace',
          name: 'Workspace Name',
        },
        user: {
          gid: '1206353569757060',
          resource_type: 'user',
          name: 'Example User',
          email: 'user@example.com',
        },
      },
    };

    if (!token || !workspaceId) {
      return mockData;
    }

    try {
      const [userResult, workspaceResult, projectsResult] = await Promise.allSettled([
        asanaClient.get('users/me', { token, objectPath: 'data' }),
        asanaClient.get(`workspaces/${workspaceId}`, { token, objectPath: 'data' }),
        asanaClient.get(`workspaces/${workspaceId}/projects`, { token, objectPath: 'data', params: { limit: '1' } }),
      ]);

      const event = { ...mockData };

      if (userResult.status === 'fulfilled' && userResult.value) {
        const userData = userResult.value as any;
        event.user.gid = userData.gid;
        event.enriched.user = userData;
      }

      if (workspaceResult.status === 'fulfilled' && workspaceResult.value) {
        const workspaceData = workspaceResult.value as any;
        event.parent.gid = workspaceData.gid;
        event.enriched.parent = workspaceData;
      }

      if (projectsResult.status === 'fulfilled' && projectsResult.value) {
        const projects = projectsResult.value as any[];
        if (projects?.[0]) {
          const project = projects[0];
          event.resource.gid = project.gid;
          event.resource.name = project.name;
          event.enriched.resource = project;
        }
      }

      return event;
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
      return mockData;
    }
  },
  event_info: {
    desc: 'New project event data',
    type: asanaProjectEventInfoType,
  },
});

export default asanaNewProjectTrigger;
