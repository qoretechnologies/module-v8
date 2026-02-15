/**
 * NetSuite Update Records
 *
 * Finds matching records via SuiteQL WHERE clause, then updates each
 * via REST PATCH. Returns the count of successfully updated records.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
} from '../../../../global/helpers';
import { delay } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { buildSuiteQlWhereClause } from './apply-where-condition';
import {
  findMatchingRecordIds,
  netsuiteRecordRequest,
  NetsuiteRecordError,
  normalizeSetToSingleRecord,
  REST_OPERATION_DELAY,
} from './constants';

/**
 * Update NetSuite records matching the WHERE condition.
 * Returns the count of updated records.
 */
export const updateNetsuiteRecords: TQoreUpdateRecordsFunction = async (
  context,
  set,
  where,
  options
) => {
  const { token, account_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'account_id'],
    ErrorClass: NetsuiteRecordError,
  });

  const recordType = options?.table;

  if (!recordType) {
    throw new NetsuiteRecordError('Table name is required to update records.');
  }

  // Find matching records
  const whereClause = buildSuiteQlWhereClause(where);
  const matchingIds = await findMatchingRecordIds({
    token,
    accountId: account_id,
    recordType,
    whereClause,
  });

  if (matchingIds.length === 0) {
    return 0;
  }

  // Normalize set data to a single flat object
  const updateData = normalizeSetToSingleRecord(set, mapColumnFormatToObject);
  const { id, ...updatePayload } = updateData;

  if (Object.keys(updatePayload).length === 0) {
    return 0;
  }

  // PATCH each matching record
  let updatedCount = 0;

  for (let i = 0; i < matchingIds.length; i++) {
    const recordId = matchingIds[i];
    try {
      await netsuiteRecordRequest({
        token,
        accountId: account_id,
        method: 'PATCH',
        recordType,
        recordId,
        data: updatePayload as Record<string, unknown>,
      });
      updatedCount++;
    } catch (error) {
      Debugger.log(`Failed to update ${recordType} ${recordId}: ${error}`);
    }

    // Delay between updates to respect rate limits
    if (i < matchingIds.length - 1) {
      await delay(REST_OPERATION_DELAY);
    }
  }

  return updatedCount;
};
