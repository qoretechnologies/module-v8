/**
 * QuickBooks Search Records
 *
 * Implements iterator-based search with filtering, sorting, and offset pagination.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../constants';
import { buildQuickbooksCriteria, filterRecordsClientSide } from './apply-where-condition';
import {
  ENTITY_CAPABILITIES,
  getFindMethodName,
  getEntityFromQueryResponse,
  MAX_PAGE_SIZE,
  QuickbooksRecordError,
  validateEntityType,
} from './constants';

/**
 * Search for QuickBooks records with filtering, sorting, and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchQuickbooksRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, realm_id, instance_type } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'realm_id', 'instance_type'],
    ErrorClass: QuickbooksError,
  });

  const tableName = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!tableName) {
    throw new QuickbooksRecordError('Table name is required in opts.table');
  }

  const entityType = validateEntityType(tableName);
  const capabilities = ENTITY_CAPABILITIES[entityType];

  if (!capabilities.query) {
    throw new QuickbooksRecordError(`Entity type ${entityType} does not support querying`);
  }

  try {
    const client = createQuickbooksClient({ token, realm_id, instance_type });

    // Build server-side criteria + optional client-side filter from WHERE
    const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

    // Build sort configuration
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;

    let offset = 0;
    let totalFetched = 0;
    let hasMore = true;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore || totalFetched >= limit) {
        return null;
      }

      try {
        const pageSize = Math.min(blockSize, MAX_PAGE_SIZE, limit - totalFetched);

        // Build QueryInput for the find method
        const queryInput: Record<string, unknown> = {
          limit: pageSize,
          offset,
          fetchAll: false,
        };

        // Add filter criteria
        if (criteria.length > 0) {
          queryInput.items = criteria;
        }

        // Add sort
        if (orderBy?.field) {
          const direction = orderBy.direction === 'desc' ? 'desc' : 'asc';
          queryInput[direction] = orderBy.field;
        }

        // Call find method dynamically (e.g., findCustomers, findInvoices)
        const findMethod = getFindMethodName(entityType);
        const response = await (client as unknown as Record<string, Function>)[findMethod](queryInput);

        const entities = getEntityFromQueryResponse(response, entityType) as Record<string, unknown>[];

        if (entities.length === 0) {
          hasMore = false;
          return null;
        }

        totalFetched += entities.length;
        offset += entities.length;

        // Check if there are more records
        const queryResponse = response?.QueryResponse as Record<string, unknown> | undefined;
        const totalCount = (queryResponse?.totalCount as number) || 0;
        if (totalFetched >= totalCount || entities.length < pageSize) {
          hasMore = false;
        }

        // Apply client-side filtering if needed (for ||, !=, is-set, is-not-set)
        let records = entities;
        if (clientSideFilter) {
          records = filterRecordsClientSide(entities, clientSideFilter);
        }

        if (records.length === 0) {
          // Client-side filter removed all results but there may be more pages
          if (hasMore) {
            return get_records(_ctx, blockSize);
          }
          return null;
        }

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof QuickbooksError || error instanceof QuickbooksRecordError) {
          throw error;
        }
        throw new QuickbooksRecordError(
          `Failed to search ${entityType} records: ${getQuickbooksErrorMessage(error)}`
        );
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof QuickbooksError || error instanceof QuickbooksRecordError) {
      throw error;
    }
    throw new QuickbooksRecordError(
      `Failed to initialize search for ${entityType}: ${getQuickbooksErrorMessage(error)}`
    );
  }
};
