import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import {
  deregisterAsanaWebhook,
  getAsanaProject,
  getAsanaProjectTasks,
  getCurrentAsanaUser,
} from './helpers';
import { Debugger } from '../../../utils/Debugger';

const asanaNewProjectTaskTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'project_task_added',
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
      throw new Error('Token is required to register New Project Task Asana webhook');
    }

    if (!project) {
      throw new Error('Project is required to register New Project Task Asana webhook');
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
                resource_type: 'task',
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
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const project = context?.opts?.project;

    const mockData = {
      action: 'added',
      type: 'task',
      created_at: new Date().toISOString(),
      parent: {
        gid: project || '1208499061475139',
        resource_type: 'project',
        name: 'Example Project',
      },
      resource: {
        gid: '1209628887786464',
        resource_type: 'task',
        name: 'Example Task',
        resource_subtype: 'default_task',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
        name: 'user@example.com',
      },
    };

    const missingValues = [];
    if (!token) missingValues.push('token');
    if (!project) missingValues.push('project');

    if (missingValues.length > 0) {
      Debugger.log(`The following values are required: ${missingValues.join(', ')}`);

      return mockData;
    }

    try {
      const [projectResult, tasksResult, userResult] = await Promise.allSettled([
        getAsanaProject(token!, project!),
        getAsanaProjectTasks(token!, project!),
        getCurrentAsanaUser(token!),
      ]);

      const event = { ...mockData };

      if (projectResult.status === 'fulfilled' && projectResult.value) {
        const projectData = projectResult.value;
        if (projectData?.name) {
          event.parent.name = projectData.name;
        }
      }

      if (tasksResult.status === 'fulfilled' && tasksResult.value) {
        const tasksData = tasksResult.value;
        if (tasksData?.[0]) {
          const task = tasksData[0];
          event.resource.gid = task.gid;
          event.resource.name = task.name;
          event.resource.resource_subtype = task.resource_subtype || 'default_task';
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
      Debugger.log('Error fetching event data:', error);

      return mockData;
    }
  },
  event_info: {
    desc: 'New project task event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewProjectTaskTrigger;
