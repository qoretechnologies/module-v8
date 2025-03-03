import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { getOutlookContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';

const options = {
  contactId: {
    type: 'string',
    get_allowed_values: getOutlookContactIdAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const DeleteOutlookContact = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'delete-contact',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const contactId = data?.contactId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!contactId) missingValues.push('contactId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to delete Outlook contact`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    try {
      await client.api(`/me/contacts/${contactId}`).delete();

      return {
        success: true,
        message: `Contact ${contactId} has been successfully deleted`,
      };
    } catch (error) {
      throw new Error(`Failed to delete Outlook contact: ${error.message}`);
    }
  },
  options,
  response_type,
});
