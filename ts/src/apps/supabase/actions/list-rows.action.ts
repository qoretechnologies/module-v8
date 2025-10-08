import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { createSupabaseClient } from '../helpers/constants';
import { getSupabaseTableAllowedValues } from '../helpers/get-table-allowed-values';
import {
  getSupabaseTableColumnAllowedValues,
  getSupabaseTableColumnsResponseType,
} from '../helpers/get-table-fields';
import { SupabaseFilterOperatorAllowedValues } from '../helpers/get-filter-operator-allowed-values';

const action = 'list_rows';

const options = {
  tableName: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSupabaseTableAllowedValues,
    on_change: ['refetch'],
  },
  limit: {
    type: 'integer',
    required: false,
  },
  offset: {
    type: 'integer',
    required: false,
  },
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        column: {
          type: 'string',
          required: true,
          get_allowed_values: getSupabaseTableColumnAllowedValues,
          depends_on: ['tableName'],
        },
        ascending: {
          type: 'boolean',
          required: false,
          default_value: true,
        },
      },
    },
    required: false,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          get_allowed_values: getSupabaseTableColumnAllowedValues,
        },
        operator: {
          type: 'string',
          required: true,
          allowed_values: SupabaseFilterOperatorAllowedValues,
        },
        value: { type: 'string', required: true },
      },
    },
  },
} satisfies TQoreOptions;

const listRows = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, projectId, tableName } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['tableName'],
      connectionFields: ['token', 'projectId'],
      ErrorClass: SupabaseError,
    });

    const { limit = 20, offset = 0, filter, orderBy } = obj || {};

    try {
      const client = createSupabaseClient({ token, projectId });
      let query: any = client.from(tableName).select('*');

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
          case 'is':
            query = query.is(field, value);
            break;
          case 'in':
            const inValues = value.split(',').map((v) => v.trim());
            query = query.in(field, inValues);
            break;
          case 'contains':
            query = query.contains(field, value);
            break;
          case 'containedBy':
            query = query.containedBy(field, value);
            break;
          default:
            query = query.eq(field, value);
        }
      }

      if (orderBy && orderBy.column) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      query = query.limit(limit);

      if (offset) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new SupabaseError(`Supabase error: ${error.message}`);
      }

      return {
        data: data || [],
        count: count || 0,
        limit,
        offset,
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
      data: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              created_at: { type: 'string' },
            },
          },
        },
      },
      count: { type: 'integer' },
      limit: { type: 'integer' },
      offset: { type: 'integer' },
    },
  },
  get_dynamic_response_type: async (context) => {
    const columns = await getSupabaseTableColumnsResponseType(context);

    return {
      type: 'hash',
      fields: {
        data: {
          type: {
            type: 'list',
            element_type: columns,
          },
        },
        count: { type: 'integer' },
        limit: { type: 'integer' },
        offset: { type: 'integer' },
      },
    };
  },
});

export default listRows;
