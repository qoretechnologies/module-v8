import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { TStripeEventType } from './constants';
import { stripeSubscriptionEventInfoType } from './event-info/subscription.event-info';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['customer.subscription.deleted'] satisfies TStripeEventType[];

export default {
  action: 'subscription_canceled',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Subscription canceled event data',
    type: stripeSubscriptionEventInfoType,
  },
} satisfies TQorePartialEventAction;
