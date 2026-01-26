import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { clickUpClient } from '../client';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { clickUpTaskEventInfoType } from '../response-types';

const options = {
  workspace: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const ClickUpTaskUpdated = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'task_updated',
  app: CLICKUP_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    const webhook = await clickUpClient.post<{ id: string }>(
      `team/${workspace}/webhook`,
      {
        endpoint: url,
        events: ['taskUpdated'],
      },
      { token }
    );

    return { webhook };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ClickUpError,
    });

    const webhookId = regInfo.webhook.id;

    if (!webhookId) {
      throw new ClickUpError('Webhook ID is required for deregistration.');
    }

    await clickUpClient.delete(`webhook/${webhookId}`, { token });
  },
  format_event_data: async (context, eventData) => {
    const token = context.conn_opts?.token;
    const taskId = eventData.task_id;

    if (!token || !taskId) {
      return eventData;
    }

    try {
      return await clickUpClient.get(`task/${taskId}`, { token });
    } catch (error) {
      Debugger.log('Error fetching ClickUp task:', error);
      return eventData;
    }
  },
  get_example_event_data: async (context) => {
    const mockData = {
      id: '1vj37mc',
      custom_id: null,
      custom_item_id: 0,
      name: 'Updated Task Example',
      text_content: '',
      description: '',
      status: { status: 'in progress', color: '#4194f6', orderindex: 1, type: 'custom' },
      orderindex: '0',
      date_created: '1642734631523',
      date_updated: '1642734925064',
      date_closed: null,
      creator: { id: 183, username: 'John', color: '#7b68ee', profilePicture: null },
      assignees: [{ id: 212567236, username: 'John', email: 'john@company.com', color: '', initials: 'J' }],
      watchers: [],
      checklists: [],
      tags: [],
      parent: null,
      priority: null,
      due_date: null,
      start_date: null,
      points: null,
      time_estimate: null,
      time_spent: null,
      custom_fields: [],
      list: { id: '12345' },
      folder: { id: '67890' },
      space: { id: '11111' },
      url: 'https://app.clickup.com/t/1vj37mc',
    };

    const token = context?.conn_opts?.token;
    const workspace = context?.opts?.workspace;

    if (!token || !workspace) {
      return mockData;
    }

    try {
      const spacesResponse = await clickUpClient.get<{ spaces: { id: string }[] }>(
        `team/${workspace}/space`,
        { token }
      );
      const spaces = spacesResponse.spaces || [];

      if (spaces.length === 0) {
        return mockData;
      }

      const space = spaces[0].id;

      const listsResponse = await clickUpClient.get<{ lists: { id: string }[] }>(
        `space/${space}/list`,
        { token }
      );
      const lists = listsResponse.lists || [];

      if (lists.length === 0) {
        return mockData;
      }

      const list = lists[0].id;

      const tasksResponse = await clickUpClient.get<{ tasks: any[] }>(
        `list/${list}/task`,
        { token }
      );
      const tasks = tasksResponse.tasks || [];

      if (tasks.length === 0) {
        return mockData;
      }

      return tasks[0];
    } catch (error) {
      Debugger.log('Error fetching example event data:', error);
      return mockData;
    }
  },
  event_info: {
    desc: 'Updated task data',
    type: clickUpTaskEventInfoType,
  },
});

export default ClickUpTaskUpdated;
