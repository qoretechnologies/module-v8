/**
 * Asana Search Records
 *
 * Implements iterator-based search for Asana tasks with filtering and pagination.
 * Tasks are the "records" in the Asana record-based context.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { asanaClient } from '../../client';
import { buildAsanaFilter, filterParamsToQueryParams } from './apply-where-condition';
import {
  AsanaError,
  CUSTOM_FIELD_PREFIX,
  getAsanaCustomFields,
  getAsanaProjectByPath,
  MAX_PAGE_SIZE,
} from './constants';

/**
 * Asana task type from API response
 */
type TTask = {
  gid: string;
  name: string;
  notes?: string;
  html_notes?: string;
  completed: boolean;
  completed_at?: string | null;
  due_on?: string | null;
  due_at?: string | null;
  start_on?: string | null;
  start_at?: string | null;
  assignee?: { gid: string; name?: string } | null;
  followers?: Array<{ gid: string; name?: string }>;
  projects?: Array<{ gid: string; name?: string }>;
  tags?: Array<{ gid: string; name?: string }>;
  parent?: { gid: string } | null;
  created_at?: string;
  modified_at?: string;
  permalink_url?: string;
  resource_subtype?: string;
  num_subtasks?: number;
  liked?: boolean;
  num_likes?: number;
  custom_fields?: Array<{
    gid: string;
    name: string;
    type?: string;
    resource_subtype?: string;
    display_value?: string;
    text_value?: string;
    number_value?: number;
    enum_value?: { gid: string; name: string } | null;
    multi_enum_values?: Array<{ gid: string; name: string }>;
    people_value?: Array<{ gid: string; name?: string }>;
    date_value?: { date: string; date_time?: string } | null;
  }>;
};

/**
 * Transform an Asana task to a flat record format
 */
const transformTaskToRecord = (task: TTask): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: task.gid,
    name: task.name,
    notes: task.notes || '',
    html_notes: task.html_notes || '',
    completed: task.completed,
    completed_at: task.completed_at || null,
    due_on: task.due_on || null,
    due_at: task.due_at || null,
    start_on: task.start_on || null,
    start_at: task.start_at || null,
    assignee: task.assignee?.gid || null,
    assignee_name: task.assignee?.name || null,
    followers: task.followers?.map((f) => f.gid) || [],
    projects: task.projects?.map((p) => p.gid) || [],
    tags: task.tags?.map((t) => t.gid) || [],
    parent: task.parent?.gid || null,
    created_at: task.created_at || null,
    modified_at: task.modified_at || null,
    permalink_url: task.permalink_url || '',
    resource_subtype: task.resource_subtype || 'default_task',
    num_subtasks: task.num_subtasks || 0,
    liked: task.liked || false,
    num_likes: task.num_likes || 0,
  };

  // Flatten custom fields with cf_ prefix
  if (task.custom_fields) {
    for (const cf of task.custom_fields) {
      const fieldKey = `${CUSTOM_FIELD_PREFIX}${cf.name}`;
      const fieldType = cf.resource_subtype || cf.type;

      switch (fieldType) {
        case 'text':
          record[fieldKey] = cf.text_value || cf.display_value || null;
          break;
        case 'number':
          record[fieldKey] = cf.number_value ?? null;
          break;
        case 'enum':
          record[fieldKey] = cf.enum_value?.name || null;
          break;
        case 'multi_enum':
          record[fieldKey] = cf.multi_enum_values?.map((v) => v.name) || [];
          break;
        case 'people':
          record[fieldKey] = cf.people_value?.map((p) => p.gid) || [];
          break;
        case 'date':
          record[fieldKey] = cf.date_value?.date || cf.date_value?.date_time || null;
          break;
        default:
          record[fieldKey] = cf.display_value || null;
      }
    }
  }

  return record;
};

/**
 * Search for Asana tasks (records) with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchAsanaRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: AsanaError,
  });

  const tablePath = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!tablePath) {
    throw new AsanaError('Table path is required in opts.table');
  }

  try {
    // Parse table path to get workspace and project GIDs
    const { projectGid, workspaceGid } = await getAsanaProjectByPath({ token, tablePath });

    // Get custom field mapping for filter processing
    const customFieldsMap = await getAsanaCustomFields({ token, workspaceGid });

    // Build filter params from WHERE condition
    const filterParams = where ? buildAsanaFilter(where, customFieldsMap) : {};
    const baseQueryParams = filterParamsToQueryParams(filterParams);

    // Add project filter
    baseQueryParams['projects.any'] = projectGid;

    // Handle ordering
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
    if (orderBy?.field) {
      baseQueryParams.sort_by = orderBy.field;
      if (orderBy.direction === 'desc') {
        baseQueryParams.sort_ascending = 'false';
      } else {
        baseQueryParams.sort_ascending = 'true';
      }
    }

    // Add opt_fields to get all needed data including custom fields
    const optFields = [
      'gid',
      'name',
      'notes',
      'html_notes',
      'completed',
      'completed_at',
      'due_on',
      'due_at',
      'start_on',
      'start_at',
      'assignee',
      'assignee.name',
      'followers',
      'followers.name',
      'projects',
      'projects.name',
      'tags',
      'tags.name',
      'parent',
      'created_at',
      'modified_at',
      'permalink_url',
      'resource_subtype',
      'num_subtasks',
      'liked',
      'num_likes',
      'custom_fields',
      'custom_fields.gid',
      'custom_fields.name',
      'custom_fields.resource_subtype',
      'custom_fields.display_value',
      'custom_fields.text_value',
      'custom_fields.number_value',
      'custom_fields.enum_value',
      'custom_fields.enum_value.name',
      'custom_fields.multi_enum_values',
      'custom_fields.multi_enum_values.name',
      'custom_fields.people_value',
      'custom_fields.people_value.name',
      'custom_fields.date_value',
    ].join(',');

    let offset: string | null = null;
    let hasMore = true;
    let totalFetched = 0;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore || totalFetched >= limit) {
        return null;
      }

      try {
        const pageSize = Math.min(blockSize, MAX_PAGE_SIZE, limit - totalFetched);

        // Build query params for this page
        const queryParams: Record<string, string> = {
          ...baseQueryParams,
          limit: String(pageSize),
          opt_fields: optFields,
        };

        if (offset) {
          queryParams.offset = offset;
        }

        // Fetch tasks from Asana using workspace search endpoint
        const response = await asanaClient.get<{
          data: TTask[];
          next_page?: { offset: string } | null;
        }>(`workspaces/${workspaceGid}/tasks/search`, {
          token,
          params: queryParams,
        });

        const tasks = response?.data || [];

        if (tasks.length === 0) {
          hasMore = false;
          return null;
        }

        totalFetched += tasks.length;

        // Check if there are more pages
        if (response.next_page?.offset) {
          offset = response.next_page.offset;
        } else {
          hasMore = false;
        }

        // Transform tasks to flat record format
        const records = tasks.map(transformTaskToRecord);

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof AsanaError) {
          throw error;
        }
        throw new AsanaError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof AsanaError) {
      throw error;
    }
    throw new AsanaError(`Failed to initialize search for table ${tablePath}: ${error}`);
  }
};
