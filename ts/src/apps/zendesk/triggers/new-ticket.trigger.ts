import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { createZendeskWebhookDeRegistrar, createZendeskWebhookRegistrar } from './helpers';

export default {
  action: 'new_ticket',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskWebhookRegistrar(['zen:event-type:ticket.created']),
  webhook_deregister: createZendeskWebhookDeRegistrar(),
  event_info: {
    desc: 'New Ticket event data',
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
          ticket_event: {
            name: 'ticket_event',
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
                  actor_id: {
                    name: 'actor_id',
                    type: 'int',
                  },
                },
              },
              type: {
                name: 'type',
                type: 'softstring',
              },
              ticket: {
                name: 'ticket',
                type: {
                  id: {
                    name: 'id',
                    type: 'int',
                  },
                  created_at: {
                    name: 'created_at',
                    type: 'date',
                  },
                  updated_at: {
                    name: 'updated_at',
                    type: 'date',
                  },
                  type: {
                    name: 'type',
                    type: 'softstring',
                  },
                  priority: {
                    name: 'priority',
                    type: 'softstring',
                  },
                  status: {
                    name: 'status',
                    type: 'softstring',
                  },
                  requester_id: {
                    name: 'requester_id',
                    type: 'int',
                  },
                  submitter_id: {
                    name: 'submitter_id',
                    type: 'int',
                  },
                  assignee_id: {
                    name: 'assignee_id',
                    type: 'int',
                  },
                  organization_id: {
                    name: 'organization_id',
                    type: 'int',
                  },
                  group_id: {
                    name: 'group_id',
                    type: 'int',
                  },
                  brand_id: {
                    name: 'brand_id',
                    type: 'int',
                  },
                  form_id: {
                    name: 'form_id',
                    type: 'int',
                  },
                  external_id: {
                    name: 'external_id',
                    type: 'softstring',
                  },
                  tags: {
                    name: 'tags',
                    type: '*list',
                  },
                  via: {
                    name: 'via',
                    type: {
                      channel: {
                        name: 'channel',
                        type: 'softstring',
                      },
                    },
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
