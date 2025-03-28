import { TQoreAppActionWithEventOrWebhookEventInfo } from '@qoretechnologies/ts-toolkit';

export const magentoShipmentEventInfo = {
  desc: 'Magento Shipment Trigger Event Info',
  type: {
    type: 'hash',
    fields: {
      billing_address_id: {
        type: 'softnumber',
      },
      created_at: {
        type: 'string',
      },
      customer_id: {
        type: 'softnumber',
      },
      entity_id: {
        type: 'softnumber',
      },
      increment_id: {
        type: 'string',
      },
      order_id: {
        type: 'softnumber',
      },
      packages: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {},
          },
        },
      },
      shipping_address_id: {
        type: 'softnumber',
      },
      store_id: {
        type: 'softnumber',
      },
      total_qty: {
        type: 'number',
      },
      updated_at: {
        type: 'string',
      },
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              entity_id: {
                type: 'softnumber',
              },
              name: {
                type: 'string',
              },
              parent_id: {
                type: 'softnumber',
              },
              price: {
                type: 'number',
              },
              product_id: {
                type: 'softnumber',
              },
              sku: {
                type: 'string',
              },
              weight: {
                type: 'number',
              },
              order_item_id: {
                type: 'softnumber',
              },
              qty: {
                type: 'number',
              },
            },
          },
        },
      },
      tracks: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              order_id: {
                type: 'softnumber',
              },
              created_at: {
                type: 'string',
              },
              entity_id: {
                type: 'softnumber',
              },
              parent_id: {
                type: 'softnumber',
              },
              updated_at: {
                type: 'string',
              },
              weight: {
                type: 'number',
              },
              qty: {
                type: 'number',
              },
              description: {
                type: 'string',
              },
              track_number: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              carrier_code: {
                type: 'string',
              },
            },
          },
        },
      },
      comments: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              is_customer_notified: {
                type: 'softnumber',
              },
              parent_id: {
                type: 'softnumber',
              },
              comment: {
                type: 'string',
              },
              is_visible_on_front: {
                type: 'softnumber',
              },
              created_at: {
                type: 'string',
              },
              entity_id: {
                type: 'softnumber',
              },
            },
          },
        },
      },
      extension_attributes: {
        type: {
          type: 'hash',
          fields: {
            source_code: {
              type: 'string',
            },
          },
        },
      },
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;
