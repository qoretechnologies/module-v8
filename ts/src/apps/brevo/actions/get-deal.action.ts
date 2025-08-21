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
import { getBrevoDealAllowedValues } from '../helpers/get-deal-allowed-values';
import { getBrevoDealAttributeOptionsTypeWithoutAllowedValues } from '../helpers/get-deal-attributes-allowed-values';

const action = 'get_deal';

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
    linkedCompaniesIds: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
  },
} satisfies TQoreResponseType;

const options = {
  dealId: {
    type: 'string',
    required: true,
    get_allowed_values: getBrevoDealAllowedValues,
  },
} satisfies TQoreOptions;

const getDeal = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, dealId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['dealId'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const client = createBrevoClient(token);

    try {
      const response = await client.dealsClient.crmDealsIdGet(dealId);

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    const attributes = await getBrevoDealAttributeOptionsTypeWithoutAllowedValues(context);

    const responseType = cloneDeep(response_type);

    set(responseType, 'fields.attributes', attributes);

    return responseType;
  },
  response_type,
});

export default getDeal;
