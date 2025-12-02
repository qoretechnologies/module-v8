import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import { getCopperCrmCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  mapCopperCrmRecordsCustomFieldsResponseArray,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmCustomerSourceAllowedValues } from '../helpers/get-customer-source-allowed-values';
import { getCopperCrmLossReasonAllowedValues } from '../helpers/get-loss-reason-allowed-values';
import { getCopperCrmOpportunityAllowedValues } from '../helpers/get-opportunity-allowed-values';
import { getCopperCrmPersonAllowedValues } from '../helpers/get-person-allowed-values';
import { getCopperCrmPipelineAllowedValues } from '../helpers/get-pipeline-allowed-values';
import { getCopperCrmPipelineStageAllowedValues } from '../helpers/get-pipeline-stage-allowed-values';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmOpportunityResponseType } from '../response-types/opportunity';

const action = 'search_opportunities';

const dateFields = [
  'minimum_close_date',
  'maximum_close_date',
  'minimum_created_date',
  'maximum_created_date',
  'minimum_modified_date',
  'maximum_modified_date',
  'minimum_stage_change_date',
  'maximum_stage_change_date',
];

const options = {
  ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmOpportunityAllowedValues,
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
    allowed_values: [
      { value: 'name', display_name: 'Name' },
      { value: 'assignee', display_name: 'Assignee' },
      { value: 'company_name', display_name: 'Company Name' },
      { value: 'customer_source', display_name: 'Customer Source' },
      { value: 'monetary_value', display_name: 'Monetary Value' },
      { value: 'primary_contact', display_name: 'Primary Contact' },
      { value: 'priority', display_name: 'Priority' },
      { value: 'status', display_name: 'Status' },
      { value: 'win_probability', display_name: 'Win Probability' },
      { value: 'date_created', display_name: 'Date Created' },
      { value: 'date_modified', display_name: 'Date Modified' },
      { value: 'date_last_contacted', display_name: 'Date Last Contacted' },
      { value: 'close_date', display_name: 'Close Date' },
    ],
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
  assignee_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmUserAllowedValues,
  },
  company_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmCompanyAllowedValues,
  },
  customer_source_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmCustomerSourceAllowedValues,
  },
  loss_reason_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmLossReasonAllowedValues,
  },
  pipeline_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmPipelineAllowedValues,
  },
  pipeline_stage_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmPipelineStageAllowedValues,
    element_allowed_values_creatable: true,
  },
  primary_contact_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmPersonAllowedValues,
  },
  priorities: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    allowed_values: [
      { value: 'None', display_name: 'None' },
      { value: 'Low', display_name: 'Low' },
      { value: 'Medium', display_name: 'Medium' },
      { value: 'High', display_name: 'High' },
    ],
  },
  statuses: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    allowed_values: [
      { value: 'Open', display_name: 'Open' },
      { value: 'Won', display_name: 'Won' },
      { value: 'Lost', display_name: 'Lost' },
      { value: 'Abandoned', display_name: 'Abandoned' },
    ],
  },
  tags: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  followed: {
    type: 'number',
    allowed_values: [
      { value: 1, display_name: 'Followed' },
      { value: 0, display_name: 'Not Followed' },
    ],
  },
  minimum_monetary_value: {
    type: 'number',
  },
  maximum_monetary_value: {
    type: 'number',
  },
  minimum_win_probability: {
    type: 'number',
  },
  maximum_win_probability: {
    type: 'number',
  },
  minimum_interaction_count: {
    type: 'number',
  },
  maximum_interaction_count: {
    type: 'number',
  },
  minimum_close_date: {
    type: 'date',
  },
  maximum_close_date: {
    type: 'date',
  },
  minimum_created_date: {
    type: 'date',
  },
  maximum_created_date: {
    type: 'date',
  },
  minimum_modified_date: {
    type: 'date',
  },
  maximum_modified_date: {
    type: 'date',
  },
  minimum_stage_change_date: {
    type: 'date',
  },
  maximum_stage_change_date: {
    type: 'date',
  },
} satisfies TQoreOptions;

type TSearchOpportunitiesResponse = {
  results: {
    id: string;
    [key: string]: any;
    custom_fields?: Array<TCopperCrmCustomFieldValue>;
    date_created: number;
    date_modified: number;
  }[];
};
const SearchOpportunities = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const formattedObj = { ...obj } as Record<string, any>;

      dateFields.forEach((field) => {
        const value = formattedObj[field];
        if (value) {
          formattedObj[field] = new Date(value).getTime();
        }
      });

      const response = await copperCrmApiClient<TSearchOpportunitiesResponse>({
        path: `opportunities/search`,
        method: 'POST',
        token,
        body: formattedObj,
      });

      const results = response.results || [];

      const formattedOpportunities = await mapCopperCrmRecordsCustomFieldsResponseArray({
        token,
        records: results,
      });

      return formattedOpportunities;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: CopperCrmOpportunityResponseType,
  },
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['opportunity'])(
      context
    );

    return {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ...CopperCrmOpportunityResponseType.fields,
          custom_fields: customFields as TQoreAppActionOption,
        },
      },
    };
  },
});

export default SearchOpportunities;
