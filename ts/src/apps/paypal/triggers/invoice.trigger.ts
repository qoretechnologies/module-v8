import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { DeregisterPayPalWebhook, getPayPalWebhookExampleDataFunction } from './constants';

const action = 'invoice_trigger';

const options = {
  event_name: {
    type: 'string',
    required: true,
    allowed_values: [
      {
        value: 'INVOICING.INVOICE.CANCELLED',
        display_name: 'Invoice Cancelled',
        desc: 'A merchant or customer cancels an invoice.',
      },
      {
        value: 'INVOICING.INVOICE.CREATED',
        display_name: 'Invoice Created',
        desc: 'An invoice is created.',
      },
      {
        value: 'INVOICING.INVOICE.PAID',
        display_name: 'Invoice Paid',
        desc: 'An invoice is paid, partially paid, or payment is made and is pending.',
      },
      {
        value: 'INVOICING.INVOICE.REFUNDED',
        display_name: 'Invoice Refunded',
        desc: 'An invoice is refunded or partially refunded.',
      },
      {
        value: 'INVOICING.INVOICE.SCHEDULED',
        display_name: 'Invoice Scheduled',
        desc: 'An invoice is scheduled.',
      },
      {
        value: 'INVOICING.INVOICE.UPDATED',
        display_name: 'Invoice Updated',
        desc: 'An invoice is updated.',
      },
    ],
  },
} satisfies TQoreOptions;

const InvoiceTrigger = QoreAppCreator.createLocalizedTrigger({
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
    desc: 'Invoice data',
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
              tax_calculated_after_discount: { type: 'bool' },
              metadata: {
                type: {
                  type: 'hash',
                  fields: {
                    created_date: { type: 'string' },
                    cancelled_date: { type: 'string' },
                    first_sent_date: { type: 'string' },
                    last_sent_date: { type: 'string' },
                  },
                },
              },
              payment_term: {
                type: {
                  type: 'hash',
                  fields: {
                    term_type: { type: 'string' },
                    due_date: { type: 'string' },
                  },
                },
              },
              tax_inclusive: { type: 'bool' },
              merchant_info: {
                type: {
                  type: 'hash',
                  fields: {
                    email: { type: 'string' },
                    first_name: { type: 'string' },
                    last_name: { type: 'string' },
                    business_name: { type: 'string' },
                    address: {
                      type: {
                        type: 'hash',
                        fields: {
                          line1: { type: 'string' },
                          line2: { type: 'string' },
                          city: { type: 'string' },
                          state: { type: 'string' },
                          postal_code: { type: 'string' },
                          country_code: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              invoice_date: { type: 'string' },
              number: { type: 'string' },
              billing_info: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      email: { type: 'string' },
                      business_name: { type: 'string' },
                      language: { type: 'string' },
                    },
                  },
                },
              },
              total_amount: {
                type: {
                  type: 'hash',
                  fields: {
                    currency: { type: 'string' },
                    value: { type: 'string' },
                  },
                },
              },
              links: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      rel: { type: 'string' },
                      href: { type: 'string' },
                      method: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'string' },
              items: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      quantity: { type: 'number' },
                      unit_price: {
                        type: {
                          type: 'hash',
                          fields: {
                            currency: { type: 'string' },
                            value: { type: 'string' },
                          },
                        },
                      },
                      unit_of_measure: { type: 'string' },
                    },
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
      },
    },
  },
});

export default InvoiceTrigger;
