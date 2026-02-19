/**
 * SharePoint Get Record Type
 *
 * Returns the dynamic schema for list item records in a specific SharePoint list,
 * including standard item fields and all writable column fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  getSharePointColumnFields,
  getSharePointSiteAndList,
  SharePointRecordError,
} from './constants';

/**
 * Get the record type (schema) for list items in a specific SharePoint list.
 * Includes standard item metadata fields and all writable column fields.
 */
export const getSharePointRecordType: TQoreGetRecordTypeFunction = async (context, tablePath) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SharePointRecordError,
  });

  try {
    const { siteId, listId } = await getSharePointSiteAndList({ token, tablePath });

    // Get dynamic column fields for this list
    const columnFields = await getSharePointColumnFields({ token, siteId, listId });

    return {
      type: 'hash',
      fields: {
        // Standard metadata fields (read-only)
        id: { type: 'string', desc: 'List item ID' },
        createdDateTime: { type: 'date', desc: 'Item creation timestamp' },
        lastModifiedDateTime: { type: 'date', desc: 'Item last modified timestamp' },
        webUrl: { type: 'string', desc: 'Item web URL' },

        // Dynamic column fields
        ...columnFields,
      },
    } satisfies TQoreTypeObject;
  } catch (error) {
    if (error instanceof SharePointRecordError) {
      throw error;
    }
    throw new SharePointRecordError(`Failed to get record type for "${tablePath}": ${error}`);
  }
};
