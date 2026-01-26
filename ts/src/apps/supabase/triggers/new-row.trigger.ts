import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SupabaseFilterOperatorAllowedValues } from '../helpers/get-filter-operator-allowed-values';
import { getSupabaseTableAllowedValues } from '../helpers/get-table-allowed-values';
import {
  getSupabaseTableColumnAllowedValues,
  getSupabaseTableColumnsResponseType,
} from '../helpers/get-table-fields';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { createSupabaseClient } from '../helpers/constants';

const action = 'new_table_row';

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

const NewTableRow = QoreAppCreator.createLocalizedTrigger({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, projectId, tableName } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'projectId'],
      optionFields: ['tableName'],
      ErrorClass: SupabaseError,
    });

    const { filter } = context.opts || {};

    const getItems = () => {
      return fetchLatestRows({
        token,
        projectId,
        tableName,
        filter,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `supabase_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, projectId, tableName } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'projectId'],
      optionFields: ['tableName'],
      ErrorClass: SupabaseError,
    });

    const { filter } = context.opts || {};

    const rows = await fetchLatestRows({
      token,
      projectId,
      tableName,
      filter,
    });

    return rows?.length ? rows[0] : null;
  },
  event_info: {
    desc: 'Supabase New Table Row Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        created_at: { type: 'string' },
      },
    },
  },
  get_dynamic_type: getSupabaseTableColumnsResponseType,
});

const fetchLatestRows = async (options: {
  token: string;
  projectId: string;
  tableName: string;
  filter?: {
    field: string;
    operator: string;
    value: string;
  };
}): Promise<Record<string, any>[]> => {
  const { token, projectId, tableName, filter } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

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

    query = query.order('created_at', { ascending: false });
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new SupabaseError(`Supabase error: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
  }
};

export default NewTableRow;
