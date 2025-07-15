import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

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

    const webhook = await fetchClickUpData<{ id: string }>({
      method: 'POST',
      token,
      body: {
        endpoint: url,
        events: ['folderCreated'],
      },
      path: `team/${workspace}/webhook`,
    });

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

    await QorusRequest.deleteReq(
      {
        path: `/api/v2/webhook/${webhookId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { endpointId: CLICKUP_APP_NAME, url: `https://api.clickup.com` }
    );
  },
  get_example_event_data: async (context) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    try {
      const spaces = await fetchClickUpData<{ id: string }[]>({
        token,
        path: `team/${workspace}/space`,
        object: 'spaces',
        limit: 1,
      });

      if (spaces.length === 0) {
        throw new ClickUpError('No spaces found in the workspace.');
      }

      const space = spaces[0].id;

      const folders = await fetchClickUpData<{ id: string }[]>({
        token,
        path: `space/${space}/folder`,
        object: 'folders',
        limit: 1,
      });

      if (folders.length === 0) {
        throw new ClickUpError('No folders found in the space.');
      }

      const folder = folders[0].id;

      return {
        event: 'folderCreated',
        folder_id: folder,
        webhook_id: 'example-webhook-id',
      };
    } catch (error) {
      Debugger.log('Error fetching example event data:', error);

      return {
        event: 'folderCreated',
        folder_id: '96772212',
        webhook_id: '7fa3ec74-69a8-4530-a251-8a13730bd204',
      };
    }
  },
  event_info: {
    desc: 'Folder created event data',
    type: {
      type: 'hash',
      fields: {
        event: { type: 'string' },
        folder_id: { type: 'string' },
        webhook_id: { type: 'string' },
      },
    },
  },
});

export default ClickUpNewFolder;
