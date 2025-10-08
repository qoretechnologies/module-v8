import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { createSupabaseClient } from '../helpers/constants';
import { getSupabaseTableAllowedValues } from '../helpers/get-table-allowed-values';
import {
  getSupabaseTableColumnOptions,
  getSupabaseTableColumnsResponseType,
} from '../helpers/get-table-fields';

const action = 'create_row';

const options = {
  tableName: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSupabaseTableAllowedValues,
    on_change: ['refetch'],
  },
  values: {
    type: 'hash',
    required: true,
    get_dynamic_type: getSupabaseTableColumnOptions,
  },
} satisfies TQoreOptions;

const createRow = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, projectId, tableName, values } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['tableName', 'values'],
      connectionFields: ['token', 'projectId'],
      ErrorClass: SupabaseError,
    });

    try {
      const client = createSupabaseClient({ token, projectId });

      const { data, error } = await client.from(tableName).insert([values]).select().single();

      if (error) {
        throw new SupabaseError(`Supabase insert error: ${error.message}`);
      }

      return data;
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
      id: { type: 'string' },
      created_at: { type: 'string' },
    },
  },
  get_dynamic_response_type: getSupabaseTableColumnsResponseType,
});

export default createRow;
