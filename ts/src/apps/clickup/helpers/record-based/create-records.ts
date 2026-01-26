/**
 * ClickUp Create Records
 *
 * Creates tasks (records) in a ClickUp list.
 * ClickUp does not support batch creation, so tasks are created sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { clickUpClient } from '../../client';
import { ClickUpError } from '../../constants';
import { getClickUpListIdByPath } from './constants';

type TCustomField = {
  id: string;
  name: string;
  type: string;
};

type TTask = {
  id: string;
  name: string;
  description?: string;
  text_content?: string;
  status?: { status: string };
  priority?: { priority: string } | null;
  due_date?: string | null;
  start_date?: string | null;
  date_created?: string;
  date_updated?: string;
  assignees?: Array<{ id: number }>;
  tags?: Array<{ name: string }>;
  time_estimate?: number | null;
  points?: number | null;
  url?: string;
  parent?: string | null;
  custom_fields?: Array<{ id: string; name: string; value?: unknown }>;
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
 * Transform a record to ClickUp task payload format
 */
const transformRecordToTaskPayload = (
  record: Record<string, unknown>,
  customFieldMap: Map<string, string>
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  const customFields: Array<{ id: string; value: unknown }> = [];

  // Map standard fields
  if (record.name !== undefined) {
    payload.name = record.name;
  }

  if (record.description !== undefined) {
    payload.description = record.description;
  }

  if (record.markdown_description !== undefined) {
    payload.markdown_description = record.markdown_description;
  }

  if (record.status !== undefined) {
    payload.status = record.status;
  }

  if (record.priority !== undefined) {
    // ClickUp priority: 1=urgent, 2=high, 3=normal, 4=low
    payload.priority = record.priority;
  }

  if (record.due_date !== undefined && record.due_date !== null) {
    // Convert ISO date to Unix timestamp in milliseconds
    const date = new Date(record.due_date as string);
    if (!isNaN(date.getTime())) {
      payload.due_date = date.getTime();
      payload.due_date_time = true;
    }
  }

  if (record.start_date !== undefined && record.start_date !== null) {
    const date = new Date(record.start_date as string);
    if (!isNaN(date.getTime())) {
      payload.start_date = date.getTime();
      payload.start_date_time = true;
    }
  }

  if (record.time_estimate !== undefined && record.time_estimate !== null) {
    payload.time_estimate = record.time_estimate;
  }

  if (record.points !== undefined && record.points !== null) {
    payload.points = record.points;
  }

  if (record.parent !== undefined && record.parent !== null) {
    payload.parent = record.parent;
  }

  // Handle assignees (array of user IDs)
  if (record.assignees !== undefined && Array.isArray(record.assignees)) {
    payload.assignees = record.assignees.map((id) => Number(id));
  }

  // Handle tags (array of tag names)
  if (record.tags !== undefined && Array.isArray(record.tags)) {
    payload.tags = record.tags;
  }

  // Handle custom fields (prefixed with cf_)
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('cf_') && value !== undefined) {
      const cfName = key.slice(3); // Remove cf_ prefix
      const fieldId = customFieldMap.get(cfName);
      if (fieldId) {
        customFields.push({ id: fieldId, value });
      }
    }
  }

  if (customFields.length > 0) {
    payload.custom_fields = customFields;
  }

  return payload;
};

/**
 * Transform a ClickUp task response to flat record format
 */
const transformTaskToRecord = (task: TTask): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: task.id,
    name: task.name,
    description: task.text_content || task.description || '',
    status: task.status?.status || '',
    priority: task.priority?.priority || '',
    due_date: task.due_date ? new Date(parseInt(task.due_date)).toISOString() : null,
    start_date: task.start_date ? new Date(parseInt(task.start_date)).toISOString() : null,
    date_created: task.date_created || null,
    date_updated: task.date_updated || null,
    assignees: task.assignees?.map((a) => String(a.id)) || [],
    tags: task.tags?.map((t) => t.name) || [],
    time_estimate: task.time_estimate || null,
    points: task.points || null,
    url: task.url || '',
    parent: task.parent || null,
  };

  // Flatten custom fields
  if (task.custom_fields) {
    for (const cf of task.custom_fields) {
      record[`cf_${cf.name}`] = cf.value;
    }
  }

  return record;
};

/**
 * Create tasks (records) in a ClickUp list.
 * Tasks are created sequentially since ClickUp does not support batch creation.
 */
export const createClickUpRecords: TQoreCreateRecordsFunction = async (context, records, options) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new ClickUpError('Table path is required to create records.');
  }

  try {
    // Parse table path to get list ID
    const { listId } = await getClickUpListIdByPath({ token, tablePath });

    // Get custom field mapping
    const customFieldMap = await getCustomFieldMap(token, listId);

    // Convert column format to array of records
    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    // Create each task sequentially (ClickUp has no batch create API)
    for (const record of recordsArray) {
      const taskPayload = transformRecordToTaskPayload(record, customFieldMap);

      // Ensure task has a name (required by ClickUp)
      if (!taskPayload.name) {
        throw new ClickUpError('Task name is required');
      }

      const createdTask = await clickUpClient.post<TTask>(
        `list/${listId}/task`,
        taskPayload,
        { token }
      );

      createdRecords.push(transformTaskToRecord(createdTask));
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof ClickUpError) {
      throw error;
    }

    throw new ClickUpError(`Failed to create records: ${error}`);
  }
};
