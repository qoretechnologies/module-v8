import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { TStripeEventType } from './constants';
import { stripePaymentIntentEventInfoType } from './event-info/payment-infent.event-info';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['payment_intent.succeeded'] satisfies TStripeEventType[];

export default {
  action: 'payment_intent_succeeded',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Payment intent succeeded event data',
    type: stripePaymentIntentEventInfoType,
  },
} satisfies TQorePartialEventAction;
