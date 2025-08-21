import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { cloneDeep, set } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getBrevoCompanyAttributeOptionsTypeWithoutAllowedValues } from '../helpers/get-company-attributes-allowed-values';

const action = 'get_company';

const response_type = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    attributes: {
      type: {
        type: 'hash',
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
} satisfies TQoreResponseType;

const options = {
  companyId: {
    type: 'string',
    required: true,
    get_allowed_values: getBrevoCompanyAllowedValues,
  },
} satisfies TQoreOptions;

const getCompany = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, companyId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['companyId'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const client = createBrevoClient(token);

    try {
      const response = await client.companiesClient.companiesIdGet(companyId);

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    const attributes = await getBrevoCompanyAttributeOptionsTypeWithoutAllowedValues(context);

    const responseType = cloneDeep(response_type);

    set(responseType, 'fields.attributes', attributes);

    return responseType;
  },
  response_type,
});

export default getCompany;
