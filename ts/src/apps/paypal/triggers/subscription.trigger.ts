import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { DeregisterPayPalWebhook, getPayPalWebhookExampleDataFunction } from './constants';

const action = 'subscription_trigger';

const options = {
  event_name: {
    type: 'string',
    required: true,
    allowed_values: [
      {
        value: 'BILLING.SUBSCRIPTION.CREATED',
        display_name: 'Subscription Created',
        desc: 'A subscription is created.',
      },
      {
        value: 'BILLING.SUBSCRIPTION.ACTIVATED',
        display_name: 'Subscription Activated',
        desc: 'A subscription is activated.',
      },
      {
        value: 'BILLING.SUBSCRIPTION.UPDATED',
        display_name: 'Subscription Updated',
        desc: 'A subscription is updated.',
      },
      {
        value: 'BILLING.SUBSCRIPTION.EXPIRED',
        display_name: 'Subscription Expired',
        desc: 'A subscription is expired.',
      },
      {
        value: 'BILLING.SUBSCRIPTION.CANCELLED',
        display_name: 'Subscription Cancelled',
        desc: 'A subscription is cancelled.',
      },
      {
        value: 'BILLING.SUBSCRIPTION.SUSPENDED',
        display_name: 'Subscription Suspended',
        desc: 'A subscription is suspended.',
      },
    ],
  },
} satisfies TQoreOptions;

const SubscriptionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, environment, event_name } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'environment'],
      optionFields: ['event_name'],
      ErrorClass: PayPalError,
    });

    try {
      const webhook = await payPalApiClient<{ id: string }>({
        token,
        environment,
        path: 'notifications/webhooks',
        method: 'POST',
        body: {
          url,
          event_types: [
            {
              name: event_name,
            },
          ],
        },
      });

      return {
        webhookId: webhook.id,
      };
    } catch (error) {
      throw new PayPalError(
        `Failed to register webhook for ${humanizeNameTitle(action)}: ${getPayPalErrorMessage(error)}`
      );
    }
  },
  webhook_deregister: DeregisterPayPalWebhook,
  get_example_event_data: getPayPalWebhookExampleDataFunction(action),

  event_info: {
    desc: 'Subscription data',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        create_time: { type: 'string' },
        resource_type: { type: 'string' },
        event_type: { type: 'string' },
        summary: { type: 'string' },
        resource: {
          type: {
            type: 'hash',
            fields: {
              quantity: { type: 'string' },
              subscriber: {
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
                    shipping_address: {
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
                        },
                      },
                    },
                  },
                },
              },
              create_time: { type: 'string' },
              shipping_amount: {
                type: {
                  type: 'hash',
                  fields: {
                    currency_code: { type: 'string' },
                    value: { type: 'string' },
                  },
                },
              },
              start_time: { type: 'string' },
              update_time: { type: 'string' },
              billing_info: {
                type: {
                  type: 'hash',
                  fields: {
                    outstanding_balance: {
                      type: {
                        type: 'hash',
                        fields: {
                          currency_code: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                    cycle_executions: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            tenure_type: { type: 'string' },
                            sequence: { type: 'number' },
                            cycles_completed: { type: 'number' },
                            cycles_remaining: { type: 'number' },
                            current_pricing_scheme_version: { type: 'number' },
                          },
                        },
                      },
                    },
                    last_payment: {
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
                          time: { type: 'string' },
                        },
                      },
                    },
                    next_billing_time: { type: 'string' },
                    final_payment_time: { type: 'string' },
                    failed_payments_count: { type: 'number' },
                  },
                },
              },
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
              id: { type: 'string' },
              plan_id: { type: 'string' },
              auto_renewal: { type: 'boolean' },
              status: { type: 'string' },
              status_update_time: { type: 'string' },
            },
          },
        },
        links: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                href: { type: 'string' },
                rel: { type: 'string' },
                method: { type: 'string' },
                encType: { type: 'string' },
              },
            },
          },
        },
        event_version: { type: 'string' },
        resource_version: { type: 'string' },
      },
    },
  },
});

export default SubscriptionTrigger;
