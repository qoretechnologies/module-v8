import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { createOdooClient } from '../helpers/constants';
import { getOdooActivityIdAllowedValues } from '../helpers/get-activity-type-allowed-values';
import { getOdooUtmCampaignIdAllowedValues } from '../helpers/get-campaign-allowed-values';
import { getOdooCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getOdooCountryIdAllowedValues } from '../helpers/get-country-allowed-values';
import { getOdooLangIdAllowedValues } from '../helpers/get-lang-allowed-values';
import { getOdooLostReasonIdAllowedValues } from '../helpers/get-lost-reason-allowed-values';
import { getOdooMarketingMediumAllowedValues } from '../helpers/get-marketing-medium-allowed-values';
import { getOdooPartnerAllowedValues } from '../helpers/get-partner-allowed-values';
import { getOdooMarketingSourceAllowedValues } from '../helpers/get-source-allowed-values';
import { getOdooStageIdAllowedValues } from '../helpers/get-stage-allowed-values';
import { getOdooStateIdAllowedValues } from '../helpers/get-state-id-allowed-values';
import { getOdooLeadTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getOdooTeamIdAllowedValues } from '../helpers/get-team-allowed-values';
import { getOdooUserIdAllowedValues } from '../helpers/get-user-allowed-values';

const options = {
  name: {
    type: 'string',
    required: true,
  },
  contact_name: {
    type: 'string',
    required: false,
  },
  partner_name: {
    type: 'string',
    required: false,
  },

  contact_info: {
    type: {
      type: 'hash',
      fields: {
        email_from: {
          type: 'string',
        },
        email_cc: {
          type: 'string',
        },
        phone: {
          type: 'string',
        },
        function: {
          type: 'string',
        },
        website: {
          type: 'string',
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

  sales_info: {
    type: {
      type: 'hash',
      fields: {
        user_id: {
          type: 'integer',
          get_allowed_values: getOdooUserIdAllowedValues,
        },
        team_id: {
          type: 'integer',
          get_allowed_values: getOdooTeamIdAllowedValues,
        },
        stage_id: {
          type: 'integer',
          get_allowed_values: getOdooStageIdAllowedValues,
        },
        priority: {
          type: 'string',
          allowed_values: [
            { value: '0', display_name: 'Low' },
            { value: '1', display_name: 'Medium' },
            { value: '2', display_name: 'High' },
            { value: '3', display_name: 'Very High' },
          ],
          default_value: '1',
        },
        probability: {
          type: 'float',
        },
        date_deadline: {
          type: 'date',
        },
      },
    },
    required: false,
  },

  marketing_info: {
    type: {
      type: 'hash',
      fields: {
        campaign_id: {
          type: 'integer',
          get_allowed_values: getOdooUtmCampaignIdAllowedValues,
        },
        medium_id: {
          type: 'integer',
          get_allowed_values: getOdooMarketingMediumAllowedValues,
        },
        source_id: {
          type: 'integer',
          get_allowed_values: getOdooMarketingSourceAllowedValues,
        },
        referred: {
          type: 'string',
        },
      },
    },
    required: false,
  },

  activity_info: {
    type: {
      type: 'hash',
      fields: {
        activity_summary: {
          type: 'string',
        },
        activity_type_id: {
          type: 'integer',
          get_allowed_values: getOdooActivityIdAllowedValues,
        },
      },
    },
    required: false,
  },

  active: {
    type: 'bool',
    required: false,
    default_value: true,
  },

  description: {
    type: 'string',
    required: false,
  },

  color: {
    type: 'integer',
    required: false,
  },

  tag_ids: {
    type: {
      type: 'list',
      element_type: 'integer',
    },
    get_element_allowed_values: getOdooLeadTagAllowedValues,
    required: false,
  },

  partner_id: {
    type: 'integer',
    get_allowed_values: getOdooPartnerAllowedValues,
    required: false,
  },

  company_id: {
    type: 'integer',
    get_allowed_values: getOdooCompanyAllowedValues,
    required: false,
  },

  type: {
    type: 'string',
    required: false,
    default_value: 'lead',
    allowed_values: [
      { value: 'lead', display_name: 'Lead' },
      { value: 'opportunity', display_name: 'Opportunity' },
    ],
  },

  email_bounce: {
    type: 'integer',
    required: false,
  },

  lost_reason: {
    type: 'integer',
    get_allowed_values: getOdooLostReasonIdAllowedValues,
    required: false,
  },
  lang_code: {
    type: 'string',
    required: false,
    get_allowed_values: getOdooLangIdAllowedValues,
  },
} satisfies TQoreOptions;

const createLead = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ODOO_APP_NAME,
  action: 'create_lead',
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

      const leadData: Record<string, any> = {
        name,
        active: obj?.active ?? true,
        type: obj?.type || 'lead',
      };

      if (obj?.contact_name) leadData.contact_name = obj.contact_name;
      if (obj?.partner_name) leadData.partner_name = obj.partner_name;
      if (obj?.description) leadData.description = obj.description;
      if (obj?.color) leadData.color = obj.color;
      if (obj?.partner_id) leadData.partner_id = obj.partner_id;
      if (obj?.company_id) leadData.company_id = obj.company_id;
      if (obj?.email_bounce) leadData.email_bounce = obj.email_bounce;
      if (obj?.lost_reason) leadData.lost_reason_id = obj.lost_reason;
      if (obj?.tag_ids) leadData.tag_ids = [[6, 0, obj.tag_ids]];
      if (obj?.lang_code) leadData.lang_code = obj.lang_code;

      if (obj?.contact_info) {
        const { email_from, email_cc, phone, function: jobFunction, website } = obj.contact_info;
        if (email_from) leadData.email_from = email_from;
        if (email_cc) leadData.email_cc = email_cc;
        if (phone) leadData.phone = phone;
        if (jobFunction) leadData.function = jobFunction;
        if (website) leadData.website = website;
      }

      if (obj?.address_info) {
        const { street, street2, city, zip, country_id, state_id } = obj.address_info;
        if (street) leadData.street = street;
        if (street2) leadData.street2 = street2;
        if (city) leadData.city = city;
        if (zip) leadData.zip = zip;
        if (country_id) leadData.country_id = country_id;
        if (state_id) leadData.state_id = state_id;
      }

      if (obj?.sales_info) {
        const { user_id, team_id, stage_id, priority, probability, date_deadline } = obj.sales_info;
        if (user_id) leadData.user_id = user_id;
        if (team_id) leadData.team_id = team_id;
        if (stage_id) leadData.stage_id = stage_id;
        if (priority) leadData.priority = priority;
        if (probability) leadData.probability = probability;
        if (date_deadline) leadData.date_deadline = date_deadline;
      }

      if (obj?.marketing_info) {
        const { campaign_id, medium_id, source_id, referred } = obj.marketing_info;
        if (campaign_id) leadData.campaign_id = campaign_id;
        if (medium_id) leadData.medium_id = medium_id;
        if (source_id) leadData.source_id = source_id;
        if (referred) leadData.referred = referred;
      }

      if (obj?.activity_info) {
        const { activity_summary, activity_type_id } = obj.activity_info;
        if (activity_summary) leadData.activity_summary = activity_summary;
        if (activity_type_id) leadData.activity_type_id = activity_type_id;
      }

      const leadId = await client.create('crm.lead', leadData);

      const createdLead = await client.read('crm.lead', leadId, [
        'id',
        'name',
        'contact_name',
        'partner_name',
        'email_from',
        'phone',
        'stage_id',
        'user_id',
        'create_date',
      ]);

      return {
        lead_id: leadId,
        lead_data: createdLead[0],
      };
    } catch (error) {
      throw new OdooError(`Failed to create lead: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      lead_id: {
        type: 'integer',
      },
      lead_data: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'integer' },
            name: { type: 'string' },
            contact_name: { type: 'string' },
            partner_name: { type: 'string' },
            email_from: { type: 'string' },
            phone: { type: 'string' },
            stage_id: { type: 'list' },
            user_id: { type: 'list' },
            create_date: { type: 'string' },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default createLead;
