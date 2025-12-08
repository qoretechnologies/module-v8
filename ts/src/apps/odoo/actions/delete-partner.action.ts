import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { createOdooClient } from '../helpers/constants';
import { getOdooPartnerAllowedValues } from '../helpers/get-partner-allowed-values';

const options = {
  partner_id: {
    type: 'number',
    required: true,
    get_allowed_values: getOdooPartnerAllowedValues,
  },
} satisfies TQoreOptions;

const deletePartner = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ODOO_APP_NAME,
  action: 'delete_partner',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { subdomain, username, password, partner_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['partner_id'],
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    try {
      const client = await createOdooClient({
        subdomain,
        username,
        password,
      });

      const result = await client.delete('res.partner', partner_id);

      return {
        success: result,
        partner_id,
      };
    } catch (error) {
      throw new OdooError(`Failed to delete partner: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      partner_id: { type: 'number' },
    },
  } satisfies TQoreResponseType,
});

export default deletePartner;
