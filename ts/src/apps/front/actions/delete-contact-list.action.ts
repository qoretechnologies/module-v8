import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { getFrontContactListAllowedValues } from '../helpers/get-contact-list-allowed-values';

const action = 'delete_contact_list';

const options = {
  contactListId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactListAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    contactListId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const deleteFrontContactList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactListId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactListId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      await frontClient.delete(`contact_lists/${contactListId}`, { token });

      return {
        success: true,
        contactListId,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteFrontContactList;
