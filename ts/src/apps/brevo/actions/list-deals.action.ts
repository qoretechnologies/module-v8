import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreGetDynamicResponseTypeFunction,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { cloneDeep, set } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoDealAttributeOptionsTypeWithoutAllowedValues } from '../helpers/get-deal-attributes-allowed-values';

const action = 'list_deals';

const defaultResponseType = {
  type: 'hash',
  fields: {
    items: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            attributes: {
              type: {
                type: 'hash',
                fields: {},
              },
            },
            linkedContactsIds: {
              type: {
                type: 'list',
                element_type: 'integer',
              },
            },
            linkedCompaniesIds: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
          },
        },
      },
    },
    count: { type: 'number' },
  },
} satisfies TQoreResponseType;

const options = {
  limit: {
    type: 'number',
    required: false,
  },
  offset: {
    type: 'number',
    required: false,
  },
  sort: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'desc', display_name: 'New First' },
      { value: 'asc', display_name: 'Old First' },
    ],
  },
  linkedContactsId: {
    type: 'number',
    get_allowed_values: getBrevoContactAllowedValues,
    required: false,
  },
  linkedCompaniesId: {
    type: 'string',
    get_allowed_values: getBrevoCompanyAllowedValues,
    required: false,
  },
  dealName: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const getDynamicResponseType: TQoreGetDynamicResponseTypeFunction = async (context) => {
  const attributesType = await getBrevoDealAttributeOptionsTypeWithoutAllowedValues(context);

  const responseType = cloneDeep(defaultResponseType);

  set(responseType, 'fields.items.element_type.fields.attributes', {
    type: attributesType,
  });

  return responseType as TQoreResponseType;
};

const listDeals = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const {
      limit = 10,
      offset = 0,
      sort = 'desc',
      linkedContactsId,
      linkedCompaniesId,
      dealName,
    } = obj || {};

    const client = createBrevoClient(token);

    try {
      const response = await client.dealsClient.crmDealsGet(
        dealName,
        linkedCompaniesId,
        linkedContactsId?.toString(),
        offset,
        limit,
        sort as 'desc' | 'asc'
      );

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  get_dynamic_response_type: getDynamicResponseType,
  response_type: defaultResponseType,
});

export default listDeals;
