/**
 * Mailchimp Search Options
 *
 * Defines the available search options for record-based queries.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

export const MailchimpSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'email_address', display_name: 'Email Address' },
            { value: 'last_changed', display_name: 'Last Changed' },
            { value: 'timestamp_signup', display_name: 'Signup Date' },
            { value: 'member_rating', display_name: 'Member Rating' },
            { value: 'avg_open_rate', display_name: 'Average Open Rate' },
            { value: 'avg_click_rate', display_name: 'Average Click Rate' },
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
