/**
 * BambooHR Create Records
 *
 * Creates new employees in BambooHR.
 * Employees are created sequentially as BambooHR has no bulk create endpoint.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { bambooHRClient } from '../../client';
import { BambooHRError } from '../../constants';
import { IBambooHRConnectionOptions, IBambooHREmployee } from '../../types';
import { transformBambooHRResponseToOutput, transformInputToBambooHRFormat } from '../dynamic-types';
import { getAllFieldsString, getBambooHRFields } from '../get-fields';
import { BambooHRRecordError, buildNormalizedToAliasMap, denormalizeRecordKeys, EMPLOYEES_TABLE } from './constants';

/**
 * Create new employees in BambooHR.
 * Accepts records in column format and returns created records in column format.
 */
export const createBambooHRRecords: TQoreCreateRecordsFunction = async (ctx, records, opts) => {
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

  // Convert column format to array of records
  const recordsArray = mapColumnFormatToObject(records);
  const createdRecords: Record<string, unknown>[] = [];

  // Build reverse mapping: normalized names (first_name) → original aliases (firstName)
  const allFields = await getBambooHRFields(connectionOptions);
  const normalizedToAlias = buildNormalizedToAliasMap(allFields);

  // Create employees sequentially (no batch create in BambooHR API)
  for (const record of recordsArray) {
    // Reverse-normalize field names for BambooHR API (first_name → firstName)
    const denormalizedRecord = denormalizeRecordKeys(record, normalizedToAlias);
    const apiData = transformInputToBambooHRFormat(denormalizedRecord);

    // Create the employee
    const response = await bambooHRClient.post<{
      data: Record<string, unknown>;
      headers: Record<string, string>;
    }>(
      'employees',
      apiData,
      {
        token,
        connectionOptions: { company_domain },
        includeHeaders: true,
      }
    );

    // Extract employee ID from Location header
    const location = response.headers?.location || response.headers?.Location;
    let employeeId: string | undefined;

    if (location) {
      const match = /employees\/(\d+)/.exec(location);
      if (match) {
        employeeId = match[1];
      }
    }

    if (!employeeId) {
      throw new BambooHRRecordError('Failed to get created employee ID from response');
    }

    // Fetch the created employee to return full data
    const fieldsParam = await getAllFieldsString(connectionOptions);
    const createdEmployee = await bambooHRClient.get<IBambooHREmployee>(
      `employees/${employeeId}`,
      {
        token,
        connectionOptions: { company_domain },
        params: {
          fields: fieldsParam,
        },
      }
    );

    // Transform response to user-friendly format
    const transformed = await transformBambooHRResponseToOutput(connectionOptions, createdEmployee);
    createdRecords.push(transformed);
  }

  return mapObjectToColumnFormat(createdRecords);
};
