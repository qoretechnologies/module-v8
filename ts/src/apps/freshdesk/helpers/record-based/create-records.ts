/**
 * Freshdesk Create Records
 *
 * Creates records in a Freshdesk entity type.
 * Freshdesk does not support batch creation, so records are created sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import {
  ENTITY_CONFIG,
  FreshdeskRecordError,
  freshdeskPost,
  resolveEntity,
  transformEntityToRecord,
  transformRecordToPayload,
} from './constants';

/**
 * Create records in a Freshdesk entity type.
 * Records are created sequentially since Freshdesk has no batch create API.
 */
export const createFreshdeskRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  options
) => {
  const { token, subdomain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'subdomain'],
    ErrorClass: FreshdeskRecordError,
  });

  const entity = resolveEntity(options?.table);
  const config = ENTITY_CONFIG[entity];

  try {
    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    for (const record of recordsArray) {
      const payload = transformRecordToPayload(record, entity);

      const created = await freshdeskPost<Record<string, unknown>>(
        config.listPath,
        payload,
        token,
        subdomain
      );

      if (created) {
        createdRecords.push(transformEntityToRecord(created, entity));
      }
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof FreshdeskRecordError) {
      throw error;
    }
    throw new FreshdeskRecordError(`Failed to create records: ${error}`);
  }
};
