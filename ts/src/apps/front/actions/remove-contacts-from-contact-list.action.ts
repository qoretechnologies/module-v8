import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { frontApiClient } from '../helpers/constants';
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getFrontContactListAllowedValues } from '../helpers/get-contact-list-allowed-values';

const action = 'remove_contacts_from_contact_list';

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

const removeFrontContactsFromContactList = QoreAppCreator.createLocalizedAction<typeof options>({
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
      await frontApiClient({
        token,
        path: `contact_lists/${contactListId}/contacts`,
        method: 'DELETE',
        body: {
          contact_ids: contactIds,
        },
      });

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

export default removeFrontContactsFromContactList;
