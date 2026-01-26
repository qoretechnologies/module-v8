import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

export const HubspotSearchOptions = {
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
    type: 'int',
    required: false,
  },
} satisfies TQoreCrudOptions;
