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
import {
  BrevoCompanyFilterOption,
  getBrevoCompanyAttributeOptionsTypeWithoutAllowedValues,
  getBrevoCompanyAttributesAllowedValues,
} from '../helpers/get-company-attributes-allowed-values';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoDealAllowedValues } from '../helpers/get-deal-allowed-values';

const action = 'list_companies';

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
            linkedDealsIds: {
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
  page: {
    type: 'number',
    required: false,
  },
  sort: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'desc', display_name: 'Ascending' },
      { value: 'asc', display_name: 'Descending' },
    ],
  },
  sortBy: {
    type: 'string',
    required: false,
    get_allowed_values: getBrevoCompanyAttributesAllowedValues,
  },
  linkedContactsId: {
    type: 'number',
    get_allowed_values: getBrevoContactAllowedValues,
    required: false,
  },
  linkedDealsId: {
    type: 'string',
    get_allowed_values: getBrevoDealAllowedValues,
    required: false,
  },
  filter: BrevoCompanyFilterOption,
} satisfies TQoreOptions;

const getDynamicResponseType: TQoreGetDynamicResponseTypeFunction = async (context) => {
  const attributesType = await getBrevoCompanyAttributeOptionsTypeWithoutAllowedValues(context);

  const responseType = cloneDeep(defaultResponseType);

  set(responseType, 'fields.items.element_type.fields.attributes', {
    type: attributesType,
  });

  return responseType as TQoreResponseType;
};

const listCompanies = QoreAppCreator.createLocalizedAction<typeof options>({
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
      page = 1,
      sort = 'desc',
      linkedContactsId,
      linkedDealsId,
      filter,
      sortBy = 'created_at',
    } = obj || {};

    let filterString: string | undefined = undefined;

    if (filter) {
      filterString = `{"attributes.${filter.field}":"${filter.value}"}`;
    }

    const client = createBrevoClient(token);

    try {
      const response = await client.companiesClient.companiesGet(
        filterString,
        linkedContactsId,
        linkedDealsId,
        page,
        limit,
        sort as 'desc' | 'asc',
        `attributes.${sortBy}`
      );

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  get_dynamic_response_type: getDynamicResponseType,
  response_type: defaultResponseType,
});

export default listCompanies;
