import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { TStripeEventType } from './constants';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['payment_link.created'] satisfies TStripeEventType[];

export default {
  action: 'payment_link_created',
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
    desc: 'Payment link created event data',
    type: {
      type: 'hash',
      fields: {
        object: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              object: { type: 'string' },
              active: { type: 'boolean' },
              after_completion: {
                type: {
                  type: 'hash',
                  fields: {
                    hosted_confirmation: {
                      type: {
                        type: 'hash',
                        fields: {
                          custom_message: { type: 'string' },
                        },
                      },
                    },
                    type: { type: 'string' },
                  },
                },
              },
              allow_promotion_codes: { type: 'boolean' },
              application: { type: 'string' },
              application_fee_amount: { type: 'string' },
              application_fee_percent: { type: 'string' },
              automatic_tax: {
                type: {
                  type: 'hash',
                  fields: {
                    enabled: { type: 'boolean' },
                    liability: { type: 'string' },
                  },
                },
              },
              billing_address_collection: { type: 'string' },
              consent_collection: { type: 'hash' },
              currency: { type: 'string' },
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
              customer_creation: { type: 'string' },
              inactive_message: { type: 'string' },
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
              metadata: {
                type: {
                  type: 'hash',
                  fields: {},
                },
              },
              on_behalf_of: { type: 'string' },
              payment_intent_data: { type: 'hash' },
              payment_method_collection: { type: 'string' },
              payment_method_types: { type: 'hash' },
              phone_number_collection: {
                type: {
                  type: 'hash',
                  fields: {
                    enabled: { type: 'boolean' },
                  },
                },
              },
              restrictions: { type: 'hash' },
              shipping_address_collection: { type: 'hash' },
              shipping_options: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {},
                  },
                },
              },
              submit_type: { type: 'string' },
              subscription_data: {
                type: {
                  type: 'hash',
                  fields: {
                    description: { type: 'string' },
                    invoice_settings: {
                      type: {
                        type: 'hash',
                        fields: {
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
                    metadata: {
                      type: {
                        type: 'hash',
                        fields: {},
                      },
                    },
                    trial_period_days: { type: 'string' },
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
                  },
                },
              },
              tax_id_collection: {
                type: {
                  type: 'hash',
                  fields: {
                    enabled: { type: 'boolean' },
                    required: { type: 'string' },
                  },
                },
              },
              transfer_data: { type: 'hash' },
              url: { type: 'string' },
            },
          },
        },
        previous_attributes: { type: 'string' },
      },
    },
  },
} satisfies TQorePartialEventAction;
