/**
 * Freshdesk Get Record Type
 *
 * Returns the dynamic schema for records in a specific entity type,
 * including standard fields and custom fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreType, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  CUSTOM_FIELD_PREFIX,
  FreshdeskRecordError,
  getCustomFields,
  mapFreshdeskFieldTypeToQore,
  resolveEntity,
  STANDARD_FIELDS,
} from './constants';

type TFieldDefinition = {
  type: TQoreType;
  desc: string;
};

/**
 * Build a description string for a custom field, including choices if available.
 */
const buildCustomFieldDesc = (fieldInfo: { label?: string; choices?: Record<string, string> | string[] }, fieldName: string): string => {
  let desc = `Custom field: ${fieldInfo.label || fieldName}`;

  if (!fieldInfo.choices) {
    return desc;
  }

  const choiceValues = Array.isArray(fieldInfo.choices)
    ? fieldInfo.choices
    : Object.keys(fieldInfo.choices);

  if (choiceValues.length > 0) {
    desc += ` - Options: ${choiceValues.slice(0, 10).join(', ')}`;
    if (choiceValues.length > 10) {
      desc += `, ... (${choiceValues.length} total)`;
    }
  }

  return desc;
};

/**
 * Get the record type (schema) for a specific entity type.
 * Includes both standard fields and custom fields fetched from the API.
 */
export const getFreshdeskRecordType: TQoreGetRecordTypeFunction = async (context, tablePath) => {
  const { token, subdomain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'subdomain'],
    ErrorClass: FreshdeskRecordError,
  });

  const entity = resolveEntity(tablePath);

  // Fetch custom fields from the API
  const customFields: Record<string, TFieldDefinition> = {};

  try {
    const customFieldsMap = await getCustomFields(token, subdomain, entity);

    for (const [fieldName, fieldInfo] of customFieldsMap.entries()) {
      const cfKey = fieldName.startsWith(CUSTOM_FIELD_PREFIX)
        ? fieldName
        : `${CUSTOM_FIELD_PREFIX}${fieldName}`;

      customFields[cfKey] = {
        type: mapFreshdeskFieldTypeToQore(fieldInfo.type),
        desc: buildCustomFieldDesc(fieldInfo, fieldName),
      };
    }
  } catch {
    // Custom fields endpoint might fail, continue with standard fields only
  }

  return {
    type: 'hash',
    fields: {
      ...STANDARD_FIELDS[entity],
      ...customFields,
    },
  } as TQoreTypeObject;
};
