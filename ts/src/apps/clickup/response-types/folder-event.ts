// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

/**
 * Type definition for a ClickUp folder resource.
 * Matches the response from GET /api/v2/folder/{folder_id}
 */
export const clickUpFolderEventInfoType: TQoreTypeObject = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    orderindex: { type: 'number' },
    override_statuses: { type: 'bool' },
    hidden: { type: 'bool' },
    space: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
    task_count: { type: 'string' },
    archived: { type: 'bool' },
    statuses: {
      type: {
        type: 'list',
        element_type: 'hash',
      },
    },
    lists: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            orderindex: { type: 'number' },
            status: { type: 'string' },
            priority: { type: 'string' },
            assignee: { type: 'string' },
            task_count: { type: 'number' },
            due_date: { type: 'string' },
            start_date: { type: 'string' },
            space: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  access: { type: 'bool' },
                },
              },
            },
            archived: { type: 'bool' },
            override_statuses: { type: 'string' },
            statuses: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    status: { type: 'string' },
                    orderindex: { type: 'number' },
                    color: { type: 'string' },
                    type: { type: 'string' },
                    status_group: { type: 'string' },
                  },
                },
              },
            },
            permission_level: { type: 'string' },
          },
        },
      },
    },
    permission_level: { type: 'string' },
  },
};
