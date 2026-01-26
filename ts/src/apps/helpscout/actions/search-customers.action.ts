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
import { HelpScoutCustomerResponseType } from '../response-types/customer';
import { HelpScoutCustomerSortFieldAllowedValues, HelpScoutSortOrderAllowedValues } from './list-customers.action';

const action = 'search_customers';

const options = {
  query: {
    type: 'string',
    required: true,
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

const searchHelpScoutCustomers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, query } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['query'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const { sortField, sortOrder, limit } = obj || {};

    try {
      const params: Record<string, string> = {
        query,
      };

      if (sortField) params.sortField = sortField;
      if (sortOrder) params.sortOrder = sortOrder;

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

export default searchHelpScoutCustomers;
