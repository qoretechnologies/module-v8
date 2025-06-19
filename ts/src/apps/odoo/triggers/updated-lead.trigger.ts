import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ODOO_APP_NAME, OdooError } from '../constants';
import { fetchLatestOdooLeadsForTriggers } from '../helpers/fetch-latest-leads';
import { getOdooCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getOdooStageIdAllowedValues } from '../helpers/get-stage-allowed-values';
import { getOdooLeadTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getOdooTeamIdAllowedValues } from '../helpers/get-team-allowed-values';
import { getOdooUserIdAllowedValues } from '../helpers/get-user-allowed-values';

const OdooUpdatedLeadTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ODOO_APP_NAME,
  action: 'updated_lead',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    company_id: {
      type: 'integer',
      required: false,
      get_allowed_values: getOdooCompanyAllowedValues,
    },
    team_id: {
      type: 'integer',
      required: false,
      get_allowed_values: getOdooTeamIdAllowedValues,
    },
    user_id: {
      type: 'integer',
      required: false,
      get_allowed_values: getOdooUserIdAllowedValues,
    },
    stage_id: {
      type: 'integer',
      required: false,
      get_allowed_values: getOdooStageIdAllowedValues,
    },
    lead_type: {
      type: 'string',
      required: false,
      allowed_values: [
        { value: 'lead', display_name: 'Lead' },
        { value: 'opportunity', display_name: 'Opportunity' },
        { value: 'both', display_name: 'Both' },
      ],
      default_value: 'both',
    },
    tag_ids: {
      type: {
        type: 'list',
        element_type: 'integer',
      },
      required: false,
      get_element_allowed_values: getOdooLeadTagAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { subdomain, username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    const { company_id, team_id, user_id, stage_id, lead_type, tag_ids } = context?.opts || {};

    const getItems = () => {
      return fetchLatestOdooLeadsForTriggers({
        subdomain,
        username,
        password,
        company_id,
        team_id,
        user_id,
        stage_id,
        lead_type,
        tag_ids,
        type: 'updated_lead',
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'odoo_updated_lead',
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

    const leads = await fetchLatestOdooLeadsForTriggers({
      subdomain,
      username,
      password,
      type: 'updated_lead',
    });

    return leads?.length > 0 ? leads[0] : null;
  },
  event_info: {
    desc: 'Odoo Updated Lead Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'integer' },
        name: { type: 'string' },
        contact_name: { type: 'string' },
        partner_name: { type: 'string' },
        email_from: { type: 'string' },
        phone: { type: 'string' },
        function: { type: 'string' },
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
        user_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        team_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        stage_id: {
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
        partner_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        campaign_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        medium_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        source_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        type: { type: 'string' },
        priority: { type: 'string' },
        probability: { type: 'float' },
        date_deadline: { type: 'string' },
        description: { type: 'string' },
        active: { type: 'boolean' },
        color: { type: 'integer' },
        referred: { type: 'string' },
        email_cc: { type: 'string' },
        activity_summary: { type: 'string' },
        activity_type_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        tag_ids: {
          type: {
            type: 'list',
            element_type: 'integer',
          },
        },
        create_date: { type: 'string' },
        write_date: { type: 'string' },
        message_bounce: { type: 'integer' },
        lost_reason_id: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        lang_code: { type: 'string' },
      },
    },
  },
});

export default OdooUpdatedLeadTrigger;
