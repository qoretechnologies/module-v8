import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

export const chargeEventInfoType = {
  type: 'hash',
  fields: {
    object: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          object: { type: 'string' },
          amount: { type: 'number' },
          amount_captured: { type: 'number' },
          amount_refunded: { type: 'number' },
          application: { type: 'string' },
          application_fee: { type: 'string' },
          application_fee_amount: { type: 'string' },
          balance_transaction: { type: 'string' },
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
          calculated_statement_descriptor: { type: 'string' },
          captured: { type: 'bool' },
          created: { type: 'number' },
          currency: { type: 'string' },
          customer: { type: 'string' },
          description: { type: 'string' },
          destination: { type: 'string' },
          dispute: { type: 'string' },
          disputed: { type: 'bool' },
          failure_balance_transaction: { type: 'string' },
          failure_code: { type: 'string' },
          failure_message: { type: 'string' },
          fraud_details: {
            type: 'hash',
          },
          invoice: { type: 'string' },
          livemode: { type: 'bool' },
          metadata: {
            type: 'hash',
          },
          on_behalf_of: { type: 'string' },
          order: { type: 'string' },
          outcome: {
            type: {
              type: 'hash',
              fields: {
                advice_code: { type: 'string' },
                network_advice_code: { type: 'string' },
                network_decline_code: { type: 'string' },
                network_status: { type: 'string' },
                reason: { type: 'string' },
                risk_level: { type: 'string' },
                risk_score: { type: 'number' },
                seller_message: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
          paid: { type: 'bool' },
          payment_intent: { type: 'string' },
          payment_method: { type: 'string' },
          payment_method_details: {
            type: {
              type: 'hash',
              fields: {
                card: {
                  type: {
                    type: 'hash',
                    fields: {
                      amount_authorized: { type: 'number' },
                      authorization_code: { type: 'string' },
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
                      exp_month: { type: 'number' },
                      exp_year: { type: 'number' },
                      extended_authorization: {
                        type: {
                          type: 'hash',
                          fields: {
                            status: { type: 'string' },
                          },
                        },
                      },
                      fingerprint: { type: 'string' },
                      funding: { type: 'string' },
                      incremental_authorization: {
                        type: {
                          type: 'hash',
                          fields: {
                            status: { type: 'string' },
                          },
                        },
                      },
                      installments: {
                        type: 'hash',
                      },
                      last4: { type: 'string' },
                      mandate: {
                        type: 'hash',
                      },
                      multicapture: {
                        type: {
                          type: 'hash',
                          fields: {
                            status: { type: 'string' },
                          },
                        },
                      },
                      network: { type: 'string' },
                      network_token: {
                        type: {
                          type: 'hash',
                          fields: {
                            used: { type: 'bool' },
                          },
                        },
                      },
                      network_transaction_id: { type: 'string' },
                      overcapture: {
                        type: {
                          type: 'hash',
                          fields: {
                            maximum_amount_capturable: { type: 'number' },
                            status: { type: 'string' },
                          },
                        },
                      },
                      regulated_status: { type: 'string' },
                      three_d_secure: {
                        type: 'hash',
                      },
                      wallet: {
                        type: 'hash',
                      },
                    },
                  },
                },
                type: { type: 'string' },
              },
            },
          },
          radar_options: {
            type: 'hash',
          },
          receipt_email: { type: 'string' },
          receipt_number: { type: 'string' },
          receipt_url: { type: 'string' },
          refunded: { type: 'bool' },
          review: { type: 'string' },
          shipping: {
            type: 'hash',
          },
          source: {
            type: 'hash',
          },
          source_transfer: { type: 'string' },
          statement_descriptor: { type: 'string' },
          statement_descriptor_suffix: { type: 'string' },
          status: { type: 'string' },
          transfer_data: {
            type: 'hash',
          },
          transfer_group: { type: 'string' },
        },
      },
    },
    previous_attributes: { type: 'string' },
  },
} satisfies TQoreTypeObject;
