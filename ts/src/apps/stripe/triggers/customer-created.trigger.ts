import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { STRIPE_APP_NAME } from '../constants';
import { TStripeEventType } from './constants';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['customer.created'] satisfies TStripeEventType[];

const stripeCustomerCreatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: STRIPE_APP_NAME,
  action: 'customer_created',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Customer created event data',
    type: {
      type: 'hash',
      fields: {
        object: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              object: { type: 'string' },
              address: { type: 'hash' },
              balance: { type: 'number' },
              created: { type: 'number' },
              currency: { type: 'string' },
              default_source: { type: 'string' },
              delinquent: { type: 'boolean' },
              description: { type: 'string' },
              discount: { type: 'hash' },
              email: { type: 'string' },
              invoice_prefix: { type: 'string' },
              invoice_settings: {
                type: {
                  type: 'hash',
                  fields: {
                    custom_fields: { type: 'hash' },
                    default_payment_method: { type: 'string' },
                    footer: { type: 'string' },
                    rendering_options: { type: 'hash' },
                  },
                },
              },
              livemode: { type: 'boolean' },
              metadata: {
                type: 'hash',
              },
              name: { type: 'string' },
              next_invoice_sequence: { type: 'number' },
              phone: { type: 'string' },
              preferred_locales: {
                type: {
                  type: 'list',
                  element_type: { type: 'string' },
                },
              },
              shipping: { type: 'hash' },
              tax_exempt: { type: 'string' },
              test_clock: { type: 'hash' },
            },
          },
        },
        previous_attributes: { type: 'string' },
      },
    },
  },
});

export default stripeCustomerCreatedTrigger;
