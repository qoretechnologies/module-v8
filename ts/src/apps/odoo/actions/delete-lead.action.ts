import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { createOdooClient } from '../helpers/constants';
import { getOdooLeadIdAllowedValues } from '../helpers/get-lead-allowed-values';

const options = {
  lead_id: {
    type: 'number',
    required: true,
    get_allowed_values: getOdooLeadIdAllowedValues,
  },
} satisfies TQoreOptions;

const deleteLead = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ODOO_APP_NAME,
  action: 'delete_lead',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { subdomain, username, password, lead_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['lead_id'],
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    try {
      const client = await createOdooClient({
        subdomain,
        username,
        password,
      });

      const result = await client.delete('crm.lead', lead_id);

      return {
        success: result,
        lead_id,
      };
    } catch (error) {
      throw new OdooError(`Failed to delete lead: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      lead_id: { type: 'number' },
    },
  } satisfies TQoreResponseType,
});

export default deleteLead;
