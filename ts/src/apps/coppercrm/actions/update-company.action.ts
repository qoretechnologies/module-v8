import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import { getCopperCrmCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getCopperCrmContactTypeAllowedValues } from '../helpers/get-contact-type-allowed-values';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  getCopperCrmCustomFieldDynamicTypeFunction,
  mapCopperCrmCustomFieldsObjectToArray,
  mapCopperCrmCustomFieldsResponseArrayToObject,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmPersonAllowedValues } from '../helpers/get-person-allowed-values';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmCompanyResponseType } from '../response-types/company';

const action = 'update_company';

const options = {
  company_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmCompanyAllowedValues,
  },
  name: {
    type: 'string',
  },
  address: {
    type: {
      type: 'hash',
      fields: {
        street: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        postal_code: { type: 'string' },
        country: { type: 'string' },
      },
    },
  },
  assignee_id: {
    type: 'number',
    get_allowed_values: getCopperCrmUserAllowedValues,
  },
  contact_type_id: {
    type: 'number',
    get_allowed_values: getCopperCrmContactTypeAllowedValues,
  },
  details: {
    type: 'string',
  },
  email_domain: {
    type: 'string',
  },
  phone_numbers: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          number: { type: 'string', required: true },
          category: {
            type: 'string',
            default_value: 'work',
            allowed_values: [
              { value: 'work', display_name: 'Work' },
              { value: 'mobile', display_name: 'Mobile' },
              { value: 'home', display_name: 'Home' },
              { value: 'other', display_name: 'Other' },
            ],
          },
        },
      },
    },
  },
  primary_contact_id: {
    type: 'number',
    get_allowed_values: getCopperCrmPersonAllowedValues,
  },
  socials: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          url: { type: 'string', required: true },
          category: {
            type: 'string',
            allowed_values: [
              { value: 'linkedin', display_name: 'LinkedIn' },
              { value: 'twitter', display_name: 'Twitter' },
              { value: 'facebook', display_name: 'Facebook' },
              { value: 'youtube', display_name: 'YouTube' },
              { value: 'quora', display_name: 'Quora' },
              { value: 'instagram', display_name: 'Instagram' },
              { value: 'pinterest', display_name: 'Pinterest' },
              { value: 'other', display_name: 'Other' },
            ],
          },
        },
      },
    },
  },
  tags: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  websites: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          url: { type: 'string', required: true },
          category: {
            type: 'string',
            default_value: 'work',
            allowed_values: [
              { value: 'work', display_name: 'Work' },
              { value: 'personal', display_name: 'Personal' },
              { value: 'other', display_name: 'Other' },
            ],
          },
        },
      },
    },
  },
  custom_fields: {
    type: {
      type: 'hash',
    },
    get_dynamic_type: getCopperCrmCustomFieldDynamicTypeFunction(['company']),
  },
} satisfies TQoreOptions;

type TUpdateCompanyResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_modified: number;
};

const UpdateCompany = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, company_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['company_id'],
      ErrorClass: CopperCrmError,
    });

    const customFields = obj?.custom_fields
      ? mapCopperCrmCustomFieldsObjectToArray(obj.custom_fields)
      : [];

    const baseFields = omit(obj, ['custom_fields', 'company_id']);

    const body = {
      ...baseFields,
      ...(customFields.length && { custom_fields: customFields }),
    };

    try {
      const response = await copperCrmApiClient<TUpdateCompanyResponse>({
        path: `companies/${company_id}`,
        method: 'PUT',
        token,
        body,
      });

      const { custom_fields, ...restResponse } = response;

      const formattedCustomFields = custom_fields
        ? await mapCopperCrmCustomFieldsResponseArrayToObject({
            token,
            customFieldsArray: custom_fields,
          })
        : {};

      return {
        ...restResponse,
        custom_fields: formattedCustomFields,
      };
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: CopperCrmCompanyResponseType,
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['company'])(
      context
    );

    return {
      type: 'hash',
      fields: {
        ...CopperCrmCompanyResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default UpdateCompany;
