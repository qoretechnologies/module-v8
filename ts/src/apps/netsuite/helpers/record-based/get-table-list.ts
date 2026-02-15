/**
 * NetSuite Get Table List
 *
 * Returns an array of available record type names as "table" identifiers.
 * Reuses the existing getNetsuiteRecordTypesAllowedValues helper which
 * returns both standard (27) and custom record types.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getNetsuiteRecordTypesAllowedValues } from '../get-record-type-allowed-values';
import { NetsuiteRecordError } from './constants';

/**
 * Get the list of available NetSuite record types as table names.
 * Table names are flat strings (e.g., "customer", "invoice", "salesorder").
 */
export const getNetsuiteTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token, account_id } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'account_id'],
    ErrorClass: NetsuiteRecordError,
  });

  try {
    const allowedValues = await getNetsuiteRecordTypesAllowedValues({
      conn_opts: { token, account_id },
    } as any);

    return allowedValues.map((av) => String(av.value));
  } catch (error) {
    if (error instanceof NetsuiteRecordError) {
      throw error;
    }
    throw new NetsuiteRecordError(`Failed to get table list: ${error}`);
  }
};
