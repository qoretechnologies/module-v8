import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoDealAttributeOptionsTypeWithAllowedValues } from '../helpers/get-deal-attributes-allowed-values';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoCompanyAllowedValues } from '../helpers/get-company-allowed-values';

const action = 'create_deal';

const options = {
  name: {
    type: 'string',
    required: true,
  },
  attributes: {
    type: 'hash',
    preselected: true,
    get_dynamic_type: getBrevoDealAttributeOptionsTypeWithAllowedValues,
  },
  linkedContactsIds: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    get_element_allowed_values: getBrevoContactAllowedValues,
    required: false,
  },
  linkedCompaniesIds: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getBrevoCompanyAllowedValues,
    required: false,
  },
} satisfies TQoreOptions;

const createDeal = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BREVO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const { attributes, linkedContactsIds, linkedCompaniesIds } = obj || {};

    const client = createBrevoClient(token);

    try {
      const response = await client.dealsClient.crmDealsPost({
        name,
        ...(attributes && Object.keys(attributes).length > 0 && { attributes }),
        ...(linkedContactsIds?.length && { linkedContactsIds }),
        ...(linkedCompaniesIds?.length && { linkedCompaniesIds }),
      });

      return response.body;
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
    },
  },
});

export default createDeal;
