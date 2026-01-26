import { TQoreAppActionWithEventOrWebhookEventInfo } from '@qoretechnologies/ts-toolkit';

export const magentoProductEventInfo = {
  desc: 'Magento Product Trigger Event Info',
  type: {
    type: 'hash',
    fields: {
      id: {
        type: 'softnumber',
      },
      sku: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      attribute_set_id: {
        type: 'softnumber',
      },
      price: {
        type: 'number',
      },
      status: {
        type: 'softnumber',
      },
      visibility: {
        type: 'softnumber',
      },
      type_id: {
        type: 'string',
      },
      created_at: {
        type: 'string',
      },
      updated_at: {
        type: 'string',
      },
      extension_attributes: {
        type: {
          type: 'hash',
          fields: {
            website_ids: {
              type: {
                type: 'list',
                element_type: {
                  type: 'softnumber',
                },
              },
            },
            category_links: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    position: {
                      type: 'softnumber',
                    },
                    category_id: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      product_links: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              sku: {
                type: 'string',
              },
              link_type: {
                type: 'string',
              },
              linked_product_sku: {
                type: 'string',
              },
              linked_product_type: {
                type: 'string',
              },
              position: {
                type: 'softnumber',
              },
            },
          },
        },
      },
      options: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {},
          },
        },
      },
      media_gallery_entries: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: {
                type: 'softnumber',
              },
              media_type: {
                type: 'string',
              },
              label: {
                type: 'string',
              },
              position: {
                type: 'softnumber',
              },
              disabled: {
                type: 'bool',
              },
              types: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'string',
                  },
                },
              },
              file: {
                type: 'string',
              },
            },
          },
        },
      },
      tier_prices: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {},
          },
        },
      },
      custom_attributes: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              attribute_code: {
                type: 'string',
              },
              value: {
                type: 'any',
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;
