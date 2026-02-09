/**
 * QuickBooks Delete Records
 *
 * Deletes records matching WHERE condition using the batch API.
 * Requires search-first to obtain current SyncTokens for optimistic concurrency.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
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
 * Delete QuickBooks records matching the WHERE condition.
 * Two-phase: search for matching IDs + SyncTokens, then batch delete.
 *
 * @returns The number of records deleted
 */
export const deleteQuickbooksRecords: TQoreDeleteRecordsFunction = async (
  context,
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
    throw new QuickbooksRecordError('Table name is required to delete records.');
  }

  const entityType = validateEntityType(tableName);
  const capabilities = ENTITY_CAPABILITIES[entityType];

  if (!capabilities.delete) {
    throw new QuickbooksRecordError(
      `Entity type ${entityType} does not support deletion. Consider deactivating the record instead.`
    );
  }

  if (!where) {
    throw new QuickbooksRecordError(
      'WHERE condition is required to delete records. Please provide a filter to specify which records to delete.'
    );
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
      const queryResponse = response?.QueryResponse as Record<string, unknown> | undefined;
      const totalCount = (queryResponse?.totalCount as number) || 0;
      if (offset >= totalCount || entities.length < MAX_PAGE_SIZE) {
        hasMore = false;
      }
    }

    if (matchingEntities.length === 0) {
      return 0;
    }

    // Batch delete
    let deletedCount = 0;

    for (let i = 0; i < matchingEntities.length; i += BATCH_SIZE) {
      const batch = matchingEntities.slice(i, i + BATCH_SIZE);

      const batchItems = batch.map((entity, idx) => ({
        bId: `delete_${i + idx}`,
        operation: 'delete',
        [entityType]: {
          Id: entity.Id,
          SyncToken: entity.SyncToken,
        },
      }));

      const batchResponse = (await client.batch(batchItems)) as Record<string, unknown>;
      const batchItemResponses =
        (batchResponse?.BatchItemResponse as Array<Record<string, unknown>>) || [];

      for (const item of batchItemResponses) {
        if (item[entityType]) {
          deletedCount++;
        } else if (item.Fault) {
          const fault = item.Fault as Record<string, unknown>;
          const errors = (fault.Error as Array<Record<string, unknown>>) || [];
          const detail = errors[0]?.Detail || errors[0]?.Message || 'Unknown error';
          Debugger.log(`Failed to delete ${entityType} record: ${detail}`);
        }
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof QuickbooksError || error instanceof QuickbooksRecordError) {
      throw error;
    }
    throw new QuickbooksRecordError(
      `Failed to delete ${entityType} records: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
