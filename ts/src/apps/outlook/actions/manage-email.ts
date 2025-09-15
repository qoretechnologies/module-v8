import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { getOutlookMailFoldersAllowedValues } from '../helpers/get-email-folder-allowed-values';
import { getOutlookMessageIdAllowedValues } from '../helpers/get-message-id-allowed-values';
import { getQoreContextRequiredValues } from '../../../global/helpers';

const options = {
  messageId: {
    type: 'string',
    get_allowed_values: getOutlookMessageIdAllowedValues,
    required: true,
  },
  action: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_dependent_options: (context) => {
      const action = context?.opts?.action;
      if (action === 'move') {
        return additionalOptions;
      } else {
        return {} as TQoreOptions;
      }
    },
    allowed_values: [
      { display_name: 'Delete', value: 'delete' },
      { display_name: 'Move', value: 'move' },
    ],
  },
} satisfies TQoreOptions;

const additionalOptions = {
  targetFolderId: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getOutlookMailFoldersAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
} satisfies TQoreResponseType;

const ManageOutlookEmail = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  action: 'manage-email',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const targetFolderId = data?.targetFolderId;

    const { action, messageId, token } = getQoreContextRequiredValues({
      context: { opts: data, ...context },
      connectionFields: ['token'],
      optionFields: ['messageId', 'action'],
    });

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    try {
      if (action === 'delete') {
        await client.api(`/me/messages/${messageId}`).delete();

        return {
          success: true,
          message: `Email with ID "${messageId}" has been deleted successfully`,
        };
      } else if (action === 'move') {
        await client.api(`/me/messages/${messageId}/move`).post({
          destinationId: targetFolderId,
        });

        return {
          success: true,
          message: `Email with ID "${messageId}" has been moved successfully to the specified folder`,
        };
      } else {
        throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      throw new Error(`Failed to ${action} Outlook email: ${error.message}`);
    }
  },
  options,
  response_type,
});

export default ManageOutlookEmail;
