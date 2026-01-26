import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  QorusRequest,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';

export const getSupabaseTableAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, projectId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'projectId'],
    ErrorClass: SupabaseError,
  });

  try {
    const response = await QorusRequest.get<{
      data: {
        definitions?: Record<string, { description?: string }>;
        paths?: Record<string, unknown>;
      };
    }>(
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

    const tables: IQoreAllowedValue<string>[] = [];

    if (schema?.definitions) {
      Object.keys(schema.definitions).forEach((key) => {
        if (!key.startsWith('_') && schema?.paths?.[`/${key}`]) {
          const definition = schema?.definitions?.[key];
          tables.push({
            value: key,
            display_name: key,
            desc: definition?.description || `Table: ${key}`,
          });
        }
      });
    }

    return tables;
  } catch (error) {
    throw new SupabaseError(`Failed to fetch table names: ${error.message || error}`);
  }
};
