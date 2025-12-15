import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'add_or_update_contact';

const options = {
  email: {
    type: 'string',
    required: true,
  },
  firstName: {
    type: 'string',
    required: false,
  },
  lastName: {
    type: 'string',
    required: false,
  },
  listIds: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_allowed_values: getSendGridListAllowedValues,
  },
  customFields: {
    type: {
      type: 'hash',
    },
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    persisted_recipients: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    updated_count: { type: 'integer' },
    new_count: { type: 'integer' },
    error_count: { type: 'integer' },
    errors: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            message: { type: 'string' },
            error_indices: {
              type: {
                type: 'list',
                element_type: 'integer',
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const addOrUpdateSendGridContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['email'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);
    const { firstName, lastName, listIds, customFields } = obj || {};

    try {
      const recipient: Record<string, any> = { email };
      if (firstName) recipient.first_name = firstName;
      if (lastName) recipient.last_name = lastName;
      if (customFields) {
        Object.assign(recipient, customFields);
      }

      const [response] = await client.request({
        url: '/v3/contactdb/recipients',
        method: 'POST',
        body: [recipient],
      });

      const result = response.body as {
        persisted_recipients: string[];
        updated_count: number;
        new_count: number;
        error_count: number;
        errors?: any[];
      };

      if (listIds && listIds.length > 0 && result.persisted_recipients?.length > 0) {
        const recipientId = result.persisted_recipients[0];

        for (const listId of listIds) {
          try {
            await client.request({
              url: `/v3/contactdb/lists/${listId}/recipients/${recipientId}`,
              method: 'POST',
            });
          } catch (listError: any) {
            Debugger.log(`Failed to add contact to list ${listId}: ${listError.message}`);
          }
        }
      }

      return result;
    } catch (error: any) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addOrUpdateSendGridContact;
