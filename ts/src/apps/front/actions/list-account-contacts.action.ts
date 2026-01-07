import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontAccountAllowedValues } from '../helpers/get-account-allowed-values';
import { FrontContactResponseType } from '../response-types/contact';

const action = 'list_account_contacts';

const options = {
  accountId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontAccountAllowedValues,
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

const listFrontAccountContacts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, accountId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['accountId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { limit } = obj || {};

    try {
      const contacts = await frontClient.fetchPaginated<Record<string, any>>({
        path: `accounts/${accountId}/contacts`,
        token,
        maxResults: limit || 50,
      });

      return formatFrontResponse(contacts);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontAccountContacts;
