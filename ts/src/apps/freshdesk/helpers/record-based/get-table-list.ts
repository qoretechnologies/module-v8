/**
 * Freshdesk Get Table List
 *
 * Returns all available entity types as table names.
 * Freshdesk has a flat structure, so table names are simply entity type names.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { FRESHDESK_ENTITIES, FreshdeskRecordError } from './constants';

/**
 * Get all available tables (entity types).
 * Returns: ["Tickets", "Contacts", "Companies"]
 */
export const getFreshdeskTableList: TQoreGetTableListFunction = async (ctx) => {
  getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'subdomain'],
    ErrorClass: FreshdeskRecordError,
  });

  return [...FRESHDESK_ENTITIES];
};
