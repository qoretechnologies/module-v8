import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  mapCopperCrmRecordsCustomFieldsResponseArray,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmCustomerSourceAllowedValues } from '../helpers/get-customer-source-allowed-values';
import { getCopperCrmLeadAllowedValues } from '../helpers/get-lead-allowed-values';
import { getCopperCrmLeadStatusAllowedValues } from '../helpers/get-lead-status-allowed-values';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmLeadResponseType } from '../response-types/lead';

const action = 'search_leads';

const options = {
  ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmLeadAllowedValues,
  },
  page_number: {
    type: 'number',
    preselected: true,
  },
  page_size: {
    type: 'number',
    preselected: true,
  },
  sort_by: {
    type: 'string',
    preselected: true,
  },
  sort_direction: {
    type: 'string',
    preselected: true,
    allowed_values: [
      { value: 'asc', display_name: 'Ascending' },
      { value: 'desc', display_name: 'Descending' },
    ],
  },
  name: {
    type: 'string',
  },
  phone_number: {
    type: 'string',
  },
  emails: {
    type: 'string',
  },
  assignee_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmUserAllowedValues,
  },
  status_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmLeadStatusAllowedValues,
  },
  customer_source_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmCustomerSourceAllowedValues,
  },
  city: {
    type: 'string',
  },
  state: {
    type: 'string',
  },
  postal_code: {
    type: 'string',
  },
  country: {
    type: 'string',
  },
  tags: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  socials: {
    type: 'string',
  },
  followed: {
    type: 'number',
    allowed_values: [
      { value: 1, display_name: 'Followed' },
      { value: 0, display_name: 'Not Followed' },
    ],
  },
  age: {
    type: 'number',
  },
  minimum_monetary_value: {
    type: 'number',
  },
  maximum_monetary_value: {
    type: 'number',
  },
  minimum_interaction_count: {
    type: 'number',
  },
  maximum_interaction_count: {
    type: 'number',
  },
  include_converted_leads: {
    type: 'boolean',
  },
} satisfies TQoreOptions;

type TSearchLeadsResponse = {
  results: {
    id: string;
    [key: string]: any;
    custom_fields?: Array<TCopperCrmCustomFieldValue>;
    date_created: number;
    date_updated: number;
  }[];
  total_results: number;
};

const SearchLeads = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TSearchLeadsResponse>({
        path: `leads/search`,
        method: 'POST',
        token,
        body: obj,
      });

      const formattedLeads = await mapCopperCrmRecordsCustomFieldsResponseArray({
        token,
        records: response.results,
      });

      return formattedLeads;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: CopperCrmLeadResponseType,
  },
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['lead'])(
      context
    );

    return {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ...CopperCrmLeadResponseType.fields,
          custom_fields: customFields as TQoreAppActionOption,
        },
      },
    };
  },
});

export default SearchLeads;
