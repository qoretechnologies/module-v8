const CopperCrmPersonResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    prefix: { type: 'string' },
    first_name: { type: 'string' },
    middle_name: { type: 'string' },
    last_name: { type: 'string' },
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
    company_id: { type: 'integer' },
    company_name: { type: 'string' },
    contact_type_id: { type: 'integer' },
    details: { type: 'string' },
    emails: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            email: { type: 'string' },
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
    date_created: { type: 'integer' },
    date_modified: { type: 'integer' },
    interaction_count: { type: 'integer' },
    date_last_contacted: { type: 'integer' },
  },
} as const;

export default CopperCrmPersonResponseType;
