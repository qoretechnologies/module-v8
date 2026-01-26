import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';

const action = 'get_order';

const options = {
  order_id: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const getOrder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, environment, order_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'environment'],
      optionFields: ['order_id'],
      ErrorClass: PayPalError,
    });

    try {
      const order = await payPalApiClient<Record<string, any>>({
        path: `v2/checkout/orders/${order_id}`,
        environment,
        token,
      });

      return {
        ...omit(order, ['links']),
        approve_url: order.links.find((l: any) => l.rel === 'approve')?.href,
        capture_url: order.links.find((l: any) => l.rel === 'capture')?.href,
      };
    } catch (error) {
      throw new PayPalError(
        `Failed to ${humanizeNameTitle(action)}: ${getPayPalErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      intent: { type: 'string' },
      status: { type: 'string' },
      payment_source: {
        type: {
          type: 'hash',
          fields: {
            paypal: {
              type: {
                type: 'hash',
                fields: {
                  email_address: { type: 'string' },
                  account_id: { type: 'string' },
                  account_status: { type: 'string' },
                  name: {
                    type: {
                      type: 'hash',
                      fields: {
                        given_name: { type: 'string' },
                        surname: { type: 'string' },
                      },
                    },
                  },
                  address: {
                    type: {
                      type: 'hash',
                      fields: {
                        country_code: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            card: {
              type: {
                type: 'hash',
                fields: {
                  last_digits: { type: 'string' },
                  brand: { type: 'string' },
                  type: { type: 'string' },
                },
              },
            },
          },
        },
      },
      purchase_units: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              reference_id: { type: 'string' },
              amount: {
                type: {
                  type: 'hash',
                  fields: {
                    currency_code: { type: 'string' },
                    value: { type: 'string' },
                    breakdown: {
                      type: {
                        type: 'hash',
                        fields: {
                          item_total: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                          shipping: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                          handling: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                          tax_total: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                          insurance: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                          shipping_discount: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                          discount: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              payee: {
                type: {
                  type: 'hash',
                  fields: {
                    email_address: { type: 'string' },
                    merchant_id: { type: 'string' },
                  },
                },
              },
              description: { type: 'string' },
              custom_id: { type: 'string' },
              invoice_id: { type: 'string' },
              soft_descriptor: { type: 'string' },
              items: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      unit_amount: {
                        type: {
                          type: 'hash',
                          fields: {
                            currency_code: { type: 'string' },
                            value: { type: 'string' },
                          },
                        },
                      },
                      tax: {
                        type: {
                          type: 'hash',
                          fields: {
                            currency_code: { type: 'string' },
                            value: { type: 'string' },
                          },
                        },
                      },
                      quantity: { type: 'string' },
                      description: { type: 'string' },
                      sku: { type: 'string' },
                      category: { type: 'string' },
                      url: { type: 'string' },
                    },
                  },
                },
              },
              shipping: {
                type: {
                  type: 'hash',
                  fields: {
                    name: {
                      type: {
                        type: 'hash',
                        fields: {
                          full_name: { type: 'string' },
                        },
                      },
                    },
                    address: {
                      type: {
                        type: 'hash',
                        fields: {
                          address_line_1: { type: 'string' },
                          address_line_2: { type: 'string' },
                          admin_area_2: { type: 'string' },
                          admin_area_1: { type: 'string' },
                          postal_code: { type: 'string' },
                          country_code: { type: 'string' },
                        },
                      },
                    },
                    type: { type: 'string' },
                  },
                },
              },
              payments: {
                type: {
                  type: 'hash',
                  fields: {
                    captures: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            status: { type: 'string' },
                            amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            final_capture: { type: 'bool' },
                            seller_protection: {
                              type: {
                                type: 'hash',
                                fields: {
                                  status: { type: 'string' },
                                  dispute_categories: {
                                    type: {
                                      type: 'list',
                                      element_type: 'string',
                                    },
                                  },
                                },
                              },
                            },
                            seller_receivable_breakdown: {
                              type: {
                                type: 'hash',
                                fields: {
                                  gross_amount: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        currency_code: { type: 'string' },
                                        value: { type: 'string' },
                                      },
                                    },
                                  },
                                  paypal_fee: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        currency_code: { type: 'string' },
                                        value: { type: 'string' },
                                      },
                                    },
                                  },
                                  net_amount: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        currency_code: { type: 'string' },
                                        value: { type: 'string' },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            invoice_id: { type: 'string' },
                            custom_id: { type: 'string' },
                            create_time: { type: 'string' },
                            update_time: { type: 'string' },
                          },
                        },
                      },
                    },
                    authorizations: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            status: { type: 'string' },
                            amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            invoice_id: { type: 'string' },
                            custom_id: { type: 'string' },
                            seller_protection: {
                              type: {
                                type: 'hash',
                                fields: {
                                  status: { type: 'string' },
                                  dispute_categories: {
                                    type: {
                                      type: 'list',
                                      element_type: 'string',
                                    },
                                  },
                                },
                              },
                            },
                            expiration_time: { type: 'string' },
                            create_time: { type: 'string' },
                            update_time: { type: 'string' },
                          },
                        },
                      },
                    },
                    refunds: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            status: { type: 'string' },
                            amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            invoice_id: { type: 'string' },
                            note_to_payer: { type: 'string' },
                            create_time: { type: 'string' },
                            update_time: { type: 'string' },
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
      payer: {
        type: {
          type: 'hash',
          fields: {
            name: {
              type: {
                type: 'hash',
                fields: {
                  given_name: { type: 'string' },
                  surname: { type: 'string' },
                },
              },
            },
            email_address: { type: 'string' },
            payer_id: { type: 'string' },
            address: {
              type: {
                type: 'hash',
                fields: {
                  country_code: { type: 'string' },
                },
              },
            },
          },
        },
      },
      create_time: { type: 'string' },
      update_time: { type: 'string' },
      approve_url: { type: 'string' },
      capture_url: { type: 'string' },
    },
  },
});

export default getOrder;
