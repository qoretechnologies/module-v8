import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { getFrontAccountAllowedValues } from '../helpers/get-account-allowed-values';
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';

const action = 'remove_contact_from_account';

const options = {
  accountId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontAccountAllowedValues,
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
    accountId: { type: 'string' },
    contactIds: { type: { type: 'list', element_type: 'string' } },
  },
} satisfies TQoreResponseType;

const removeFrontContactFromAccount = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, accountId, contactIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['accountId', 'contactIds'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      await frontClient.delete(`accounts/${accountId}/contacts`, {
        token,
        body: { contact_ids: contactIds },
      });

      return {
        success: true,
        accountId,
        contactIds,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default removeFrontContactFromAccount;
