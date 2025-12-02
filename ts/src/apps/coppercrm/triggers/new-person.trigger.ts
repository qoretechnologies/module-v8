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
import CopperCrmPersonResponseType from '../response-types/person';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { getCopperCrmPersonAllowedValues } from '../helpers/get-person-allowed-values';
import { getCopperCrmCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getCopperCrmContactTypeAllowedValues } from '../helpers/get-contact-type-allowed-values';

const action = 'new_person';

const options = {
  ids: {
    type: {
      type: 'list',
      element_type: 'integer',
    },
    get_element_allowed_values: getCopperCrmPersonAllowedValues,
  },
  name: {
    type: 'string',
  },
  title: {
    type: 'string',
  },
  email: {
    type: 'string',
  },
  phone: {
    type: 'string',
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
  assignee_ids: {
    type: {
      type: 'list',
      element_type: {
        type: 'number',
      },
    },
    get_element_allowed_values: getCopperCrmUserAllowedValues,
  },
  contact_type_ids: {
    type: {
      type: 'list',
      element_type: {
        type: 'number',
      },
    },
    get_element_allowed_values: getCopperCrmContactTypeAllowedValues,
  },
  company_ids: {
    type: {
      type: 'list',
      element_type: {
        type: 'number',
      },
    },
    get_element_allowed_values: getCopperCrmCompanyAllowedValues,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  socials: {
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  minimum_interaction_count: {
    type: 'integer',
  },
  maximum_interaction_count: {
    type: 'integer',
  },
  page_number: {
    type: 'integer',
    preselected: true,
  },
  page_size: {
    type: 'integer',
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
} satisfies TQoreOptions;

const NewPerson = QoreAppCreator.createLocalizedTrigger({
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
    desc: 'Copper CRM New Person Trigger Event Info',
    type: CopperCrmPersonResponseType,
  },
  get_dynamic_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['person'])(
      context
    );

    return {
      type: 'hash',
      fields: {
        ...CopperCrmPersonResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default NewPerson;

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
      path: `people/search`,
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

    const formattedPeople = await mapCopperCrmRecordsCustomFieldsResponseArray({
      token,
      records: response.results,
    });

    return formattedPeople;
  } catch (error) {
    throw new CopperCrmError(`Failed to fetch latest people: ${error.message || error}`);
  }
};
