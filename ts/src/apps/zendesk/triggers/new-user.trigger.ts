import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

export default {
  action: 'new_user',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar('New User', ['zen:event-type:user.created']),
  webhook_deregister: createZendeskWebhookDeRegistrar(),
  event_info: {
    desc: 'Zendesk User Event Data',
    type: {
      type: 'hash',
      fields: {
        account_id: {
          type: 'softint',
        },
        detail: {
          type: {
            type: 'hash',
            fields: {
              created_at: {
                type: 'softdate',
              },
              default_group_id: {
                type: 'softstring',
              },
              email: {
                type: 'softstring',
              },
              external_id: {
                type: 'softstring',
              },
              id: {
                type: 'softstring',
              },
              organization_id: {
                type: 'softstring',
              },
              role: {
                type: 'softstring',
              },
              updated_at: {
                type: 'softdate',
              },
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
