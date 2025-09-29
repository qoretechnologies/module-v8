import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { omit } from 'lodash';
import { PayPalTransactionTypeAllowedValues } from '../helpers/get-transaction-type-allowed-values';
import { PayPalCurrencyCodesAllowedValues } from '../helpers/get-currency.allowed-values';

const action = 'list_transactions';

const options = {
  start_date: {
    type: 'date',
    required: true,
  },
  end_date: {
    type: 'date',
    required: true,
  },
  transaction_type: {
    type: 'string',
    required: false,
    allowed_values: PayPalTransactionTypeAllowedValues,
  },
  transaction_status: {
    type: 'string',
    required: false,
    allowed_values: [
      {
        value: 'S',
        display_name: 'Success',
        desc: 'The transaction successfully completed without a denial and after any pending statuses.',
      },
      { value: 'P', display_name: 'Pending' },
      { value: 'D', display_name: 'Denied' },
      {
        value: 'V',
        display_name: 'Refunded',
        desc: 'A successful transaction was reversed and funds were refunded to the original sender.',
      },
    ],
  },
  transaction_amount: {
    type: {
      type: 'hash',
      fields: {
        from: { type: 'number', required: true },
        to: { type: 'number', required: true },
      },
    },
  },
  transaction_currency: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: PayPalCurrencyCodesAllowedValues,
  },
  payment_instrument_type: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'CREDITCARD', display_name: 'Credit Card' },
      { value: 'DEBITCARD', display_name: 'Debit Card' },
    ],
  },
  page_size: {
    type: 'integer',
    required: false,
  },
  page: {
    type: 'integer',
    required: false,
  },
} satisfies TQoreOptions;

const listTransactions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, environment, start_date, end_date } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'environment'],
      optionFields: ['start_date', 'end_date'],
      ErrorClass: PayPalError,
    });

    const {
      transaction_type,
      transaction_status,
      transaction_amount,
      page = 1,
      page_size = 100,
      payment_instrument_type,
      transaction_currency,
    } = obj || {};

    let transactionAmountFilter = undefined;

    if (transaction_amount?.from && transaction_amount?.to) {
      transactionAmountFilter = encodeURIComponent(
        `[${transaction_amount.from * 100} TO ${transaction_amount.to * 100}]`
      );
    }

    try {
      const response = await payPalApiClient<{ transaction_details: Record<string, any>[] }>({
        path: `reporting/transactions`,
        method: 'GET',
        params: {
          page,
          page_size,
          start_date,
          end_date,
          ...(transaction_type && { transaction_type }),
          ...(transaction_status && { transaction_status }),
          ...(transactionAmountFilter && { transaction_amount: transactionAmountFilter }),
          ...(transaction_currency && { transaction_currency }),
          ...(payment_instrument_type && { payment_instrument_type }),
        },
        token,
        environment,
      });

      return {
        transactions: response.transaction_details,
        ...omit(response, ['links', 'transaction_details']),
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
      transactions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              transaction_info: {
                type: {
                  type: 'hash',
                  fields: {
                    transaction_id: { type: 'string' },
                    transaction_event_code: { type: 'string' },
                    transaction_initiation_date: { type: 'string' },
                    transaction_updated_date: { type: 'string' },
                    transaction_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    fee_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    insurance_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    shipping_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    shipping_discount_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    transaction_status: { type: 'string' },
                    transaction_subject: { type: 'string' },
                    transaction_note: { type: 'string' },
                    payment_tracking_id: { type: 'string' },
                    bank_reference_id: { type: 'string' },
                    ending_balance: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    available_balance: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    invoice_id: { type: 'string' },
                    custom_field: { type: 'string' },
                    protection_eligibility: { type: 'string' },
                    protection_eligibility_type: { type: 'string' },
                    annual_percentage_rate: { type: 'string' },
                    payment_method_type: { type: 'string' },
                    instrument_type: { type: 'string' },
                    instrument_sub_type: { type: 'string' },
                  },
                },
              },
              payer_info: {
                type: {
                  type: 'hash',
                  fields: {
                    account_id: { type: 'string' },
                    email_address: { type: 'string' },
                    address_status: { type: 'string' },
                    payer_status: { type: 'string' },
                    payer_name: {
                      type: {
                        type: 'hash',
                        fields: {
                          given_name: { type: 'string' },
                          surname: { type: 'string' },
                          alternate_full_name: { type: 'string' },
                        },
                      },
                    },
                    country_code: { type: 'string' },
                    address: {
                      type: {
                        type: 'hash',
                        fields: {
                          line1: { type: 'string' },
                          line2: { type: 'string' },
                          city: { type: 'string' },
                          state: { type: 'string' },
                          country_code: { type: 'string' },
                          postal_code: { type: 'string' },
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
                  },
                },
              },
              shipping_info: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    method: { type: 'string' },
                    address: {
                      type: {
                        type: 'hash',
                        fields: {
                          line1: { type: 'string' },
                          line2: { type: 'string' },
                          city: { type: 'string' },
                          state: { type: 'string' },
                          country_code: { type: 'string' },
                          postal_code: { type: 'string' },
                        },
                      },
                    },
                    secondary_shipping_address: {
                      type: {
                        type: 'hash',
                        fields: {
                          line1: { type: 'string' },
                          line2: { type: 'string' },
                          city: { type: 'string' },
                          state: { type: 'string' },
                          country_code: { type: 'string' },
                          postal_code: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              auction_info: {
                type: {
                  type: 'hash',
                  fields: {
                    auction_site: { type: 'string' },
                    auction_item_site: { type: 'string' },
                    auction_buyer_id: { type: 'string' },
                    auction_closing_date: { type: 'string' },
                  },
                },
              },
              cart_info: {
                type: {
                  type: 'hash',
                  fields: {
                    item_details: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            item_code: { type: 'string' },
                            item_name: { type: 'string' },
                            item_description: { type: 'string' },
                            item_options: { type: 'string' },
                            item_quantity: { type: 'string' },
                            item_unit_price: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            item_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            discount_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            adjustment_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            gift_wrap_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            tax_percentage: { type: 'string' },
                            tax_amounts: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    tax_amount: {
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
                            basic_shipping_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            extra_shipping_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            handling_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            insurance_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            total_item_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            invoice_number: { type: 'string' },
                            checkout_options: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    checkout_option_name: { type: 'string' },
                                    checkout_option_value: { type: 'string' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    tax_inclusive: { type: 'boolean' },
                    paypal_invoice_id: { type: 'string' },
                  },
                },
              },
              store_info: {
                type: {
                  type: 'hash',
                  fields: {
                    store_id: { type: 'string' },
                    terminal_id: { type: 'string' },
                  },
                },
              },
              incentive_info: {
                type: {
                  type: 'hash',
                  fields: {
                    incentive_details: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            incentive_type: { type: 'string' },
                            incentive_code: { type: 'string' },
                            incentive_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            incentive_program_code: { type: 'string' },
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
      account_number: { type: 'string' },
      start_date: { type: 'string' },
      end_date: { type: 'string' },
      last_refreshed_datetime: { type: 'string' },
      page: { type: 'integer' },
      total_items: { type: 'integer' },
      total_pages: { type: 'integer' },
    },
  },
});

export default listTransactions;
