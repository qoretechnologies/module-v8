import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { nocodbClient, toV3DeleteRequest } from '../../client';
import { NocoDBError } from '../../constants';
import { getNocoDBTableIdByPath } from './get-table-list';
import { searchNocoDBRecords } from './search-records';

export const deleteNocoDBRecords: TQoreDeleteRecordsFunction = async (context, where, options) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: NocoDBError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new NocoDBError('Table path is required to delete records.');
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
    const recordIds = matchingRecords.filter((r) => r.id).map((r) => r.id as string);

    if (recordIds.length === 0) {
      return 0;
    }

    // v3 API supports bulk delete: DELETE /api/v3/data/{baseId}/{tableId}/records
    // Request body: [{ id: recordId }, ...]
    const deletePayload = toV3DeleteRequest(recordIds);

    await nocodbClient.delete(`data/${baseId}/${tableId}/records`, {
      token,
      connectionOptions: { url },
      body: deletePayload,
    });

    return recordIds.length;
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }

    throw new NocoDBError(`Failed to delete records: ${error instanceof Error ? error.message : error}`);
  }
};
