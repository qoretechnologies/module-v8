/**
 * Asana Get Record Type
 *
 * Returns the dynamic schema for task records in a specific project,
 * including standard task fields and workspace custom fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreType, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  AsanaError,
  CUSTOM_FIELD_PREFIX,
  getAsanaCustomFields,
  getAsanaProjectByPath,
  mapAsanaFieldTypeToQore,
  TCustomFieldInfo,
} from './constants';

type TFieldDefinition = {
  type: TQoreType;
  desc: string;
};

/**
 * Get the record type (schema) for tasks in a specific project.
 * Includes both standard task fields and workspace custom fields.
 */
export const getAsanaRecordType: TQoreGetRecordTypeFunction = async (context, tablePath) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AsanaError,
  });

  // Parse table path to get workspace GID (for custom fields)
  const { workspaceGid } = await getAsanaProjectByPath({ token, tablePath });

  // Fetch custom fields for this workspace
  const customFields: Record<string, TFieldDefinition> = {};

  try {
    const customFieldsMap = await getAsanaCustomFields({ token, workspaceGid });

    // Add custom fields with cf_ prefix
    for (const [fieldName, fieldInfo] of customFieldsMap.entries()) {
      const qoreType = mapAsanaFieldTypeToQore(fieldInfo.type);
      const fieldDef: TFieldDefinition = {
        type: qoreType,
        desc: `Custom field: ${fieldName} (${fieldInfo.type})`,
      };

      // Add allowed values for enum fields
      if (
        (fieldInfo.type === 'enum' || fieldInfo.type === 'multi_enum') &&
        fieldInfo.enumOptions
      ) {
        const enabledOptions = fieldInfo.enumOptions.filter((opt) => opt.enabled);
        if (enabledOptions.length > 0) {
          // For type definitions, we just include the type
          // Allowed values would be handled separately in options
          fieldDef.desc += ` - Options: ${enabledOptions.map((o) => o.name).join(', ')}`;
        }
      }

      customFields[`${CUSTOM_FIELD_PREFIX}${fieldName}`] = fieldDef;
    }
  } catch {
    // Custom fields endpoint might fail for some workspaces, continue with base fields
  }

  // Return the record type with standard and custom fields
  return {
    type: 'hash',
    fields: {
      // Core identifiers
      id: { type: 'string', desc: 'Task GID' },
      name: { type: 'string', desc: 'Task name' },
      resource_subtype: { type: 'string', desc: 'Task subtype (default_task, milestone, etc.)' },

      // Description fields
      notes: { type: 'string', desc: 'Task description (plain text)' },
      html_notes: { type: 'string', desc: 'Task description (HTML)' },

      // Completion status
      completed: { type: 'bool', desc: 'Whether task is completed' },
      completed_at: { type: 'date', desc: 'Completion timestamp' },

      // Due dates
      due_on: { type: 'date', desc: 'Due date (date only, no time)' },
      due_at: { type: 'date', desc: 'Due date with time' },

      // Start dates
      start_on: { type: 'date', desc: 'Start date (date only, no time)' },
      start_at: { type: 'date', desc: 'Start date with time' },

      // Assignee and followers
      assignee: { type: 'string', desc: 'Assignee user GID' },
      assignee_name: { type: 'string', desc: 'Assignee user name' },
      followers: {
        type: { type: 'list', element_type: 'string' },
        desc: 'List of follower user GIDs',
      },

      // Relationships
      projects: {
        type: { type: 'list', element_type: 'string' },
        desc: 'List of project GIDs this task belongs to',
      },
      tags: {
        type: { type: 'list', element_type: 'string' },
        desc: 'List of tag GIDs',
      },
      parent: { type: 'string', desc: 'Parent task GID (if subtask)' },

      // Timestamps
      created_at: { type: 'date', desc: 'Creation timestamp' },
      modified_at: { type: 'date', desc: 'Last modified timestamp' },

      // Other fields
      permalink_url: { type: 'string', desc: 'Task URL' },
      num_subtasks: { type: 'int', desc: 'Number of subtasks' },
      liked: { type: 'bool', desc: 'Whether current user has liked this task' },
      num_likes: { type: 'int', desc: 'Number of likes' },

      // Custom fields
      ...customFields,
    },
  } satisfies TQoreTypeObject;
};

/**
 * Get custom field info by name from a workspace
 * Useful for converting field names to GIDs for API calls
 */
export const getCustomFieldByName = async (options: {
  token: string;
  workspaceGid: string;
  fieldName: string;
}): Promise<TCustomFieldInfo | undefined> => {
  const { token, workspaceGid, fieldName } = options;
  const customFieldsMap = await getAsanaCustomFields({ token, workspaceGid });

  // Remove cf_ prefix if present
  const cleanName = fieldName.startsWith(CUSTOM_FIELD_PREFIX)
    ? fieldName.slice(CUSTOM_FIELD_PREFIX.length)
    : fieldName;

  return customFieldsMap.get(cleanName);
};
