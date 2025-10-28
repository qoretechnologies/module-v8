import { QorusRequest, TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../../constants';
import { TSupabaseTablesResponse } from '../constants';

export const getSupabaseTableList: TQoreGetTableListFunction = async (context) => {
  const { token, projectId } = getQoreContextRequiredValues({
    context,
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

    return mapTableSchemaToTableName(schema);
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError(`Failed to get tables: ${error.message || error}`);
  }
};

const mapTableSchemaToTableName = (tableSchema: TSupabaseTablesResponse['data']): string[] => {
  const tables: string[] = [];

  if (tableSchema.definitions) {
    Object.keys(tableSchema.definitions).forEach((key) => {
      if (tableSchema.paths?.[`/${key}`]) {
        tables.push(key);
      }
    });
  }

  return tables;
};
