import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { createOdooClient } from '../helpers/constants';
import { getOdooCountryIdAllowedValues } from '../helpers/get-country-allowed-values';
import { getOdooPartnerAllowedValues } from '../helpers/get-partner-allowed-values';
import { getOdooLangIdAllowedValues } from '../helpers/get-lang-allowed-values';
import { getOdooUserIdAllowedValues } from '../helpers/get-user-allowed-values';
import { getOdooStateIdAllowedValues } from '../helpers/get-state-id-allowed-values';
import { getOdooIndustryAllowedValues } from '../helpers/get-industry-allowed-values';
import { getOdooPartnerCategoryAllowedValues } from '../helpers/get-partner-category-allowed-values';

const options = {
  name: {
    type: 'string',
    required: true,
  },
  is_company: {
    type: 'boolean',
    required: false,
    default_value: false,
  },

  contact_info: {
    type: {
      type: 'hash',
      fields: {
        email: {
          type: 'string',
        },
        phone: {
          type: 'string',
        },
        website: {
          type: 'string',
        },
        function: {
          type: 'string',
        },
        title: {
          type: 'string',
          allowed_values: [
            { value: 'mr', display_name: 'Mr.' },
            { value: 'mrs', display_name: 'Mrs.' },
            { value: 'ms', display_name: 'Ms.' },
            { value: 'dr', display_name: 'Dr.' },
            { value: 'prof', display_name: 'Prof.' },
          ],
        },
      },
    },
    required: false,
  },

  address_info: {
    type: {
      type: 'hash',
      fields: {
        street: {
          type: 'string',
        },
        street2: {
          type: 'string',
        },
        city: {
          type: 'string',
        },
        zip: {
          type: 'string',
        },
        country_id: {
          type: 'integer',
          get_allowed_values: getOdooCountryIdAllowedValues,
          on_change: ['refetch'],
        },
        state_id: {
          type: 'integer',
          get_allowed_values: getOdooStateIdAllowedValues,
        },
      },
    },
    required: false,
  },

  business_info: {
    type: {
      type: 'hash',
      fields: {
        vat: {
          type: 'string',
        },
        ref: {
          type: 'string',
        },
        industry_id: {
          type: 'integer',
          get_allowed_values: getOdooIndustryAllowedValues,
        },
      },
    },
    required: false,
  },

  relationship_info: {
    type: {
      type: 'hash',
      fields: {
        parent_id: {
          type: 'integer',
          get_allowed_values: getOdooPartnerAllowedValues,
        },
        user_id: {
          type: 'integer',
          get_allowed_values: getOdooUserIdAllowedValues,
        },
      },
    },
    required: false,
  },

  category_ids: {
    type: {
      type: 'list',
      element_type: 'integer',
    },
    get_element_allowed_values: getOdooPartnerCategoryAllowedValues,
    required: false,
  },

  active: {
    type: 'boolean',
    required: false,
    default_value: true,
  },

  comment: {
    type: 'string',
    required: false,
  },

  lang: {
    type: 'string',
    required: false,
    get_allowed_values: getOdooLangIdAllowedValues,
  },

  tz: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'UTC', display_name: 'UTC' },
      { value: 'US/Eastern', display_name: 'US/Eastern' },
      { value: 'US/Central', display_name: 'US/Central' },
      { value: 'US/Mountain', display_name: 'US/Mountain' },
      { value: 'US/Pacific', display_name: 'US/Pacific' },
      { value: 'Europe/London', display_name: 'Europe/London' },
      { value: 'Europe/Paris', display_name: 'Europe/Paris' },
      { value: 'Europe/Berlin', display_name: 'Europe/Berlin' },
      { value: 'Asia/Tokyo', display_name: 'Asia/Tokyo' },
      { value: 'Asia/Shanghai', display_name: 'Asia/Shanghai' },
      { value: 'Australia/Sydney', display_name: 'Australia/Sydney' },
    ],
  },

  image_1920: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createPartner = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ODOO_APP_NAME,
  action: 'create_partner',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { subdomain, username, password, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    try {
      const client = await createOdooClient({
        subdomain,
        username,
        password,
      });

      const partnerData: Record<string, any> = {
        name,
        is_company: obj?.is_company ?? false,
        active: obj?.active ?? true,
      };

      if (obj?.comment) partnerData.comment = obj.comment;
      if (obj?.lang) partnerData.lang = obj.lang;
      if (obj?.tz) partnerData.tz = obj.tz;
      if (obj?.image_1920) partnerData.image_1920 = obj.image_1920;
      if (obj?.category_ids) partnerData.category_id = [[6, 0, obj.category_ids]];

      if (obj?.contact_info) {
        const { email, phone, website, function: jobFunction, title } = obj.contact_info;
        if (email) partnerData.email = email;
        if (phone) partnerData.phone = phone;
        if (website) partnerData.website = website;
        if (jobFunction) partnerData.function = jobFunction;
        if (title) partnerData.title = title;
      }

      if (obj?.address_info) {
        const { street, street2, city, zip, country_id, state_id } = obj.address_info;
        if (street) partnerData.street = street;
        if (street2) partnerData.street2 = street2;
        if (city) partnerData.city = city;
        if (zip) partnerData.zip = zip;
        if (country_id) partnerData.country_id = country_id;
        if (state_id) partnerData.state_id = state_id;
      }

      if (obj?.business_info) {
        const { vat, ref, industry_id } = obj.business_info;
        if (vat) partnerData.vat = vat;
        if (ref) partnerData.ref = ref;
        if (industry_id) partnerData.industry_id = industry_id;
      }

      if (obj?.relationship_info) {
        const { parent_id, user_id } = obj.relationship_info;
        if (parent_id) partnerData.parent_id = parent_id;
        if (user_id) partnerData.user_id = user_id;
      }

      const partnerId = await client.create('res.partner', partnerData);

      const createdPartner = await client.read('res.partner', partnerId, [
        'id',
        'name',
        'display_name',
        'email',
        'phone',
        'is_company',
        'create_date',
        'country_id',
        'state_id',
        'parent_id',
      ]);

      return {
        partner_id: partnerId,
        partner_data: createdPartner[0],
      };
    } catch (error) {
      throw new OdooError(`Failed to create partner: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      partner_id: {
        type: 'integer',
      },
      partner_data: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'integer' },
            name: { type: 'string' },
            display_name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            is_company: { type: 'boolean' },
            create_date: { type: 'string' },
            country_id: { type: 'list' },
            state_id: { type: 'list' },
            parent_id: { type: 'list' },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default createPartner;
