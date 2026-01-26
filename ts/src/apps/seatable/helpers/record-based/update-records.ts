import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { seatableClient, SeaTableUpdateRowsResponse } from '../../client';
import { SeaTableError } from '../../constants';
import { searchSeaTableRecords } from './search-records';

export const updateSeaTableRecords: TQoreUpdateRecordsFunction = async (context, set, where, options) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: SeaTableError,
  });

  const tableName = options?.table;

  if (!tableName) {
    throw new SeaTableError('Table name is required to update records.');
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
    const recordsWithIds = matchingRecords.filter((r) => r._id);

    if (recordsWithIds.length === 0) {
      return 0;
    }

    // SeaTable update rows endpoint
    // Request format: { table_name: string, updates: [{ row_id: string, row: { column: value } }] }
    const updates = recordsWithIds.map((r) => ({
      row_id: r._id as string,
      row: set as Record<string, unknown>,
    }));

    await seatableClient.basePut<SeaTableUpdateRowsResponse>(
      'rows/',
      {
        table_name: tableName,
        updates,
      },
      { connectionOptions: { url, token } }
    );

    return recordsWithIds.length;
  } catch (error) {
    if (error instanceof SeaTableError) {
      throw error;
    }

    throw new SeaTableError(`Failed to update records: ${error instanceof Error ? error.message : error}`);
  }
};
