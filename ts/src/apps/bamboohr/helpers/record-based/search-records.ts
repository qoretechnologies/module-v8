/**
 * BambooHR Search Records
 *
 * Implements iterator-based search for BambooHR employees with filtering and pagination.
 * Uses the custom reports endpoint to fetch all employees, then applies client-side
 * filtering and sorting since BambooHR lacks server-side WHERE support.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { bambooHRClient } from '../../client';
import { BambooHRError } from '../../constants';
import { IBambooHRConnectionOptions, IBambooHRCustomReportResponse, IBambooHREmployee } from '../../types';
import { transformBambooHREmployeeList } from '../dynamic-types';
import { getBambooHRFields } from '../get-fields';
import { filterRecords, sortRecords } from './apply-where-condition';
import { BambooHRRecordError, EMPLOYEES_TABLE, MAX_PAGE_SIZE } from './constants';

/**
 * Search for BambooHR employees (records) with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchBambooHRRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, company_domain } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'company_domain'],
    ErrorClass: BambooHRError,
  });

  const tableName = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (tableName !== EMPLOYEES_TABLE) {
    throw new BambooHRRecordError(
      `Unknown table: "${tableName}". Only "${EMPLOYEES_TABLE}" is supported.`
    );
  }

  const connectionOptions: IBambooHRConnectionOptions = { token, company_domain };

  // Build fields list — use all standard fields (those with aliases)
  const allFields = await getBambooHRFields(connectionOptions);
  const fieldsList = allFields
    .filter((field) => field.alias)
    .map((field) => field.alias as string);

  // Always include essential fields
  const essentialFields = ['id', 'firstName', 'lastName', 'displayName', 'workEmail', 'department', 'jobTitle'];
  for (const field of essentialFields) {
    if (!fieldsList.includes(field)) {
      fieldsList.unshift(field);
    }
  }

  // Fetch all employees via custom reports API
  const response = await bambooHRClient.post<IBambooHRCustomReportResponse>(
    'reports/custom',
    {
      title: 'Record Search',
      fields: fieldsList,
    },
    {
      token,
      connectionOptions: { company_domain },
      params: {
        format: 'JSON',
      },
    }
  );

  const employees = response?.employees || [];

  // Transform to user-friendly format with normalized field names
  let records = await transformBambooHREmployeeList(connectionOptions, employees as IBambooHREmployee[]);

  // Apply client-side WHERE filtering
  records = filterRecords(records, where);

  // Apply sorting
  const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
  records = sortRecords(records, orderBy);

  // Create iterator state
  let offset = 0;
  let hasMore = records.length > 0;

  /**
   * Iterator function that returns batches of records
   */
  const getRecords: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (!hasMore) {
      return null;
    }

    const pageSize = Math.min(blockSize || limit, limit);
    const endIndex = Math.min(offset + pageSize, records.length);
    const batch = records.slice(offset, endIndex);

    if (batch.length === 0) {
      hasMore = false;
      return null;
    }

    offset = endIndex;
    hasMore = offset < records.length;

    return mapObjectToColumnFormat(batch);
  };

  return getRecords;
};
