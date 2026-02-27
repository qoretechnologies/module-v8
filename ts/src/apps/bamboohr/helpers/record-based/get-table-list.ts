/**
 * BambooHR Get Table List
 *
 * Returns the list of available "tables" for record-based operations.
 * BambooHR exposes a single table: Employees.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { EMPLOYEES_TABLE } from './constants';

/**
 * Get the list of available tables.
 * BambooHR only exposes Employees as a record-based table.
 */
export const getBambooHRTableList: TQoreGetTableListFunction = () => {
  return [EMPLOYEES_TABLE];
};
