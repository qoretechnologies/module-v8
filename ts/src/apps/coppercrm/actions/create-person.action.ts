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
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import CopperCrmPersonResponseType from '../response-types/person';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';

const action = 'create_person';

const options: TQoreOptions = {
  name: {
    type: 'string',
    required: true,
  },
  prefix: {
    type: 'string',
  },
  first_name: {
    type: 'string',
  },
  middle_name: {
    type: 'string',
  },
  last_name: {
    type: 'string',
  },
  suffix: {
    type: 'string',
  },
  street: {
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
  assignee_id: {
    type: 'number',
    get_allowed_values: getCopperCrmUserAllowedValues,
  },
  company_id: {
    type: 'number',
    get_allowed_values: getCopperCrmCompanyAllowedValues,
  },
  contact_type_id: {
    type: 'number',
    get_allowed_values: getCopperCrmContactTypeAllowedValues,
  },
  details: {
    type: 'string',
  },
  emails: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          email: {
            type: 'string',
            desc: 'Email address',
          },
          category: {
            type: 'string',
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
  phone_numbers: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          number: {
            type: 'string',
            desc: 'Phone number',
          },
          category: {
            type: 'string',
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
  socials: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          url: {
            type: 'string',
            desc: 'Social profile URL',
          },
          category: {
            type: 'string',
            desc: 'Social platform',
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
      element_type: 'string',
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  title: {
    type: 'string',
  },
  websites: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          url: {
            type: 'string',
            desc: 'Website URL',
          },
          category: {
            type: 'string',
            desc: 'Website category',
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
    type: 'hash',
    get_dynamic_type: getCopperCrmCustomFieldDynamicTypeFunction(['person']),
  },
};

type TCreatePersonResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_updated: number;
};

const CreatePerson = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: {
        ...context,
        opts: obj,
      },
      connectionFields: ['token'],
      optionFields: ['name'],
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
      const response = await copperCrmApiClient<TCreatePersonResponse>({
        path: `people`,
        method: 'POST',
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
  response_type: CopperCrmPersonResponseType,
  get_dynamic_response_type: async (context) => {
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

export default CreatePerson;
