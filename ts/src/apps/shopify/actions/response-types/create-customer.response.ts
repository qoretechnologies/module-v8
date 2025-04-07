import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyCreateCustomerResponseType = {
  type: 'hash',
  fields: {
    customer: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            required: true,
            desc: 'The ID of the created customer',
          },
          email: {
            type: 'string',
            required: false,
            desc: 'The customer email address',
          },
          phone: {
            type: 'string',
            required: false,
            desc: 'The customer phone number',
          },
          firstName: {
            type: 'string',
            required: false,
            desc: 'The customer first name',
          },
          lastName: {
            type: 'string',
            required: false,
            desc: 'The customer last name',
          },
          locale: {
            type: 'string',
            required: false,
            desc: 'The customer locale',
          },
          note: {
            type: 'string',
            required: false,
            desc: 'Notes about the customer',
          },
          taxExempt: {
            type: 'bool',
            required: false,
            desc: 'Whether the customer is exempt from taxes',
          },
          tags: {
            type: {
              type: 'list',
              element_type: 'string',
            },
            required: false,
            desc: 'Tags associated with the customer',
          },
          addresses: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: {
                    type: 'string',
                    required: true,
                    desc: 'The ID of the address',
                  },
                  formatted: {
                    type: {
                      type: 'list',
                      element_type: 'string',
                    },
                    required: false,
                    desc: 'The formatted address',
                  },
                  address1: {
                    type: 'string',
                    required: false,
                    desc: 'The street address',
                  },
                  address2: {
                    type: 'string',
                    required: false,
                    desc: 'The second line of the street address',
                  },
                  city: {
                    type: 'string',
                    required: false,
                    desc: 'The city',
                  },
                  province: {
                    type: 'string',
                    required: false,
                    desc: 'The province or state',
                  },
                  country: {
                    type: 'string',
                    required: false,
                    desc: 'The country',
                  },
                  zip: {
                    type: 'string',
                    required: false,
                    desc: 'The zip or postal code',
                  },
                  firstName: {
                    type: 'string',
                    required: false,
                    desc: 'The first name for the address',
                  },
                  lastName: {
                    type: 'string',
                    required: false,
                    desc: 'The last name for the address',
                  },
                  company: {
                    type: 'string',
                    required: false,
                    desc: 'The company name for the address',
                  },
                  phone: {
                    type: 'string',
                    required: false,
                    desc: 'The phone number for the address',
                  },
                },
              },
            },
            required: false,
            desc: 'The customer addresses',
          },
          emailMarketingConsent: {
            type: {
              type: 'hash',
              fields: {
                marketingState: {
                  type: 'string',
                  required: true,
                  desc: 'The marketing state for email',
                },
                marketingOptInLevel: {
                  type: 'string',
                  required: false,
                  desc: 'The opt-in level for email marketing',
                },
                consentUpdatedAt: {
                  type: 'date',
                  required: false,
                  desc: 'When the marketing consent was last updated',
                },
              },
            },
            required: false,
            desc: 'The customer email marketing consent settings',
          },
          smsMarketingConsent: {
            type: {
              type: 'hash',
              fields: {
                marketingState: {
                  type: 'string',
                  required: true,
                  desc: 'The marketing state for SMS',
                },
                marketingOptInLevel: {
                  type: 'string',
                  required: false,
                  desc: 'The opt-in level for SMS marketing',
                },
                consentUpdatedAt: {
                  type: 'date',
                  required: false,
                  desc: 'When the SMS marketing consent was last updated',
                },
              },
            },
            required: false,
            desc: 'The customer SMS marketing consent settings',
          },
          metafields: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: {
                    type: 'string',
                    required: true,
                    desc: 'The metafield ID',
                  },
                  namespace: {
                    type: 'string',
                    required: true,
                    desc: 'The metafield namespace',
                  },
                  key: {
                    type: 'string',
                    required: true,
                    desc: 'The metafield key',
                  },
                  value: {
                    type: 'string',
                    required: true,
                    desc: 'The metafield value',
                  },
                  type: {
                    type: 'string',
                    required: true,
                    desc: 'The metafield type',
                  },
                },
              },
            },
            required: false,
            desc: 'Customer metafields',
          },
        },
      },
      required: true,
      desc: 'The created customer object',
    },
    userErrors: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            field: {
              type: 'string',
              required: false,
              desc: 'The error field',
            },
            message: {
              type: 'string',
              required: true,
              desc: 'The error message',
            },
          },
        },
      },
      required: false,
      desc: 'Errors that occurred during the operation',
    },
  },
} as const satisfies TQoreResponseType;
