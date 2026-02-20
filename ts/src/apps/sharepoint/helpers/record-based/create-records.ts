/**
 * SharePoint Create Records
 *
 * Creates list items (records) in a SharePoint list.
 * Items are created sequentially since Microsoft Graph does not support batch item creation.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import {
  getSharePointGraphClient,
  getSharePointSiteAndList,
  SharePointRecordError,
  TSharePointListItem,
  transformItemToRecord,
} from './constants';

/**
 * Create list items (records) in a SharePoint list.
 * Items are created sequentially.
 */
export const createSharePointRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  options
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SharePointRecordError,
  });

  const tablePath = options?.table;

  if (!tablePath) {
    throw new SharePointRecordError('Table path is required to create records.');
  }

  try {
    const { siteId, listId } = await getSharePointSiteAndList({ token, tablePath });
    const client = getSharePointGraphClient(token);

    // Convert column format to array of records
    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    for (const record of recordsArray) {
      // Build the fields payload, handling array values with OData type annotations
      const fields: Record<string, unknown> = {};
      const odataAnnotations: Record<string, string> = {};

      for (const [key, value] of Object.entries(record)) {
        // Skip metadata fields that can't be set
        if (['id', 'createdDateTime', 'lastModifiedDateTime', 'webUrl', 'eTag'].includes(key)) {
          continue;
        }
        fields[key] = value;
        if (Array.isArray(value)) {
          odataAnnotations[`${key}@odata.type`] = 'Collection(Edm.String)';
        }
      }

      const itemInput = {
        fields: { ...fields, ...odataAnnotations },
      };

      const createdItem: TSharePointListItem = await client
        .api(`/sites/${siteId}/lists/${listId}/items`)
        .post(itemInput);

      createdRecords.push(transformItemToRecord(createdItem));
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof SharePointRecordError) {
      throw error;
    }
    throw new SharePointRecordError(`Failed to create records: ${error}`);
  }
};
