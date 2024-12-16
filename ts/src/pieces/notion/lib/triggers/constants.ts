import { TQoreTypeObject } from '../../../../global/models/qore';

export const databaseItemQoreType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    object: {
      type: 'string',
    },
    created_time: {
      type: 'string',
    },
    last_edited_time: {
      type: 'string',
    },
    created_by: {
      type: {
        type: 'hash',
        fields: {
          object: {
            type: 'string',
          },
          id: {
            type: 'string',
          },
        },
      },
    },
    properties: {
      type: 'hash',
    },
    parent: {
      type: {
        type: 'hash',
        fields: {
          type: {
            type: 'string',
          },
          database_id: {
            type: 'string',
          },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
