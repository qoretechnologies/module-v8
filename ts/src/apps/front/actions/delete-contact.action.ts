import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';

const action = 'delete_contact';

const options = {
  contactId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    contactId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const deleteFrontContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      await frontClient.delete(`contacts/${contactId}`, { token });

      return {
        success: true,
        contactId,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteFrontContact;
