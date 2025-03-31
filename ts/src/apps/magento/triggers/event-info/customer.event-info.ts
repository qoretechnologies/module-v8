import { TQoreAppActionWithEventOrWebhookEventInfo } from '@qoretechnologies/ts-toolkit';

export const magentoCustomerEventInfo = {
  desc: 'Magento Customer Created Or Updated Trigger Event Info',
  type: {
    type: 'hash',
    fields: {
      id: {
        type: 'softnumber',
      },
      group_id: {
        type: 'softnumber',
      },
      default_billing: {
        type: 'string',
      },
      default_shipping: {
        type: 'string',
      },
      created_at: {
        type: 'string',
      },
      updated_at: {
        type: 'string',
      },
      created_in: {
        type: 'string',
      },
      dob: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      firstname: {
        type: 'string',
      },
      lastname: {
        type: 'string',
      },
      gender: {
        type: 'softnumber',
      },
      store_id: {
        type: 'softnumber',
      },
      website_id: {
        type: 'softnumber',
      },
      addresses: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: {
                type: 'softnumber',
              },
              customer_id: {
                type: 'softnumber',
              },
              region: {
                type: {
                  type: 'hash',
                  fields: {
                    region_code: {
                      type: 'string',
                    },
                    region: {
                      type: 'string',
                    },
                    region_id: {
                      type: 'softnumber',
                    },
                  },
                },
              },
              region_id: {
                type: 'softnumber',
              },
              country_id: {
                type: 'string',
              },
              street: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'string',
                  },
                },
              },
              telephone: {
                type: 'string',
              },
              postcode: {
                type: 'string',
              },
              city: {
                type: 'string',
              },
              firstname: {
                type: 'string',
              },
              lastname: {
                type: 'string',
              },
              default_shipping: {
                type: 'boolean',
              },
              default_billing: {
                type: 'boolean',
              },
            },
          },
        },
      },
      disable_auto_group_change: {
        type: 'softnumber',
      },
      extension_attributes: {
        type: {
          type: 'hash',
          fields: {
            is_subscribed: {
              type: 'boolean',
            },
          },
        },
      },
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;
