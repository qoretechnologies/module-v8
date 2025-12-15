import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getSendGridListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'remove_contacts_from_list';

const options = {
  listId: {
    type: 'string',
    required: true,
    get_allowed_values: getSendGridListAllowedValues,
  },
  contactIds: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: true,
    get_allowed_values: getSendGridContactAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    listId: { type: 'string' },
    removedContactIds: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
  },
} satisfies TQoreResponseType;

const removeSendGridContactsFromList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, listId, contactIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['listId', 'contactIds'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    if (!contactIds || contactIds.length === 0) {
      throw new SendGridError('At least one contact ID must be provided');
    }

    try {
      const removedIds: string[] = [];
      const errors: string[] = [];

      for (const contactId of contactIds) {
        try {
          await client.request({
            url: `/v3/contactdb/lists/${listId}/recipients/${contactId}`,
            method: 'DELETE',
          });
          removedIds.push(contactId);
        } catch (error: any) {
          errors.push(`Contact ${contactId}: ${error.message || error}`);
        }
      }

      if (errors.length > 0 && removedIds.length === 0) {
        throw new SendGridError(`Failed to remove any contacts: ${errors.join('; ')}`);
      }

      return {
        success: true,
        listId,
        removedContactIds: removedIds,
      };
    } catch (error: any) {
      if (error instanceof SendGridError) throw error;
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default removeSendGridContactsFromList;
