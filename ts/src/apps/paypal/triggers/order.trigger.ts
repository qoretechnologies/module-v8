import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { DeregisterPayPalWebhook, getPayPalWebhookExampleDataFunction } from './constants';

const action = 'order_trigger';

const options = {
  event_name: {
    type: 'string',
    required: true,
    allowed_values: [
      {
        value: 'CHECKOUT.ORDER.APPROVED',
        display_name: 'Order Approved',
        desc: 'A buyer approved a checkout order.',
      },
      {
        value: 'CHECKOUT.ORDER.COMPLETED',
        display_name: 'Order Completed',
        desc: 'A checkout order is processed.',
      },
      {
        value: 'CHECKOUT.PAYMENT-APPROVAL.REVERSED',
        display_name: 'Payment Approval Reversed',
        desc: 'A problem occurred after the buyer approved the order but before you captured the payment.',
      },
    ],
  },
} satisfies TQoreOptions;

const OrderTrigger = QoreAppCreator.createLocalizedTrigger({
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
    desc: 'Order data',
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
              update_time: { type: 'string' },
              create_time: { type: 'string' },
              purchase_units: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      reference_id: { type: 'string' },
                      amount: {
                        type: {
                          type: 'hash',
                          fields: {
                            currency_code: { type: 'string' },
                            value: { type: 'string' },
                          },
                        },
                      },
                      payee: {
                        type: {
                          type: 'hash',
                          fields: {
                            email_address: { type: 'string' },
                          },
                        },
                      },
                      shipping: {
                        type: {
                          type: 'hash',
                          fields: {
                            method: { type: 'string' },
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
              intent: { type: 'string' },
              payer: {
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
                    payer_id: { type: 'string' },
                  },
                },
              },
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
        resource_version: { type: 'string' },
      },
    },
  },
});

export default OrderTrigger;
