import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyFindVariantResponseType = {
  type: 'hash',
  fields: {
    productId: {
      type: 'string',
      desc: 'The ID of the product when searching by product',
      required: false,
    },
    productTitle: {
      type: 'string',
      desc: 'The title of the product when searching by product',
      required: false,
    },
    variants: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
              desc: 'A globally-unique ID',
            },
            title: {
              type: 'string',
              desc: 'The title of the product variant',
            },
            displayName: {
              type: 'string',
              desc: "Display name of the variant, based on product's title + variant's title",
            },
            sku: {
              type: 'string',
              desc: 'A case-sensitive identifier for the product variant in the shop',
            },
            barcode: {
              type: 'string',
              desc: 'The value of the barcode associated with the product',
            },
            price: {
              type: 'string',
              desc: 'The price of the product variant in the default shop currency',
            },
            compareAtPrice: {
              type: 'string',
              desc: 'The compare-at price of the variant in the default shop currency',
            },
            inventoryQuantity: {
              type: 'int',
              desc: 'The total sellable quantity of the variant',
            },
            sellableOnlineQuantity: {
              type: 'int',
              desc: 'The total sellable quantity of the variant for online channels',
            },
            availableForSale: {
              type: 'bool',
              desc: 'Whether the product variant is available for sale',
            },
            position: {
              type: 'int',
              desc: 'The order of the product variant in the list of product variants',
            },
            requiresComponents: {
              type: 'bool',
              desc: 'Whether a product variant requires components',
            },
            taxable: {
              type: 'bool',
              desc: 'Whether a tax is charged when the product variant is sold',
            },
            taxCode: {
              type: 'string',
              desc: 'The tax code for the product variant',
            },
            createdAt: {
              type: 'string',
              desc: 'The date and time when the variant was created',
            },
            updatedAt: {
              type: 'string',
              desc: 'The date and time when the product variant was last modified',
            },
            inventoryPolicy: {
              type: 'string',
              desc: "Whether customers are allowed to place an order for the product variant when it's out of stock",
            },
            product: {
              type: {
                type: 'hash',
                desc: 'The product that this variant belongs to (when searching across all variants)',
                fields: {
                  id: {
                    type: 'string',
                  },
                  title: {
                    type: 'string',
                  },
                },
              },
              required: false,
            },
            image: {
              type: {
                type: 'hash',
                desc: 'The featured image for the variant',
                fields: {
                  id: {
                    type: 'string',
                  },
                  url: {
                    type: 'string',
                  },
                  altText: {
                    type: 'string',
                  },
                  width: {
                    type: 'int',
                  },
                  height: {
                    type: 'int',
                  },
                },
              },
            },
            selectedOptions: {
              type: {
                type: 'list',
                desc: 'List of product options applied to the variant',
                element_type: {
                  type: 'hash',
                  fields: {
                    name: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                  },
                },
              },
            },
            metafields: {
              type: {
                type: 'list',
                desc: 'Custom fields associated with the variant',
                element_type: {
                  type: 'hash',
                  fields: {
                    namespace: {
                      type: 'string',
                    },
                    key: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                    type: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    pageInfo: {
      type: {
        type: 'hash',
        fields: {
          hasNextPage: {
            type: 'bool',
          },
          endCursor: {
            type: 'string',
          },
        },
      },
    },
  },
} as const satisfies TQoreResponseType;
