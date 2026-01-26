import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

export const ZendeskSearchOptions = {
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
  limit: {
    type: 'integer',
    desc: 'Maximum number of records to return',
  },
} satisfies TQoreCrudOptions;
