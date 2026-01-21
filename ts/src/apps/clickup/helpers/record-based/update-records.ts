/**
 * ClickUp Update Records
 *
 * Updates tasks (records) in a ClickUp list that match a WHERE condition.
 * ClickUp does not support batch updates, so tasks are updated sequentially.
 * Custom fields require separate API calls.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { clickUpClient } from '../../client';
import { ClickUpError } from '../../constants';
import { getClickUpListIdByPath } from './constants';
import { searchClickUpRecords } from './search-records';

type TCustomField = {
  id: string;
  name: string;
  type: string;
};

/**
 * Get custom field name to ID mapping for a list
 */
const getCustomFieldMap = async (
  token: string,
  listId: string
): Promise<Map<string, string>> => {
  const fieldMap = new Map<string, string>();

  try {
    const response = await clickUpClient.get<{ fields: TCustomField[] }>(
      `list/${listId}/field`,
      { token }
    );

    const fields = response?.fields || [];
    for (const field of fields) {
      fieldMap.set(field.name, field.id);
    }
  } catch {
    // Custom fields might not be available
  }

  return fieldMap;
};

/**
 * Extract custom field updates from a record
 */
const extractCustomFieldUpdates = (
  record: Record<string, unknown>,
  customFieldMap: Map<string, string>
): Array<{ fieldId: string; value: unknown }> => {
  const updates: Array<{ fieldId: string; value: unknown }> = [];

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('cf_') && value !== undefined) {
      const cfName = key.slice(3); // Remove cf_ prefix
      const fieldId = customFieldMap.get(cfName);
      if (fieldId) {
        updates.push({ fieldId, value });
      }
    }
  }

  return updates;
};

/**
 * Build standard task update payload (excludes custom fields)
 */
const buildStandardUpdatePayload = (
  record: Record<string, unknown>
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (record.name !== undefined) {
    payload.name = record.name;
  }

  if (record.description !== undefined) {
    payload.description = record.description;
  }

  if (record.status !== undefined) {
    payload.status = record.status;
  }

  if (record.priority !== undefined) {
    payload.priority = record.priority;
  }

  if (record.due_date !== undefined) {
    if (record.due_date === null) {
      payload.due_date = null;
    } else {
      const date = new Date(record.due_date as string);
      if (!isNaN(date.getTime())) {
        payload.due_date = date.getTime();
        payload.due_date_time = true;
      }
    }
  }

  if (record.start_date !== undefined) {
    if (record.start_date === null) {
      payload.start_date = null;
    } else {
      const date = new Date(record.start_date as string);
      if (!isNaN(date.getTime())) {
        payload.start_date = date.getTime();
        payload.start_date_time = true;
      }
    }
  }

  if (record.time_estimate !== undefined) {
    payload.time_estimate = record.time_estimate;
  }

  if (record.points !== undefined) {
    payload.points = record.points;
  }

  if (record.parent !== undefined) {
    payload.parent = record.parent;
  }

  // Handle assignees - ClickUp uses add/remove pattern for updates
  if (record.assignees !== undefined && Array.isArray(record.assignees)) {
    payload.assignees = {
      add: record.assignees.map((id) => Number(id)),
    };
  }

  return payload;
};

/**
 * Update tasks (records) in a ClickUp list that match the WHERE condition.
 * Tasks are updated sequentially since ClickUp does not support batch updates.
 * Custom fields are updated via separate API calls.
 *
 * @returns The number of records updated
 */
export const updateClickUpRecords: TQoreUpdateRecordsFunction = async (ctx, set, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  const tablePath = opts?.table;

  if (!tablePath) {
    throw new ClickUpError('Table path is required to update records.');
  }

  try {
    // Parse table path to get list ID
    const { listId } = await getClickUpListIdByPath({ token, tablePath });

    // Get custom field mapping
    const customFieldMap = await getCustomFieldMap(token, listId);

    // Search for matching records
    const searchIterator = await searchClickUpRecords(ctx, where, { table: tablePath });
    const matchingRecords: Array<{ id?: string; [key: string]: unknown }> = [];

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

    // Prepare update payload
    const setRecord = set as Record<string, unknown>;
    const standardPayload = buildStandardUpdatePayload(setRecord);
    const customFieldUpdates = extractCustomFieldUpdates(setRecord, customFieldMap);
    const hasStandardUpdates = Object.keys(standardPayload).length > 0;

    // Update each task sequentially
    let updatedCount = 0;

    for (const record of matchingRecords) {
      if (!record.id) {
        continue;
      }

      const taskId = record.id as string;

      // Update standard fields if any
      if (hasStandardUpdates) {
        await clickUpClient.put(`task/${taskId}`, standardPayload, { token });
      }

      // Update custom fields (requires separate API call per field)
      for (const cf of customFieldUpdates) {
        await clickUpClient.post(
          `task/${taskId}/field/${cf.fieldId}`,
          { value: cf.value },
          { token }
        );
      }

      updatedCount++;
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof ClickUpError) {
      throw error;
    }

    throw new ClickUpError(`Failed to update records: ${error}`);
  }
};
