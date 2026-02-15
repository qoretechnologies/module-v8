/**
 * NetSuite Get Record Type
 *
 * Returns dynamic schema (TQoreTypeObject) for a given record type by
 * querying NetSuite via SuiteQL to discover fields and infer types.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getRecordFieldsViaQuery, NetsuiteRecordError } from './constants';

/**
 * Get the dynamic record type schema for a NetSuite record type.
 * Uses SuiteQL `SELECT * FROM {type} LIMIT 1` to discover fields.
 */
export const getNetsuiteRecordType: TQoreGetRecordTypeFunction = async (context, tablePath) => {
  const { token, account_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'account_id'],
    ErrorClass: NetsuiteRecordError,
  });

  if (!tablePath) {
    throw new NetsuiteRecordError('Record type name is required.');
  }

  try {
    const fieldsMap = await getRecordFieldsViaQuery({
      token,
      accountId: account_id,
      recordType: tablePath,
    });

    const fields: Record<string, { type: any; desc: string }> = {};

    for (const [fieldName, fieldType] of fieldsMap.entries()) {
      fields[fieldName] = {
        type: fieldType,
        desc: fieldName,
      };
    }

    // Ensure 'id' is always present
    if (!fields['id']) {
      fields['id'] = { type: 'string', desc: 'Internal ID' };
    }

    return {
      type: 'hash',
      fields,
    } satisfies TQoreTypeObject;
  } catch (error) {
    if (error instanceof NetsuiteRecordError) {
      throw error;
    }
    throw new NetsuiteRecordError(`Failed to get record type for "${tablePath}": ${error}`);
  }
};
