import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

export const stripeSubscriptionEventInfoType = {
  type: 'hash',
  fields: {
    object: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          object: { type: 'string' },
          application: { type: 'string' },
          application_fee_percent: { type: 'number' },
          automatic_tax: {
            type: {
              type: 'hash',
              fields: {
                disabled_reason: { type: 'string' },
                enabled: { type: 'bool' },
                liability: { type: 'string' },
              },
            },
          },
          billing_cycle_anchor: { type: 'number' },
          billing_cycle_anchor_config: { type: 'string' },
          billing_thresholds: { type: 'string' },
          cancel_at: { type: 'string' },
          cancel_at_period_end: { type: 'bool' },
          canceled_at: { type: 'number' },
          cancellation_details: {
            type: {
              type: 'hash',
              fields: {
                comment: { type: 'string' },
                feedback: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
          collection_method: { type: 'string' },
          created: { type: 'number' },
          currency: { type: 'string' },
          current_period_end: { type: 'number' },
          current_period_start: { type: 'number' },
          customer: { type: 'string' },
          days_until_due: { type: 'string' },
          default_payment_method: { type: 'string' },
          default_source: { type: 'string' },
          default_tax_rates: {
            type: {
              type: 'list',
              element_type: { type: 'string' },
            },
          },
          description: { type: 'string' },
          discount: { type: 'string' },
          discounts: {
            type: {
              type: 'list',
              element_type: { type: 'string' },
            },
          },
          ended_at: { type: 'number' },
          invoice_settings: {
            type: {
              type: 'hash',
              fields: {
                account_tax_ids: { type: 'string' },
                issuer: {
                  type: {
                    type: 'hash',
                    fields: {
                      type: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          items: {
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
                        billing_thresholds: { type: 'string' },
                        created: { type: 'number' },
                        discounts: {
                          type: {
                            type: 'list',
                            element_type: { type: 'string' },
                          },
                        },
                        metadata: {
                          type: 'hash',
                        },
                        plan: {
                          type: {
                            type: 'hash',
                            fields: {
                              id: { type: 'string' },
                              object: { type: 'string' },
                              active: { type: 'bool' },
                              aggregate_usage: { type: 'string' },
                              amount: { type: 'number' },
                              amount_decimal: { type: 'string' },
                              billing_scheme: { type: 'string' },
                              created: { type: 'number' },
                              currency: { type: 'string' },
                              interval: { type: 'string' },
                              interval_count: { type: 'number' },
                              livemode: { type: 'bool' },
                              metadata: {
                                type: 'hash',
                              },
                              meter: { type: 'string' },
                              nickname: { type: 'string' },
                              product: { type: 'string' },
                              tiers_mode: { type: 'string' },
                              transform_usage: { type: 'string' },
                              trial_period_days: { type: 'string' },
                              usage_type: { type: 'string' },
                            },
                          },
                        },
                        price: {
                          type: {
                            type: 'hash',
                            fields: {
                              id: { type: 'string' },
                              object: { type: 'string' },
                              active: { type: 'bool' },
                              billing_scheme: { type: 'string' },
                              created: { type: 'number' },
                              currency: { type: 'string' },
                              custom_unit_amount: { type: 'string' },
                              livemode: { type: 'bool' },
                              lookup_key: { type: 'string' },
                              metadata: {
                                type: 'hash',
                              },
                              nickname: { type: 'string' },
                              product: { type: 'string' },
                              recurring: {
                                type: {
                                  type: 'hash',
                                  fields: {
                                    aggregate_usage: { type: 'string' },
                                    interval: { type: 'string' },
                                    interval_count: { type: 'number' },
                                    meter: { type: 'string' },
                                    trial_period_days: { type: 'string' },
                                    usage_type: { type: 'string' },
                                  },
                                },
                              },
                              tax_behavior: { type: 'string' },
                              tiers_mode: { type: 'string' },
                              transform_quantity: { type: 'string' },
                              type: { type: 'string' },
                              unit_amount: { type: 'number' },
                              unit_amount_decimal: { type: 'string' },
                            },
                          },
                        },
                        quantity: { type: 'number' },
                        subscription: { type: 'string' },
                        tax_rates: {
                          type: {
                            type: 'list',
                            element_type: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
                has_more: { type: 'bool' },
                total_count: { type: 'number' },
                url: { type: 'string' },
              },
            },
          },
          latest_invoice: { type: 'string' },
          livemode: { type: 'bool' },
          metadata: {
            type: 'hash',
          },
          next_pending_invoice_item_invoice: { type: 'string' },
          on_behalf_of: { type: 'string' },
          pause_collection: { type: 'string' },
          payment_settings: {
            type: {
              type: 'hash',
              fields: {
                payment_method_options: { type: 'string' },
                payment_method_types: { type: 'string' },
                save_default_payment_method: { type: 'string' },
              },
            },
          },
          pending_invoice_item_interval: { type: 'string' },
          pending_setup_intent: { type: 'string' },
          pending_update: { type: 'string' },
          plan: {
            type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                object: { type: 'string' },
                active: { type: 'bool' },
                aggregate_usage: { type: 'string' },
                amount: { type: 'number' },
                amount_decimal: { type: 'string' },
                billing_scheme: { type: 'string' },
                created: { type: 'number' },
                currency: { type: 'string' },
                interval: { type: 'string' },
                interval_count: { type: 'number' },
                livemode: { type: 'bool' },
                metadata: {
                  type: 'hash',
                },
                meter: { type: 'string' },
                nickname: { type: 'string' },
                product: { type: 'string' },
                tiers_mode: { type: 'string' },
                transform_usage: { type: 'string' },
                trial_period_days: { type: 'string' },
                usage_type: { type: 'string' },
              },
            },
          },
          quantity: { type: 'number' },
          schedule: { type: 'string' },
          start_date: { type: 'number' },
          status: { type: 'string' },
          test_clock: { type: 'string' },
          transfer_data: { type: 'string' },
          trial_end: { type: 'string' },
          trial_settings: {
            type: {
              type: 'hash',
              fields: {
                end_behavior: {
                  type: {
                    type: 'hash',
                    fields: {
                      missing_payment_method: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          trial_start: { type: 'string' },
        },
      },
    },
    previous_attributes: { type: 'string' },
  },
} satisfies TQoreTypeObject;
