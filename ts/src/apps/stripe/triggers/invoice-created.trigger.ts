import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { TStripeEventType } from './constants';
import { stripeInvoiceEventInfoType } from './event-info/invoice.event-info';
import {
  createGetStripeExampleEventDataFunction,
  createRegisterStripeWebhookFunction,
  deregisterStripeWebhook,
} from './helpers';

const triggerEvents = ['invoice.created'] satisfies TStripeEventType[];

export default {
  action: 'invoice_created',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createRegisterStripeWebhookFunction(triggerEvents),
  webhook_deregister: deregisterStripeWebhook,
  get_example_event_data: createGetStripeExampleEventDataFunction(triggerEvents),
  event_info: {
    desc: 'Invoice created event data',
    type: stripeInvoiceEventInfoType,
  },
} satisfies TQorePartialEventAction;
