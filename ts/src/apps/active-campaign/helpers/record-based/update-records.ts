/**
 * ActiveCampaign Update Records
 *
 * Finds records matching WHERE conditions and updates them sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { activeCampaignClient } from '../constants';
import { extractServerSideParams, filterRecords } from './apply-where-condition';
import {
  ActiveCampaignRecordError,
  ACTIVE_CAMPAIGN_RECORD_TYPES,
  ENTITY_CONFIG,
  MAX_PAGE_SIZE,
  normalizeSetToSingleRecord,
  TActiveCampaignRecordType,
  transformRecordToPayload,
  transformToRecord,
} from './constants';

/**
 * Update deal custom field values via separate API calls
 */
const updateDealCustomFields = async (
  dealId: string,
  customFields: Array<{ id: string; value: unknown }>,
  token: string,
  instanceUrl: string
): Promise<void> => {
  for (const cf of customFields) {
    await activeCampaignClient.post('dealCustomFieldData', {
      dealCustomFieldDatum: {
        dealId: Number(dealId),
        customFieldId: Number(cf.id),
        fieldValue: String(cf.value),
      },
    }, {
      token,
      baseUrl: instanceUrl,
    });
  }
};

/**
 * Update records matching WHERE conditions for the specified entity type.
 * Returns the number of records updated.
 */
export const updateActiveCampaignRecords: TQoreUpdateRecordsFunction = async (context, set, where, options) => {
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
      'WHERE condition is required to update records. Please provide a filter to specify which records to update.'
    );
  }

  const entityConfig = ENTITY_CONFIG[tableName];

  // Normalize set to a single record
  const setRecord = normalizeSetToSingleRecord(set);
  const { standardPayload, customFields } = transformRecordToPayload(setRecord, tableName);

  // Find matching records using server-side + client-side filtering
  const { serverParams, remainingWhere } = extractServerSideParams(where, tableName);

  let offset = 0;
  let hasMore = true;
  let updatedCount = 0;

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

    // Transform raw API items to records so WHERE conditions match record field names
    const records = items.map((item) => transformToRecord(item, tableName));

    // Apply client-side filtering on transformed records
    const matchingRecords = filterRecords(records, remainingWhere);

    // Update each matching record
    for (const record of matchingRecords) {
      const itemId = String(record.id);

      await activeCampaignClient.put<Record<string, unknown>>(
        `${entityConfig.apiPath}/${itemId}`,
        { [entityConfig.itemKey]: standardPayload },
        { token, baseUrl: instance_url }
      );

      // For deals, update custom fields via separate API
      if (tableName === 'Deals' && customFields.length > 0) {
        await updateDealCustomFields(itemId, customFields, token, instance_url);
      }

      updatedCount++;
    }

    offset += items.length;

    const total = (response?.meta as Record<string, unknown>)?.total;
    if (total !== undefined) {
      hasMore = offset < Number(total);
    } else {
      hasMore = items.length >= MAX_PAGE_SIZE;
    }
  }

  return updatedCount;
};
