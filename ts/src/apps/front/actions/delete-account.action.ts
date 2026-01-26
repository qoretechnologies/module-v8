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

const action = 'delete_account';

const options = {
  accountId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontAccountAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    accountId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const deleteFrontAccount = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      await frontClient.delete(`accounts/${accountId}`, { token });

      return {
        success: true,
        accountId,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteFrontAccount;
