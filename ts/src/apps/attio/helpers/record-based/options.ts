import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getAttioObjectUniqueAttributesAllowedValues } from '../get-object-attribute-allowed-values';

export const AttioSearchOptions = {
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
    display_name: 'Maximum Records',
    short_desc: 'Maximum number of records to return',
    desc: 'The maximum total number of records to return across all pages. If not specified, all matching records will be returned.',
  },
} satisfies TQoreCrudOptions;

export const AttioUpsertOptions = {
  matching_attribute: {
    required: true,
    type: 'string',
    get_allowed_values: async (context) => {
      const table = context?.opts?.table;

      return await getAttioObjectUniqueAttributesAllowedValues({
        ...context,
        opts: {
          object: table,
        },
      });
    },
    display_name: 'Matching Attribute',
    short_desc: 'Attribute to match for upsert. Must be a unique attribute.',
    desc: 'The attribute used to determine if a record already exists for updating. If no existing record is found, a new record will be created.',
  },
} satisfies TQoreCrudOptions;
