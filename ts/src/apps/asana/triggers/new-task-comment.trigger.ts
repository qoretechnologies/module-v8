import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { getAsanaWorkspaceProjectIdAllowedValues } from '../helpers/get-workspace-project-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import {
  deregisterAsanaWebhook,
  getAsanaTask,
  getAsanaTaskStories,
  getCurrentAsanaUser,
} from './helpers';
import { Debugger } from '../../../utils/Debugger';

const asanaNewTaskCommentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'task_comment_added',
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
      throw new Error('Token is required to register New Task Comment Asana webhook');
    }

    if (!task) {
      throw new Error('Task is required to register New Task Comment Asana webhook');
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
                fields: ['text'],
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
      action: 'added',
      type: 'story',
      created_at: new Date().toISOString(),
      parent: {
        gid: '1209628887786464',
        resource_type: 'task',
        name: 'Task Name',
      },
      resource: {
        gid: '1209843667890123',
        resource_type: 'story',
        resource_subtype: 'comment_added',
        text: 'This is an example comment on a task',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
        name: 'user@example.com',
      },
    };

    const token = context?.conn_opts?.token;
    const task = context?.opts?.task as string;

    if (!token || !task) {
      return mockData;
    }

    try {
      const [user, parent, stories] = await Promise.all([
        getCurrentAsanaUser(token),
        getAsanaTask(token, task),
        getAsanaTaskStories(token, task, 'comments'),
      ]);

      if (parent) {
        mockData.parent.gid = parent.gid;
        mockData.parent.name = parent.name;
      }

      if (user) {
        mockData.user.gid = user.gid;
        mockData.user.name = user.name;
      }

      const comment = stories?.[0];
      if (comment) {
        mockData.resource.gid = comment.gid;
        mockData.resource.text = comment.text;
      }
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
    } finally {
      return mockData;
    }
  },
  event_info: {
    desc: 'New task comment event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewTaskCommentTrigger;
