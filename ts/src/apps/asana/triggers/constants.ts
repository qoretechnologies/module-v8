import { TQoreTypeObject } from '../../../global/models/qore';

export const asanaWebhookInfoLocation = 'events';

export const asanaEventInfoType = {
  type: 'hash',
  fields: {
    action: {
      type: 'string',
    },
    parent: {
      type: {
        type: 'hash',
        fields: {
          gid: {
            type: 'string',
          },
          resource_type: {
            type: 'string',
          },
          resource_subtype: {
            type: 'string',
          },
        },
      },
    },
    resource: {
      type: {
        type: 'hash',
        fields: {
          gid: {
            type: 'string',
          },
          resource_type: {
            type: 'string',
          },
          resource_subtype: {
            type: 'string',
          },
        },
      },
    },
    change: {
      type: {
        type: 'hash',
        fields: {
          field: {
            type: 'string',
          },
          action: {
            type: 'string',
          },
        },
      },
    },
    user: {
      type: {
        type: 'hash',
        fields: {
          gid: {
            type: 'string',
          },
          resource_type: {
            type: 'string',
          },
        },
      },
    },
    created_at: {
      type: 'string',
    },
  },
} satisfies TQoreTypeObject;
