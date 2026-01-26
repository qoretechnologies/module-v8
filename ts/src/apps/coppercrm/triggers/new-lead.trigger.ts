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
import { CopperCrmLeadResponseType } from '../response-types/lead';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmLeadStatusAllowedValues } from '../helpers/get-lead-status-allowed-values';
import { getCopperCrmCustomerSourceAllowedValues } from '../helpers/get-customer-source-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { getCopperCrmLeadAllowedValues } from '../helpers/get-lead-allowed-values';

const action = 'new_lead';

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
    type: 'bool',
  },
} satisfies TQoreOptions;

const NewLead = QoreAppCreator.createLocalizedTrigger({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    const opts = context.opts || {};

    const getItems = () => {
      return fetchLatestRecords({
        token,
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
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    const records = await fetchLatestRecords({
      token,
      filters: context.opts || {},
    });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Copper Crm New Lead Trigger Event Info',
    type: CopperCrmLeadResponseType,
  },
  get_dynamic_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['lead'])(
      context
    );

    return {
      type: 'hash',
      fields: {
        ...CopperCrmLeadResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default NewLead;

type TFetchRowsOptions = {
  token: string;
  filters?: Record<string, any>;
};

type TRecordsResponse = {
  results: Array<{ custom_fields?: TCopperCrmCustomFieldValue[]; [key: string]: any }>;
};

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<Record<string, any>[]> => {
  const { token, filters } = options;
  const limit = 20;

  try {
    const response = await copperCrmApiClient<TRecordsResponse>({
      path: `leads/search`,
      method: 'POST',
      token,
      body: {
        ...filters,
        page_size: limit,
        page_number: 1,
        sort_by: 'date_created',
        sort_direction: 'desc',
      },
    });

    const formattedLeads = await mapCopperCrmRecordsCustomFieldsResponseArray({
      token,
      records: response.results,
    });

    return formattedLeads;
  } catch (error) {
    throw new CopperCrmError(`Failed to fetch latest leads: ${error.message || error}`);
  }
};
