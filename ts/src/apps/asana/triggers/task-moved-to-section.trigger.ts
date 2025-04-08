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
  get_example_event_data: async (context) => {
    const mockData = {
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
    };

    const token = context?.conn_opts?.token;
    const projectId = context?.opts?.project as string;

    if (!token || !projectId) {
      return mockData;
    }

    try {
      const [user, project, tasks] = await Promise.all([
        getCurrentAsanaUser(token),
        getAsanaProject(token, projectId),
        getAsanaProjectTasks(token, projectId),
      ]);

      if (user) {
        mockData.user.gid = user.gid;
        mockData.user.name = user.name;
      }

      const task = tasks?.[0];
      if (task) {
        mockData.resource.gid = task.gid;
        mockData.resource.name = task.name;
      }

      if (project) {
        mockData.parent.gid = project.gid;
        mockData.parent.name = project.name;
      }
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
    } finally {
      return mockData;
    }
  },
  event_info: {
    desc: 'Triggered when a task is moved to a section within a project.',
    type: asanaEventInfoType,
  },
});

export default asanaTaskMovedToSectionTrigger;
