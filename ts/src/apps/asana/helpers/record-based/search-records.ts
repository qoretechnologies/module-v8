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
  getAsanaCustomFields,
  getAsanaProjectByPath,
  MAX_PAGE_SIZE,
  TAsanaTask,
  transformTaskToRecord,
} from './constants';

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
          data: TAsanaTask[];
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
