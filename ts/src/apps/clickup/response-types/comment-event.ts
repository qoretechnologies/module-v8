// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

/**
 * Type definition for a ClickUp comment resource.
 * Matches a single comment from GET /api/v2/task/{task_id}/comment response
 */
export const clickUpCommentEventInfoType: TQoreTypeObject = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    comment: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            text: { type: 'string' },
            attributes: { type: 'hash' },
          },
        },
      },
    },
    comment_text: { type: 'string' },
    user: {
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
    resolved: { type: 'bool' },
    assignee: {
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
    assigned_by: {
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
    reactions: {
      type: {
        type: 'list',
        element_type: 'hash',
      },
    },
    date: { type: 'string' },
  },
};
