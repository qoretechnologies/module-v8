import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { TStripeEventType } from './constants';
import { chargeEventInfoType } from './event-info/charge.event-info';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['charge.succeeded'] satisfies TStripeEventType[];

export default {
  action: 'charge_succeeded',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    secretKey: {
      required: true,
      type: 'string',
      sensitive: true,
    },
  },
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Charge succeeded event data',
    type: chargeEventInfoType,
  },
} satisfies TQorePartialEventAction;
