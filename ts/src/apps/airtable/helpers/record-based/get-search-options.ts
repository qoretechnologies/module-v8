import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Search options for Airtable record-based search operations.
 */
export const AirtableSearchOptions = {
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
  baseId: {
    type: 'string',
    required: false,
    desc: 'The ID of the Airtable base. If not provided, table name must be in format "baseName/tableName".',
  },
} satisfies TQoreCrudOptions;
