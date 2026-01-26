import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const CopperCrmCompanyResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
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
    contact_type_id: { type: 'integer' },
    details: { type: 'string' },
    email_domain: { type: 'string' },
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
    primary_contact_id: { type: 'integer' },
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
    tags: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
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
    interaction_count: { type: 'integer' },
    date_created: { type: 'integer' },
    date_modified: { type: 'integer' },
  },
} satisfies TQoreResponseType;
