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
import { getFrontContactListAllowedValues } from '../helpers/get-contact-list-allowed-values';

const action = 'add_contacts_to_contact_list';

const options = {
  contactListId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactListAllowedValues,
  },
  contactIds: {
    type: { type: 'list', element_type: 'string' },
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    contactListId: { type: 'string' },
    contactIds: { type: { type: 'list', element_type: 'string' } },
  },
} satisfies TQoreResponseType;

const addFrontContactsToContactList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactListId, contactIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactListId', 'contactIds'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      await frontClient.post(
        `contact_lists/${contactListId}/contacts`,
        { contact_ids: contactIds },
        { token }
      );

      return {
        success: true,
        contactListId,
        contactIds,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addFrontContactsToContactList;
