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
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmCompanyResponseType } from '../response-types/company';

const action = 'search_companies';

const dateFields = [
  'minimum_created_date',
  'maximum_created_date',
  'minimum_modified_date',
  'maximum_modified_date',
];

const options = {
  ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmCompanyAllowedValues,
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
      { value: 'email_domain', display_name: 'Email Domain' },
      { value: 'assignee', display_name: 'Assignee' },
      { value: 'contact_type', display_name: 'Contact Type' },
      { value: 'inactive_days', display_name: 'Inactive Days' },
      { value: 'interaction_count', display_name: 'Interaction Count' },
      { value: 'date_modified', display_name: 'Date Modified' },
      { value: 'date_created', display_name: 'Date Created' },
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
  contact_type_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmContactTypeAllowedValues,
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
  minimum_interaction_count: {
    type: 'number',
  },
  maximum_interaction_count: {
    type: 'number',
  },
  minimum_inactive_days: {
    type: 'number',
  },
  maximum_inactive_days: {
    type: 'number',
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
} satisfies TQoreOptions;

type TSearchCompaniesResponse = {
  results: {
    id: string;
    [key: string]: any;
    custom_fields?: Array<TCopperCrmCustomFieldValue>;
    date_created: number;
    date_modified: number;
  }[];
};

const SearchCompanies = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['email', 'token'],
      ErrorClass: CopperCrmError,
    });

    const formattedObj = { ...obj } as Record<string, any>;

    dateFields.forEach((field) => {
      const value = formattedObj[field];
      if (value) {
        formattedObj[field] = new Date(value).getTime();
      }
    });

    try {
      const response = await copperCrmApiClient<TSearchCompaniesResponse>({
        path: `companies/search`,
        method: 'POST',
        token,
        email,
        body: formattedObj,
      });

      const results = response.results || [];

      const formattedCompanies = await mapCopperCrmRecordsCustomFieldsResponseArray({
        token,
        email,
        records: results,
      });

      return formattedCompanies;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: CopperCrmCompanyResponseType,
  },
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['company'])(
      context
    );

    return {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ...CopperCrmCompanyResponseType.fields,
          custom_fields: customFields as TQoreAppActionOption,
        },
      },
    };
  },
});

export default SearchCompanies;
