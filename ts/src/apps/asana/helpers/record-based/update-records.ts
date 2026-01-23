/**
 * Asana Update Records
 *
 * Updates tasks (records) in an Asana project that match the WHERE condition.
 * Asana does not support batch updates, so tasks are updated sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { asanaClient } from '../../client';
import { buildAsanaFilter, filterParamsToQueryParams } from './apply-where-condition';
import {
  AsanaError,
  CUSTOM_FIELD_PREFIX,
  getAsanaCustomFields,
  getAsanaProjectByPath,
  MAX_PAGE_SIZE,
} from './constants';

type TTask = {
  gid: string;
  name: string;
};

/**
 * Transform update data to Asana task payload format
 */
const transformUpdateToPayload = (
  update: Record<string, unknown>,
  customFieldMap: Map<string, { gid: string; type: string; enumOptions?: Array<{ gid: string; name: string }> }>
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  const customFields: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(update)) {
    // Skip id field - can't update
    if (key === 'id') {
      continue;
    }

    // Handle custom fields
    if (key.startsWith(CUSTOM_FIELD_PREFIX)) {
      const cfName = key.slice(CUSTOM_FIELD_PREFIX.length);
      const fieldInfo = customFieldMap.get(cfName);
      if (fieldInfo && value !== undefined) {
        switch (fieldInfo.type) {
          case 'enum':
            if (fieldInfo.enumOptions && typeof value === 'string') {
              const enumOption = fieldInfo.enumOptions.find((opt) => opt.name === value);
              if (enumOption) {
                customFields[fieldInfo.gid] = enumOption.gid;
              }
            } else if (value === null) {
              customFields[fieldInfo.gid] = null;
            }
            break;
          case 'multi_enum':
            if (fieldInfo.enumOptions && Array.isArray(value)) {
              const enumGids = value
                .map((v) => fieldInfo.enumOptions?.find((opt) => opt.name === v)?.gid)
                .filter(Boolean);
              customFields[fieldInfo.gid] = enumGids;
            } else if (value === null) {
              customFields[fieldInfo.gid] = [];
            }
            break;
          case 'date':
            if (typeof value === 'string') {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                customFields[fieldInfo.gid] = date.toISOString().split('T')[0];
              }
            } else if (value === null) {
              customFields[fieldInfo.gid] = null;
            }
            break;
          default:
            customFields[fieldInfo.gid] = value;
        }
      }
      continue;
    }

    // Handle standard fields
    switch (key) {
      case 'name':
      case 'notes':
      case 'html_notes':
      case 'completed':
      case 'assignee':
      case 'parent':
      case 'resource_subtype':
        payload[key] = value;
        break;
      case 'due_on':
      case 'start_on':
        if (value !== null && value !== undefined) {
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            payload[key] = date.toISOString().split('T')[0];
          }
        } else {
          payload[key] = null;
        }
        break;
      case 'due_at':
      case 'start_at':
        if (value !== null && value !== undefined) {
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            payload[key] = date.toISOString();
          }
        } else {
          payload[key] = null;
        }
        break;
      case 'followers':
      case 'tags':
        if (Array.isArray(value)) {
          payload[key] = value;
        }
        break;
    }
  }

  if (Object.keys(customFields).length > 0) {
    payload.custom_fields = customFields;
  }

  return payload;
};

/**
 * Update tasks (records) in an Asana project that match the WHERE condition.
 * Tasks are updated sequentially since Asana does not support batch updates.
 *
 * @returns The number of records updated
 */
export const updateAsanaRecords: TQoreUpdateRecordsFunction = async (context, set, where, options) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AsanaError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new AsanaError('Table path is required to update records.');
  }

  try {
    // Parse table path to get project GID
    const { projectGid, workspaceGid } = await getAsanaProjectByPath({ token, tablePath });

    // Get custom field mapping
    const customFieldsMap = await getAsanaCustomFields({ token, workspaceGid });

    // Convert Map to format needed for transformation
    const customFieldMap = new Map<string, { gid: string; type: string; enumOptions?: Array<{ gid: string; name: string }> }>();
    for (const [name, info] of customFieldsMap.entries()) {
      customFieldMap.set(name, {
        gid: info.gid,
        type: info.type,
        enumOptions: info.enumOptions?.map((opt) => ({ gid: opt.gid, name: opt.name })),
      });
    }

    // First, find all tasks matching the WHERE condition
    const filterParams = where ? buildAsanaFilter(where, customFieldsMap) : {};
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

    // Convert set data from column format to object
    const setArray = mapColumnFormatToObject(set);

    // Validate that exactly one record is provided in `set`
    if (setArray.length > 1) {
      throw new AsanaError(
        `Asana update supports a single record in 'set'; received ${setArray.length} records.`
      );
    }
    const updateData = setArray[0] || {};

    // Transform update data to Asana payload
    const updatePayload = transformUpdateToPayload(updateData, customFieldMap);

    if (Object.keys(updatePayload).length === 0) {
      return 0; // Nothing to update
    }

    // Update each task
    let updatedCount = 0;
    for (const task of matchingTasks) {
      try {
        await asanaClient.put<{ data: TTask }>(
          `tasks/${task.gid}`,
          { data: updatePayload },
          { token }
        );
        updatedCount++;
      } catch (error) {
        // Log but continue with other tasks
        Debugger.log(`Failed to update task ${task.gid}: ${error}`);
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof AsanaError) {
      throw error;
    }

    throw new AsanaError(`Failed to update records: ${error}`);
  }
};
