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

const action = 'delete_contacts';

const options = {
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
    deletedContactIds: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
  },
} satisfies TQoreResponseType;

const deleteSendGridContacts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactIds'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    if (!contactIds || contactIds.length === 0) {
      throw new SendGridError('At least one contact ID must be provided');
    }

    try {
      await client.request({
        url: '/v3/contactdb/recipients',
        method: 'DELETE',
        body: contactIds,
      });

      return {
        success: true,
        deletedContactIds: contactIds,
      };
    } catch (error: any) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteSendGridContacts;
