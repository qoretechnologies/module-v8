/**
 * Jira Search Options
 *
 * Defines the available sorting options for issue searches.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Search options for Jira records
 */
export const JiraSearchOptions: TQoreCrudOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'created', display_name: 'Created Date' },
            { value: 'updated', display_name: 'Updated Date' },
            { value: 'duedate', display_name: 'Due Date' },
            { value: 'priority', display_name: 'Priority' },
            { value: 'status', display_name: 'Status' },
            { value: 'summary', display_name: 'Summary' },
            { value: 'key', display_name: 'Issue Key' },
            { value: 'assignee', display_name: 'Assignee' },
            { value: 'reporter', display_name: 'Reporter' },
            { value: 'resolution', display_name: 'Resolution' },
            { value: 'resolutiondate', display_name: 'Resolution Date' },
          ],
        },
        direction: {
          type: 'string',
          required: false,
          default_value: 'desc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
};
