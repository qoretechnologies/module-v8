import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { STRIPE_APP_NAME } from '../constants';
import { TStripeEventType } from './constants';
import { chargeEventInfoType } from './event-info/charge.event-info';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['charge.dispute.created'] satisfies TStripeEventType[];

const stripeChargeDisputeCreatedTrigger = QoreAppCreator.createLocalizedTrigger({
  app: STRIPE_APP_NAME,
  action: 'charge_dispute_created',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Charge dispute created event data',
    type: chargeEventInfoType,
  },
});

export default stripeChargeDisputeCreatedTrigger;
