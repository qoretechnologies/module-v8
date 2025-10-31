import { TQoreSearchOptions } from '@qoretechnologies/ts-toolkit';

export const NotionSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        column: {
          type: 'string',
          required: true,
        },
        ascending: {
          type: 'bool',
          required: true,
        },
      },
    },
  },
} satisfies TQoreSearchOptions;
