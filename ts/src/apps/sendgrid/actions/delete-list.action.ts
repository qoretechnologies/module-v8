import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { getSendGridListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'delete_list';

const options = {
  listId: {
    type: 'string',
    required: true,
    get_allowed_values: getSendGridListAllowedValues,
  },
  deleteContacts: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    listId: { type: 'string' },
    contactsDeleted: { type: 'bool' },
  },
} satisfies TQoreResponseType;

const deleteSendGridList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, listId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['listId'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);
    const { deleteContacts } = obj || {};

    try {
      await client.request({
        url: `/v3/contactdb/lists/${listId}`,
        method: 'DELETE',
        qs: deleteContacts ? { delete_contacts: 'true' } : undefined,
      });

      return {
        success: true,
        listId,
        contactsDeleted: deleteContacts || false,
      };
    } catch (error: any) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteSendGridList;
