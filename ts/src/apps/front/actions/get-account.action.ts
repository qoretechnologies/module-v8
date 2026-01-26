import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontAccountAllowedValues } from '../helpers/get-account-allowed-values';
import { FrontAccountResponseType } from '../response-types/account';

const action = 'get_account';

const options = {
  accountId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontAccountAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = FrontAccountResponseType;

const getFrontAccount = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const account = await frontClient.get<Record<string, any>>(`accounts/${accountId}`, { token });

      return formatFrontResponse(account);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getFrontAccount;
