/**
 * ClickUp Delete Records
 *
 * Deletes tasks (records) from a ClickUp list that match a WHERE condition.
 * ClickUp does not support batch deletion, so tasks are deleted sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { clickUpClient } from '../../client';
import { ClickUpError } from '../../constants';
import { searchClickUpRecords } from './search-records';

/**
 * Delete tasks (records) from a ClickUp list that match the WHERE condition.
 * Tasks are deleted sequentially since ClickUp does not support batch deletion.
 *
 * @returns The number of records deleted
 */
export const deleteClickUpRecords: TQoreDeleteRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  const tablePath = opts?.table;

  if (!tablePath) {
    throw new ClickUpError('Table path is required to delete records.');
  }

  try {
    // Search for matching records
    const searchIterator = await searchClickUpRecords(ctx, where, { table: tablePath });
    const matchingRecords: Array<{ id?: string }> = [];

    // Collect all matching records
    let batch = await searchIterator(ctx, 100);
    while (batch) {
      const records = mapColumnFormatToObject(batch);
      matchingRecords.push(...records);
      batch = await searchIterator(ctx, 100);
    }

    if (matchingRecords.length === 0) {
      return 0;
    }

    // Delete each task sequentially
    let deletedCount = 0;

    for (const record of matchingRecords) {
      if (!record.id) {
        continue;
      }

      await clickUpClient.delete(`task/${record.id}`, { token });
      deletedCount++;
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof ClickUpError) {
      throw error;
    }

    throw new ClickUpError(`Failed to delete records: ${error}`);
  }
};
