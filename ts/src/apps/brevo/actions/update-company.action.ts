import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getBrevoCompanyAttributeOptionsTypeWithAllowedValues } from '../helpers/get-company-attributes-allowed-values';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoDealAllowedValues } from '../helpers/get-deal-allowed-values';

const action = 'update_company';

const options = {
  companyId: {
    type: 'string',
    required: true,
    get_allowed_values: getBrevoCompanyAllowedValues,
  },
  name: {
    type: 'string',
    required: false,
  },
  attributes: {
    type: 'hash',
    required: false,
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
      element_type: 'string',
    },
    get_element_allowed_values: getBrevoDealAllowedValues,
    required: false,
  },
} satisfies TQoreOptions;

const updateCompany = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { name, attributes, linkedContactsIds, linkedDeals } = obj || {};

    const client = createBrevoClient(token);

    try {
      await client.companiesClient.companiesIdPatch(companyId, {
        ...(name && { name }),
        ...(attributes && Object.keys(attributes).length > 0 && { attributes }),
        ...(linkedDeals?.length && { linkedDeals }),
        ...(linkedContactsIds?.length && { linkedContactsIds }),
      });

      return { success: true };
    } catch (error) {
      throw new BrevoError(`Failed to ${humanizeNameTitle(action)}: ${extractBrevoError(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
    },
  },
});

export default updateCompany;
