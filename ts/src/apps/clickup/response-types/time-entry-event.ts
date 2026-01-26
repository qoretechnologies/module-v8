// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

/**
 * Type definition for a ClickUp time entry resource.
 * Matches a single time entry from GET /api/v2/task/{task_id}/time response
 */
export const clickUpTimeEntryEventInfoType: TQoreTypeObject = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    task: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          name: { type: 'string' },
          status: {
            type: {
              type: 'hash',
              fields: {
                status: { type: 'string' },
                color: { type: 'string' },
                type: { type: 'string' },
                orderindex: { type: 'number' },
              },
            },
          },
          custom_type: { type: 'string' },
        },
      },
    },
    wid: { type: 'string' },
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
    billable: { type: 'bool' },
    start: { type: 'string' },
    end: { type: 'string' },
    duration: { type: 'string' },
    description: { type: 'string' },
    tags: {
      type: {
        type: 'list',
        element_type: 'hash',
      },
    },
    source: { type: 'string' },
    at: { type: 'string' },
  },
};
