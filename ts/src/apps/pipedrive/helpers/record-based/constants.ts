// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { PipedriveError } from '../../base-constants';
import { isPipedriveCustomField } from '../constants';
export const PipedriveTables = [
  'deals',
  'persons',
  'organizations',
  'activities',
  'products',
  'leads',
  'notes',
  'tasks',
] as const;

export const usePipedriveV1Endpoint = (tableName: string): boolean => {
  return ['leads', 'notes'].includes(tableName);
};

export type TPipedriveTable = (typeof PipedriveTables)[number];

export const PipedriveTableToFilterTypeMap: Record<TPipedriveTable, string> = {
  deals: 'deals',
  persons: 'people',
  organizations: 'org',
  products: 'products',
  activities: 'activity',
  leads: 'leads',
  notes: 'notes',
  tasks: 'tasks',
};

export const PipedriveTableToObjectMap: Record<TPipedriveTable, string> = {
  deals: 'deal',
  persons: 'person',
  organizations: 'organization',
  products: 'product',
  activities: 'activity',
  leads: 'lead',
  notes: 'note',
  tasks: 'task',
};

/** Reject unsupported table names before constructing an API path. */
export function pipedriveTablePath(table: unknown): string {
  if (typeof table !== 'string' || !(PipedriveTables as readonly string[]).includes(table)) {
    throw new PipedriveError('A supported Pipedrive table is required');
  }
  return usePipedriveV1Endpoint(table) ? `v1/${table}` : table;
}

/** v2 nests custom values; v1 leads and notes retain their flat payloads. */
export function pipedriveRecordBody(table: string, record: Record<string, unknown>): Record<string, unknown> {
  pipedriveTablePath(table);
  const { custom_fields, ...body } = record;
  const custom: Record<string, unknown> = {};
  if (custom_fields !== undefined) {
    if (!custom_fields || typeof custom_fields !== 'object' || Array.isArray(custom_fields)) {
      throw new PipedriveError('custom_fields must be an object');
    }
    Object.assign(custom, custom_fields);
  }
  for (const key of Object.keys(body)) {
    if (isPipedriveCustomField(key)) {
      custom[key] = body[key]; delete body[key];
    }
  }
  return usePipedriveV1Endpoint(table) ? { ...body, ...custom }
    : { ...body, ...(Object.keys(custom).length ? { custom_fields: custom } : {}) };
}
