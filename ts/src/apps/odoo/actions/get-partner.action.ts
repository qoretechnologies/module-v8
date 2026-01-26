import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { createOdooClient } from '../helpers/constants';
import { getOdooPartnerFieldsAllowedValues } from '../helpers/get-fields-allowed-values';
import { mapOdooFieldsToQoreType } from '../helpers/map-odoo-field-type-to-qore-type';
import { getOdooPartnerAllowedValues } from '../helpers/get-partner-allowed-values';

const defaultPartnerFields = ['id', 'name', 'display_name', 'email', 'phone', 'is_company'];

const options = {
  partner_id: {
    type: 'number',
    required: true,
    get_allowed_values: getOdooPartnerAllowedValues,
  },
  fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getOdooPartnerFieldsAllowedValues,
    default_value: defaultPartnerFields,
    required: false,
  },
} satisfies TQoreOptions;

const getPartner = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ODOO_APP_NAME,
  action: 'get_partner',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { subdomain, username, password, partner_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['partner_id'],
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const fields = obj?.fields || defaultPartnerFields;

    try {
      const client = await createOdooClient({
        subdomain,
        username,
        password,
      });

      const result = await client.read('res.partner', partner_id, fields);

      return result[0];
    } catch (error) {
      throw new OdooError(`Failed to get partner: ${error}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    const { subdomain, username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const fields = context?.opts?.fields || defaultPartnerFields;

    const qoreType = await mapOdooFieldsToQoreType({
      model: 'res.partner',
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
      display_name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      is_company: { type: 'bool' },
    },
  } satisfies TQoreResponseType,
});

export default getPartner;
