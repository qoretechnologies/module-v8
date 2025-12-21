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
import { HelpScoutGenderAllowedValues } from './create-customer.action';

const action = 'update_customer';

const options = {
  customerId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutCustomerAllowedValues,
  },
  firstName: {
    type: 'string',
    required: false,
  },
  lastName: {
    type: 'string',
    required: false,
  },
  jobTitle: {
    type: 'string',
    required: false,
  },
  organization: {
    type: 'string',
    required: false,
  },
  location: {
    type: 'string',
    required: false,
  },
  background: {
    type: 'string',
    required: false,
  },
  gender: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutGenderAllowedValues,
  },
  age: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    customerId: { type: 'integer' },
  },
} satisfies TQoreResponseType;

const updateHelpScoutCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { firstName, lastName, jobTitle, organization, location, background, gender, age } =
      obj || {};

    try {
      const operations: Array<{ op: string; path: string; value?: any }> = [];

      if (firstName !== undefined) {
        operations.push({ op: 'replace', path: '/firstName', value: firstName });
      }
      if (lastName !== undefined) {
        operations.push({ op: 'replace', path: '/lastName', value: lastName });
      }
      if (jobTitle !== undefined) {
        operations.push({ op: 'replace', path: '/jobTitle', value: jobTitle });
      }
      if (organization !== undefined) {
        operations.push({ op: 'replace', path: '/organization', value: organization });
      }
      if (location !== undefined) {
        operations.push({ op: 'replace', path: '/location', value: location });
      }
      if (background !== undefined) {
        operations.push({ op: 'replace', path: '/background', value: background });
      }
      if (gender !== undefined) {
        operations.push({ op: 'replace', path: '/gender', value: gender });
      }
      if (age !== undefined) {
        operations.push({ op: 'replace', path: '/age', value: age });
      }

      if (operations.length === 0) {
        throw new HelpScoutError('At least one field must be provided to update');
      }

      await helpScoutApiClient({
        token,
        path: `customers/${customerId}`,
        method: 'PATCH',
        body: operations,
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

export default updateHelpScoutCustomer;
