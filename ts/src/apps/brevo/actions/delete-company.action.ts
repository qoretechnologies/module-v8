import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BREVO_APP_NAME, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoCompanyAllowedValues } from '../helpers/get-company-allowed-values';

const action = 'delete_company';

const options = {
  companyId: {
    type: 'string',
    required: true,
    get_allowed_values: getBrevoCompanyAllowedValues,
  },
} satisfies TQoreOptions;

const deleteCompany = QoreAppCreator.createLocalizedAction<typeof options>({
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
      await client.companiesClient.companiesIdDelete(companyId);

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

export default deleteCompany;
