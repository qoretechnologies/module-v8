/**
 * Event payload helpers
 *
 * Trims a live Bot API object down to the fields a trigger declares, recursively, so that
 * example event data never carries keys the event_info schema does not describe.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';

type TDeclaredType = TQoreAppActionOption['type'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const trimToDeclaredType = (value: unknown, type: TDeclaredType): unknown => {
  if (typeof type !== 'object' || value === null || value === undefined) {
    return value;
  }

  if (type.type === 'hash' && 'fields' in type && type.fields) {
    return trimToDeclaredFields(value, type.fields);
  }

  if (type.type === 'list' && 'element_type' in type && type.element_type && Array.isArray(value)) {
    const elementType = type.element_type as TDeclaredType;

    return value.map((element) => trimToDeclaredType(element, elementType));
  }

  return value;
};

/**
 * Keeps only the declared fields of `value`, descending into hash fields and list elements
 */
export const trimToDeclaredFields = (
  value: unknown,
  fields: Record<string, TQoreAppActionOption>
): Record<string, unknown> => {
  if (!isRecord(value)) {
    return {};
  }

  const trimmed: Record<string, unknown> = {};

  for (const [key, field] of Object.entries(fields)) {
    if (!(key in value)) {
      continue;
    }

    trimmed[key] = trimToDeclaredType(value[key], field.type);
  }

  return trimmed;
};
