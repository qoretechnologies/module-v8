import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

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
  limit: {
    type: 'int',
    required: false,
    display_name: 'Maximum Records',
    short_desc: 'Maximum number of records to return',
    desc: 'The maximum total number of records to return across all pages. If not specified, all matching records will be returned.',
  },
} satisfies TQoreCrudOptions;
