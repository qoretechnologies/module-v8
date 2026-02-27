/**
 * SharePoint Get Search Options
 *
 * Defines the search options for SharePoint record-based operations.
 * Supports sorting by any column field.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * SharePoint search options for record-based operations.
 * Uses free-form field name since columns are dynamic per list.
 */
export const SharePointSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
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
