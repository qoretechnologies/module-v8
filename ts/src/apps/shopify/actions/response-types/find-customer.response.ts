import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyFindCustomerResponseType = {
  type: 'hash',
  fields: {
    customers: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
              desc: 'A globally-unique ID',
            },
            firstName: {
              type: 'string',
              desc: "The customer's first name",
            },
            lastName: {
              type: 'string',
              desc: "The customer's last name",
            },
            displayName: {
              type: 'string',
              desc: 'The full name of the customer',
            },
            email: {
              type: 'string',
              desc: "The customer's email address",
            },
            phone: {
              type: 'string',
              desc: "The customer's phone number",
            },
            createdAt: {
              type: 'string',
              desc: 'The date and time when the customer was added to the store',
            },
            updatedAt: {
              type: 'string',
              desc: 'The date and time when the customer was last updated',
            },
            verifiedEmail: {
              type: 'boolean',
              desc: 'Whether the customer has verified their email address',
            },
            taxExempt: {
              type: 'boolean',
              desc: 'Whether the customer is exempt from being charged taxes on their orders',
            },
            tags: {
              type: {
                type: 'list',
                desc: 'A list of tags that have been added to the customer',
                element_type: {
                  type: 'string',
                },
              },
            },
            note: {
              type: 'string',
              desc: 'A note about the customer',
            },
            numberOfOrders: {
              type: 'int',
              desc: 'The number of orders that the customer has made at the store in their lifetime',
            },
            defaultAddress: {
              type: {
                type: 'hash',
                desc: 'The default address associated with the customer',

                fields: {
                  id: {
                    type: 'string',
                  },
                  address1: {
                    type: 'string',
                  },
                  address2: {
                    type: 'string',
                  },
                  city: {
                    type: 'string',
                  },
                  company: {
                    type: 'string',
                  },
                  country: {
                    type: 'string',
                  },
                  countryCode: {
                    type: 'string',
                  },
                  firstName: {
                    type: 'string',
                  },
                  lastName: {
                    type: 'string',
                  },
                  phone: {
                    type: 'string',
                  },
                  province: {
                    type: 'string',
                  },
                  provinceCode: {
                    type: 'string',
                  },
                  zip: {
                    type: 'string',
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
            type: 'boolean',
          },
          endCursor: {
            type: 'string',
          },
        },
      },
    },
  },
} as const satisfies TQoreResponseType;
