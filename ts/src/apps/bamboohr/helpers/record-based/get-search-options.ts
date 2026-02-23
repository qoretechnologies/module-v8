/**
 * BambooHR Search Options
 *
 * Defines additional options available when searching employee records.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Search options for BambooHR record-based search.
 * Provides orderBy with commonly used sortable employee fields.
 */
export const BambooHRSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'first_name', display_name: 'First Name' },
            { value: 'last_name', display_name: 'Last Name' },
            { value: 'display_name', display_name: 'Display Name' },
            { value: 'hire_date', display_name: 'Hire Date' },
            { value: 'department', display_name: 'Department' },
            { value: 'job_title', display_name: 'Job Title' },
            { value: 'location', display_name: 'Location' },
            { value: 'division', display_name: 'Division' },
            { value: 'status', display_name: 'Status' },
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
