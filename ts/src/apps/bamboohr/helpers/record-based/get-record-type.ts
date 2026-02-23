/**
 * BambooHR Get Record Type
 *
 * Returns the dynamic type definition for employee records.
 * Reuses existing field metadata and type mapping helpers.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, normalizeName } from '../../../../global/helpers';
import { BambooHRError } from '../../constants';
import { IBambooHRConnectionOptions } from '../../types';
import { mapBambooHRFieldToQoreOption } from '../dynamic-types';
import { getBambooHRFields } from '../get-fields';
import { BambooHRRecordError, EMPLOYEES_TABLE } from './constants';

/**
 * Get the record type definition for a BambooHR table.
 * Returns a hash type with all available employee fields.
 */
export const getBambooHRRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  if (tableName !== EMPLOYEES_TABLE) {
    throw new BambooHRRecordError(`Unknown table: "${tableName}". Only "${EMPLOYEES_TABLE}" is supported.`);
  }

  const { token, company_domain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'company_domain'],
    ErrorClass: BambooHRError,
  });

  const connectionOptions: IBambooHRConnectionOptions = { token, company_domain };
  const fields = await getBambooHRFields(connectionOptions);

  const qoreFields: Record<string, unknown> = {
    id: {
      type: 'string',
      display_name: 'Employee ID',
      short_desc: 'Unique identifier for the employee',
    },
  };

  for (const field of fields) {
    const fieldAlias = field.alias;

    // Skip fields without aliases for record-based operations
    // (custom fields with numeric-only IDs are not supported by GET endpoint)
    if (!fieldAlias) {
      continue;
    }

    const fieldKey = normalizeName(fieldAlias);

    qoreFields[fieldKey] = mapBambooHRFieldToQoreOption(field, {
      isForResponse: true,
    });
  }

  return {
    type: 'hash',
    fields: qoreFields,
  } as TQoreTypeObject;
};
