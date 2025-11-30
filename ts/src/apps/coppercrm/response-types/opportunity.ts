import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const CopperCrmOpportunityResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    assignee_id: { type: 'integer' },
    close_date: { type: 'string' },
    company_id: { type: 'integer' },
    company_name: { type: 'string' },
    customer_source_id: { type: 'integer' },
    details: { type: 'string' },
    loss_reason_id: { type: 'integer' },
    monetary_value: { type: 'number' },
    monetary_unit: { type: 'string' },
    converted_value: { type: 'number' },
    converted_unit: { type: 'string' },
    pipeline_id: { type: 'integer' },
    pipeline_is_revenue: { type: 'boolean' },
    pipeline_stage_id: { type: 'integer' },
    pipeline_type: { type: 'string' },
    primary_contact_id: { type: 'integer' },
    priority: { type: 'string' },
    status: { type: 'string' },
    tags: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    win_probability: { type: 'number' },
    interaction_count: { type: 'integer' },
    date_created: { type: 'integer' },
    date_modified: { type: 'integer' },
    date_last_contacted: { type: 'integer' },
    date_lead_created: { type: 'integer' },
    leads_converted_from: {
      type: {
        type: 'list',
        element_type: 'integer',
      },
    },
  },
} satisfies TQoreResponseType;
