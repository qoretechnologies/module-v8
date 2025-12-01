import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const CopperCrmLeadResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    prefix: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    middle_name: { type: 'string' },
    suffix: { type: 'string' },
    address: {
      type: {
        type: 'hash',
        fields: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postal_code: { type: 'string' },
          country: { type: 'string' },
        },
      },
    },
    assignee_id: { type: 'integer' },
    company_name: { type: 'string' },
    customer_source_id: { type: 'integer' },
    details: { type: 'string' },
    email: {
      type: {
        type: 'hash',
        fields: {
          email: { type: 'string' },
          category: { type: 'string' },
        },
      },
    },
    interaction_count: { type: 'integer' },
    monetary_unit: { type: 'string' },
    monetary_value: { type: 'number' },
    converted_unit: { type: 'string' },
    converted_value: { type: 'number' },
    socials: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            url: { type: 'string' },
            category: { type: 'string' },
          },
        },
      },
    },
    status: { type: 'string' },
    status_id: { type: 'integer' },
    tags: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    title: { type: 'string' },
    websites: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            url: { type: 'string' },
            category: { type: 'string' },
          },
        },
      },
    },
    phone_numbers: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            number: { type: 'string' },
            category: { type: 'string' },
          },
        },
      },
    },
    date_created: { type: 'integer' },
    date_modified: { type: 'integer' },
    date_last_contacted: { type: 'integer' },
    converted_opportunity_id: { type: 'integer' },
    converted_contact_id: { type: 'integer' },
    converted_at: { type: 'integer' },
  },
} satisfies TQoreResponseType;
