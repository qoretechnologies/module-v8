import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { formatHelpScoutResponse } from '../helpers/format-response';
import { getHelpScoutCustomerAllowedValues } from '../helpers/get-customer-allowed-values';
import { HelpScoutCustomerResponseType } from '../response-types/customer';

const action = 'get_customer';

const options = {
  customerId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutCustomerAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = HelpScoutCustomerResponseType;

const getHelpScoutCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const customer = await helpScoutApiClient<Record<string, any>>({
        token,
        path: `customers/${customerId}`,
        method: 'GET',
      });

      return formatHelpScoutResponse(customer);
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getHelpScoutCustomer;
