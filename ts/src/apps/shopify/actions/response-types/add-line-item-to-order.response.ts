import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyAddLineItemToOrderResponseType = {
  type: 'hash',
  fields: {
    addedItem: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          quantity: { type: 'int' },
          title: { type: 'string' },
          variantTitle: { type: 'string' },
          discountedUnitPriceSet: {
            type: {
              type: 'hash',
              fields: {
                shopMoney: {
                  type: {
                    type: 'hash',
                    fields: {
                      amount: { type: 'string' },
                      currencyCode: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          originalUnitPriceSet: {
            type: {
              type: 'hash',
              fields: {
                shopMoney: {
                  type: {
                    type: 'hash',
                    fields: {
                      amount: { type: 'string' },
                      currencyCode: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    order: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          name: { type: 'string' },
          totalPriceSet: {
            type: {
              type: 'hash',
              fields: {
                shopMoney: {
                  type: {
                    type: 'hash',
                    fields: {
                      amount: { type: 'string' },
                      currencyCode: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
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
