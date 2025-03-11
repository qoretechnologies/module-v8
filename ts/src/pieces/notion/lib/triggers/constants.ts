import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

export const NOTION_FETCH_MAX_RETRIES = 3;
export const NOTION_FETCH_DELAY = 1000;

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

export const pageItemQoreType = {
  type: 'hash',
  fields: {
    object: { type: 'string' },
    id: { type: 'string' },
    created_time: { type: 'string' },
    last_edited_time: { type: 'string' },
    created_by: {
      type: {
        type: 'hash',
        fields: {
          object: { type: 'string' },
          id: { type: 'string' },
        },
      },
    },
    last_edited_by: {
      type: {
        type: 'hash',
        fields: {
          object: { type: 'string' },
          id: { type: 'string' },
        },
      },
    },
    cover: { type: 'hash' },
    icon: { type: 'hash' },
    parent: {
      type: {
        type: 'hash',
        fields: {
          type: { type: 'string' },
          database_id: { type: 'string' },
        },
      },
    },
    archived: { type: 'boolean' },
    in_trash: { type: 'boolean' },
    properties: {
      type: 'hash',
    },
    url: { type: 'string' },
    public_url: { type: 'hash' },
    developer_survey: { type: 'string' },
    request_id: { type: 'string' },
  },
} satisfies TQoreTypeObject;
