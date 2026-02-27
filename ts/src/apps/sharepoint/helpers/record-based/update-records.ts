/**
 * SharePoint Update Records
 *
 * Updates list items (records) in a SharePoint list that match the WHERE condition.
 * Items are updated sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { buildODataFilter } from './apply-where-condition';
import {
  getSharePointGraphClient,
  getSharePointSiteAndList,
  normalizeSetToSingleRecord,
  SharePointRecordError,
  TSharePointListItem,
} from './constants';

/**
 * Update list items (records) in a SharePoint list that match the WHERE condition.
 * Items are updated sequentially.
 *
 * @returns The number of records updated
 */
export const updateSharePointRecords: TQoreUpdateRecordsFunction = async (
  context,
  set,
  where,
  options
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SharePointRecordError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new SharePointRecordError('Table path is required to update records.');
  }

  try {
    const { siteId, listId } = await getSharePointSiteAndList({ token, tablePath });
    const client = getSharePointGraphClient(token);

    // Build OData filter from WHERE condition
    const filter = where ? buildODataFilter(where) : '';

    // Find all matching items
    const matchingItems: TSharePointListItem[] = [];
    let nextLink: string | null = null;

    do {
      let response;

      if (nextLink) {
        response = await client
          .api(nextLink)
          .headers({ Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' })
          .get();
      } else {
        let request = client
          .api(`/sites/${siteId}/lists/${listId}/items`)
          .query({ $select: 'id', $top: 100 });

        if (filter) {
          request = request.query({ $filter: filter });
        }

        response = await request
          .headers({ Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' })
          .get();
      }

      const items: TSharePointListItem[] = response?.value || [];
      matchingItems.push(...items);

      nextLink = response['@odata.nextLink'] || null;
    } while (nextLink);

    if (matchingItems.length === 0) {
      return 0;
    }

    // Normalize set data to a single flat object
    const updateData = normalizeSetToSingleRecord(set, mapColumnFormatToObject);

    // Remove metadata fields that can't be updated
    const fieldsToUpdate: Record<string, unknown> = {};
    const odataAnnotations: Record<string, string> = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (['id', 'createdDateTime', 'lastModifiedDateTime', 'webUrl', 'eTag'].includes(key)) {
        continue;
      }
      fieldsToUpdate[key] = value;
      if (Array.isArray(value)) {
        odataAnnotations[`${key}@odata.type`] = 'Collection(Edm.String)';
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return 0;
    }

    const updatePayload = { ...fieldsToUpdate, ...odataAnnotations };

    // Update each matching item
    let updatedCount = 0;
    for (const item of matchingItems) {
      try {
        await client
          .api(`/sites/${siteId}/lists/${listId}/items/${item.id}/fields`)
          .patch(updatePayload);
        updatedCount++;
      } catch (error) {
        Debugger.log(`Failed to update item ${item.id}: ${error}`);
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof SharePointRecordError) {
      throw error;
    }
    throw new SharePointRecordError(`Failed to update records: ${error}`);
  }
};
