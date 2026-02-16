/**
 * Freshdesk Update Records
 *
 * Updates records in a Freshdesk entity type that match the WHERE condition.
 * Records are updated sequentially since Freshdesk does not support batch updates.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { freshdeskClient } from '../../client';
import { buildFreshdeskWhere } from './apply-where-condition';
import {
  ENTITY_CONFIG,
  FreshdeskRecordError,
  MAX_PAGE_SIZE,
  MAX_SEARCH_PAGES,
  SEARCH_PAGE_SIZE,
  normalizeSetToSingleRecord,
  resolveEntity,
  transformRecordToPayload,
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

  if (where) {
    const { query, clientFilter } = buildFreshdeskWhere(
      where as import('@qoretechnologies/ts-toolkit').TQoreSearchRecordsWhereConditions
    );

    if (query) {
      // Use search endpoint
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
      // No server query, fetch all and filter client-side
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
  }

  return ids;
};

/**
 * Update records in a Freshdesk entity type that match the WHERE condition.
 *
 * @returns The number of records updated
 */
export const updateFreshdeskRecords: TQoreUpdateRecordsFunction = async (
  context,
  set,
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

  try {
    // Find matching records
    const matchingIds = await findMatchingRecordIds(token, subdomain, entity, where);

    if (matchingIds.length === 0) {
      return 0;
    }

    // Normalize set data
    const updateData = normalizeSetToSingleRecord(
      set,
      mapColumnFormatToObject as (data: Record<string, unknown>) => Record<string, unknown>[]
    );
    const payload = transformRecordToPayload(updateData, entity);

    if (Object.keys(payload).length === 0) {
      return 0;
    }

    // Update each record
    let updatedCount = 0;
    for (const id of matchingIds) {
      try {
        await freshdeskClient.put(`${config.singlePath}/${id}`, payload, {
          token,
          connectionOptions: { subdomain },
        });
        updatedCount++;
      } catch (error) {
        Debugger.log(`Failed to update ${entity} ${id}: ${error}`);
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof FreshdeskRecordError) {
      throw error;
    }
    throw new FreshdeskRecordError(`Failed to update records: ${error}`);
  }
};
