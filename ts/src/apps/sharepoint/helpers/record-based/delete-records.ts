/**
 * SharePoint Delete Records
 *
 * Deletes list items (records) from a SharePoint list that match the WHERE condition.
 * Items are deleted sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { buildODataFilter } from './apply-where-condition';
import {
  getSharePointGraphClient,
  getSharePointSiteAndList,
  SharePointRecordError,
  TSharePointListItem,
} from './constants';

/**
 * Delete list items (records) from a SharePoint list that match the WHERE condition.
 * Items are deleted sequentially.
 *
 * @returns The number of records deleted
 */
export const deleteSharePointRecords: TQoreDeleteRecordsFunction = async (
  context,
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
    throw new SharePointRecordError('Table path is required to delete records.');
  }

  if (!where) {
    throw new SharePointRecordError(
      'WHERE condition is required to delete records. Please provide a filter to specify which records to delete.'
    );
  }

  try {
    const { siteId, listId } = await getSharePointSiteAndList({ token, tablePath });
    const client = getSharePointGraphClient(token);

    // Build OData filter from WHERE condition
    const filter = buildODataFilter(where);

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
        const request = client
          .api(`/sites/${siteId}/lists/${listId}/items`)
          .query({ $select: 'id', $top: 100, $filter: filter });

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

    // Delete each matching item
    let deletedCount = 0;
    for (const item of matchingItems) {
      try {
        await client
          .api(`/sites/${siteId}/lists/${listId}/items/${item.id}`)
          .delete();
        deletedCount++;
      } catch (error) {
        Debugger.log(`Failed to delete item ${item.id}: ${error}`);
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof SharePointRecordError) {
      throw error;
    }
    throw new SharePointRecordError(`Failed to delete records: ${error}`);
  }
};
