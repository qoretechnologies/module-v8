import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyCreateCompanyResponseType = {
  type: 'hash',
  fields: {
    company: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          name: { type: 'string' },
          externalId: { type: 'string' },
          mainContact: {
            type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                customer: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          contacts: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  customer: {
                    type: {
                      type: 'hash',
                      fields: {
                        email: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          contactRoles: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
          locations: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  shippingAddress: {
                    type: {
                      type: 'hash',
                      fields: {
                        address1: { type: 'string' },
                        address2: { type: 'string' },
                        city: { type: 'string' },
                        province: { type: 'string' },
                        country: { type: 'string' },
                        zip: { type: 'string' },
                      },
                    },
                  },
                },
              },
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
