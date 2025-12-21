import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { getHelpScoutCustomerAllowedValues } from '../helpers/get-customer-allowed-values';

const action = 'delete_customer';

const options = {
  customerId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutCustomerAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    customerId: { type: 'integer' },
  },
} satisfies TQoreResponseType;

const deleteHelpScoutCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, customerId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['customerId'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    try {
      await helpScoutApiClient({
        token,
        path: `customers/${customerId}`,
        method: 'DELETE',
      });

      return {
        success: true,
        customerId,
      };
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteHelpScoutCustomer;
