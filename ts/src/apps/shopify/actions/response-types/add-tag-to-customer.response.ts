import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyAddTagToCustomerResponseType = {
  type: 'hash',
  fields: {
    customer: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          tags: { type: 'string' },
          updatedAt: { type: 'string' },
        },
      },
    },
    userErrors: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            field: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;
