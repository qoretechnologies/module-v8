/**
 * Asana Delete Records
 *
 * Deletes tasks (records) from an Asana project that match the WHERE condition.
 * Asana does not support batch deletion, so tasks are deleted sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { asanaClient } from '../../client';
import { buildAsanaFilter, filterParamsToQueryParams } from './apply-where-condition';
import {
  AsanaError,
  getAsanaCustomFields,
  getAsanaProjectByPath,
  MAX_PAGE_SIZE,
} from './constants';

type TTask = {
  gid: string;
  name: string;
};

/**
 * Delete tasks (records) from an Asana project that match the WHERE condition.
 * Tasks are deleted sequentially since Asana does not support batch deletion.
 *
 * @returns The number of records deleted
 */
export const deleteAsanaRecords: TQoreDeleteRecordsFunction = async (context, where, options) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AsanaError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new AsanaError('Table path is required to delete records.');
  }

  if (!where) {
    throw new AsanaError(
      'WHERE condition is required to delete records. Please provide a filter to specify which records to delete (e.g., completed == true).'
    );
  }

  try {
    // Parse table path to get project GID
    const { projectGid, workspaceGid } = await getAsanaProjectByPath({ token, tablePath });

    // Get custom field mapping for filter processing
    const customFieldsMap = await getAsanaCustomFields({ token, workspaceGid });

    // Build filter params from WHERE condition
    const filterParams = buildAsanaFilter(where, customFieldsMap);
    const queryParams = filterParamsToQueryParams(filterParams);
    queryParams['projects.any'] = projectGid;
    queryParams.opt_fields = 'gid,name';
    queryParams.limit = String(MAX_PAGE_SIZE);

    const matchingTasks: TTask[] = [];
    let offset: string | undefined;

    // Paginate through all matching tasks
    do {
      const params: Record<string, string> = { ...queryParams };
      if (offset) {
        params.offset = offset;
      }

      const response = await asanaClient.get<{
        data: TTask[];
        next_page?: { offset: string } | null;
      }>(`workspaces/${workspaceGid}/tasks/search`, {
        token,
        params,
      });

      const tasks = response?.data || [];
      matchingTasks.push(...tasks);

      offset = response?.next_page?.offset || undefined;
    } while (offset);

    if (matchingTasks.length === 0) {
      return 0;
    }

    // Delete each task
    let deletedCount = 0;
    for (const task of matchingTasks) {
      try {
        await asanaClient.delete<{ data: Record<string, never> }>(
          `tasks/${task.gid}`,
          { token }
        );
        deletedCount++;
      } catch (error) {
        // Log but continue with other tasks
        Debugger.log(`Failed to delete task ${task.gid}: ${error}`);
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof AsanaError) {
      throw error;
    }

    throw new AsanaError(`Failed to delete records: ${error}`);
  }
};
