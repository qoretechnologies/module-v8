/**
 * QuickBooks Update Records
 *
 * Updates records matching WHERE condition using the batch API.
 * Requires search-first to obtain current SyncTokens for optimistic concurrency.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../constants';
import { buildQuickbooksCriteria, filterRecordsClientSide } from './apply-where-condition';
import {
  BATCH_SIZE,
  ENTITY_CAPABILITIES,
  getFindMethodName,
  getEntityFromQueryResponse,
  MAX_PAGE_SIZE,
  QuickbooksRecordError,
  validateEntityType,
} from './constants';

type MatchingEntity = { Id: string; SyncToken: string };

/**
 * Normalize the `set` parameter into a single flat record of fields to update.
 * Handles both column format ({ field: [val] }) and plain object format ({ field: val }).
 */
const normalizeSetToSingleRecord = (
  input: unknown
): Record<string, unknown> => {
  if (Array.isArray(input)) {
    if (input.length > 1) {
      throw new QuickbooksRecordError(
        `Update supports a single record in 'set'; received ${input.length} records.`
      );
    }
    return (input[0] as Record<string, unknown>) || {};
  }

  if (input && typeof input === 'object') {
    const values = Object.values(input);
    const allArrays = values.length > 0 && values.every((v) => Array.isArray(v));
    const lengths = allArrays ? values.map((v) => (v as unknown[]).length) : [];
    const sameLength = lengths.length > 0 && new Set(lengths).size === 1;

    if (allArrays && sameLength) {
      const records = mapColumnFormatToObject(input as Record<string, {}[]>);
      if (records.length > 1) {
        throw new QuickbooksRecordError(
          `Update supports a single record in 'set'; received ${records.length} records.`
        );
      }
      return records[0] || {};
    }

    return input as Record<string, unknown>;
  }

  return {};
};

/**
 * Update QuickBooks records matching the WHERE condition.
 * Two-phase: search for matching IDs + SyncTokens, then batch update.
 *
 * @returns The number of records updated
 */
export const updateQuickbooksRecords: TQoreUpdateRecordsFunction = async (
  context,
  set,
  where,
  options
) => {
  const { token, realm_id, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'realm_id', 'instance_type'],
    ErrorClass: QuickbooksError,
  });

  const tableName = options?.table;

  if (!tableName) {
    throw new QuickbooksRecordError('Table name is required to update records.');
  }

  const entityType = validateEntityType(tableName);
  const capabilities = ENTITY_CAPABILITIES[entityType];

  if (!capabilities.update) {
    throw new QuickbooksRecordError(`Entity type ${entityType} does not support updates`);
  }

  try {
    const client = createQuickbooksClient({ token, realm_id, instance_type });

    // Build criteria from WHERE
    const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

    // Search for matching records to get IDs and SyncTokens
    const findMethod = getFindMethodName(entityType);
    const matchingEntities: MatchingEntity[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const queryInput: Record<string, unknown> = {
        limit: MAX_PAGE_SIZE,
        offset,
        fetchAll: false,
      };

      if (criteria.length > 0) {
        queryInput.items = criteria;
      }

      const response = await (client as unknown as Record<string, Function>)[findMethod](queryInput);
      const entities = getEntityFromQueryResponse(response, entityType) as Record<string, unknown>[];

      if (entities.length === 0) {
        break;
      }

      // Apply client-side filter if needed
      const filtered = clientSideFilter
        ? filterRecordsClientSide(entities, clientSideFilter)
        : entities;

      for (const entity of filtered) {
        if (entity.Id && entity.SyncToken !== undefined) {
          matchingEntities.push({
            Id: String(entity.Id),
            SyncToken: String(entity.SyncToken),
          });
        }
      }

      offset += entities.length;
      const queryResponse = response?.QueryResponse as { totalCount?: number } | undefined;
      const totalCount = queryResponse?.totalCount;
      if (
        (typeof totalCount === 'number' && totalCount > 0 && offset >= totalCount) ||
        entities.length < MAX_PAGE_SIZE
      ) {
        hasMore = false;
      }
    }

    if (matchingEntities.length === 0) {
      return 0;
    }

    // Normalize set data to a single flat object
    const updateFields = normalizeSetToSingleRecord(set);

    if (Object.keys(updateFields).length === 0) {
      return 0;
    }

    // Remove read-only fields from update payload
    delete updateFields.Id;
    delete updateFields.SyncToken;
    delete updateFields.MetaData;
    delete updateFields.domain;
    delete updateFields.sparse;

    // Batch update
    let updatedCount = 0;

    for (let i = 0; i < matchingEntities.length; i += BATCH_SIZE) {
      const batch = matchingEntities.slice(i, i + BATCH_SIZE);

      const batchItems = batch.map((entity, idx) => ({
        bId: `update_${i + idx}`,
        operation: 'update',
        [entityType]: {
          ...updateFields,
          Id: entity.Id,
          SyncToken: entity.SyncToken,
          sparse: true,
        },
      }));

      const batchResponse = (await client.batch(batchItems)) as Record<string, unknown>;
      const batchItemResponses =
        (batchResponse?.BatchItemResponse as Array<Record<string, unknown>>) || [];

      for (const item of batchItemResponses) {
        if (item[entityType]) {
          updatedCount++;
        } else if (item.Fault) {
          const fault = item.Fault as Record<string, unknown>;
          const errors = (fault.Error as Array<Record<string, unknown>>) || [];
          const detail = errors[0]?.Detail || errors[0]?.Message || 'Unknown error';
          Debugger.log(`Failed to update ${entityType} record: ${detail}`);
        }
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof QuickbooksError || error instanceof QuickbooksRecordError) {
      throw error;
    }
    throw new QuickbooksRecordError(
      `Failed to update ${entityType} records: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
