import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoDealAllowedValues } from '../helpers/get-deal-allowed-values';
import { getBrevoDealAttributeOptionsTypeWithAllowedValues } from '../helpers/get-deal-attributes-allowed-values';
import { getBrevoContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { getBrevoCompanyAllowedValues } from '../helpers/get-company-allowed-values';

const action = 'update_deal';

const options = {
  dealId: {
    type: 'string',
    required: true,
    get_allowed_values: getBrevoDealAllowedValues,
  },
  name: {
    type: 'string',
    required: false,
  },
  attributes: {
    type: 'hash',
    required: false,
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

const updateDeal = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { name, attributes, linkedContactsIds, linkedCompaniesIds } = obj || {};

    const client = createBrevoClient(token);

    try {
      await client.dealsClient.crmDealsIdPatch(dealId, {
        ...(name && { name }),
        ...(attributes && Object.keys(attributes).length > 0 && { attributes }),
        ...(linkedContactsIds?.length && { linkedContactsIds }),
        ...(linkedCompaniesIds?.length && { linkedCompaniesIds }),
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

export default updateDeal;
