/**
 * Asana Get Search Options
 *
 * Defines the search options for Asana record-based operations.
 * Supports sorting by various fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Asana search options for record-based operations.
 * Supports sorting by: created_at, modified_at, due_on, completed_at, likes
 */
export const AsanaSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'created_at', display_name: 'Created At' },
            { value: 'modified_at', display_name: 'Modified At' },
            { value: 'due_on', display_name: 'Due Date' },
            { value: 'completed_at', display_name: 'Completed At' },
            { value: 'likes', display_name: 'Number of Likes' },
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
