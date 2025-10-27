import { TQoreGetSearchOptionsFunction } from '@qoretechnologies/ts-toolkit';

export const getNotionSearchOptions: TQoreGetSearchOptionsFunction = (_context) => ({
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
});
