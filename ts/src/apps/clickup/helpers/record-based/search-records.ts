/**
 * ClickUp Search Records
 *
 * Implements iterator-based search for ClickUp tasks with filtering and pagination.
 * Tasks are the "records" in the ClickUp record-based context.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { clickUpClient } from '../../client';
import { ClickUpError } from '../../constants';
import { buildClickUpFilter, filterParamsToQueryParams } from './apply-where-condition';
import { getClickUpListIdByPath, MAX_PAGE_SIZE } from './constants';

/**
 * ClickUp task type from API response
 */
type TTask = {
  id: string;
  name: string;
  description?: string;
  text_content?: string;
  markdown_description?: string;
  status?: {
    status: string;
    color?: string;
    type?: string;
  };
  priority?: {
    id: string;
    priority: string;
    color?: string;
  } | null;
  due_date?: string | null;
  start_date?: string | null;
  date_created?: string;
  date_updated?: string;
  date_closed?: string | null;
  assignees?: Array<{ id: number; username?: string; email?: string }>;
  watchers?: Array<{ id: number; username?: string }>;
  tags?: Array<{ name: string }>;
  time_estimate?: number | null;
  time_spent?: number | null;
  points?: number | null;
  url?: string;
  parent?: string | null;
  list?: { id: string };
  folder?: { id: string };
  space?: { id: string };
  creator?: { id: number };
  custom_fields?: Array<{
    id: string;
    name: string;
    type: string;
    value?: unknown;
  }>;
};

type TCustomField = {
  id: string;
  name: string;
  type: string;
};

/**
 * Transform a ClickUp task to a flat record format
 */
const transformTaskToRecord = (task: TTask): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: task.id,
    name: task.name,
    description: task.text_content || task.description || '',
    markdown_description: task.markdown_description || '',
    status: task.status?.status || '',
    priority: task.priority?.priority || '',
    due_date: task.due_date ? new Date(parseInt(task.due_date)).toISOString() : null,
    start_date: task.start_date ? new Date(parseInt(task.start_date)).toISOString() : null,
    date_created: task.date_created || null,
    date_updated: task.date_updated || null,
    date_closed: task.date_closed || null,
    assignees: task.assignees?.map((a) => String(a.id)) || [],
    watchers: task.watchers?.map((w) => String(w.id)) || [],
    tags: task.tags?.map((t) => t.name) || [],
    time_estimate: task.time_estimate || null,
    time_spent: task.time_spent || null,
    points: task.points || null,
    url: task.url || '',
    parent: task.parent || null,
    list_id: task.list?.id || '',
    folder_id: task.folder?.id || '',
    space_id: task.space?.id || '',
    creator_id: task.creator ? String(task.creator.id) : '',
  };

  // Flatten custom fields with cf_ prefix
  if (task.custom_fields) {
    for (const cf of task.custom_fields) {
      record[`cf_${cf.name}`] = cf.value;
    }
  }

  return record;
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
    // Custom fields might not be available for all lists
    // Continue with empty map
  }

  return fieldMap;
};

/**
 * Search for ClickUp tasks (records) with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchClickUpRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  const tablePath = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!tablePath) {
    throw new ClickUpError('Table path is required in opts.table');
  }

  try {
    // Parse table path to get list ID
    const { listId } = await getClickUpListIdByPath({ token, tablePath });

    // Get custom field mapping for filter processing
    const customFieldMap = await getCustomFieldMap(token, listId);

    // Build filter params from WHERE condition
    const filterParams = where ? buildClickUpFilter(where, customFieldMap) : {};
    const baseQueryParams = filterParamsToQueryParams(filterParams);

    // Handle ordering
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;

    let page = 0;
    let hasMore = true;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      try {
        const pageSize = Math.min(blockSize, MAX_PAGE_SIZE, limit);

        // Build query params for this page
        const queryParams: Record<string, string | string[]> = {
          ...baseQueryParams,
          page: String(page),
        };

        // Add ordering if specified
        if (orderBy?.field) {
          queryParams.order_by = orderBy.field;
          if (orderBy.direction === 'desc') {
            queryParams.reverse = 'true';
          }
        }

        // Fetch tasks from ClickUp
        const response = await clickUpClient.get<{ tasks: TTask[]; last_page: boolean }>(
          `list/${listId}/task`,
          {
            token,
            params: queryParams,
          }
        );

        const tasks = response?.tasks || [];

        if (tasks.length === 0) {
          hasMore = false;
          return null;
        }

        page++;

        // Check if this is the last page
        if (response.last_page === true || tasks.length < pageSize) {
          hasMore = false;
        }

        // Transform tasks to flat record format
        const records = tasks.map(transformTaskToRecord);

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof ClickUpError) {
          throw error;
        }
        throw new ClickUpError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof ClickUpError) {
      throw error;
    }
    throw new ClickUpError(`Failed to initialize search for table ${tablePath}: ${error}`);
  }
};
