import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { clickUpClient } from '../client';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { clickUpFolderEventInfoType } from '../response-types';

const options = {
  workspace: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const ClickUpNewFolder = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'new_folder',
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
        events: ['folderCreated'],
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
    const folderId = eventData.folder_id;

    if (!token || !folderId) {
      return eventData;
    }

    try {
      const folder = await clickUpClient.get(`folder/${folderId}`, { token });
      return folder;
    } catch (error) {
      Debugger.log('Error fetching ClickUp folder:', error);
      return eventData;
    }
  },
  get_example_event_data: async (context) => {
    const mockData = {
      id: '96772212',
      name: 'Example Folder',
      orderindex: 0,
      override_statuses: false,
      hidden: false,
      space: { id: '12345', name: 'Space Name' },
      task_count: '0',
      archived: false,
      statuses: [],
      lists: [],
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

      const foldersResponse = await clickUpClient.get<{ folders: any[] }>(
        `space/${space}/folder`,
        { token }
      );
      const folders = foldersResponse.folders || [];

      if (folders.length === 0) {
        return mockData;
      }

      return folders[0];
    } catch (error) {
      Debugger.log('Error fetching example event data:', error);
      return mockData;
    }
  },
  event_info: {
    desc: 'New folder data',
    type: clickUpFolderEventInfoType,
  },
});

export default ClickUpNewFolder;
