import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoCompanyAttributeOptionsTypeWithAllowedValues } from '../helpers/get-company-attributes-allowed-values';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoDealAllowedValues } from '../helpers/get-deal-allowed-values';

const action = 'create_company';

const options = {
  name: {
    type: 'string',
    required: true,
  },
  attributes: {
    type: 'hash',
    preselected: true,
    get_dynamic_type: getBrevoCompanyAttributeOptionsTypeWithAllowedValues,
  },
  linkedContactsIds: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    get_element_allowed_values: getBrevoContactAllowedValues,
    required: false,
  },
  linkedDeals: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    get_element_allowed_values: getBrevoDealAllowedValues,
    required: false,
  },
} satisfies TQoreOptions;

const createCompany = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { attributes, linkedContactsIds, linkedDeals } = obj || {};

    const client = createBrevoClient(token);

    try {
      const response = await client.companiesClient.companiesPost({
        name,
        ...(attributes && Object.keys(attributes).length > 0 && { attributes }),
        ...(linkedDeals?.length && { linkedDeals }),
        ...(linkedContactsIds?.length && { linkedContactsIds }),
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

export default createCompany;
