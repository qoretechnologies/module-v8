import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { TStripeEventType } from './constants';
import { stripeSubscriptionEventInfoType } from './event-info/subscription.event-info';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['customer.subscription.created'] satisfies TStripeEventType[];

export default {
  action: 'subscription_created',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Subscription created event data',
    type: stripeSubscriptionEventInfoType,
  },
} satisfies TQorePartialEventAction;
