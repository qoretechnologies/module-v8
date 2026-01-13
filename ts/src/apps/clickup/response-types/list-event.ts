// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

/**
 * Type definition for a ClickUp list resource.
 * Matches the response from GET /api/v2/list/{list_id}
 */
export const clickUpListEventInfoType: TQoreTypeObject = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    orderindex: { type: 'number' },
    content: { type: 'string' },
    status: {
      type: {
        type: 'hash',
        fields: {
          status: { type: 'string' },
          color: { type: 'string' },
          hide_label: { type: 'bool' },
        },
      },
    },
    priority: {
      type: {
        type: 'hash',
        fields: {
          priority: { type: 'string' },
          color: { type: 'string' },
        },
      },
    },
    assignee: { type: 'string' },
    due_date: { type: 'string' },
    due_date_time: { type: 'bool' },
    start_date: { type: 'string' },
    start_date_time: { type: 'string' },
    folder: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          name: { type: 'string' },
          hidden: { type: 'bool' },
          access: { type: 'bool' },
        },
      },
    },
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
    inbound_address: { type: 'string' },
    archived: { type: 'bool' },
    override_statuses: { type: 'bool' },
    statuses: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            status: { type: 'string' },
            orderindex: { type: 'number' },
            color: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
    },
    permission_level: { type: 'string' },
  },
};
