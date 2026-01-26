import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { TSupabaseTablesResponse } from '../helpers/constants';

const action = 'list_tables';

const options = {
  include_system_tables: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

type TTableInfo = {
  name: string;
  description: string;
  total_columns: number;
  columns: { name: string; type: string; format?: string }[];
};

const mapTableSchemaToTableInfo = (
  tableSchema: TSupabaseTablesResponse['data'],
  includeSystemTables = false
): TTableInfo[] => {
  const tables: TTableInfo[] = [];

  if (tableSchema.definitions) {
    Object.keys(tableSchema.definitions).forEach((key) => {
      if (!includeSystemTables && key.startsWith('_')) {
        return;
      }

      if (tableSchema.paths?.[`/${key}`]) {
        const definition = tableSchema.definitions[key];
        const properties = definition.properties || {};

        tables.push({
          name: key,
          description: definition.description || '',
          columns: Object.keys(properties).map((propKey) => ({
            name: propKey,
            type: properties[propKey].type || 'unknown',
            format: properties[propKey].format,
          })),
          total_columns: Object.keys(properties).length,
        });
      }
    });
  }

  return tables;
};

const listTables = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, projectId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'projectId'],
      ErrorClass: SupabaseError,
    });

    const includeSystemTables = obj?.include_system_tables || false;

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

      const tables = mapTableSchemaToTableInfo(schema, includeSystemTables);

      return {
        total_tables: tables.length,
        tables: tables.sort((a, b) => a.name.localeCompare(b.name)),
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
      total_tables: {
        type: 'integer',
      },
      tables: {
        type: {
          type: 'list',
          element_type: {
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
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default listTables;
