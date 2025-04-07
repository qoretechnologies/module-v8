import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyAddBlogEntryResponseType = {
  type: 'hash',
  fields: {
    article: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          handle: { type: 'string' },
          author: {
            type: {
              type: 'hash',
              fields: {
                name: { type: 'string' },
              },
            },
          },
          tags: {
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
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
