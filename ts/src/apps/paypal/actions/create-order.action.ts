import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { PayPalCurrencyCodesAllowedValues } from '../helpers/get-currency.allowed-values';

const action = 'create_order';

const options = {
  intent: {
    type: 'string',
    required: true,
    default_value: 'CAPTURE',
    allowed_values: [
      {
        value: 'CAPTURE',
        display_name: 'Capture',
        desc: 'The merchant intends to capture payment immediately after the customer makes a payment.',
      },
      {
        value: 'AUTHORIZE',
        display_name: 'Authorize',
        desc: 'The merchant intends to authorize a payment and place funds on hold after the customer makes a payment. Authorized payments are best captured within three days but are available to capture for up to 29 days.',
      },
    ],
  },
  currency_code: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    allowed_values: PayPalCurrencyCodesAllowedValues,
  },
  total_amount: {
    type: 'string',
    required: true,
  },
  item_total: {
    type: 'string',
    required: false,
  },
  shipping_amount: {
    type: 'string',
    required: false,
  },
  handling_amount: {
    type: 'string',
    required: false,
  },
  tax_total: {
    type: 'string',
    required: false,
  },
  insurance_amount: {
    type: 'string',
    required: false,
  },
  shipping_discount: {
    type: 'string',
    required: false,
  },
  discount_amount: {
    type: 'string',
    required: false,
  },
  payee_email: {
    type: 'string',
    required: false,
  },
  payee_merchant_id: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'string',
    required: false,
  },
  custom_id: {
    type: 'string',
    required: false,
  },
  invoice_id: {
    type: 'string',
    required: false,
  },
  soft_descriptor: {
    type: 'string',
    required: false,
  },
  items: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            required: true,
          },
          quantity: {
            type: 'string',
            required: true,
          },
          unit_price: {
            type: 'string',
            required: true,
          },
          description: {
            type: 'string',
            required: false,
          },
          sku: {
            type: 'string',
            required: false,
          },
          url: {
            type: 'string',
            required: false,
          },
          category: {
            type: 'string',
            required: false,
            display_name: 'Category',
            allowed_values: [
              { value: 'DIGITAL_GOODS', display_name: 'Digital Goods' },
              { value: 'PHYSICAL_GOODS', display_name: 'Physical Goods' },
              { value: 'DONATION', display_name: 'Donation' },
            ],
          },
          tax_amount: {
            type: 'string',
            required: false,
          },
        },
      },
    },
    required: false,
  },
  shipping_type: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'SHIPPING', display_name: 'Shipping' },
      { value: 'PICKUP_IN_PERSON', display_name: 'Pickup in Person' },
    ],
  },
  shipping_name: {
    type: 'string',
    required: false,
  },
  shipping_address_line_1: {
    type: 'string',
    required: false,
  },
  shipping_address_line_2: {
    type: 'string',
    required: false,
  },
  shipping_city: {
    type: 'string',
    required: false,
  },
  shipping_state: {
    type: 'string',
    required: false,
  },
  shipping_postal_code: {
    type: 'string',
    required: false,
  },
  shipping_country_code: {
    type: 'string',
    required: false,
  },
  platform_fees: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          fee_amount: {
            type: 'string',
            required: true,
          },
          payee_email: {
            type: 'string',
            required: false,
          },
          payee_merchant_id: {
            type: 'string',
            required: false,
          },
        },
      },
    },
    required: false,
  },
  disbursement_mode: {
    type: 'string',
    required: false,
    default_value: 'INSTANT',
    allowed_values: [
      { value: 'INSTANT', display_name: 'Instant' },
      { value: 'DELAYED', display_name: 'Delayed' },
    ],
  },
  return_url: {
    type: 'string',
    required: false,
  },
  cancel_url: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createOrder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, environment, intent, currency_code, total_amount } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token', 'environment'],
        optionFields: ['intent', 'currency_code', 'total_amount'],
        ErrorClass: PayPalError,
      });

    try {
      const breakdown: Record<string, any> = {};

      if (obj?.item_total) {
        breakdown.item_total = {
          currency_code,
          value: obj?.item_total,
        };
      }

      if (obj?.shipping_amount) {
        breakdown.shipping = {
          currency_code,
          value: obj?.shipping_amount,
        };
      }

      if (obj?.handling_amount) {
        breakdown.handling = {
          currency_code,
          value: obj?.handling_amount,
        };
      }

      if (obj?.tax_total) {
        breakdown.tax_total = {
          currency_code,
          value: obj?.tax_total,
        };
      }

      if (obj?.insurance_amount) {
        breakdown.insurance = {
          currency_code,
          value: obj?.insurance_amount,
        };
      }

      if (obj?.shipping_discount) {
        breakdown.shipping_discount = {
          currency_code,
          value: obj?.shipping_discount,
        };
      }

      if (obj?.discount_amount) {
        breakdown.discount = {
          currency_code,
          value: obj?.discount_amount,
        };
      }

      const purchase_unit: any = {
        amount: {
          currency_code,
          value: total_amount,
          ...(Object.keys(breakdown).length > 0 && { breakdown }),
        },
        ...(obj?.description && { description: obj?.description }),
        ...(obj?.custom_id && { custom_id: obj?.custom_id }),
        ...(obj?.invoice_id && { invoice_id: obj?.invoice_id }),
        ...(obj?.soft_descriptor && { soft_descriptor: obj?.soft_descriptor }),
      };

      if (obj?.payee_email || obj?.payee_merchant_id) {
        purchase_unit.payee = {
          ...(obj?.payee_email && { email_address: obj?.payee_email }),
          ...(obj?.payee_merchant_id && { merchant_id: obj?.payee_merchant_id }),
        };
      }

      if (obj?.platform_fees && obj?.platform_fees.length > 0) {
        purchase_unit.payment_instruction = {
          platform_fees: obj?.platform_fees.map((fee: any) => ({
            amount: {
              currency_code,
              value: fee.fee_amount,
            },
            ...(fee.payee_email || fee.payee_merchant_id
              ? {
                  payee: {
                    ...(fee.payee_email && { email_address: fee.payee_email }),
                    ...(fee.payee_merchant_id && { merchant_id: fee.payee_merchant_id }),
                  },
                }
              : {}),
          })),
          ...(obj?.disbursement_mode && { disbursement_mode: obj?.disbursement_mode }),
        };
      }

      if (obj?.items && obj?.items.length > 0) {
        purchase_unit.items = obj?.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unit_amount: {
            currency_code,
            value: item.unit_price,
          },
          ...(item.description && { description: item.description }),
          ...(item.sku && { sku: item.sku }),
          ...(item.url && { url: item.url }),
          ...(item.category && { category: item.category }),
          ...(item.tax_amount && {
            tax: {
              currency_code,
              value: item.tax_amount,
            },
          }),
        }));
      }

      if (obj?.shipping_name || obj?.shipping_address_line_1 || obj?.shipping_type) {
        purchase_unit.shipping = {
          ...(obj?.shipping_type && { type: obj?.shipping_type }),
          ...(obj?.shipping_name && { name: { full_name: obj?.shipping_name } }),
        };

        if (obj?.shipping_address_line_1 || obj?.shipping_country_code) {
          purchase_unit.shipping.address = {
            ...(obj?.shipping_address_line_1 && { address_line_1: obj?.shipping_address_line_1 }),
            ...(obj?.shipping_address_line_2 && { address_line_2: obj?.shipping_address_line_2 }),
            ...(obj?.shipping_city && { admin_area_2: obj?.shipping_city }),
            ...(obj?.shipping_state && { admin_area_1: obj?.shipping_state }),
            ...(obj?.shipping_postal_code && { postal_code: obj?.shipping_postal_code }),
            ...(obj?.shipping_country_code && { country_code: obj?.shipping_country_code }),
          };
        }
      }

      if (Object.keys(breakdown).length > 0) {
        const breakdownSum = [
          obj?.item_total,
          obj?.shipping_amount,
          obj?.handling_amount,
          obj?.tax_total,
          obj?.insurance_amount,
        ].reduce((sum, val) => sum + parseFloat(val || '0'), 0);

        const discounts = [obj?.shipping_discount, obj?.discount_amount].reduce(
          (sum, val) => sum + parseFloat(val || '0'),
          0
        );

        const calculatedTotal = breakdownSum - discounts;

        if (Math.abs(calculatedTotal - parseFloat(total_amount)) > 0.01) {
          throw new PayPalError(
            `Amount breakdown doesn't match total. Expected ${total_amount}, got ${calculatedTotal.toFixed(2)}`
          );
        }
      }

      let application_context = undefined;

      if (obj?.return_url || obj?.cancel_url) {
        application_context = {
          ...(obj?.return_url && { return_url: obj?.return_url }),
          ...(obj?.cancel_url && { cancel_url: obj?.cancel_url }),
        };
      }

      const orderData = {
        intent,
        purchase_units: [purchase_unit],
        ...(application_context && { application_context }),
      };

      const response = await payPalApiClient<{
        id: string;
      }>({
        path: 'v2/checkout/orders',
        method: 'POST',
        body: orderData,
        token,
        environment,
      });

      const orderId = response.id;

      const order = await payPalApiClient<Record<string, any>>({
        path: `v2/checkout/orders/${orderId}`,
        environment,
        token,
      });

      return {
        ...omit(order, ['links']),
        approve_url: order.links.find((l: any) => l.rel === 'approve')?.href,
        capture_url: order.links.find((l: any) => l.rel === 'capture')?.href,
        authorize_url: order.links.find((l: any) => l.rel === 'authorize')?.href,
      };
    } catch (error) {
      throw new PayPalError(`Failed to ${humanizeNameTitle(action)}: ${getPayPalErrorMessage(error)}`);
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

export default createOrder;
