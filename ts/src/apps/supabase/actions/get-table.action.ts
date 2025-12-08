import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { getSupabaseTableAllowedValues } from '../helpers/get-table-allowed-values';
import { TSupabaseTablesResponse } from '../helpers/constants';

const action = 'get_table';

const options = {
  tableName: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSupabaseTableAllowedValues,
    on_change: ['refetch'],
  },
} satisfies TQoreOptions;

const getTable = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      const response = await QorusRequest.get<TSupabaseTablesResponse>(
        {
          path: '/rest/v1/',
          headers: {
            apikey: token,
            Authorization: `Bearer ${token}`,
          },
        },
        {
          url: `https://${projectId}.supabase.co`,
          endpointId: SUPABASE_APP_NAME,
        }
      );

      const schema = response?.data;

      if (!schema) throw new Error('No schema data received from Supabase');

      if (!schema.definitions || !schema.definitions[tableName]) {
        throw new Error(`Table '${tableName}' not found`);
      }

      const tableDefinition = schema.definitions[tableName];
      const properties = tableDefinition.properties || {};
      const required = tableDefinition.required || [];

      const columns = Object.keys(properties).map((key) => {
        const prop = properties[key];
        return {
          name: key,
          type: prop.type || 'unknown',
          format: prop.format || null,
          description: prop.description || null,
          is_required: required.includes(key),
          default_value: prop.default || null,
          is_nullable: !required.includes(key),
        };
      });

      return {
        name: tableName,
        description: tableDefinition.description || '',
        total_columns: columns.length,
        columns,
        required_columns: required,
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
      name: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      total_columns: {
        type: 'integer',
      },
      required_columns: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      columns: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              format: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              is_required: {
                type: 'bool',
              },
              is_nullable: {
                type: 'bool',
              },
              default_value: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
});

export default getTable;
