/**
 * QuickBooks Get Table List
 *
 * Returns all supported entity types as table names.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { SUPPORTED_ENTITIES } from './constants';

/**
 * Get all available tables (entity types).
 * QuickBooks entities are flat — no workspace/project hierarchy.
 */
export const getQuickbooksTableList: TQoreGetTableListFunction = async () => {
  return [...SUPPORTED_ENTITIES];
};
