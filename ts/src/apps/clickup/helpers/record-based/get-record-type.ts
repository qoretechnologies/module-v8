/**
 * ClickUp Get Record Type
 *
 * Returns the dynamic schema for task records in a specific list,
 * including standard task fields and custom fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreGetRecordTypeFunction,
  TQoreType,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { clickUpClient } from '../../client';
import { ClickUpError } from '../../constants';
import { getClickUpListIdByPath, mapClickUpFieldTypeToQore } from './constants';

type TCustomField = {
  id: string;
  name: string;
  type: string;
  type_config?: {
    options?: Array<{ id: string; name: string; color?: string }>;
  };
};

type TFieldDefinition = {
  type: TQoreType;
  desc: string;
};

/**
 * Get the record type (schema) for tasks in a specific list.
 * Includes both standard task fields and custom fields.
 */
export const getClickUpRecordType: TQoreGetRecordTypeFunction = async (context, tablePath) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  // Parse table path to get list ID
  const { listId } = await getClickUpListIdByPath({ token, tablePath });

  // Fetch custom fields for this list
  const customFields: Record<string, TFieldDefinition> = {};

  try {
    const customFieldsResponse = await clickUpClient.get<{ fields: TCustomField[] }>(
      `list/${listId}/field`,
      { token }
    );

    const fields = customFieldsResponse?.fields || [];

    // Add custom fields with cf_ prefix
    for (const field of fields) {
      const qoreType = mapClickUpFieldTypeToQore(field.type);
      customFields[`cf_${field.name}`] = {
        type: qoreType,
        desc: `Custom field: ${field.name} (${field.type})`,
      };
    }
  } catch {
    // Custom fields endpoint might fail for some lists, continue with base fields
    // This is non-fatal - we can still work with standard fields
  }

  // Return the record type with standard and custom fields
  return {
    type: 'hash',
    fields: {
      id: { type: 'string', desc: 'Task ID' },
      name: { type: 'string', desc: 'Task name' },
      description: { type: 'string', desc: 'Task description (plain text)' },
      markdown_description: { type: 'string', desc: 'Task description (markdown)' },
      status: { type: 'string', desc: 'Task status name' },
      priority: { type: 'string', desc: 'Task priority (1=urgent, 2=high, 3=normal, 4=low)' },
      due_date: { type: 'date', desc: 'Due date' },
      start_date: { type: 'date', desc: 'Start date' },
      date_created: { type: 'date', desc: 'Date task was created' },
      date_updated: { type: 'date', desc: 'Date task was last updated' },
      date_closed: { type: 'date', desc: 'Date task was closed' },
      assignees: {
        type: { type: 'list', element_type: 'string' },
        desc: 'List of assignee user IDs',
      },
      watchers: {
        type: { type: 'list', element_type: 'string' },
        desc: 'List of watcher user IDs',
      },
      tags: {
        type: { type: 'list', element_type: 'string' },
        desc: 'List of tag names',
      },
      time_estimate: { type: 'int', desc: 'Time estimate in milliseconds' },
      time_spent: { type: 'int', desc: 'Time spent in milliseconds' },
      points: { type: 'number', desc: 'Sprint points' },
      url: { type: 'string', desc: 'Task URL' },
      parent: { type: 'string', desc: 'Parent task ID (if subtask)' },
      list_id: { type: 'string', desc: 'List ID' },
      folder_id: { type: 'string', desc: 'Folder ID' },
      space_id: { type: 'string', desc: 'Space ID' },
      creator_id: { type: 'string', desc: 'Creator user ID' },
      ...customFields,
    },
  } satisfies TQoreTypeObject;
};
