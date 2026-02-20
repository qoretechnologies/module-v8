/**
 * SharePoint Get Table List
 *
 * Returns all available Lists across all accessible Sites as table paths
 * in the format "siteName|listName".
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { buildTablePath, getSharePointGraphClient, SharePointRecordError } from './constants';

/**
 * Get all available tables (Lists) across all accessible Sites.
 * Returns table names in the format: "siteName|listName"
 */
export const getSharePointTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: SharePointRecordError,
  });

  try {
    const tables: string[] = [];
    const client = getSharePointGraphClient(token);

    // Fetch all sites
    let siteResponse = await client.api('/sites?search=*&$select=displayName,id').get();

    const sites: Array<{ id: string; displayName: string }> = [];

    while (siteResponse.value.length > 0) {
      for (const site of siteResponse.value) {
        if (site.displayName && site.id) {
          sites.push({ id: site.id, displayName: site.displayName });
        }
      }
      if (siteResponse['@odata.nextLink']) {
        siteResponse = await client.api(siteResponse['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    // For each site, fetch lists
    for (const site of sites) {
      let listResponse = await client
        .api(`/sites/${site.id}/lists?$select=displayName,id,system,list`)
        .get();

      while (listResponse.value.length > 0) {
        for (const list of listResponse.value) {
          // Skip system/hidden lists and document libraries
          if (list.system || list.list?.template === 'documentLibrary') {
            continue;
          }
          if (list.displayName) {
            tables.push(buildTablePath(site.displayName, list.displayName));
          }
        }
        if (listResponse['@odata.nextLink']) {
          listResponse = await client.api(listResponse['@odata.nextLink']).get();
        } else {
          break;
        }
      }
    }

    return tables;
  } catch (error) {
    if (error instanceof SharePointRecordError) {
      throw error;
    }
    throw new SharePointRecordError(`Failed to get table list: ${error}`);
  }
};
