import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { fetchFrontPaginatedRecords } from '../helpers/constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontContactListAllowedValues } from '../helpers/get-contact-list-allowed-values';
import { FrontContactResponseType } from '../response-types/contact';

const action = 'list_contacts_in_contact_list';

const options = {
  contactListId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactListAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: FrontContactResponseType,
} satisfies TQoreResponseType;

const listFrontContactsInContactList = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { limit } = obj || {};

    try {
      const contacts = await fetchFrontPaginatedRecords<any, Record<string, any>>({
        token,
        path: `contact_lists/${contactListId}/contacts`,
        method: 'GET',
        maxResults: limit || 50,
      });

      return formatFrontResponse(contacts);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontContactsInContactList;
