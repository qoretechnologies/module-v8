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
import { getCopperCrmContactTypeAllowedValues } from '../helpers/get-contact-type-allowed-values';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  mapCopperCrmRecordsCustomFieldsResponseArray,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmPersonAllowedValues } from '../helpers/get-person-allowed-values';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import CopperCrmPersonResponseType from '../response-types/person';

const action = 'search_people';

const options: TQoreOptions = {
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
  minimum_created_date: {
    type: 'integer',
  },
  maximum_created_date: {
    type: 'integer',
  },
  minimum_modified_date: {
    type: 'integer',
  },
  maximum_modified_date: {
    type: 'integer',
  },
  sort_by: {
    type: 'string',
    desc: 'Field to sort results by',
    allowed_values: [
      { value: 'name', display_name: 'Name' },
      { value: 'title', display_name: 'Title' },
      { value: 'email', display_name: 'Email' },
      { value: 'phone', display_name: 'Phone' },
      { value: 'city', display_name: 'City' },
      { value: 'state', display_name: 'State' },
      { value: 'country', display_name: 'Country' },
      { value: 'zip', display_name: 'Postal Code' },
      { value: 'socials', display_name: 'Socials' },
      { value: 'date_created', display_name: 'Date Created' },
      { value: 'date_modified', display_name: 'Date Modified' },
    ],
  },
  sort_direction: {
    type: 'string',
    allowed_values: [
      { value: 'asc', display_name: 'Ascending' },
      { value: 'desc', display_name: 'Descending' },
    ],
  },
  page_number: {
    type: 'integer',
  },
  page_size: {
    type: 'integer',
  },
};

type TSearchPeopleResponse = {
  results: {
    id: string;
    [key: string]: any;
    custom_fields?: Array<TCopperCrmCustomFieldValue>;
    date_created: number;
    date_modified: number;
  }[];
};

const SearchPeople = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await copperCrmApiClient<TSearchPeopleResponse>({
        path: `people/search`,
        method: 'POST',
        token,
        body: obj,
      });

      const results = response.results || [];

      const formattedPeople = await mapCopperCrmRecordsCustomFieldsResponseArray({
        token,
        records: results,
      });

      return formattedPeople;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: CopperCrmPersonResponseType,
  },
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['person'])(
      context
    );

    return {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ...CopperCrmPersonResponseType.fields,
          custom_fields: customFields as TQoreAppActionOption,
        },
      },
    };
  },
});

export default SearchPeople;
