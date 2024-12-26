import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { TStripeEventType } from './constants';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['invoice.payment_failed'] satisfies TStripeEventType[];

export default {
  action: 'invoice_payment_failed',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    secretKey: {
      required: true,
      type: 'string',
      sensitive: true,
    },
  },
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Invoice payment failed event data',
    type: {
      type: 'hash',
      fields: {
        object: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              object: { type: 'string' },
              account_country: { type: 'string' },
              account_name: { type: 'string' },
              account_tax_ids: {
                type: 'hash',
              },
              amount_due: { type: 'number' },
              amount_paid: { type: 'number' },
              amount_remaining: { type: 'number' },
              amount_shipping: { type: 'number' },
              application: { type: 'string' },
              application_fee_amount: { type: 'string' },
              attempt_count: { type: 'number' },
              attempted: { type: 'boolean' },
              auto_advance: { type: 'boolean' },
              automatic_tax: {
                type: {
                  type: 'hash',
                  fields: {
                    disabled_reason: { type: 'string' },
                    enabled: { type: 'boolean' },
                    liability: { type: 'string' },
                    status: { type: 'string' },
                  },
                },
              },
              automatically_finalizes_at: { type: 'string' },
              billing_reason: { type: 'string' },
              charge: { type: 'string' },
              collection_method: { type: 'string' },
              created: { type: 'number' },
              currency: { type: 'string' },
              custom_fields: {
                type: 'hash',
              },
              customer: { type: 'string' },
              customer_address: {
                type: 'hash',
              },
              customer_email: { type: 'string' },
              customer_name: { type: 'string' },
              customer_phone: { type: 'string' },
              customer_shipping: {
                type: 'hash',
              },
              customer_tax_exempt: { type: 'string' },
              customer_tax_ids: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              default_payment_method: {
                type: 'hash',
              },
              default_source: { type: 'string' },
              default_tax_rates: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              description: { type: 'string' },
              discount: {
                type: 'hash',
              },
              discounts: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              due_date: { type: 'string' },
              effective_at: { type: 'number' },
              ending_balance: { type: 'number' },
              footer: { type: 'string' },
              from_invoice: {
                type: 'hash',
              },
              hosted_invoice_url: { type: 'string' },
              invoice_pdf: { type: 'string' },
              issuer: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                  },
                },
              },
              last_finalization_error: {
                type: 'hash',
              },
              latest_revision: {
                type: 'hash',
              },
              lines: {
                type: {
                  type: 'hash',
                  fields: {
                    object: { type: 'string' },
                    data: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            object: { type: 'string' },
                            amount: { type: 'number' },
                            amount_excluding_tax: { type: 'number' },
                            currency: { type: 'string' },
                            description: { type: 'string' },
                            discount_amounts: {
                              type: {
                                type: 'list',
                                element_type: { type: 'string' },
                              },
                            },
                            discountable: { type: 'boolean' },
                            discounts: {
                              type: {
                                type: 'list',
                                element_type: { type: 'string' },
                              },
                            },
                            invoice: { type: 'string' },
                            invoice_item: { type: 'string' },
                            livemode: { type: 'boolean' },
                            metadata: {
                              type: 'hash',
                            },
                            period: {
                              type: {
                                type: 'hash',
                                fields: {
                                  end: { type: 'number' },
                                  start: { type: 'number' },
                                },
                              },
                            },
                            plan: { type: 'string' },
                            pretax_credit_amounts: {
                              type: {
                                type: 'list',
                                element_type: { type: 'string' },
                              },
                            },
                            price: {
                              type: {
                                type: 'hash',
                                fields: {
                                  id: { type: 'string' },
                                  object: { type: 'string' },
                                  active: { type: 'boolean' },
                                  billing_scheme: { type: 'string' },
                                  created: { type: 'number' },
                                  currency: { type: 'string' },
                                  custom_unit_amount: { type: 'string' },
                                  livemode: { type: 'boolean' },
                                  lookup_key: { type: 'string' },
                                  metadata: {
                                    type: 'hash',
                                  },
                                  nickname: { type: 'string' },
                                  product: { type: 'string' },
                                  recurring: { type: 'string' },
                                  tax_behavior: { type: 'string' },
                                  tiers_mode: { type: 'string' },
                                  transform_quantity: { type: 'string' },
                                  type: { type: 'string' },
                                  unit_amount: { type: 'number' },
                                  unit_amount_decimal: { type: 'string' },
                                },
                              },
                            },
                            proration: { type: 'boolean' },
                            proration_details: {
                              type: {
                                type: 'hash',
                                fields: {
                                  credited_items: { type: 'string' },
                                },
                              },
                            },
                            quantity: { type: 'number' },
                            subscription: { type: 'string' },
                            tax_amounts: {
                              type: {
                                type: 'list',
                                element_type: { type: 'string' },
                              },
                            },
                            tax_rates: {
                              type: {
                                type: 'list',
                                element_type: { type: 'string' },
                              },
                            },
                            type: { type: 'string' },
                            unit_amount_excluding_tax: { type: 'string' },
                          },
                        },
                      },
                    },
                    has_more: { type: 'boolean' },
                    total_count: { type: 'number' },
                    url: { type: 'string' },
                  },
                },
              },
              livemode: { type: 'boolean' },
              metadata: {
                type: 'hash',
              },
              next_payment_attempt: { type: 'string' },
              number: { type: 'string' },
              on_behalf_of: { type: 'string' },
              paid: { type: 'boolean' },
              paid_out_of_band: { type: 'boolean' },
              payment_intent: { type: 'string' },
              payment_settings: {
                type: {
                  type: 'hash',
                  fields: {
                    default_mandate: { type: 'string' },
                    payment_method_options: { type: 'hash' },
                    payment_method_types: { type: 'hash' },
                  },
                },
              },
              period_end: { type: 'number' },
              period_start: { type: 'number' },
              post_payment_credit_notes_amount: { type: 'number' },
              pre_payment_credit_notes_amount: { type: 'number' },
              quote: {
                type: 'hash',
              },
              receipt_number: { type: 'string' },
              rendering: {
                type: {
                  type: 'hash',
                  fields: {
                    amount_tax_display: { type: 'string' },
                    pdf: {
                      type: {
                        type: 'hash',
                        fields: {
                          page_size: { type: 'string' },
                        },
                      },
                    },
                    template: { type: 'string' },
                    template_version: { type: 'string' },
                  },
                },
              },
              shipping_cost: {
                type: 'hash',
              },
              shipping_details: {
                type: 'hash',
              },
              starting_balance: { type: 'number' },
              statement_descriptor: { type: 'string' },
              status: { type: 'string' },
              status_transitions: {
                type: {
                  type: 'hash',
                  fields: {
                    finalized_at: { type: 'number' },
                    marked_uncollectible_at: { type: 'string' },
                    paid_at: { type: 'string' },
                    voided_at: { type: 'string' },
                  },
                },
              },
              subscription: { type: 'string' },
              subscription_details: {
                type: 'hash',
              },
              subtotal: { type: 'number' },
              subtotal_excluding_tax: { type: 'number' },
              tax: { type: 'string' },
              test_clock: {
                type: 'hash',
              },
              total: { type: 'number' },
              total_discount_amounts: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              total_excluding_tax: { type: 'number' },
              total_pretax_credit_amounts: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              total_tax_amounts: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              transfer_data: {
                type: 'hash',
              },
              webhooks_delivered_at: { type: 'number' },
            },
          },
        },
        previous_attributes: { type: 'string' },
      },
    },
  },
} satisfies TQorePartialEventAction;
