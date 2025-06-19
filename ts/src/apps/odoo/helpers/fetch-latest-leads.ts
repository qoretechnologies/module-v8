import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { OdooError } from '../constants';
import { createOdooClient } from './constants';

const LeadFields = [
  'id',
  'name',
  'contact_name',
  'partner_name',
  'email_from',
  'phone',
  'function',
  'website',
  'street',
  'street2',
  'city',
  'zip',
  'country_id',
  'state_id',
  'user_id',
  'team_id',
  'stage_id',
  'company_id',
  'partner_id',
  'campaign_id',
  'medium_id',
  'source_id',
  'type',
  'priority',
  'probability',
  'date_deadline',
  'description',
  'active',
  'color',
  'referred',
  'email_cc',
  'activity_summary',
  'activity_type_id',
  'tag_ids',
  'create_date',
  'write_date',
  'message_bounce',
  'lost_reason_id',
  'lang_code',
];

export const fetchLatestOdooLeadsForTriggers = async (options: {
  subdomain: string;
  username: string;
  password: string;
  company_id?: number;
  team_id?: number;
  user_id?: number;
  stage_id?: number;
  lead_type?: string;
  tag_ids?: number[];
  type: 'new_lead' | 'updated_lead';
}) => {
  const {
    subdomain,
    username,
    password,
    company_id,
    team_id,
    user_id,
    stage_id,
    lead_type,
    type,
    tag_ids,
  } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = await createOdooClient({
      subdomain,
      username,
      password,
    });

    const domain: Record<string, any> = {
      active: true,
      ...(company_id && { company_id }),
      ...(team_id && { team_id }),
      ...(user_id && { user_id }),
      ...(stage_id && { stage_id }),
      ...(lead_type && lead_type !== 'both' && { type: lead_type }),
      ...(tag_ids && tag_ids.length > 0 && { tag_ids }),
    };

    const leads = await client.searchRead('crm.lead', domain, LeadFields, {
      limit,
      order: type === 'new_lead' ? 'create_date desc' : 'write_date desc',
    });

    if (leads.length === 0) {
      return [];
    }

    return leads.map((lead: any) => {
      const transformedLead = { ...lead };

      const many2oneFields = [
        'country_id',
        'state_id',
        'user_id',
        'team_id',
        'stage_id',
        'company_id',
        'partner_id',
        'campaign_id',
        'medium_id',
        'source_id',
        'activity_type_id',
        'lost_reason_id',
      ];

      many2oneFields.forEach((field) => {
        if (transformedLead[field] && typeof transformedLead[field] === 'number') {
          transformedLead[field] = {
            id: transformedLead[field],
            name: '',
          };
        } else if (transformedLead[field] && Array.isArray(transformedLead[field])) {
          transformedLead[field] = {
            id: transformedLead[field]?.[0],
            name: transformedLead[field]?.[1] || '',
          };
        }
      });

      return transformedLead;
    });
  } catch (error) {
    throw new OdooError(`Failed to fetch latest leads: ${error.message || error}`);
  }
};
