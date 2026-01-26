import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { clickUpClient } from '../client';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { clickUpTimeEntryEventInfoType } from '../response-types';

const options = {
  workspace: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const ClickUpTaskTimeTrackedUpdated = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'task_time_tracked_updated',
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
        events: ['taskTimeTrackedUpdated'],
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
    const intervalId = eventData.data?.interval_id;

    if (!token || !taskId) {
      return eventData;
    }

    try {
      const timeEntriesResponse = await clickUpClient.get<{ data: any[] }>(
        `task/${taskId}/time`,
        { token }
      );

      const timeEntries = timeEntriesResponse.data || [];

      // Return specific interval or first one
      const entry = intervalId
        ? timeEntries.find((e: any) => e.id === intervalId)
        : timeEntries[0];

      return entry || eventData;
    } catch (error) {
      Debugger.log('Error fetching ClickUp time entry:', error);
      return eventData;
    }
  },
  get_example_event_data: async (context) => {
    const mockData = {
      id: '2800809188061119507',
      task: {
        id: '1vj38vv',
        name: 'Example Task',
        status: { status: 'to do', color: '#f9d900', type: 'open', orderindex: 0 },
        custom_type: null,
      },
      wid: '12345',
      user: {
        id: 183,
        username: 'John',
        email: 'john@company.com',
        color: '#7b68ee',
        initials: 'J',
        profilePicture: null,
      },
      billable: false,
      start: '1642736476215',
      end: '1642737376215',
      duration: '900000',
      description: '',
      tags: [],
      source: 'clickup',
      at: '1642737376354',
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

      const tasksResponse = await clickUpClient.get<{ tasks: { id: string }[] }>(
        `list/${list}/task`,
        { token }
      );
      const tasks = tasksResponse.tasks || [];

      if (tasks.length === 0) {
        return mockData;
      }

      const task = tasks[0].id;

      const timeEntriesResponse = await clickUpClient.get<{ data: any[] }>(
        `task/${task}/time`,
        { token }
      );

      const timeEntries = timeEntriesResponse.data || [];

      if (timeEntries.length === 0) {
        return mockData;
      }

      return timeEntries[0];
    } catch (error) {
      Debugger.log('Error fetching example event data:', error);
      return mockData;
    }
  },
  event_info: {
    desc: 'Task time tracked data',
    type: clickUpTimeEntryEventInfoType,
  },
});

export default ClickUpTaskTimeTrackedUpdated;
