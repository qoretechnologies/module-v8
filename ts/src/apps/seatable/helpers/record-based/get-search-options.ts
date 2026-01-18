import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * SeaTable search options for record-based operations
 *
 * SQL ORDER BY format: ORDER BY `column` ASC|DESC
 */
export const SeaTableSearchOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
        },
        direction: {
          type: 'string',
          required: false,
          default_value: 'asc',
        },
      },
    },
  },
} satisfies TQoreCrudOptions;
