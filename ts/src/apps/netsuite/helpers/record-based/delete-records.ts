/**
 * NetSuite Delete Records
 *
 * Finds matching records via SuiteQL WHERE clause, then deletes each
 * via REST DELETE. Requires a WHERE condition to prevent accidental mass deletion.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { delay } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { buildSuiteQlWhereClause } from './apply-where-condition';
import {
  findMatchingRecordIds,
  netsuiteRecordRequest,
  NetsuiteRecordError,
  REST_OPERATION_DELAY,
} from './constants';

/**
 * Delete NetSuite records matching the WHERE condition.
 * WHERE condition is required to prevent accidental mass deletion.
 * Returns the count of deleted records.
 */
export const deleteNetsuiteRecords: TQoreDeleteRecordsFunction = async (
  context,
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
    throw new NetsuiteRecordError('Table name is required to delete records.');
  }

  if (!where) {
    throw new NetsuiteRecordError(
      'WHERE condition is required to delete records. ' +
        'Please provide a filter to specify which records to delete.'
    );
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

  // DELETE each matching record
  let deletedCount = 0;

  for (let i = 0; i < matchingIds.length; i++) {
    const recordId = matchingIds[i];
    try {
      await netsuiteRecordRequest({
        token,
        accountId: account_id,
        method: 'DELETE',
        recordType,
        recordId,
      });
      deletedCount++;
    } catch (error) {
      Debugger.log(`Failed to delete ${recordType} ${recordId}: ${error}`);
    }

    // Delay between deletes to respect rate limits
    if (i < matchingIds.length - 1) {
      await delay(REST_OPERATION_DELAY);
    }
  }

  return deletedCount;
};
