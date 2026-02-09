/**
 * ActiveCampaign Get Search Options
 *
 * Defines the available search options for record-based queries.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Search options for ActiveCampaign record-based operations.
 * Includes orderBy with sortable fields across all supported entities.
 */
export const ActiveCampaignSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'id', display_name: 'ID' },
            { value: 'cdate', display_name: 'Created Date' },
            { value: 'email', display_name: 'Email (Contacts)' },
            { value: 'first_name', display_name: 'First Name (Contacts)' },
            { value: 'last_name', display_name: 'Last Name (Contacts)' },
            { value: 'title', display_name: 'Title (Deals)' },
            { value: 'value', display_name: 'Value (Deals)' },
            { value: 'name', display_name: 'Name (Accounts)' },
            { value: 'createdTimestamp', display_name: 'Created Timestamp (Accounts)' },
            { value: 'updatedTimestamp', display_name: 'Updated Timestamp (Accounts)' },
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
