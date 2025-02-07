import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { STRIPE_APP_NAME } from '../constants';
import { TStripeEventType } from './constants';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['checkout.session.completed'] satisfies TStripeEventType[];

const stripeCheckoutSessionCompletedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: STRIPE_APP_NAME,
  action: 'checkout_session_completed',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Checkout session completed event data',
    type: {
      type: 'hash',
      fields: {
        object: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              object: { type: 'string' },
              adaptive_pricing: {
                type: {
                  type: 'hash',
                  fields: {
                    enabled: { type: 'boolean' },
                  },
                },
              },
              after_expiration: { type: 'hash' },
              allow_promotion_codes: { type: 'string' },
              amount_subtotal: { type: 'number' },
              amount_total: { type: 'number' },
              automatic_tax: {
                type: {
                  type: 'hash',
                  fields: {
                    enabled: { type: 'boolean' },
                    liability: { type: 'hash' },
                    status: { type: 'hash' },
                  },
                },
              },
              billing_address_collection: { type: 'string' },
              cancel_url: { type: 'string' },
              client_reference_id: { type: 'string' },
              client_secret: { type: 'string' },
              consent: { type: 'hash' },
              consent_collection: { type: 'hash' },
              created: { type: 'number' },
              currency: { type: 'string' },
              currency_conversion: { type: 'hash' },
              custom_fields: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {},
                  },
                },
              },
              custom_text: {
                type: {
                  type: 'hash',
                  fields: {
                    after_submit: { type: 'hash' },
                    shipping_address: { type: 'hash' },
                    submit: { type: 'hash' },
                    terms_of_service_acceptance: { type: 'hash' },
                  },
                },
              },
              customer: { type: 'string' },
              customer_creation: { type: 'string' },
              customer_details: {
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
                    tax_exempt: { type: 'string' },
                    tax_ids: {
                      type: {
                        type: 'list',
                        element_type: { type: 'string' },
                      },
                    },
                  },
                },
              },
              customer_email: { type: 'string' },
              expires_at: { type: 'number' },
              invoice: { type: 'string' },
              invoice_creation: {
                type: {
                  type: 'hash',
                  fields: {
                    enabled: { type: 'boolean' },
                    invoice_data: {
                      type: {
                        type: 'hash',
                        fields: {
                          account_tax_ids: { type: 'hash' },
                          custom_fields: { type: 'hash' },
                          description: { type: 'string' },
                          footer: { type: 'string' },
                          issuer: { type: 'string' },
                          metadata: {
                            type: {
                              type: 'hash',
                              fields: {},
                            },
                          },
                          rendering_options: { type: 'hash' },
                        },
                      },
                    },
                  },
                },
              },
              livemode: { type: 'boolean' },
              locale: { type: 'string' },
              metadata: {
                type: {
                  type: 'hash',
                  fields: {},
                },
              },
              mode: { type: 'string' },
              payment_intent: { type: 'string' },
              payment_link: { type: 'hash' },
              payment_method_collection: { type: 'string' },
              payment_method_configuration_details: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    parent: { type: 'hash' },
                  },
                },
              },
              payment_method_options: {
                type: {
                  type: 'hash',
                  fields: {
                    card: {
                      type: {
                        type: 'hash',
                        fields: {
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
              payment_status: { type: 'string' },
              phone_number_collection: {
                type: {
                  type: 'hash',
                  fields: {
                    enabled: { type: 'boolean' },
                  },
                },
              },
              recovered_from: { type: 'hash' },
              saved_payment_method_options: { type: 'hash' },
              setup_intent: { type: 'hash' },
              shipping_address_collection: { type: 'hash' },
              shipping_cost: { type: 'hash' },
              shipping_details: { type: 'hash' },
              shipping_options: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {},
                  },
                },
              },
              status: { type: 'string' },
              submit_type: { type: 'string' },
              subscription: { type: 'hash' },
              success_url: { type: 'string' },
              total_details: {
                type: {
                  type: 'hash',
                  fields: {
                    amount_discount: { type: 'number' },
                    amount_shipping: { type: 'number' },
                    amount_tax: { type: 'number' },
                  },
                },
              },
              ui_mode: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
        previous_attributes: { type: 'string' },
      },
    },
  },
});

export default stripeCheckoutSessionCompletedTrigger;
