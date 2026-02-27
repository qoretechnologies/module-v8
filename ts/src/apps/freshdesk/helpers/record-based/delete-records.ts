/**
 * Freshdesk Delete Records
 *
 * Deletes records from a Freshdesk entity type that match the WHERE condition.
 * Records are deleted sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { freshdeskClient } from '../../client';
import { buildFreshdeskWhere } from './apply-where-condition';
import {
  ENTITY_CONFIG,
  FreshdeskRecordError,
  MAX_PAGE_SIZE,
  MAX_SEARCH_PAGES,
  SEARCH_PAGE_SIZE,
  resolveEntity,
} from './constants';

/**
 * Find all record IDs matching a WHERE condition
 */
const findMatchingRecordIds = async (
  token: string,
  subdomain: string,
  entity: string,
  where: unknown
): Promise<number[]> => {
  const config = ENTITY_CONFIG[entity as keyof typeof ENTITY_CONFIG];
  const ids: number[] = [];
  const connOpts = { connectionOptions: { subdomain } };

  const { query, clientFilter } = buildFreshdeskWhere(
    where as import('@qoretechnologies/ts-toolkit').TQoreSearchRecordsWhereConditions
  );

  if (query) {
    for (let page = 1; page <= MAX_SEARCH_PAGES; page++) {
      const response = await freshdeskClient.get<{
        total: number;
        results: Array<{ id: number } & Record<string, unknown>>;
      }>(config.searchPath, {
        token,
        ...connOpts,
        params: {
          query: `"${query}"`,
          page: String(page),
        },
      });

      const items = response?.results || [];

      for (const item of items) {
        if (clientFilter) {
          if (clientFilter(item as Record<string, unknown>)) {
            ids.push(item.id);
          }
        } else {
          ids.push(item.id);
        }
      }

      if (items.length < SEARCH_PAGE_SIZE) {
        break;
      }
    }
  } else if (clientFilter) {
    for (let page = 1; ; page++) {
      const response = await freshdeskClient.get<
        Array<{ id: number } & Record<string, unknown>>
      >(config.listPath, {
        token,
        ...connOpts,
        params: { per_page: String(MAX_PAGE_SIZE), page: String(page) },
      });

      const items = response || [];

      for (const item of items) {
        if (clientFilter(item as Record<string, unknown>)) {
          ids.push(item.id);
        }
      }

      if (items.length < MAX_PAGE_SIZE) {
        break;
      }
    }
  }

  return ids;
};

/**
 * Delete records from a Freshdesk entity type that match the WHERE condition.
 * WHERE condition is required to prevent accidental mass deletion.
 *
 * @returns The number of records deleted
 */
export const deleteFreshdeskRecords: TQoreDeleteRecordsFunction = async (
  context,
  where,
  options
) => {
  const { token, subdomain } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'subdomain'],
    ErrorClass: FreshdeskRecordError,
  });

  const entity = resolveEntity(options?.table);
  const config = ENTITY_CONFIG[entity];

  if (!where) {
    throw new FreshdeskRecordError(
      'WHERE condition is required to delete records. Please provide a filter to specify which records to delete.'
    );
  }

  try {
    const matchingIds = await findMatchingRecordIds(token, subdomain, entity, where);

    if (matchingIds.length === 0) {
      return 0;
    }

    let deletedCount = 0;
    for (const id of matchingIds) {
      try {
        await freshdeskClient.delete(`${config.singlePath}/${id}`, {
          token,
          connectionOptions: { subdomain },
        });
        deletedCount++;
      } catch (error) {
        Debugger.log(`Failed to delete ${entity} ${id}: ${error}`);
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof FreshdeskRecordError) {
      throw error;
    }
    throw new FreshdeskRecordError(`Failed to delete records: ${error}`);
  }
};
