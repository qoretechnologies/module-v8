/**
 * BambooHR Update Records
 *
 * Updates existing employees in BambooHR that match WHERE conditions.
 * Fetches all employees, applies client-side filtering, then updates each match.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { bambooHRClient } from '../../client';
import { BambooHRError } from '../../constants';
import { IBambooHRConnectionOptions, IBambooHRCustomReportResponse, IBambooHREmployee } from '../../types';
import { transformBambooHREmployeeList, transformInputToBambooHRFormat } from '../dynamic-types';
import { getBambooHRFields } from '../get-fields';
import { filterRecords } from './apply-where-condition';
import { BambooHRRecordError, EMPLOYEES_TABLE, normalizeSetToSingleRecord } from './constants';

/**
 * Update employees matching WHERE conditions.
 * Returns the count of updated records.
 */
export const updateBambooHRRecords: TQoreUpdateRecordsFunction = async (ctx, set, where, opts) => {
  const { token, company_domain } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'company_domain'],
    ErrorClass: BambooHRError,
  });

  const tableName = opts?.table;

  if (tableName !== EMPLOYEES_TABLE) {
    throw new BambooHRRecordError(
      `Unknown table: "${tableName}". Only "${EMPLOYEES_TABLE}" is supported.`
    );
  }

  const connectionOptions: IBambooHRConnectionOptions = { token, company_domain };

  // Build fields list for fetching employees
  const allFields = await getBambooHRFields(connectionOptions);
  const fieldsList = allFields
    .filter((field) => field.alias)
    .map((field) => field.alias as string);

  // Always include id
  if (!fieldsList.includes('id')) {
    fieldsList.unshift('id');
  }

  // Fetch all employees via custom reports API
  const response = await bambooHRClient.post<IBambooHRCustomReportResponse>(
    'reports/custom',
    {
      title: 'Record Update Search',
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

  // Transform to user-friendly format
  let records = await transformBambooHREmployeeList(connectionOptions, employees as IBambooHREmployee[]);

  // Apply client-side WHERE filtering
  records = filterRecords(records, where);

  if (records.length === 0) {
    return 0;
  }

  // Normalize set values (convert from column format if needed)
  const setValues = Array.isArray(Object.values(set)[0])
    ? normalizeSetToSingleRecord(set)
    : (set as Record<string, unknown>);

  // Transform set values to BambooHR API format
  const apiData = transformInputToBambooHRFormat(setValues);

  // Update each matching employee
  let updatedCount = 0;

  for (const record of records) {
    const employeeId = record.id as string;

    if (!employeeId) {
      continue;
    }

    try {
      await bambooHRClient.post(
        `employees/${employeeId}`,
        apiData,
        {
          token,
          connectionOptions: { company_domain },
        }
      );
      updatedCount++;
    } catch (error) {
      // Log but continue with remaining records
      // (consistent with Asana's error tolerance pattern)
    }
  }

  return updatedCount;
};
