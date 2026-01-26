import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { createOdooClient } from '../helpers/constants';
import { getOdooLeadFieldsAllowedValues } from '../helpers/get-fields-allowed-values';
import { mapOdooFieldsToQoreType } from '../helpers/map-odoo-field-type-to-qore-type';
import { getOdooLeadIdAllowedValues } from '../helpers/get-lead-allowed-values';

const defaultLeadFields = ['id', 'name', 'email_from', 'contact_name', 'partner_name'];

const options = {
  lead_id: {
    type: 'number',
    required: true,
    get_allowed_values: getOdooLeadIdAllowedValues,
  },
  fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getOdooLeadFieldsAllowedValues,
    default_value: defaultLeadFields,
    required: false,
  },
} satisfies TQoreOptions;

const getLead = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ODOO_APP_NAME,
  action: 'get_lead',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { subdomain, username, password, lead_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['lead_id'],
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const fields = obj?.fields || defaultLeadFields;

    try {
      const client = await createOdooClient({
        subdomain,
        username,
        password,
      });

      const result = await client.read('crm.lead', lead_id, fields);

      return result[0];
    } catch (error) {
      throw new OdooError(`Failed to get lead: ${error}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    const { subdomain, username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const fields = context?.opts?.fields || defaultLeadFields;

    const qoreType = await mapOdooFieldsToQoreType({
      model: 'crm.lead',
      fields,
      subdomain,
      username,
      password,
    });

    return {
      type: 'hash',
      fields: qoreType,
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'number' },
      name: { type: 'string' },
      email_from: { type: 'string' },
      contact_name: { type: 'string' },
      partner_name: { type: 'string' },
    },
  } satisfies TQoreResponseType,
});

export default getLead;
