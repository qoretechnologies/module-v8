import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

export default {
  action: 'new_user',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar(['zen:event-type:user.created']),
  webhook_deregister: createZendeskWebhookDeRegistrar(),
  event_info: {
    desc: 'New User event data',
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
          user_event: {
            name: 'user_event',
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
              user: {
                name: 'user',
                type: {
                  id: {
                    name: 'id',
                    type: 'int',
                  },
                  external_id: {
                    name: 'external_id',
                    type: 'softstring',
                  },
                  role: {
                    name: 'role',
                    type: 'softstring',
                  },
                  email: {
                    name: 'email',
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
                  organization_id: {
                    name: 'organization_id',
                    type: 'int',
                  },
                  default_group_id: {
                    name: 'default_group_id',
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
