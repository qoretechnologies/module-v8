/**
 * Trello Search Options
 *
 * Defines the available sorting options for card searches.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Search options for Trello records
 */
export const TrelloSearchOptions: TQoreCrudOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'name', display_name: 'Card Name' },
            { value: 'pos', display_name: 'Position' },
            { value: 'due', display_name: 'Due Date' },
            { value: 'dateLastActivity', display_name: 'Last Activity' },
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
};
