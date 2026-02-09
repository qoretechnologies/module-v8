/**
 * ActiveCampaign Delete Records
 *
 * Finds records matching WHERE conditions and deletes them sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { activeCampaignClient } from '../constants';
import { extractServerSideParams, filterRecords } from './apply-where-condition';
import {
  ActiveCampaignRecordError,
  ACTIVE_CAMPAIGN_RECORD_TYPES,
  ENTITY_CONFIG,
  MAX_PAGE_SIZE,
  TActiveCampaignRecordType,
} from './constants';

/**
 * Delete records matching WHERE conditions for the specified entity type.
 * Returns the number of records deleted.
 */
export const deleteActiveCampaignRecords: TQoreDeleteRecordsFunction = async (context, where, options) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'] as const,
    ErrorClass: ActiveCampaignRecordError,
  });

  const tableName = options?.table as TActiveCampaignRecordType | undefined;

  if (!tableName) {
    throw new ActiveCampaignRecordError('Table name is required in options.table');
  }

  if (!ACTIVE_CAMPAIGN_RECORD_TYPES.includes(tableName)) {
    throw new ActiveCampaignRecordError(
      `Unknown table: ${tableName}. Available tables: ${ACTIVE_CAMPAIGN_RECORD_TYPES.join(', ')}`
    );
  }

  if (!where) {
    throw new ActiveCampaignRecordError(
      'WHERE condition is required to delete records. Please provide a filter to specify which records to delete (e.g., email == "test@example.com").'
    );
  }

  const entityConfig = ENTITY_CONFIG[tableName];

  // Extract server-side params from WHERE
  const { serverParams, remainingWhere } = extractServerSideParams(where, tableName);

  let offset = 0;
  let hasMore = true;
  let deletedCount = 0;

  while (hasMore) {
    const response = await activeCampaignClient.get<Record<string, unknown>>(
      entityConfig.apiPath,
      {
        token,
        baseUrl: instance_url,
        params: {
          ...serverParams,
          limit: MAX_PAGE_SIZE,
          offset,
        },
      }
    );

    const items = (response[entityConfig.itemsKey] || []) as Record<string, unknown>[];

    if (items.length === 0) {
      break;
    }

    // Apply client-side filtering
    const matchingItems = filterRecords(items, remainingWhere);

    // Delete each matching record
    for (const item of matchingItems) {
      const itemId = String(item.id);

      await activeCampaignClient.delete(
        `${entityConfig.apiPath}/${itemId}`,
        { token, baseUrl: instance_url }
      );

      deletedCount++;
    }

    // After deletion, don't increase offset — items shift.
    // But we need to handle the case where we deleted all items on this page.
    if (matchingItems.length === items.length) {
      // All items matched and were deleted, fetch same offset
      const total = (response?.meta as Record<string, unknown>)?.total;
      if (total !== undefined) {
        hasMore = Number(total) - deletedCount > 0;
      } else {
        hasMore = items.length >= MAX_PAGE_SIZE;
      }
    } else {
      // Some items didn't match, move offset past them
      offset += items.length - matchingItems.length;

      const total = (response?.meta as Record<string, unknown>)?.total;
      if (total !== undefined) {
        hasMore = offset < Number(total) - deletedCount;
      } else {
        hasMore = items.length >= MAX_PAGE_SIZE;
      }
    }
  }

  return deletedCount;
};
