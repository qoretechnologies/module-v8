import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { nocodbClient } from '../client';
import { NOCODB_APP_NAME, NocoDBError } from '../constants';
import { getNocoDBWorkspaceAllowedValues } from '../helpers/get-workspace-allowed-values';
import { getNocoDBBaseAllowedValues } from '../helpers/get-base-allowed-values';
import { getNocoDBTableAllowedValues } from '../helpers/get-table-allowed-values';
import { getNocoDBTableIdByName } from '../helpers/record-based/constants';

const action = 'count_records';

const options = {
  workspaceId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBWorkspaceAllowedValues,
    on_change: ['refetch'],
  },
  baseId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBBaseAllowedValues,
    on_change: ['refetch'],
  },
  table: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBTableAllowedValues,
  },
  where: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

type TCountResponse = {
  count: number;
};

const CountRecords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOCODB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      count: { type: 'integer' },
    },
  },
  api_function: async (obj, _opts, context) => {
    const { token, url, baseId, table } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['baseId', 'table'],
      ErrorClass: NocoDBError,
    });

    const where = obj?.where as string | undefined;

    try {
      // Convert table name to table ID
      const tableId = await getNocoDBTableIdByName({ token, url, baseId, tableName: table });

      const queryParams: Record<string, string> = {};
      if (where) {
        queryParams.where = where;
      }

      // v3 API endpoint: GET /api/v3/data/{baseId}/{tableId}/count
      const response = await nocodbClient.get<TCountResponse>(`data/${baseId}/${tableId}/count`, {
        token,
        connectionOptions: { url },
        params: queryParams,
      });

      return { count: response?.count ?? 0 };
    } catch (error) {
      if (error instanceof NocoDBError) {
        throw error;
      }
      throw new NocoDBError(`Failed to count records: ${error instanceof Error ? error.message : error}`);
    }
  },
});

export default CountRecords;
