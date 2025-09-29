import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { DeregisterPayPalWebhook, getPayPalWebhookExampleDataFunction } from './constants';

const action = 'dispute_trigger';

const options = {
  event_name: {
    type: 'string',
    required: true,
    allowed_values: [
      {
        value: 'CUSTOMER.DISPUTE.CREATED',
        display_name: 'Dispute Created',
        desc: 'A dispute is created.',
      },
      {
        value: 'CUSTOMER.DISPUTE.RESOLVED',
        display_name: 'Dispute Resolved',
        desc: 'A dispute is resolved.',
      },
      {
        value: 'CUSTOMER.DISPUTE.UPDATED',
        display_name: 'Dispute Updated',
        desc: 'A dispute is updated.',
      },
    ],
  },
} satisfies TQoreOptions;

const DisputeTrigger = QoreAppCreator.createLocalizedTrigger({
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
    desc: 'Dispute data',
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
              disputed_transactions: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      seller_transaction_id: { type: 'string' },
                      seller: {
                        type: {
                          type: 'hash',
                          fields: {
                            merchant_id: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      },
                      items: {
                        type: {
                          type: 'list',
                          element_type: 'hash',
                        },
                      },
                      seller_protection_eligible: { type: 'boolean' },
                    },
                  },
                },
              },
              reason: { type: 'string' },
              dispute_channel: { type: 'string' },
              update_time: { type: 'string' },
              create_time: { type: 'string' },
              messages: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      posted_by: { type: 'string' },
                      time_posted: { type: 'string' },
                      content: { type: 'string' },
                    },
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
              dispute_amount: {
                type: {
                  type: 'hash',
                  fields: {
                    currency_code: { type: 'string' },
                    value: { type: 'string' },
                  },
                },
              },
              dispute_id: { type: 'string' },
              dispute_life_cycle_stage: { type: 'string' },
              status: { type: 'string' },
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
      },
    },
  },
});

export default DisputeTrigger;
