import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { fromV3Response, nocodbClient, NocoDBV3Response, toV3Request } from '../../client';
import { NocoDBError } from '../../constants';
import { getNocoDBTableIdByPath } from './get-table-list';

export const createNocoDBRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  options
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: NocoDBError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new NocoDBError('Table path is required to create records.');
  }

  try {
    // Parse hierarchical table path (workspace/base/table) to get baseId and tableId
    const { baseId, tableId } = await getNocoDBTableIdByPath({ token, url, tablePath });
    const items = mapColumnFormatToObject(records);

    // v3 API endpoint: /api/v3/data/{baseId}/{tableId}/records
    // v3 request format: [{ fields: { col: val, ... } }]
    const v3RequestBody = toV3Request(items);

    const response = await nocodbClient.post<NocoDBV3Response>(
      `data/${baseId}/${tableId}/records`,
      v3RequestBody,
      {
        token,
        connectionOptions: { url },
      }
    );

    // v3 response format: { records: [{ id, fields }] }
    const createdRecords = fromV3Response(response?.records || []);

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }

    throw new NocoDBError(`Failed to create records: ${error}`);
  }
};
