import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { nocodbClient, toV3UpdateRequest } from '../../client';
import { NocoDBError } from '../../constants';
import { getNocoDBTableIdByPath } from './get-table-list';
import { searchNocoDBRecords } from './search-records';

export const updateNocoDBRecords: TQoreUpdateRecordsFunction = async (
  context,
  set,
  where,
  options
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: NocoDBError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new NocoDBError('Table path is required to update records.');
  }

  try {
    // Parse hierarchical table path (workspace/base/table) to get baseId and tableId
    const { baseId, tableId } = await getNocoDBTableIdByPath({ token, url, tablePath });

    // Get all matching records
    const searchIterator = await searchNocoDBRecords(context, where, { table: tablePath });
    const matchingRecords: Array<{ id?: string; [key: string]: unknown }> = [];

    let batch = await searchIterator(context, 100);
    while (batch) {
      // Convert from column format back to object format
      const records = mapColumnFormatToObject(batch);
      matchingRecords.push(...records);
      batch = await searchIterator(context, 100);
    }

    if (matchingRecords.length === 0) {
      return 0;
    }

    // Filter records that have valid IDs (v3 uses lowercase 'id')
    const recordsWithIds = matchingRecords.filter((r) => r.id);

    if (recordsWithIds.length === 0) {
      return 0;
    }

    // v3 API supports bulk update: PATCH /api/v3/data/{baseId}/{tableId}/records
    // Request format: [{ id: recordId, fields: { col: val, ... } }]
    const updatePayload = toV3UpdateRequest(
      recordsWithIds.map((r) => ({
        id: r.id as string,
        data: set as Record<string, unknown>,
      }))
    );

    await nocodbClient.patch(`data/${baseId}/${tableId}/records`, updatePayload, {
      token,
      connectionOptions: { url },
    });

    return recordsWithIds.length;
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }

    throw new NocoDBError(`Failed to update records: ${error instanceof Error ? error.message : error}`);
  }
};
