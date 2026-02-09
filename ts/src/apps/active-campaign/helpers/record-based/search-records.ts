/**
 * ActiveCampaign Search Records
 *
 * Implements iterator-based search with hybrid filtering (server-side + client-side)
 * and offset-based pagination.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { activeCampaignClient } from '../constants';
import {
  canSortServerSide,
  extractServerSideParams,
  filterRecords,
  sortRecords,
  toApiSortField,
} from './apply-where-condition';
import {
  ActiveCampaignRecordError,
  ACTIVE_CAMPAIGN_RECORD_TYPES,
  CUSTOM_FIELD_PREFIX,
  ENTITY_CONFIG,
  MAX_PAGE_SIZE,
  TActiveCampaignRecordType,
  transformToRecord,
} from './constants';

/**
 * Fetch custom field values for contacts in a batch
 */
const fetchContactFieldValues = async (
  contactIds: string[],
  token: string,
  instanceUrl: string
): Promise<Map<string, Array<{ field: string; value: string }>>> => {
  const result = new Map<string, Array<{ field: string; value: string }>>();

  for (const contactId of contactIds) {
    try {
      const response = await activeCampaignClient.get<{
        fieldValues: Array<{ contact: string; field: string; value: string }>;
      }>(`contacts/${contactId}/fieldValues`, {
        token,
        baseUrl: instanceUrl,
      });

      const values = (response.fieldValues || [])
        .filter((fv) => fv.value !== '')
        .map((fv) => ({ field: fv.field, value: fv.value }));

      result.set(contactId, values);
    } catch {
      result.set(contactId, []);
    }
  }

  return result;
};

/**
 * Fetch custom field values for deals in a batch
 */
const fetchDealCustomFieldValues = async (
  dealIds: string[],
  token: string,
  instanceUrl: string
): Promise<Map<string, Array<{ customFieldId: number | string; fieldValue: string }>>> => {
  const result = new Map<string, Array<{ customFieldId: number | string; fieldValue: string }>>();

  for (const dealId of dealIds) {
    try {
      const response = await activeCampaignClient.get<{
        dealCustomFieldData: Array<{
          dealId: string;
          customFieldId: number;
          fieldValue: string;
        }>;
      }>(`deals/${dealId}/dealCustomFieldData`, {
        token,
        baseUrl: instanceUrl,
      });

      result.set(
        dealId,
        (response.dealCustomFieldData || []).map((d) => ({
          customFieldId: d.customFieldId,
          fieldValue: d.fieldValue,
        }))
      );
    } catch {
      result.set(dealId, []);
    }
  }

  return result;
};

/**
 * Extract custom field values from account response
 */
const extractAccountCustomFields = (
  account: Record<string, unknown>
): Array<{ customFieldId: number | string; fieldValue: string }> => {
  const fields = account.fields as Array<{
    customFieldId: number;
    fieldValue: string;
  }> | undefined;

  if (!fields || !Array.isArray(fields)) {
    return [];
  }

  return fields.map((f) => ({
    customFieldId: f.customFieldId,
    fieldValue: f.fieldValue,
  }));
};

/**
 * Check if a WHERE condition references any custom fields
 */
