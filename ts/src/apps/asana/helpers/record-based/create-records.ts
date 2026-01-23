/**
 * Asana Create Records
 *
 * Creates tasks (records) in an Asana project.
 * Asana does not support batch creation, so tasks are created sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { asanaClient } from '../../client';
import {
  AsanaError,
  CUSTOM_FIELD_PREFIX,
  getAsanaCustomFields,
  getAsanaProjectByPath,
} from './constants';

type TTask = {
  gid: string;
  name: string;
  notes?: string;
  html_notes?: string;
  completed?: boolean;
  completed_at?: string | null;
  due_on?: string | null;
  due_at?: string | null;
  start_on?: string | null;
  start_at?: string | null;
  assignee?: { gid: string; name?: string } | null;
  followers?: Array<{ gid: string }>;
  projects?: Array<{ gid: string }>;
  tags?: Array<{ gid: string }>;
  parent?: { gid: string } | null;
  created_at?: string;
  modified_at?: string;
  permalink_url?: string;
  resource_subtype?: string;
  custom_fields?: Array<{
    gid: string;
    name: string;
    resource_subtype?: string;
    display_value?: string;
    text_value?: string;
    number_value?: number;
    enum_value?: { gid: string; name: string } | null;
    multi_enum_values?: Array<{ gid: string; name: string }>;
    people_value?: Array<{ gid: string }>;
    date_value?: { date: string } | null;
  }>;
};

/**
 * Transform a record to Asana task payload format
 */
const transformRecordToTaskPayload = (
  record: Record<string, unknown>,
  projectGid: string,
  customFieldMap: Map<string, { gid: string; type: string; enumOptions?: Array<{ gid: string; name: string }> }>
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    projects: [projectGid],
  };
  const customFields: Record<string, unknown> = {};

  // Map standard fields
  if (record.name !== undefined) {
    payload.name = record.name;
  }

  if (record.notes !== undefined) {
    payload.notes = record.notes;
  }

  if (record.html_notes !== undefined) {
    payload.html_notes = record.html_notes;
  }

  if (record.completed !== undefined) {
    payload.completed = record.completed;
  }

  if (record.due_on !== undefined && record.due_on !== null) {
    // Ensure date format is YYYY-MM-DD
    const date = new Date(record.due_on as string);
    if (!isNaN(date.getTime())) {
      payload.due_on = date.toISOString().split('T')[0];
    }
  }

  if (record.due_at !== undefined && record.due_at !== null) {
    // Full datetime
    const date = new Date(record.due_at as string);
    if (!isNaN(date.getTime())) {
      payload.due_at = date.toISOString();
    }
  }

  if (record.start_on !== undefined && record.start_on !== null) {
    const date = new Date(record.start_on as string);
    if (!isNaN(date.getTime())) {
      payload.start_on = date.toISOString().split('T')[0];
    }
  }

  if (record.start_at !== undefined && record.start_at !== null) {
    const date = new Date(record.start_at as string);
    if (!isNaN(date.getTime())) {
      payload.start_at = date.toISOString();
    }
  }

  if (record.assignee !== undefined && record.assignee !== null) {
    payload.assignee = record.assignee;
  }

  if (record.followers !== undefined && Array.isArray(record.followers)) {
    payload.followers = record.followers;
  }

  if (record.tags !== undefined && Array.isArray(record.tags)) {
    payload.tags = record.tags;
  }

  if (record.parent !== undefined && record.parent !== null) {
    payload.parent = record.parent;
  }

  if (record.resource_subtype !== undefined) {
    payload.resource_subtype = record.resource_subtype;
  }

  // Handle custom fields (prefixed with cf_)
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(CUSTOM_FIELD_PREFIX) && value !== undefined && value !== null) {
      const cfName = key.slice(CUSTOM_FIELD_PREFIX.length);
      const fieldInfo = customFieldMap.get(cfName);
      if (fieldInfo) {
        // Handle different custom field types
        switch (fieldInfo.type) {
          case 'enum':
            // For enum, we need to find the enum option GID by name
            if (fieldInfo.enumOptions && typeof value === 'string') {
              const enumOption = fieldInfo.enumOptions.find((opt) => opt.name === value);
              if (enumOption) {
                customFields[fieldInfo.gid] = enumOption.gid;
              }
            }
            break;
          case 'multi_enum':
            // For multi_enum, we need to find all enum option GIDs by names
            if (fieldInfo.enumOptions && Array.isArray(value)) {
              const enumGids = value
                .map((v) => fieldInfo.enumOptions?.find((opt) => opt.name === v)?.gid)
                .filter(Boolean);
              customFields[fieldInfo.gid] = enumGids;
            }
            break;
          case 'date':
            // For date, ensure proper format
            if (typeof value === 'string') {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                customFields[fieldInfo.gid] = date.toISOString().split('T')[0];
              }
            }
            break;
          default:
            // For text, number, people, etc. - pass value directly
            customFields[fieldInfo.gid] = value;
        }
      }
    }
  }

  if (Object.keys(customFields).length > 0) {
    payload.custom_fields = customFields;
  }

  return payload;
};

/**
 * Transform an Asana task response to flat record format
 */
const transformTaskToRecord = (task: TTask): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: task.gid,
    name: task.name,
    notes: task.notes || '',
    html_notes: task.html_notes || '',
    completed: task.completed || false,
    completed_at: task.completed_at || null,
    due_on: task.due_on || null,
    due_at: task.due_at || null,
    start_on: task.start_on || null,
    start_at: task.start_at || null,
    assignee: task.assignee?.gid || null,
    followers: task.followers?.map((f) => f.gid) || [],
    projects: task.projects?.map((p) => p.gid) || [],
    tags: task.tags?.map((t) => t.gid) || [],
    parent: task.parent?.gid || null,
    created_at: task.created_at || null,
    modified_at: task.modified_at || null,
    permalink_url: task.permalink_url || '',
    resource_subtype: task.resource_subtype || 'default_task',
  };

  // Flatten custom fields
  if (task.custom_fields) {
    for (const cf of task.custom_fields) {
      const fieldKey = `${CUSTOM_FIELD_PREFIX}${cf.name}`;
      const fieldType = cf.resource_subtype;

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
          record[fieldKey] = cf.date_value?.date || null;
          break;
        default:
          record[fieldKey] = cf.display_value || null;
      }
    }
  }

  return record;
};

/**
 * Create tasks (records) in an Asana project.
 * Tasks are created sequentially since Asana does not support batch creation.
 */
export const createAsanaRecords: TQoreCreateRecordsFunction = async (context, records, options) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AsanaError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new AsanaError('Table path is required to create records.');
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

    // Convert column format to array of records
    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    // Create each task sequentially (Asana has no batch create API)
    for (const record of recordsArray) {
      const taskPayload = transformRecordToTaskPayload(record, projectGid, customFieldMap);

      // Ensure task has a name (required by Asana)
      if (!taskPayload.name) {
        throw new AsanaError('Task name is required');
      }

      const createdTask = await asanaClient.post<{ data: TTask }>(
        'tasks',
        { data: taskPayload },
        { token }
      );

      if (createdTask?.data) {
        createdRecords.push(transformTaskToRecord(createdTask.data));
      }
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof AsanaError) {
      throw error;
    }

    throw new AsanaError(`Failed to create records: ${error}`);
  }
};
