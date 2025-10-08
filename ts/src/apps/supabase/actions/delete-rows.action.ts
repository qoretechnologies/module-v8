import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { createSupabaseClient } from '../helpers/constants';
import { getSupabaseTableAllowedValues } from '../helpers/get-table-allowed-values';
import { getSupabaseTableColumnAllowedValues } from '../helpers/get-table-fields';

const action = 'delete_rows';

const options = {
  tableName: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSupabaseTableAllowedValues,
    on_change: ['refetch'],
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          get_allowed_values: getSupabaseTableColumnAllowedValues,
          depends_on: ['tableName'],
        },
        operator: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'eq', display_name: 'Equals (=)' },
            { value: 'neq', display_name: 'Not equals (!=)' },
            { value: 'gt', display_name: 'Greater than (>)' },
            { value: 'gte', display_name: 'Greater than or equal (>=)' },
            { value: 'lt', display_name: 'Less than (<)' },
            { value: 'lte', display_name: 'Less than or equal (<=)' },
            { value: 'like', display_name: 'Pattern match (LIKE)' },
            { value: 'ilike', display_name: 'Case-insensitive pattern match (ILIKE)' },
            { value: 'in', display_name: 'In list (IN)' },
          ],
        },
        value: { type: 'string', required: true },
      },
    },
    required: true,
  },
} satisfies TQoreOptions;

const deleteRows = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, projectId, tableName, filter } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['tableName', 'filter'],
      connectionFields: ['token', 'projectId'],
      ErrorClass: SupabaseError,
    });

    try {
      const client = createSupabaseClient({ token, projectId });

      let query: any = client.from(tableName).delete();

      if (filter && filter.field && filter.operator && filter.value !== undefined) {
        const { field, operator, value } = filter;

        switch (operator) {
          case 'eq':
            query = query.eq(field, value);
            break;
          case 'neq':
            query = query.neq(field, value);
            break;
          case 'gt':
            query = query.gt(field, value);
            break;
          case 'gte':
            query = query.gte(field, value);
            break;
          case 'lt':
            query = query.lt(field, value);
            break;
          case 'lte':
            query = query.lte(field, value);
            break;
          case 'like':
            query = query.like(field, value);
            break;
          case 'ilike':
            query = query.ilike(field, value);
            break;
          case 'in':
            const inValues = value.split(',').map((v: string) => v.trim());
            query = query.in(field, inValues);
            break;
          default:
            query = query.eq(field, value);
        }
      }

      const { data, error, count } = await query.select();

      if (error) {
        throw new SupabaseError(`Supabase delete error: ${error.message}`);
      }

      return {
        deleted_count: count || data?.length || 0,
        deleted_rows: data || [],
      };
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      deleted_count: { type: 'integer' },
      deleted_rows: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
          },
        },
      },
    },
  },
});

export default deleteRows;
