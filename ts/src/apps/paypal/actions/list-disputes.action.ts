import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { PayPalDisputeStatusAllowedValues } from '../helpers/get-dispute-status-allowed-values';

const action = 'list_disputes';

const options = {
  start_time: {
    type: 'date',
    required: false,
  },
  disputed_transaction_id: {
    type: 'string',
    required: false,
  },
  dispute_states: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    element_allowed_values: PayPalDisputeStatusAllowedValues,
  },
  page_size: {
    type: 'integer',
    required: false,
  },
  next_page_token: {
    type: 'string',
    required: false,
  },
  update_time_before: {
    type: 'date',
    required: false,
  },
  update_time_after: {
    type: 'date',
    required: false,
  },
} satisfies TQoreOptions;

const listDisputes = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, environment } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'environment'],
      ErrorClass: PayPalError,
    });

    const {
      dispute_states,
      start_time,
      disputed_transaction_id,
      update_time_before,
      update_time_after,
      page_size = 10,
      next_page_token,
    } = obj || {};

    try {
      const response = await payPalApiClient<{
        items: Record<string, any>[];
        links: Record<string, any>[];
      }>({
        path: `customer/disputes`,
        method: 'GET',
        params: {
          page_size,
          ...(dispute_states && { dispute_state: dispute_states.join(',') }),
          ...(start_time && { start_time }),
          ...(disputed_transaction_id && { disputed_transaction_id }),
          ...(update_time_before && { update_time_before }),
          ...(update_time_after && { update_time_after }),
          ...(next_page_token && { next_page_token }),
        },
        token,
        environment,
      });

      return {
        disputes: response.items,
        next_page_token: response.links.find((link) => link.rel === 'next')?.href || null,
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
      disputes: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              dispute_id: { type: 'string' },
              create_time: { type: 'string' },
              update_time: { type: 'string' },
              reason: { type: 'string' },
              status: { type: 'string' },
              dispute_state: { type: 'string' },
              dispute_life_cycle_stage: { type: 'string' },
              dispute_channel: { type: 'string' },
              dispute_amount: {
                type: {
                  type: 'hash',
                  fields: {
                    currency_code: { type: 'string' },
                    value: { type: 'string' },
                  },
                },
              },
              disputed_transactions: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      seller_transaction_id: { type: 'string' },
                      buyer_transaction_id: { type: 'string' },
                      create_time: { type: 'string' },
                      transaction_status: { type: 'string' },
                      gross_amount: {
                        type: {
                          type: 'hash',
                          fields: {
                            currency_code: { type: 'string' },
                            value: { type: 'string' },
                          },
                        },
                      },
                      invoice_number: { type: 'string' },
                      custom: { type: 'string' },
                      buyer: {
                        type: {
                          type: 'hash',
                          fields: {
                            name: { type: 'string' },
                          },
                        },
                      },
                      seller: {
                        type: {
                          type: 'hash',
                          fields: {
                            email: { type: 'string' },
                            merchant_id: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      },
                      items: {
                        type: {
                          type: 'list',
                          element_type: {
                            type: 'hash',
                            fields: {
                              item_name: { type: 'string' },
                              item_id: { type: 'string' },
                              item_type: { type: 'string' },
                              partner_transaction_id: { type: 'string' },
                              reason: { type: 'string' },
                              dispute_amount: {
                                type: {
                                  type: 'hash',
                                  fields: {
                                    currency_code: { type: 'string' },
                                    value: { type: 'string' },
                                  },
                                },
                              },
                              notes: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              reason_details: {
                type: {
                  type: 'hash',
                  fields: {
                    duplicate_transaction_id: { type: 'string' },
                    expected_refund_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    duplicate_transaction: {
                      type: {
                        type: 'hash',
                        fields: {
                          duplicate_transaction_id: { type: 'string' },
                          duplicate_transaction_time: { type: 'string' },
                        },
                      },
                    },
                    credit_not_processed: {
                      type: {
                        type: 'hash',
                        fields: {
                          expected_refund_amount: {
                            type: {
                              type: 'hash',
                              fields: {
                                currency_code: { type: 'string' },
                                value: { type: 'string' },
                              },
                            },
                          },
                          credit_transaction_id: { type: 'string' },
                        },
                      },
                    },
                    cancelled_recurring_billing: {
                      type: {
                        type: 'hash',
                        fields: {
                          cancellation_date: { type: 'string' },
                          cancelled_recurring_billing_reason: { type: 'string' },
                        },
                      },
                    },
                    product_or_service_details: {
                      type: {
                        type: 'hash',
                        fields: {
                          sub_reason: { type: 'string' },
                          purchase_url: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              dispute_outcome: {
                type: {
                  type: 'hash',
                  fields: {
                    outcome_code: { type: 'string' },
                    outcome_reason: { type: 'string' },
                    amount_refunded: {
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
              messages: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      posted_by: { type: 'string' },
                      time_posted: { type: 'string' },
                      content: { type: 'string' },
                      documents: {
                        type: {
                          type: 'list',
                          element_type: {
                            type: 'hash',
                            fields: {
                              name: { type: 'string' },
                              url: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              evidence: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      evidence_type: { type: 'string' },
                      evidence_info: {
                        type: {
                          type: 'hash',
                          fields: {
                            tracking_info: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    carrier_name: { type: 'string' },
                                    carrier_name_other: { type: 'string' },
                                    tracking_number: { type: 'string' },
                                    tracking_url: { type: 'string' },
                                  },
                                },
                              },
                            },
                            refund_ids: {
                              type: {
                                type: 'list',
                                element_type: 'string',
                              },
                            },
                            return_policy_details: {
                              type: {
                                type: 'hash',
                                fields: {
                                  return_policy_type: { type: 'string' },
                                  return_method: { type: 'string' },
                                  return_policy_days: { type: 'integer' },
                                  return_policy_description: { type: 'string' },
                                },
                              },
                            },
                            item_details: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    item_name: { type: 'string' },
                                    item_description: { type: 'string' },
                                    partner_transaction_id: { type: 'string' },
                                    item_type: { type: 'string' },
                                    item_quantity: { type: 'string' },
                                    dispute_amount: {
                                      type: {
                                        type: 'hash',
                                        fields: {
                                          currency_code: { type: 'string' },
                                          value: { type: 'string' },
                                        },
                                      },
                                    },
                                    notes: { type: 'string' },
                                    partner_transaction_status: { type: 'string' },
                                  },
                                },
                              },
                            },
                            service_details: {
                              type: {
                                type: 'hash',
                                fields: {
                                  service_started: { type: 'string' },
                                  note: { type: 'string' },
                                  service_description: { type: 'string' },
                                },
                              },
                            },
                            cancel_details: {
                              type: {
                                type: 'hash',
                                fields: {
                                  cancelled_time: { type: 'string' },
                                  cancellation_number: { type: 'string' },
                                  cancelled_reason: { type: 'string' },
                                  cancelled_via: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                      source: { type: 'string' },
                      notes: { type: 'string' },
                      documents: {
                        type: {
                          type: 'list',
                          element_type: {
                            type: 'hash',
                            fields: {
                              name: { type: 'string' },
                              url: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              life_cycle_stage_history: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      stage: { type: 'string' },
                      actor: { type: 'string' },
                      create_time: { type: 'string' },
                    },
                  },
                },
              },
              offer: {
                type: {
                  type: 'hash',
                  fields: {
                    buyer_requested_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    seller_offered_amount: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    offer_type: { type: 'string' },
                    offer_time: { type: 'string' },
                    history: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            offer_time: { type: 'string' },
                            actor: { type: 'string' },
                            event_type: { type: 'string' },
                            offer_type: { type: 'string' },
                            offer_amount: {
                              type: {
                                type: 'hash',
                                fields: {
                                  currency_code: { type: 'string' },
                                  value: { type: 'string' },
                                },
                              },
                            },
                            note: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              communication_details: {
                type: {
                  type: 'hash',
                  fields: {
                    merchant_contacted: { type: 'boolean' },
                    merchant_contacted_outcome: { type: 'string' },
                    merchant_contacted_time: { type: 'string' },
                    merchant_contacted_mode: { type: 'string' },
                    buyer_contacted_time: { type: 'string' },
                  },
                },
              },
              partner_actions: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      type: { type: 'string' },
                    },
                  },
                },
              },
              platform_type: { type: 'string' },
              acknowledgement_details: {
                type: {
                  type: 'hash',
                  fields: {
                    acknowledgement_type: { type: 'string' },
                    acknowledgement_time: { type: 'string' },
                    note: { type: 'string' },
                  },
                },
              },
              external_reason_code: { type: 'string' },
              seller_response_due_date: { type: 'string' },
              buyer_response_due_date: { type: 'string' },
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
        },
      },
      next_page_token: { type: 'string' },
    },
  },
});

export default listDisputes;
