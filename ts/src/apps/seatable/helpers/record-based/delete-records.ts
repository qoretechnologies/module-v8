import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { seatableClient, SeaTableDeleteRowsResponse } from '../../client';
import { SeaTableError } from '../../constants';
import { searchSeaTableRecords } from './search-records';

export const deleteSeaTableRecords: TQoreDeleteRecordsFunction = async (context, where, options) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: SeaTableError,
  });

  const tableName = options?.table;

  if (!tableName) {
    throw new SeaTableError('Table name is required to delete records.');
  }

  try {
    // Get all matching records
    const searchIterator = await searchSeaTableRecords(context, where, { table: tableName });
    const matchingRecords: Array<{ _id?: string; [key: string]: unknown }> = [];

    let batch = await searchIterator(context, 100);
    while (batch) {
      const records = mapColumnFormatToObject(batch);
      matchingRecords.push(...records);
      batch = await searchIterator(context, 100);
    }

    if (matchingRecords.length === 0) {
      return 0;
    }

    // Filter records that have valid IDs
    const recordIds = matchingRecords.filter((r) => r._id).map((r) => r._id as string);

    if (recordIds.length === 0) {
      return 0;
    }

    // SeaTable delete rows endpoint
    // Request format: { table_name: string, row_ids: [row_id, ...] }
    await seatableClient.baseDelete<SeaTableDeleteRowsResponse>(
      'rows/',
      {
        table_name: tableName,
        row_ids: recordIds,
      },
      { connectionOptions: { url, token } }
    );

    return recordIds.length;
  } catch (error) {
    if (error instanceof SeaTableError) {
      throw error;
    }

    throw new SeaTableError(`Failed to delete records: ${error instanceof Error ? error.message : error}`);
  }
};
