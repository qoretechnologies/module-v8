import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
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
      account_id: {
        name: 'account_id',
        type: 'softint',
      },
      detail: {
        name: 'detail',
        type: {
          created_at: {
            name: 'created_at',
            type: 'softdate',
          },
          default_group_id: {
            name: 'default_group_id',
            type: 'softstring',
          },
          email: {
            name: 'email',
            type: 'softstring',
          },
          external_id: {
            name: 'external_id',
            type: 'softstring',
          },
          id: {
            name: 'id',
            type: 'softstring',
          },
          organization_id: {
            name: 'organization_id',
            type: 'softstring',
          },
          role: {
            name: 'role',
            type: 'softstring',
          },
          updated_at: {
            name: 'updated_at',
            type: 'softdate',
          },
        },
      },
      event: {
        name: 'event',
        type: 'hash',
      },
      id: {
        name: 'id',
        type: 'softstring',
      },
      subject: {
        name: 'subject',
        type: 'softstring',
      },
      time: {
        name: 'time',
        type: 'softdate',
      },
      type: {
        name: 'type',
        type: 'softstring',
      },
      zendesk_event_version: {
        name: 'zendesk_event_version',
        type: 'softstring',
      },
    },
  },
} satisfies TQorePartialEventAction;
