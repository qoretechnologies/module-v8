/**
 * NetSuite Search Options
 *
 * Defines the search options for NetSuite record-based operations,
 * including orderBy support for SuiteQL ORDER BY clauses.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

export const NetsuiteSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: [
            { value: 'id', display_name: 'ID' },
            { value: 'datecreated', display_name: 'Date Created' },
            { value: 'lastmodifieddate', display_name: 'Last Modified Date' },
            { value: 'name', display_name: 'Name' },
            { value: 'entityid', display_name: 'Entity ID' },
            { value: 'email', display_name: 'Email' },
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
