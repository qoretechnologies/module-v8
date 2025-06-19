import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { createOdooClient } from '../helpers/constants';

const OdooNewPartnerTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ODOO_APP_NAME,
  action: 'new_partner',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { subdomain, username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const getItems = () => {
      return fetchLatestPartners({
        subdomain,
        username,
        password,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'odoo_new_partner',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { subdomain, username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const partners = await fetchLatestPartners({
      subdomain,
      username,
      password,
    });

    return partners?.length > 0 ? partners[0] : null;
  },
  event_info: {
    desc: 'Odoo New Partner Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'integer' },
        name: { type: 'string' },
        display_name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        website: { type: 'string' },
        street: { type: 'string' },
        street2: { type: 'string' },
        city: { type: 'string' },
        zip: { type: 'string' },
        country_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        state_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        company_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        parent_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        category_id: {
          type: {
            type: 'list',
            element_type: 'integer',
          },
        },
        is_company: { type: 'boolean' },
        function: { type: 'string' },
        lang: { type: 'string' },
        tz: { type: 'string' },
        vat: { type: 'string' },
        ref: { type: 'string' },
        industry_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        comment: { type: 'string' },
        active: { type: 'boolean' },
        employee: { type: 'boolean' },
        create_date: { type: 'string' },
        write_date: { type: 'string' },
      },
    },
  },
});

export default OdooNewPartnerTrigger;

const fetchLatestPartners = async (options: {
  subdomain: string;
  username: string;
  password: string;
}) => {
  const { subdomain, username, password } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = await createOdooClient({ subdomain, username, password });

    const fields = [
      'id',
      'name',
      'display_name',
      'email',
      'phone',
      'website',
      'street',
      'street2',
      'city',
      'zip',
      'country_id',
      'state_id',
      'company_id',
      'parent_id',
      'category_id',
      'is_company',
      'function',
      'lang',
      'tz',
      'vat',
      'ref',
      'industry_id',
      'comment',
      'active',
      'employee',
      'create_date',
      'write_date',
    ];

    const partners = await client.searchRead('res.partner', [], fields, {
      limit,
      order: 'create_date desc',
    });

    const transformedPartners = partners.map((partner: any) => {
      const transformed = { ...partner };

      const referenceFields = ['country_id', 'state_id', 'company_id', 'parent_id', 'industry_id'];

      referenceFields.forEach((field) => {
        if (transformed[field] && Array.isArray(transformed[field])) {
          transformed[field] = {
            id: transformed[field][0],
            name: transformed[field][1],
          };
        } else if (transformed[field] === false) {
          transformed[field] = null;
        }
      });

      return transformed;
    });

    return transformedPartners;
  } catch (error) {
    throw new OdooError(`Failed to fetch latest partners: ${error.message || error}`);
  }
};
