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
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  getCopperCrmCustomFieldDynamicTypeFunction,
  mapCopperCrmCustomFieldsObjectToArray,
  mapCopperCrmCustomFieldsResponseArrayToObject,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmCustomerSourceAllowedValues } from '../helpers/get-customer-source-allowed-values';
import { getCopperCrmLeadAllowedValues } from '../helpers/get-lead-allowed-values';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmLeadResponseType } from '../response-types/lead';

const action = 'update_lead';

const options = {
  lead_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmLeadAllowedValues,
  },
  first_name: {
    type: 'string',
  },
  last_name: {
    type: 'string',
  },
  middle_name: {
    type: 'string',
  },
  suffix: {
    type: 'string',
  },
  assignee_id: {
    type: 'number',
    get_allowed_values: getCopperCrmUserAllowedValues,
  },
  company_name: {
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
  title: {
    type: 'string',
  },
  details: {
    type: 'string',
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
  email: {
    type: {
      type: 'hash',
      fields: {
        email: { type: 'string', required: true },
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
      required: false,
    },
  },
  phone_numbers: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          number: { type: 'string', required: true },
          category: { type: 'string', default_value: 'mobile' },
        },
      },
    },
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
  customer_source_id: {
    type: 'number',
    get_allowed_values: getCopperCrmCustomerSourceAllowedValues,
  },
  custom_fields: {
    type: {
      type: 'hash',
    },
    get_dynamic_type: getCopperCrmCustomFieldDynamicTypeFunction(['lead']),
  },
} satisfies TQoreOptions;

type TUpdateLeadResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_updated: number;
};

const UpdateLead = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, email, lead_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['email', 'token'],
      optionFields: ['lead_id'],
      ErrorClass: CopperCrmError,
    });

    const customFields = obj?.custom_fields
      ? mapCopperCrmCustomFieldsObjectToArray(obj.custom_fields)
      : [];

    const baseFields = omit(obj, ['custom_fields']);

    const body = {
      ...baseFields,
      ...(customFields.length && { custom_fields: customFields }),
    };

    try {
      const response = await copperCrmApiClient<TUpdateLeadResponse>({
        path: `leads/${lead_id}`,
        method: 'PUT',
        token,
        email,
        body,
      });

      const { custom_fields, ...restResponse } = response;

      const formattedCustomFields = custom_fields
        ? await mapCopperCrmCustomFieldsResponseArrayToObject({
            token,
            email,
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
  response_type: CopperCrmLeadResponseType,
  get_dynamic_response_type: async (context) => {
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

export default UpdateLead;
