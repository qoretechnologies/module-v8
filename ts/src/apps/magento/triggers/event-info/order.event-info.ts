import { TQoreAppActionWithEventOrWebhookEventInfo } from '@qoretechnologies/ts-toolkit';

export const magentoOrderEventInfo = {
  desc: 'Magento Order Trigger Event Info',
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
      base_shipping_discount_amount: {
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
      base_total_due: {
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
      created_at: {
        type: 'string',
      },
      customer_email: {
        type: 'string',
      },
      customer_firstname: {
        type: 'string',
      },
      customer_group_id: {
        type: 'softnumber',
      },
      customer_is_guest: {
        type: 'softnumber',
      },
      customer_lastname: {
        type: 'string',
      },
      customer_note_notify: {
        type: 'softnumber',
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
      is_virtual: {
        type: 'softnumber',
      },
      order_currency_code: {
        type: 'string',
      },
      protect_code: {
        type: 'string',
      },
      quote_id: {
        type: 'softnumber',
      },
      remote_ip: {
        type: 'string',
      },
      shipping_amount: {
        type: 'number',
      },
      shipping_description: {
        type: 'string',
      },
      shipping_discount_amount: {
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
        type: 'string',
      },
      status: {
        type: 'string',
      },
      store_currency_code: {
        type: 'string',
      },
      store_id: {
        type: 'softnumber',
      },
      store_name: {
        type: 'string',
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
      total_due: {
        type: 'number',
      },
      total_item_count: {
        type: 'softnumber',
      },
      total_qty_ordered: {
        type: 'number',
      },
      updated_at: {
        type: 'string',
      },
      weight: {
        type: 'number',
      },
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              amount_refunded: {
                type: 'number',
              },
              base_amount_refunded: {
                type: 'number',
              },
              base_discount_amount: {
                type: 'number',
              },
              base_discount_invoiced: {
                type: 'number',
              },
              base_discount_tax_compensation_amount: {
                type: 'number',
              },
              base_original_price: {
                type: 'number',
              },
              base_price: {
                type: 'number',
              },
              base_price_incl_tax: {
                type: 'number',
              },
              base_row_invoiced: {
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
              base_tax_invoiced: {
                type: 'number',
              },
              created_at: {
                type: 'string',
              },
              discount_amount: {
                type: 'number',
              },
              discount_invoiced: {
                type: 'number',
              },
              discount_percent: {
                type: 'number',
              },
              free_shipping: {
                type: 'softnumber',
              },
              discount_tax_compensation_amount: {
                type: 'number',
              },
              is_qty_decimal: {
                type: 'softnumber',
              },
              is_virtual: {
                type: 'softnumber',
              },
              item_id: {
                type: 'softnumber',
              },
              name: {
                type: 'string',
              },
              no_discount: {
                type: 'softnumber',
              },
              order_id: {
                type: 'softnumber',
              },
              original_price: {
                type: 'number',
              },
              parent_item_id: {
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
              product_type: {
                type: 'string',
              },
              qty_canceled: {
                type: 'number',
              },
              qty_invoiced: {
                type: 'number',
              },
              qty_ordered: {
                type: 'number',
              },
              qty_refunded: {
                type: 'number',
              },
              qty_shipped: {
                type: 'number',
              },
              quote_item_id: {
                type: 'softnumber',
              },
              row_invoiced: {
                type: 'number',
              },
              row_total: {
                type: 'number',
              },
              row_total_incl_tax: {
                type: 'number',
              },
              row_weight: {
                type: 'number',
              },
              sku: {
                type: 'string',
              },
              store_id: {
                type: 'softnumber',
              },
              tax_amount: {
                type: 'number',
              },
              tax_invoiced: {
                type: 'number',
              },
              tax_percent: {
                type: 'number',
              },
              updated_at: {
                type: 'string',
              },
              weight: {
                type: 'number',
              },
              product_option: {
                type: {
                  type: 'hash',
                  fields: {
                    extension_attributes: {
                      type: {
                        type: 'hash',
                        fields: {
                          configurable_item_options: {
                            type: {
                              type: 'list',
                              element_type: {
                                type: 'hash',
                                fields: {
                                  option_id: {
                                    type: 'string',
                                  },
                                  option_value: {
                                    type: 'number',
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
              },
              parent_item: {
                type: {
                  type: 'hash',
                  fields: {
                    amount_refunded: {
                      type: 'number',
                    },
                    base_amount_refunded: {
                      type: 'number',
                    },
                    base_discount_amount: {
                      type: 'number',
                    },
                    base_discount_invoiced: {
                      type: 'number',
                    },
                    base_discount_tax_compensation_amount: {
                      type: 'number',
                    },
                    base_original_price: {
                      type: 'number',
                    },
                    base_price: {
                      type: 'number',
                    },
                    base_price_incl_tax: {
                      type: 'number',
                    },
                    base_row_invoiced: {
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
                    base_tax_invoiced: {
                      type: 'number',
                    },
                    created_at: {
                      type: 'string',
                    },
                    discount_amount: {
                      type: 'number',
                    },
                    discount_invoiced: {
                      type: 'number',
                    },
                    discount_percent: {
                      type: 'number',
                    },
                    free_shipping: {
                      type: 'softnumber',
                    },
                    discount_tax_compensation_amount: {
                      type: 'number',
                    },
                    is_qty_decimal: {
                      type: 'softnumber',
                    },
                    is_virtual: {
                      type: 'softnumber',
                    },
                    item_id: {
                      type: 'softnumber',
                    },
                    name: {
                      type: 'string',
                    },
                    no_discount: {
                      type: 'softnumber',
                    },
                    order_id: {
                      type: 'softnumber',
                    },
                    original_price: {
                      type: 'number',
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
                    product_type: {
                      type: 'string',
                    },
                    qty_canceled: {
                      type: 'number',
                    },
                    qty_invoiced: {
                      type: 'number',
                    },
                    qty_ordered: {
                      type: 'number',
                    },
                    qty_refunded: {
                      type: 'number',
                    },
                    qty_shipped: {
                      type: 'number',
                    },
                    quote_item_id: {
                      type: 'softnumber',
                    },
                    row_invoiced: {
                      type: 'number',
                    },
                    row_total: {
                      type: 'number',
                    },
                    row_total_incl_tax: {
                      type: 'number',
                    },
                    row_weight: {
                      type: 'number',
                    },
                    sku: {
                      type: 'string',
                    },
                    store_id: {
                      type: 'softnumber',
                    },
                    tax_amount: {
                      type: 'number',
                    },
                    tax_invoiced: {
                      type: 'number',
                    },
                    tax_percent: {
                      type: 'number',
                    },
                    updated_at: {
                      type: 'string',
                    },
                    weight: {
                      type: 'number',
                    },
                    product_option: {
                      type: {
                        type: 'hash',
                        fields: {
                          extension_attributes: {
                            type: {
                              type: 'hash',
                              fields: {
                                configurable_item_options: {
                                  type: {
                                    type: 'list',
                                    element_type: {
                                      type: 'hash',
                                      fields: {
                                        option_id: {
                                          type: 'string',
                                        },
                                        option_value: {
                                          type: 'number',
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
                    },
                  },
                },
              },
            },
          },
        },
      },
      billing_address: {
        type: {
          type: 'hash',
          fields: {
            address_type: {
              type: 'string',
            },
            city: {
              type: 'string',
            },
            country_id: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            entity_id: {
              type: 'softnumber',
            },
            firstname: {
              type: 'string',
            },
            lastname: {
              type: 'string',
            },
            parent_id: {
              type: 'softnumber',
            },
            postcode: {
              type: 'string',
            },
            region: {
              type: 'string',
            },
            region_code: {
              type: 'string',
            },
            region_id: {
              type: 'softnumber',
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
          },
        },
      },
      payment: {
        type: {
          type: 'hash',
          fields: {
            account_status: {
              type: 'string',
            },
            additional_information: {
              type: {
                type: 'list',
                element_type: {
                  type: 'string',
                },
              },
            },
            amount_ordered: {
              type: 'number',
            },
            base_amount_ordered: {
              type: 'number',
            },
            base_shipping_amount: {
              type: 'number',
            },
            cc_exp_year: {
              type: 'string',
            },
            cc_last4: {
              type: 'string',
            },
            cc_ss_start_month: {
              type: 'string',
            },
            cc_ss_start_year: {
              type: 'string',
            },
            entity_id: {
              type: 'softnumber',
            },
            method: {
              type: 'string',
            },
            parent_id: {
              type: 'softnumber',
            },
            shipping_amount: {
              type: 'number',
            },
          },
        },
      },
      status_histories: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {},
          },
        },
      },
      extension_attributes: {
        type: {
          type: 'hash',
          fields: {
            shipping_assignments: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    shipping: {
                      type: {
                        type: 'hash',
                        fields: {
                          address: {
                            type: {
                              type: 'hash',
                              fields: {
                                address_type: {
                                  type: 'string',
                                },
                                city: {
                                  type: 'string',
                                },
                                country_id: {
                                  type: 'string',
                                },
                                email: {
                                  type: 'string',
                                },
                                entity_id: {
                                  type: 'softnumber',
                                },
                                firstname: {
                                  type: 'string',
                                },
                                lastname: {
                                  type: 'string',
                                },
                                parent_id: {
                                  type: 'softnumber',
                                },
                                postcode: {
                                  type: 'string',
                                },
                                region: {
                                  type: 'string',
                                },
                                region_code: {
                                  type: 'string',
                                },
                                region_id: {
                                  type: 'softnumber',
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
                              },
                            },
                          },
                          method: {
                            type: 'string',
                          },
                          total: {
                            type: {
                              type: 'hash',
                              fields: {
                                base_shipping_amount: {
                                  type: 'number',
                                },
                                base_shipping_discount_amount: {
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
                                shipping_amount: {
                                  type: 'number',
                                },
                                shipping_discount_amount: {
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
                              },
                            },
                          },
                        },
                      },
                    },
                    items: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            amount_refunded: {
                              type: 'number',
                            },
                            base_amount_refunded: {
                              type: 'number',
                            },
                            base_discount_amount: {
                              type: 'number',
                            },
                            base_discount_invoiced: {
                              type: 'number',
                            },
                            base_discount_tax_compensation_amount: {
                              type: 'number',
                            },
                            base_original_price: {
                              type: 'number',
                            },
                            base_price: {
                              type: 'number',
                            },
                            base_price_incl_tax: {
                              type: 'number',
                            },
                            base_row_invoiced: {
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
                            base_tax_invoiced: {
                              type: 'number',
                            },
                            created_at: {
                              type: 'string',
                            },
                            discount_amount: {
                              type: 'number',
                            },
                            discount_invoiced: {
                              type: 'number',
                            },
                            discount_percent: {
                              type: 'number',
                            },
                            free_shipping: {
                              type: 'softnumber',
                            },
                            discount_tax_compensation_amount: {
                              type: 'number',
                            },
                            is_qty_decimal: {
                              type: 'softnumber',
                            },
                            is_virtual: {
                              type: 'softnumber',
                            },
                            item_id: {
                              type: 'softnumber',
                            },
                            name: {
                              type: 'string',
                            },
                            no_discount: {
                              type: 'softnumber',
                            },
                            order_id: {
                              type: 'softnumber',
                            },
                            original_price: {
                              type: 'number',
                            },
                            parent_item_id: {
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
                            product_type: {
                              type: 'string',
                            },
                            qty_canceled: {
                              type: 'number',
                            },
                            qty_invoiced: {
                              type: 'number',
                            },
                            qty_ordered: {
                              type: 'number',
                            },
                            qty_refunded: {
                              type: 'number',
                            },
                            qty_shipped: {
                              type: 'number',
                            },
                            quote_item_id: {
                              type: 'softnumber',
                            },
                            row_invoiced: {
                              type: 'number',
                            },
                            row_total: {
                              type: 'number',
                            },
                            row_total_incl_tax: {
                              type: 'number',
                            },
                            row_weight: {
                              type: 'number',
                            },
                            sku: {
                              type: 'string',
                            },
                            store_id: {
                              type: 'softnumber',
                            },
                            tax_amount: {
                              type: 'number',
                            },
                            tax_invoiced: {
                              type: 'number',
                            },
                            tax_percent: {
                              type: 'number',
                            },
                            updated_at: {
                              type: 'string',
                            },
                            weight: {
                              type: 'number',
                            },
                            product_option: {
                              type: {
                                type: 'hash',
                                fields: {
                                  extension_attributes: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        configurable_item_options: {
                                          type: {
                                            type: 'list',
                                            element_type: {
                                              type: 'hash',
                                              fields: {
                                                option_id: {
                                                  type: 'string',
                                                },
                                                option_value: {
                                                  type: 'number',
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
                            },
                            parent_item: {
                              type: {
                                type: 'hash',
                                fields: {
                                  amount_refunded: {
                                    type: 'number',
                                  },
                                  base_amount_refunded: {
                                    type: 'number',
                                  },
                                  base_discount_amount: {
                                    type: 'number',
                                  },
                                  base_discount_invoiced: {
                                    type: 'number',
                                  },
                                  base_discount_tax_compensation_amount: {
                                    type: 'number',
                                  },
                                  base_original_price: {
                                    type: 'number',
                                  },
                                  base_price: {
                                    type: 'number',
                                  },
                                  base_price_incl_tax: {
                                    type: 'number',
                                  },
                                  base_row_invoiced: {
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
                                  base_tax_invoiced: {
                                    type: 'number',
                                  },
                                  created_at: {
                                    type: 'string',
                                  },
                                  discount_amount: {
                                    type: 'number',
                                  },
                                  discount_invoiced: {
                                    type: 'number',
                                  },
                                  discount_percent: {
                                    type: 'number',
                                  },
                                  free_shipping: {
                                    type: 'softnumber',
                                  },
                                  discount_tax_compensation_amount: {
                                    type: 'number',
                                  },
                                  is_qty_decimal: {
                                    type: 'softnumber',
                                  },
                                  is_virtual: {
                                    type: 'softnumber',
                                  },
                                  item_id: {
                                    type: 'softnumber',
                                  },
                                  name: {
                                    type: 'string',
                                  },
                                  no_discount: {
                                    type: 'softnumber',
                                  },
                                  order_id: {
                                    type: 'softnumber',
                                  },
                                  original_price: {
                                    type: 'number',
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
                                  product_type: {
                                    type: 'string',
                                  },
                                  qty_canceled: {
                                    type: 'number',
                                  },
                                  qty_invoiced: {
                                    type: 'number',
                                  },
                                  qty_ordered: {
                                    type: 'number',
                                  },
                                  qty_refunded: {
                                    type: 'number',
                                  },
                                  qty_shipped: {
                                    type: 'number',
                                  },
                                  quote_item_id: {
                                    type: 'softnumber',
                                  },
                                  row_invoiced: {
                                    type: 'number',
                                  },
                                  row_total: {
                                    type: 'number',
                                  },
                                  row_total_incl_tax: {
                                    type: 'number',
                                  },
                                  row_weight: {
                                    type: 'number',
                                  },
                                  sku: {
                                    type: 'string',
                                  },
                                  store_id: {
                                    type: 'softnumber',
                                  },
                                  tax_amount: {
                                    type: 'number',
                                  },
                                  tax_invoiced: {
                                    type: 'number',
                                  },
                                  tax_percent: {
                                    type: 'number',
                                  },
                                  updated_at: {
                                    type: 'string',
                                  },
                                  weight: {
                                    type: 'number',
                                  },
                                  product_option: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        extension_attributes: {
                                          type: {
                                            type: 'hash',
                                            fields: {
                                              configurable_item_options: {
                                                type: {
                                                  type: 'list',
                                                  element_type: {
                                                    type: 'hash',
                                                    fields: {
                                                      option_id: {
                                                        type: 'string',
                                                      },
                                                      option_value: {
                                                        type: 'number',
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
              },
            },
            payment_additional_info: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    key: {
                      type: 'string',
                    },
                    value: {
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
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;
