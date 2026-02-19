/**
 * Freshdesk Get Search Options
 *
 * Defines the search options for Freshdesk record-based operations.
 * Supports sorting by various fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Freshdesk search options for record-based operations.
 * Supports sorting by: created_at, updated_at, due_by, status, priority
 */
export const FreshdeskSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'created_at', display_name: 'Created At' },
            { value: 'updated_at', display_name: 'Updated At' },
            { value: 'due_by', display_name: 'Due By' },
            { value: 'status', display_name: 'Status' },
            { value: 'priority', display_name: 'Priority' },
          ],
        },
        direction: {
          type: 'string',
          required: false,
          default_value: 'asc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreCrudOptions;
