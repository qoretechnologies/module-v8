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

const defaultPartnerFields = ['id', 'display_name', 'email'];

const options = {
  limit: {
    type: 'integer',
    default_value: 10,
    required: false,
  },
  offset: {
    type: 'integer',
    default_value: 0,
    required: false,
  },
  fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getOdooPartnerFieldsAllowedValues,
    default_value: defaultPartnerFields,
    required: false,
    preselected: true,
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: { type: 'string', required: true },
        direction: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
          default_value: 'asc',
        },
      },
    },
  },
  filter: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          field: {
            type: 'string',
            get_allowed_values: getOdooPartnerFieldsAllowedValues,
            required: true,
          },
          searchType: {
            type: 'string',
            required: true,
            allowed_values: [
              { value: '=', display_name: 'Equals' },
              { value: 'like', display_name: 'Contains' },
            ],
            default_value: '=',
          },
          value: { type: 'string', required: true },
        },
      },
    },
  },
} satisfies TQoreOptions;

const listPartners = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ODOO_APP_NAME,
  action: 'list_partners',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { subdomain, username, password } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const fields = obj?.fields || defaultPartnerFields;
    const sort = obj?.sort;
    const filter = obj?.filter || [];
    const limit = obj?.limit || 10;
    const offset = obj?.offset || 0;

    try {
      const client = await createOdooClient({
        subdomain,
        username,
        password,
      });

      let domain: Array<string[]> = [];
      let order: string | undefined;

      if (filter?.length > 0) {
        domain = filter.map(({ field, value, searchType }) => [field, searchType, value]);
      }

      if (sort?.field) {
        order = `${sort.field} ${sort.direction || 'asc'}`;
      }

      const result = await client.searchRead('res.partner', domain, fields, {
        limit,
        offset,
        ...(order && { order }),
      });

      return result;
    } catch (error) {
      throw new OdooError(`Failed to list partners: ${error}`);
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
      type: 'list',
      element_type: {
        type: 'hash',
        fields: qoreType,
      },
    };
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'number' },
        display_name: { type: 'string' },
        email: { type: 'string' },
      },
    },
  } satisfies TQoreResponseType,
});

export default listPartners;
