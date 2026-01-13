import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { clickUpClient } from '../client';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { clickUpListEventInfoType } from '../response-types';

const options = {
  workspace: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const ClickUpNewList = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'new_list',
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
        events: ['listCreated'],
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
    const listId = eventData.list_id;

    if (!token || !listId) {
      return eventData;
    }

    try {
      return await clickUpClient.get(`list/${listId}`, { token });
    } catch (error) {
      Debugger.log('Error fetching ClickUp list:', error);
      return eventData;
    }
  },
  get_example_event_data: async (context) => {
    const mockData = {
      id: '96772212',
      name: 'Example List',
      orderindex: 0,
      content: '',
      status: { status: 'open', color: '#d3d3d3', hide_label: true },
      priority: null,
      assignee: null,
      due_date: null,
      due_date_time: false,
      start_date: null,
      start_date_time: null,
      folder: { id: '12345', name: 'Folder Name', hidden: false, access: true },
      space: { id: '67890', name: 'Space Name', access: true },
      inbound_address: '',
      archived: false,
      override_statuses: false,
      statuses: [],
      permission_level: 'create',
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

      const listsResponse = await clickUpClient.get<{ lists: any[] }>(
        `space/${space}/list`,
        { token }
      );
      const lists = listsResponse.lists || [];

      if (lists.length === 0) {
        return mockData;
      }

      return lists[0];
    } catch (error) {
      Debugger.log('Error fetching example event data:', error);
      return mockData;
    }
  },
  event_info: {
    desc: 'New list data',
    type: clickUpListEventInfoType,
  },
});

export default ClickUpNewList;
