/**
 * ClickUp Search Options
 *
 * Defines the available search options for ClickUp record-based operations,
 * including orderBy (sorting) configuration.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * ClickUp search options for record-based operations.
 *
 * ClickUp supports sorting by:
 * - created: Date task was created
 * - updated: Date task was last updated
 * - due_date: Task due date
 * - id: Task ID
 */
export const ClickUpSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'created', display_name: 'Date Created' },
            { value: 'updated', display_name: 'Date Updated' },
            { value: 'due_date', display_name: 'Due Date' },
            { value: 'id', display_name: 'Task ID' },
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
