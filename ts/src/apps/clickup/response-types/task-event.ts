// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

/**
 * Type definition for a ClickUp task resource.
 * Matches the response from GET /api/v2/task/{task_id}
 */
export const clickUpTaskEventInfoType: TQoreTypeObject = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    custom_id: { type: 'string' },
    custom_item_id: { type: 'number' },
    name: { type: 'string' },
    text_content: { type: 'string' },
    description: { type: 'string' },
    status: {
      type: {
        type: 'hash',
        fields: {
          status: { type: 'string' },
          color: { type: 'string' },
          orderindex: { type: 'number' },
          type: { type: 'string' },
        },
      },
    },
    orderindex: { type: 'string' },
    date_created: { type: 'string' },
    date_updated: { type: 'string' },
    date_closed: { type: 'string' },
    creator: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'number' },
          username: { type: 'string' },
          color: { type: 'string' },
          profilePicture: { type: 'string' },
        },
      },
    },
    assignees: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    watchers: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    checklists: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    tags: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    parent: { type: 'string' },
    priority: {
      type: {
        type: 'hash',
        fields: {
          color: { type: 'string' },
          id: { type: 'string' },
          orderindex: { type: 'string' },
          priority: { type: 'string' },
        },
      },
    },
    due_date: { type: 'string' },
    start_date: { type: 'string' },
    points: { type: 'number' },
    time_estimate: { type: 'string' },
    time_spent: { type: 'string' },
    custom_fields: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            type_config: {
              type: {
                type: 'hash',
              },
            },
            date_created: { type: 'string' },
            hide_from_guests: { type: 'bool' },
            value: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'number' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  color: { type: 'string' },
                  initials: { type: 'string' },
                  profilePicture: { type: 'string' },
                },
              },
            },
            value_richtext: { type: 'string' },
            value_markdown: { type: 'string' },
            required: { type: 'bool' },
          },
        },
      },
    },
    list: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
        },
      },
    },
    folder: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
        },
      },
    },
    space: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
        },
      },
    },
    url: { type: 'string' },
    markdown_description: { type: 'string' },
    attachments: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            date: { type: 'number' },
            title: { type: 'string' },
            type: { type: 'number' },
            source: { type: 'number' },
            version: { type: 'number' },
            extension: { type: 'string' },
            thumbnail_small: { type: 'string' },
            thumbnail_medium: { type: 'string' },
            thumbnail_large: { type: 'string' },
            is_folder: { type: 'bool' },
            mimetype: { type: 'string' },
            hidden: { type: 'bool' },
            parent_id: { type: 'string' },
            size: { type: 'number' },
            total_comments: { type: 'number' },
            resolved_comments: { type: 'number' },
            user: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'number' },
                  username: { type: 'string' },
                  initials: { type: 'string' },
                  email: { type: 'string' },
                  color: { type: 'string' },
                  profilePicture: { type: 'string' },
                },
              },
            },
            deleted: { type: 'bool' },
            orientation: { type: 'string' },
            url: { type: 'string' },
            email_data: {
              type: {
                type: 'hash',
              },
            },
            url_w_query: { type: 'string' },
            url_w_host: { type: 'string' },
          },
        },
      },
    },
  },
};
