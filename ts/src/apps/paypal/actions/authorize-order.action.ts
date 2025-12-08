import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';

const options = {
  order_id: {
    type: 'string',
    required: true,
    desc: 'The ID of the approved order to capture',
  },
} satisfies TQoreOptions;

const action = 'authorize_order';

const authorizeOrder = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await payPalApiClient<Record<string, any>>({
        path: `v2/checkout/orders/${order_id}/authorize`,
        method: 'POST',
        token,
        environment,
      });

      return omit(response, ['links']);
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
                  phone_number: {
                    type: {
                      type: 'hash',
                      fields: {
                        national_number: { type: 'string' },
                      },
                    },
                  },
                  birth_date: { type: 'string' },
                  tax_info: {
                    type: {
                      type: 'hash',
                      fields: {
                        tax_id: { type: 'string' },
                        tax_id_type: { type: 'string' },
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
                },
              },
            },
            card: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  billing_address: {
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
                  last_digits: { type: 'string' },
                  card_type: { type: 'string' },
                  brand: { type: 'string' },
                  available_networks: {
                    type: {
                      type: 'list',
                      element_type: 'string',
                    },
                  },
                  authentication_result: {
                    type: {
                      type: 'hash',
                      fields: {
                        liability_shift: { type: 'string' },
                        three_d_secure: {
                          type: {
                            type: 'hash',
                            fields: {
                              enrollment_status: { type: 'string' },
                              authentication_status: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            bank_account: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  account_type: { type: 'string' },
                  account_number: { type: 'string' },
                  bank_name: { type: 'string' },
                  country_code: { type: 'string' },
                },
              },
            },
            venmo: {
              type: {
                type: 'hash',
                fields: {
                  email_address: { type: 'string' },
                  account_id: { type: 'string' },
                  user_name: { type: 'string' },
                  name: {
                    type: {
                      type: 'hash',
                      fields: {
                        given_name: { type: 'string' },
                        surname: { type: 'string' },
                      },
                    },
                  },
                  phone_number: { type: 'string' },
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
                },
              },
            },
            apple_pay: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  token: { type: 'string' },
                  name: { type: 'string' },
                  email_address: { type: 'string' },
                  phone_number: {
                    type: {
                      type: 'hash',
                      fields: {
                        country_code: { type: 'string' },
                        national_number: { type: 'string' },
                      },
                    },
                  },
                  card: {
                    type: {
                      type: 'hash',
                      fields: {
                        name: { type: 'string' },
                        last_digits: { type: 'string' },
                        brand: { type: 'string' },
                        available_networks: {
                          type: {
                            type: 'list',
                            element_type: 'string',
                          },
                        },
                        type: { type: 'string' },
                        authentication_result: {
                          type: {
                            type: 'hash',
                            fields: {
                              liability_shift: { type: 'string' },
                              three_d_secure: {
                                type: {
                                  type: 'hash',
                                  fields: {
                                    enrollment_status: { type: 'string' },
                                    authentication_status: { type: 'string' },
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
                              address_line_1: { type: 'string' },
                              address_line_2: { type: 'string' },
                              admin_area_2: { type: 'string' },
                              admin_area_1: { type: 'string' },
                              postal_code: { type: 'string' },
                              country_code: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            google_pay: {
              type: {
                type: 'hash',
                fields: {
                  name: { type: 'string' },
                  email_address: { type: 'string' },
                  phone_number: {
                    type: {
                      type: 'hash',
                      fields: {
                        country_code: { type: 'string' },
                        national_number: { type: 'string' },
                      },
                    },
                  },
                  card: {
                    type: {
                      type: 'hash',
                      fields: {
                        name: { type: 'string' },
                        last_digits: { type: 'string' },
                        type: { type: 'string' },
                        brand: { type: 'string' },
                        billing_address: {
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
                      },
                    },
                  },
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
                      url: { type: 'string' },
                      category: { type: 'string' },
                    },
                  },
                },
              },
              shipping: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
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
                            disbursement_mode: { type: 'string' },
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
                                  paypal_fee_in_receivable_currency: {
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
                                  receivable_amount: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        currency_code: { type: 'string' },
                                        value: { type: 'string' },
                                      },
                                    },
                                  },
                                  exchange_rate: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        source_currency: { type: 'string' },
                                        target_currency: { type: 'string' },
                                        value: { type: 'string' },
                                      },
                                    },
                                  },
                                  platform_fees: {
                                    type: {
                                      type: 'list',
                                      element_type: {
                                        type: 'hash',
                                        fields: {
                                          amount: {
                                            type: {
                                              type: 'hash',
                                              fields: {
                                                currency_code: { type: 'string' },
                                                value: { type: 'string' },
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
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            invoice_id: { type: 'string' },
                            custom_id: { type: 'string' },
                            links: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    href: { type: 'string' },
                                    rel: { type: 'string' },
                                    method: { type: 'string' },
                                  },
                                },
                              },
                            },
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
                            links: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    href: { type: 'string' },
                                    rel: { type: 'string' },
                                    method: { type: 'string' },
                                  },
                                },
                              },
                            },
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
                            seller_payable_breakdown: {
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
                                  total_refunded_amount: {
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
                            links: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    href: { type: 'string' },
                                    rel: { type: 'string' },
                                    method: { type: 'string' },
                                  },
                                },
                              },
                            },
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
            phone: {
              type: {
                type: 'hash',
                fields: {
                  phone_type: { type: 'string' },
                  phone_number: {
                    type: {
                      type: 'hash',
                      fields: {
                        national_number: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            birth_date: { type: 'string' },
            tax_info: {
              type: {
                type: 'hash',
                fields: {
                  tax_id: { type: 'string' },
                  tax_id_type: { type: 'string' },
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
          },
        },
      },
      create_time: { type: 'string' },
      update_time: { type: 'string' },
      links: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default authorizeOrder;
