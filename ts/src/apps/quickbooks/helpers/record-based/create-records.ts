/**
 * QuickBooks Create Records
 *
 * Creates records using the QuickBooks batch API (up to 25 per batch request).
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../constants';
import {
  BATCH_SIZE,
  ENTITY_CAPABILITIES,
  QuickbooksRecordError,
  validateEntityType,
} from './constants';

/**
 * Create QuickBooks records using the batch API.
 * Records are chunked into groups of 25 (QB batch limit).
 */
export const createQuickbooksRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  options
) => {
  const { token, realm_id, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'realm_id', 'instance_type'],
    ErrorClass: QuickbooksError,
  });

  const tableName = options?.table;

  if (!tableName) {
    throw new QuickbooksRecordError('Table name is required to create records.');
  }

  const entityType = validateEntityType(tableName);
  const capabilities = ENTITY_CAPABILITIES[entityType];

  if (!capabilities.create) {
    throw new QuickbooksRecordError(`Entity type ${entityType} does not support creation`);
  }

  try {
    const client = createQuickbooksClient({ token, realm_id, instance_type });

    // Convert column format to array of records
    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    // Process in batches of 25
    for (let i = 0; i < recordsArray.length; i += BATCH_SIZE) {
      const batch = recordsArray.slice(i, i + BATCH_SIZE);

      // Build batch request items
      const batchItems = batch.map((record, idx) => ({
        bId: `create_${i + idx}`,
        operation: 'create',
        [entityType]: record,
      }));

      // Execute batch
      const batchResponse = (await client.batch(batchItems)) as Record<string, unknown>;
      const batchItemResponses =
        (batchResponse?.BatchItemResponse as Array<Record<string, unknown>>) || [];

      // Extract created entities from batch response
      for (const item of batchItemResponses) {
        if (item[entityType]) {
          createdRecords.push(item[entityType] as Record<string, unknown>);
        } else if (item.Fault) {
          const fault = item.Fault as Record<string, unknown>;
          const errors = (fault.Error as Array<Record<string, unknown>>) || [];
          const detail = errors[0]?.Detail || errors[0]?.Message || 'Unknown error';
          throw new QuickbooksRecordError(
            `Batch create failed for ${entityType}: ${detail}`
          );
        }
      }
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof QuickbooksError || error instanceof QuickbooksRecordError) {
      throw error;
    }
    throw new QuickbooksRecordError(
      `Failed to create ${entityType} records: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
