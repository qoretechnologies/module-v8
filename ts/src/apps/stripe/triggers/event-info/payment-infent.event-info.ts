import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

export const stripePaymentIntentEventInfoType = {
  type: 'hash',
  fields: {
    object: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          object: { type: 'string' },
          amount: { type: 'number' },
          amount_capturable: { type: 'number' },
          amount_details: {
            type: {
              type: 'hash',
              fields: {
                tip: {
                  type: 'hash',
                },
              },
            },
          },
          amount_received: { type: 'number' },
          application: { type: 'string' },
          application_fee_amount: { type: 'string' },
          automatic_payment_methods: { type: 'string' },
          canceled_at: { type: 'string' },
          cancellation_reason: { type: 'string' },
          capture_method: { type: 'string' },
          client_secret: { type: 'string' },
          confirmation_method: { type: 'string' },
          created: { type: 'number' },
          currency: { type: 'string' },
          customer: { type: 'string' },
          description: { type: 'string' },
          invoice: { type: 'string' },
          last_payment_error: {
            type: {
              type: 'hash',
              fields: {
                advice_code: { type: 'string' },
                charge: { type: 'string' },
                code: { type: 'string' },
                decline_code: { type: 'string' },
                doc_url: { type: 'string' },
                message: { type: 'string' },
                payment_method: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      object: { type: 'string' },
                      allow_redisplay: { type: 'string' },
                      billing_details: {
                        type: {
                          type: 'hash',
                          fields: {
                            address: {
                              type: {
                                type: 'hash',
                                fields: {
                                  city: { type: 'string' },
                                  country: { type: 'string' },
                                  line1: { type: 'string' },
                                  line2: { type: 'string' },
                                  postal_code: { type: 'string' },
                                  state: { type: 'string' },
                                },
                              },
                            },
                            email: { type: 'string' },
                            name: { type: 'string' },
                            phone: { type: 'string' },
                          },
                        },
                      },
                      card: {
                        type: {
                          type: 'hash',
                          fields: {
                            brand: { type: 'string' },
                            checks: {
                              type: {
                                type: 'hash',
                                fields: {
                                  address_line1_check: { type: 'string' },
                                  address_postal_code_check: { type: 'string' },
                                  cvc_check: { type: 'string' },
                                },
                              },
                            },
                            country: { type: 'string' },
                            display_brand: { type: 'string' },
                            exp_month: { type: 'number' },
                            exp_year: { type: 'number' },
                            fingerprint: { type: 'string' },
                            funding: { type: 'string' },
                            generated_from: { type: 'string' },
                            last4: { type: 'string' },
                            networks: {
                              type: {
                                type: 'hash',
                                fields: {
                                  available: {
                                    type: {
                                      type: 'list',
                                      element_type: { type: 'string' },
                                    },
                                  },
                                  preferred: { type: 'string' },
                                },
                              },
                            },
                            regulated_status: { type: 'string' },
                            three_d_secure_usage: {
                              type: {
                                type: 'hash',
                                fields: {
                                  supported: { type: 'boolean' },
                                },
                              },
                            },
                            wallet: { type: 'string' },
                          },
                        },
                      },
                      created: { type: 'number' },
                      customer: { type: 'string' },
                      livemode: { type: 'boolean' },
                      metadata: {
                        type: 'hash',
                      },
                      type: { type: 'string' },
                    },
                  },
                },
                type: { type: 'string' },
              },
            },
          },
          latest_charge: { type: 'string' },
          livemode: { type: 'boolean' },
          metadata: {
            type: 'hash',
          },
          next_action: { type: 'string' },
          on_behalf_of: { type: 'string' },
          payment_method: { type: 'string' },
          payment_method_configuration_details: { type: 'string' },
          payment_method_options: {
            type: {
              type: 'hash',
              fields: {
                card: {
                  type: {
                    type: 'hash',
                    fields: {
                      installments: { type: 'string' },
                      mandate_options: { type: 'string' },
                      network: { type: 'string' },
                      request_three_d_secure: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          payment_method_types: {
            type: {
              type: 'list',
              element_type: { type: 'string' },
            },
          },
          processing: { type: 'string' },
          receipt_email: { type: 'string' },
          review: { type: 'string' },
          setup_future_usage: { type: 'string' },
          shipping: { type: 'string' },
          source: { type: 'string' },
          statement_descriptor: { type: 'string' },
          statement_descriptor_suffix: { type: 'string' },
          status: { type: 'string' },
          transfer_data: { type: 'string' },
          transfer_group: { type: 'string' },
        },
      },
    },
    previous_attributes: { type: 'string' },
  },
} satisfies TQoreTypeObject;
