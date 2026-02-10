/**
 * QuickBooks Get Search Options
 *
 * Defines the sort options for QuickBooks record-based operations.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * QuickBooks search options for record-based operations.
 * Sort fields are provided as allowed_values_creatable since they
 * vary per entity type and the user can specify any QB field name.
 */
export const QuickbooksSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
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
