import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

export default {
  action: 'new_organization',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar(['zen:event-type:organization.created']),
  webhook_deregister: createZendeskWebhookDeRegistrar(),
  event_info: {
    desc: 'New Organization event data',
    type: {
      version: {
        name: 'version',
        type: 'softstring',
      },
      id: {
        name: 'id',
        type: 'softstring',
      },
      'detail-type': {
        name: 'detail-type',
        type: 'softstring',
      },
      source: {
        name: 'source',
        type: 'softstring',
      },
      account: {
        name: 'account',
        type: 'string',
      },
      time: {
        name: 'time',
        type: 'softdate',
      },
      region: {
        name: 'region',
        type: 'softstring',
      },
      resources: {
        name: 'resources',
        type: '*list',
      },
      detail: {
        name: 'detail',
        type: {
          organization_event: {
            name: 'organization_event',
            type: {
              meta: {
                name: 'meta',
                type: {
                  version: {
                    name: 'version',
                    type: 'softstring',
                  },
                  occurred_at: {
                    name: 'occurred_at',
                    type: 'date',
                  },
                  ref: {
                    name: 'ref',
                    type: 'string',
                  },
                  sequence: {
                    name: 'sequence',
                    type: {
                      id: {
                        name: 'id',
                        type: 'softstring',
                      },
                      position: {
                        name: 'position',
                        type: 'int',
                      },
                      total: {
                        name: 'total',
                        type: 'int',
                      },
                    },
                  },
                },
              },
              type: {
                name: 'type',
                type: 'softstring',
              },
              organization: {
                name: 'organization',
                type: {
                  id: {
                    name: 'id',
                    type: 'int',
                  },
                  external_id: {
                    name: 'external_id',
                    type: 'softstring',
                  },
                  name: {
                    name: 'name',
                    type: 'softstring',
                  },
                  created_at: {
                    name: 'created_at',
                    type: 'date',
                  },
                  updated_at: {
                    name: 'updated_at',
                    type: 'date',
                  },
                  shared_tickets: {
                    name: 'shared_tickets',
                    type: 'boolean',
                  },
                  shared_comments: {
                    name: 'shared_comments',
                    type: 'boolean',
                  },
                  group_id: {
                    name: 'group_id',
                    type: 'int',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQorePartialEventAction;
