import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { fetchHelpScoutPaginatedRecords } from '../helpers/constants';
import { formatHelpScoutResponse } from '../helpers/format-response';
import { getHelpScoutMailboxAllowedValues } from '../helpers/get-mailbox-allowed-values';
import { HelpScoutCustomerResponseType } from '../response-types/customer';

const action = 'list_customers';

export const HelpScoutCustomerSortFieldAllowedValues = [
  { display_name: 'Created At', value: 'createdAt' },
  { display_name: 'First Name', value: 'firstName' },
  { display_name: 'Last Name', value: 'lastName' },
  { display_name: 'Modified At', value: 'modifiedAt' },
];

export const HelpScoutSortOrderAllowedValues = [
  { display_name: 'Descending', value: 'desc' },
  { display_name: 'Ascending', value: 'asc' },
];

const options = {
  mailbox: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutMailboxAllowedValues,
  },
  firstName: {
    type: 'string',
    required: false,
  },
  lastName: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  modifiedSince: {
    type: 'date',
    required: false,
  },
  sortField: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutCustomerSortFieldAllowedValues,
    default_value: 'createdAt',
  },
  sortOrder: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutSortOrderAllowedValues,
    default_value: 'desc',
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: HelpScoutCustomerResponseType,
} satisfies TQoreResponseType;

const listHelpScoutCustomers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const { mailbox, firstName, lastName, email, modifiedSince, sortField, sortOrder, limit } =
      obj || {};

    try {
      const params: Record<string, string> = {};

      if (mailbox) params.mailbox = String(mailbox);
      if (firstName) params.firstName = firstName;
      if (lastName) params.lastName = lastName;
      if (sortField) params.sortField = sortField;
      if (sortOrder) params.sortOrder = sortOrder;

      if (email) {
        params.query = `(email:"${email}")`;
      }

      if (modifiedSince) {
        const dateStr = new Date(modifiedSince).toISOString();
        params.modifiedSince = dateStr;
      }

      const customers = await fetchHelpScoutPaginatedRecords<any, Record<string, any>>({
        token,
        path: 'customers',
        method: 'GET',
        object: 'customers',
        params,
        maxResults: limit || 50,
      });

      return formatHelpScoutResponse(customers);
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listHelpScoutCustomers;
