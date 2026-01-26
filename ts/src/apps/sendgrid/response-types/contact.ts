import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SendGridContactResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    email: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    custom_fields: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            value: { type: 'string' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;
