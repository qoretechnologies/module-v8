import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

export default {
  action: 'new_organization',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar(['zen:event-type:organization.created']),
  webhook_deregister: createZendeskWebhookDeRegistrar(),
  event_info: {
    desc: 'Zendesk Organization Event Data',
    type: {
      event: {
        name: 'event',
        type: {
          body: {
            name: 'body',
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
                  external_id: {
                    name: 'external_id',
                    type: 'softstring',
                  },
                  group_id: {
                    name: 'group_id',
                    type: 'softstring',
                  },
                  id: {
                    name: 'id',
                    type: 'softstring',
                  },
                  name: {
                    name: 'name',
                    type: 'softstring',
                  },
                  shared_comments: {
                    name: 'shared_comments',
                    type: 'boolean',
                  },
                  shared_tickets: {
                    name: 'shared_tickets',
                    type: 'boolean',
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
        },
      },
      context: {
        name: 'context',
        type: {
          id: {
            name: 'id',
            type: 'softstring',
          },
          ts: {
            name: 'ts',
            type: 'softdate',
          },
          workflow_id: {
            name: 'workflow_id',
            type: 'softstring',
          },
          source_type: {
            name: 'source_type',
            type: 'softstring',
          },
          owner_id: {
            name: 'owner_id',
            type: 'softstring',
          },
          platform_version: {
            name: 'platform_version',
            type: 'softstring',
          },
          workflow_name: {
            name: 'workflow_name',
            type: 'softstring',
          },
          emitter_id: {
            name: 'emitter_id',
            type: 'softstring',
          },
          trace_id: {
            name: 'trace_id',
            type: 'softstring',
          },
        },
      },
    },
  },
} satisfies TQorePartialEventAction;
