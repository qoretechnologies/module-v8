import { QorusRequest, TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { HUBSPOT_APP_NAME, HubspotError } from '../../constants';
import { buildHubspotFilter } from './apply-where-condition';
import { getHubspotCustomObjectNameToIdMap } from './constants';

type THubspotSearchResponse = {
  data: {
    results: Array<{
      id: string;
      properties: Record<string, any>;
    }>;
    paging?: {
      next?: {
        after: string;
      };
    };
  };
};

export const deleteHubspotRecords: TQoreDeleteRecordsFunction = async (context, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: HubspotError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new HubspotError('Table name is required');
  }

  try {
    const tableNameToObjectIdMap = await getHubspotCustomObjectNameToIdMap(token);
    const objectId = tableNameToObjectIdMap[tableName] || tableName;

    const filterGroups = where ? buildHubspotFilter(where) : [];

    const recordIds: string[] = [];
    let after: string | undefined;

    do {
      const searchBody: Record<string, any> = {
        limit: 100,
        properties: ['hs_object_id'],
      };

      if (filterGroups.length > 0) {
        searchBody.filterGroups = filterGroups;
      }

      if (after) {
        searchBody.after = after;
      }

      const searchResponse = await QorusRequest.post<THubspotSearchResponse>(
        {
          path: `/crm/v3/objects/${objectId}/search`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: searchBody,
        },
        {
          endpointId: HUBSPOT_APP_NAME,
          url: 'https://api.hubapi.com',
        }
      );

      const results = searchResponse?.data?.results;

      if (!results || results.length === 0) {
        break;
      }

      recordIds.push(...results.map((r) => r.id));
      after = searchResponse.data.paging?.next?.after;
    } while (after);

    if (recordIds.length === 0) {
      return 0;
    }

    let deletedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batchIds = recordIds.slice(i, i + batchSize);

      const inputs = batchIds.map((id) => ({
        id,
      }));

      try {
        await QorusRequest.post(
          {
            path: `/crm/v3/objects/${objectId}/batch/archive`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: { inputs },
          },
          {
            endpointId: HUBSPOT_APP_NAME,
            url: 'https://api.hubapi.com',
          }
        );

        deletedCount += batchIds.length;
      } catch (batchError) {
        Debugger.log(`Error deleting batch: ${batchError.message || batchError}`);
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }
    throw new HubspotError(
      `Failed to delete records in table ${tableName}: ${error.message || error}`
    );
  }
};
