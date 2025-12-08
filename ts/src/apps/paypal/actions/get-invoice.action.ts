import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { PAYPAL_APP_NAME, PayPalError, getPayPalErrorMessage } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { getPayPalInvoiceAllowedValues } from '../helpers/get-invoice-id-allowed-values';

const action = 'get_invoice';

const options = {
  invoice_id: {
    type: 'string',
    get_allowed_values: getPayPalInvoiceAllowedValues,
    allowed_values_creatable: true,
    required: true,
  },
} satisfies TQoreOptions;

const getInvoice = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, environment, invoice_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'environment'],
      optionFields: ['invoice_id'],
      ErrorClass: PayPalError,
    });

    try {
      const invoice = await payPalApiClient<Record<string, any>>({
        path: `v2/invoicing/invoices/${invoice_id}`,
        environment,
        token,
      });

      return omit(invoice, ['links']);
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
      status: { type: 'string' },
      detail: {
        type: {
          type: 'hash',
          fields: {
            invoice_number: { type: 'string' },
            reference: { type: 'string' },
            invoice_date: { type: 'string' },
            currency_code: { type: 'string' },
            note: { type: 'string' },
            term: { type: 'string' },
            memo: { type: 'string' },
            payment_term: {
              type: {
                type: 'hash',
                fields: {
                  term_type: { type: 'string' },
                  due_date: { type: 'string' },
                },
              },
            },
            metadata: {
              type: {
                type: 'hash',
                fields: {
                  create_time: { type: 'string' },
                  recipient_view_url: { type: 'string' },
                  invoicer_view_url: { type: 'string' },
                },
              },
            },
          },
        },
      },
      invoicer: {
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
            email_address: { type: 'string' },
            phones: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    country_code: { type: 'string' },
                    national_number: { type: 'string' },
                    phone_type: { type: 'string' },
                  },
                },
              },
            },
            website: { type: 'string' },
            tax_id: { type: 'string' },
            additional_notes: { type: 'string' },
          },
        },
      },
      primary_recipients: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              billing_info: {
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
                    address: {
                      type: {
                        type: 'hash',
                        fields: {
                          address_line_1: { type: 'string' },
                          admin_area_2: { type: 'string' },
                          admin_area_1: { type: 'string' },
                          postal_code: { type: 'string' },
                          country_code: { type: 'string' },
                        },
                      },
                    },
                    email_address: { type: 'string' },
                    phones: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            country_code: { type: 'string' },
                            national_number: { type: 'string' },
                            phone_type: { type: 'string' },
                          },
                        },
                      },
                    },
                    additional_info_value: { type: 'string' },
                  },
                },
              },
              shipping_info: {
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
                    address: {
                      type: {
                        type: 'hash',
                        fields: {
                          address_line_1: { type: 'string' },
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
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'string' },
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
                    name: { type: 'string' },
                    percent: { type: 'string' },
                    tax_note: { type: 'string' },
                    amount: {
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
              discount: {
                type: {
                  type: 'hash',
                  fields: {
                    percent: { type: 'string' },
                    amount: {
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
              unit_of_measure: { type: 'string' },
            },
          },
        },
      },
      configuration: {
        type: {
          type: 'hash',
          fields: {
            partial_payment: {
              type: {
                type: 'hash',
                fields: {
                  allow_partial_payment: { type: 'bool' },
                  minimum_amount_due: {
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
            allow_tip: { type: 'bool' },
            tax_calculated_after_discount: { type: 'bool' },
            tax_inclusive: { type: 'bool' },
            template_id: { type: 'string' },
          },
        },
      },
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
                  custom: {
                    type: {
                      type: 'hash',
                      fields: {
                        label: { type: 'string' },
                        amount: {
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
                  shipping: {
                    type: {
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
                        tax: {
                          type: {
                            type: 'hash',
                            fields: {
                              name: { type: 'string' },
                              percent: { type: 'string' },
                              amount: {
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
                  discount: {
                    type: {
                      type: 'hash',
                      fields: {
                        item_discount: {
                          type: {
                            type: 'hash',
                            fields: {
                              currency_code: { type: 'string' },
                              value: { type: 'string' },
                            },
                          },
                        },
                        invoice_discount: {
                          type: {
                            type: 'hash',
                            fields: {
                              percent: { type: 'string' },
                              amount: {
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
                  tax_total: {
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
      due_amount: {
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
});

export default getInvoice;
