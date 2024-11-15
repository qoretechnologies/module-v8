import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

export default {
  action: 'new_organization',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar('New Organization', [
    'zen:event-type:organization.created',
  ]),
  webhook_deregister: createZendeskWebhookDeRegistrar(),
  event_info: {
    desc: 'Zendesk Organization Event Data',
    type: {
      type: 'hash',
      fields: {
        account_id: {
          type: 'softint',
        },
        detail: {
          type: 'hash',
          fields: {
            created_at: {
              type: 'softdate',
            },
            external_id: {
              type: 'softstring',
            },
            group_id: {
              type: 'softstring',
            },
            id: {
              type: 'softstring',
            },
            name: {
              type: 'softstring',
            },
            shared_comments: {
              type: 'boolean',
            },
            shared_tickets: {
              type: 'boolean',
            },
            updated_at: {
              type: 'softdate',
            },
          },
        },
        event: {
          type: 'hash',
        },
        id: {
          type: 'softstring',
        },
        subject: {
          type: 'softstring',
        },
        time: {
          type: 'softdate',
        },
        type: {
          type: 'softstring',
        },
        zendesk_event_version: {
          type: 'softstring',
        },
      },
    },
  },
} satisfies TQorePartialEventAction;
