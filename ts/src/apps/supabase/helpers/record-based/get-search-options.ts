import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

export const SupabaseSearchOptions = {
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
          required: false,
        },
      },
    },
  },
} satisfies TQoreCrudOptions;
