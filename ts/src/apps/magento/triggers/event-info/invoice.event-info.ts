import { TQoreAppActionWithEventOrWebhookEventInfo } from '@qoretechnologies/ts-toolkit';

export const magentoInvoiceEventInfo = {
  desc: 'Magento Invoice Trigger Event Info',
  type: {
    type: 'hash',
    fields: {
      base_currency_code: {
        type: 'string',
      },
      base_discount_amount: {
        type: 'number',
      },
      base_grand_total: {
        type: 'number',
      },
      base_discount_tax_compensation_amount: {
        type: 'number',
      },
      base_shipping_amount: {
        type: 'number',
      },
      base_shipping_discount_tax_compensation_amnt: {
        type: 'number',
      },
      base_shipping_incl_tax: {
        type: 'number',
      },
      base_shipping_tax_amount: {
        type: 'number',
      },
      base_subtotal: {
        type: 'number',
      },
      base_subtotal_incl_tax: {
        type: 'number',
      },
      base_tax_amount: {
        type: 'number',
      },
      base_to_global_rate: {
        type: 'number',
      },
      base_to_order_rate: {
        type: 'number',
      },
      billing_address_id: {
        type: 'softnumber',
      },
      can_void_flag: {
        type: 'softnumber',
      },
      created_at: {
        type: 'string',
      },
      discount_amount: {
        type: 'number',
      },
      entity_id: {
        type: 'softnumber',
      },
      global_currency_code: {
        type: 'string',
      },
      grand_total: {
        type: 'number',
      },
      discount_tax_compensation_amount: {
        type: 'number',
      },
      increment_id: {
        type: 'string',
      },
      order_currency_code: {
        type: 'string',
      },
      order_id: {
        type: 'softnumber',
      },
      shipping_address_id: {
        type: 'softnumber',
      },
      shipping_amount: {
        type: 'number',
      },
      shipping_discount_tax_compensation_amount: {
        type: 'number',
      },
      shipping_incl_tax: {
        type: 'number',
      },
      shipping_tax_amount: {
        type: 'number',
      },
      state: {
        type: 'softnumber',
      },
      store_currency_code: {
        type: 'string',
      },
      store_id: {
        type: 'softnumber',
      },
      store_to_base_rate: {
        type: 'number',
      },
      store_to_order_rate: {
        type: 'number',
      },
      subtotal: {
        type: 'number',
      },
      subtotal_incl_tax: {
        type: 'number',
      },
      tax_amount: {
        type: 'number',
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
              base_discount_tax_compensation_amount: {
                type: 'number',
              },
              base_price: {
                type: 'number',
              },
              base_price_incl_tax: {
                type: 'number',
              },
              base_row_total: {
                type: 'number',
              },
              base_row_total_incl_tax: {
                type: 'number',
              },
              base_tax_amount: {
                type: 'number',
              },
              entity_id: {
                type: 'softnumber',
              },
              discount_tax_compensation_amount: {
                type: 'number',
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
              price_incl_tax: {
                type: 'number',
              },
              product_id: {
                type: 'softnumber',
              },
              row_total: {
                type: 'number',
              },
              row_total_incl_tax: {
                type: 'number',
              },
              sku: {
                type: 'string',
              },
              tax_amount: {
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
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;