const whereReferencesCustomFields = (
  where?: { exp: string; args?: unknown[] } | null
): boolean => {
  if (!where || !where.args) {
    return false;
  }

  for (const arg of where.args) {
    if (typeof arg === 'object' && arg !== null) {
      if ('field' in arg && typeof (arg as Record<string, unknown>).field === 'string') {
        if (((arg as Record<string, unknown>).field as string).startsWith(CUSTOM_FIELD_PREFIX)) {
          return true;
        }
      }
      if ('exp' in arg) {
        if (whereReferencesCustomFields(arg as { exp: string; args?: unknown[] })) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Search for ActiveCampaign records with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchActiveCampaignRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'instance_url'] as const,
    ErrorClass: ActiveCampaignRecordError,
  });

  const tableName = opts?.table as TActiveCampaignRecordType | undefined;
  const limit = (opts?.limit as number) || 10000;

  if (!tableName) {
    throw new ActiveCampaignRecordError('Table name is required in opts.table');
  }

  if (!ACTIVE_CAMPAIGN_RECORD_TYPES.includes(tableName)) {
    throw new ActiveCampaignRecordError(
      `Unknown table: ${tableName}. Available tables: ${ACTIVE_CAMPAIGN_RECORD_TYPES.join(', ')}`
    );
  }

  const entityConfig = ENTITY_CONFIG[tableName];

  // Extract server-side params from WHERE
  const { serverParams, remainingWhere } = extractServerSideParams(where, tableName);

  // Handle orderBy
  const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
  const useServerSort = canSortServerSide(tableName, orderBy?.field);

  if (useServerSort && orderBy) {
    serverParams[`orders[${toApiSortField(orderBy.field)}]`] = orderBy.direction || 'asc';
  }

  // Track whether we need to fetch custom fields
  const needsCustomFields = whereReferencesCustomFields(remainingWhere);

  // Iterator state
  let offset = 0;
  let hasMore = true;
  let totalReturned = 0;
  let leftover: Record<string, unknown>[] = [];

  const getRecords: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (leftover.length === 0 && (!hasMore || totalReturned >= limit)) {
      return null;
    }

    const pageSize = Math.min(blockSize || MAX_PAGE_SIZE, MAX_PAGE_SIZE);
    let filteredBatch: Record<string, unknown>[] = [...leftover];
    leftover = [];

    // Keep fetching pages until we have enough filtered records or run out
    while (filteredBatch.length < pageSize && hasMore && totalReturned + filteredBatch.length < limit) {
      const fetchLimit = Math.min(MAX_PAGE_SIZE, limit - totalReturned - filteredBatch.length);

      const response = await activeCampaignClient.get<Record<string, unknown>>(
        entityConfig.apiPath,
        {
          token,
          baseUrl: instance_url,
          params: {
            ...serverParams,
            limit: fetchLimit,
            offset,
          },
        }
      );

      const items = (response[entityConfig.itemsKey] || []) as Record<string, unknown>[];

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      // Transform items to records, enriching with custom field values if needed
      let records: Record<string, unknown>[];

      if (tableName === 'Contacts' && needsCustomFields) {
        const contactIds = items.map((item) => String(item.id));
        const cfValues = await fetchContactFieldValues(contactIds, token, instance_url);
        records = items.map((item) =>
          transformToRecord(item, tableName, cfValues.get(String(item.id)) as Array<Record<string, unknown>>)
        );
      } else if (tableName === 'Deals' && needsCustomFields) {
        const dealIds = items.map((item) => String(item.id));
        const cfValues = await fetchDealCustomFieldValues(dealIds, token, instance_url);
        records = items.map((item) =>
          transformToRecord(item, tableName, cfValues.get(String(item.id)) as Array<Record<string, unknown>>)
        );
      } else if (tableName === 'Accounts') {
        records = items.map((item) => {
          const accountCFs = extractAccountCustomFields(item);
          return transformToRecord(item, tableName, accountCFs as Array<Record<string, unknown>>);
        });
      } else {
        records = items.map((item) => transformToRecord(item, tableName));
      }

      // Apply client-side WHERE filtering
      const filtered = filterRecords(records, remainingWhere);
      filteredBatch.push(...filtered);

      offset += items.length;

      // Check if more data available
      const total = (response?.meta as Record<string, unknown>)?.total;
      if (total !== undefined) {
        hasMore = offset < Number(total);
      } else {
        hasMore = items.length >= fetchLimit;
      }
    }

    if (filteredBatch.length === 0) {
      return null;
    }

    // Trim to requested block size, preserve excess for next call
    const batch = filteredBatch.slice(0, pageSize);
    leftover = filteredBatch.slice(pageSize);
    totalReturned += batch.length;

    // Apply client-side sorting if server-side not available
    const sortedBatch = !useServerSort ? sortRecords(batch, orderBy) : batch;

    return mapObjectToColumnFormat(sortedBatch);
  };

  return getRecords;
};
