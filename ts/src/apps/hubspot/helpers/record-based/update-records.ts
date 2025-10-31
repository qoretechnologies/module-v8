import { QorusRequest, TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { HUBSPOT_APP_NAME, HubspotError } from '../../constants';
import { buildHubspotFilter } from './apply-where-condition';
import { getHubspotCustomObjectNameToIdMap } from './constants';
import { Debugger } from '../../../../utils/Debugger';

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

type THubspotBatchUpdateResponse = {
  data: {
    status: string;
    results: Array<{
      id: string;
      properties: Record<string, any>;
    }>;
  };
};

export const updateHubspotRecords: TQoreUpdateRecordsFunction = async (
  context,
  fields,
  where,
  opts
) => {
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

    let updatedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batchIds = recordIds.slice(i, i + batchSize);

      const inputs = batchIds.map((id) => ({
        id,
        properties: fields,
      }));

      try {
        const updateResponse = await QorusRequest.post<THubspotBatchUpdateResponse>(
          {
            path: `/crm/v3/objects/${objectId}/batch/update`,
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

        if (updateResponse?.data?.results) {
          updatedCount += updateResponse.data.results.length;
        }
      } catch (batchError) {
        Debugger.log(`Error updating batch: ${batchError.message || batchError}`);
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }
    throw new HubspotError(
      `Failed to update records in table ${tableName}: ${error.message || error}`
    );
  }
};
