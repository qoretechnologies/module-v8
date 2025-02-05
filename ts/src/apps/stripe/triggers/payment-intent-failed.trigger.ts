import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { TStripeEventType } from './constants';
import { stripePaymentIntentEventInfoType } from './event-info/payment-infent.event-info';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['payment_intent.payment_failed'] satisfies TStripeEventType[];

export default {
  action: 'payment_intent_failed',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Payment failed event data',
    type: stripePaymentIntentEventInfoType,
  },
} satisfies TQorePartialEventAction;
