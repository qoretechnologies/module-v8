import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  mapCopperCrmRecordsCustomFieldsResponseArray,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { CopperCrmOpportunityResponseType } from '../response-types/opportunity';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { getCopperCrmOpportunityAllowedValues } from '../helpers/get-opportunity-allowed-values';
import { getCopperCrmCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getCopperCrmCustomerSourceAllowedValues } from '../helpers/get-customer-source-allowed-values';
import { getCopperCrmLossReasonAllowedValues } from '../helpers/get-loss-reason-allowed-values';
import { getCopperCrmPipelineAllowedValues } from '../helpers/get-pipeline-allowed-values';
import { getCopperCrmPipelineStageAllowedValues } from '../helpers/get-pipeline-stage-allowed-values';
import { getCopperCrmPersonAllowedValues } from '../helpers/get-person-allowed-values';

const action = 'new_opportunity';

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
} satisfies TQoreOptions;

const NewOpportunity = QoreAppCreator.createLocalizedTrigger({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, email } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'email'],
      ErrorClass: CopperCrmError,
    });

    const opts = context.opts || {};

    const getItems = () => {
      return fetchLatestRecords({
        token,
        email,
        filters: opts,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `coppercrm_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, email } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'email'],
      ErrorClass: CopperCrmError,
    });

    const records = await fetchLatestRecords({
      token,
      email,
      filters: context.opts || {},
    });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Copper CRM New Opportunity Trigger Event Info',
    type: CopperCrmOpportunityResponseType,
  },
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['opportunity'])(
      context
    );

    return {
      type: 'hash',
      fields: {
        ...CopperCrmOpportunityResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default NewOpportunity;

type TFetchRowsOptions = {
  token: string;
  email: string;
  filters?: Record<string, any>;
};

type TRecordsResponse = {
  results: Array<{ custom_fields?: TCopperCrmCustomFieldValue[]; [key: string]: any }>;
};

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<Record<string, any>[]> => {
  const { token, email, filters } = options;
  const limit = 20;

  try {
    const response = await copperCrmApiClient<TRecordsResponse>({
      path: `opportunities/search`,
      method: 'POST',
      token,
      email,
      body: {
        ...filters,
        page_size: limit,
        page_number: 1,
        sort_by: 'date_created',
        sort_direction: 'desc',
      },
    });

    const formattedOpportunities = await mapCopperCrmRecordsCustomFieldsResponseArray({
      token,
      email,
      records: response.results,
    });

    return formattedOpportunities;
  } catch (error) {
    throw new CopperCrmError(`Failed to fetch latest opportunities: ${error.message || error}`);
  }
};
