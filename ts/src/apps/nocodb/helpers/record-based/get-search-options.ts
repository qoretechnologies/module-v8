import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * NocoDB search options for record-based operations
 *
 * v3 API sort format: [{"direction":"asc|desc","field":"FieldName"}]
 */
export const NocoDBSearchOptions = {
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
