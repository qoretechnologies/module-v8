import {
  IQoreTypeObjectNonList,
  QorusRequest,
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { HUBSPOT_APP_NAME, HubspotError } from '../../constants';
import { buildHubspotFilter } from './apply-where-condition';
import { getHubspotCustomObjectNameToIdMap } from './constants';
import { getHubspotRecordType } from './get-record-type';

type THubspotSearchResponse = {
  data: {
    results: Array<{
      id: string;
      properties: Record<string, any>;
      createdAt: string;
      updatedAt: string;
      archived: boolean;
    }>;
    paging?: {
      next?: {
        after: string;
      };
    };
  };
};

export const searchHubspotRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: HubspotError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new HubspotError('Table name is required in opts.table');
  }

  try {
    const tableNameToObjectIdMap = await getHubspotCustomObjectNameToIdMap(token);
    const objectId = tableNameToObjectIdMap[tableName] || tableName;

    const filterGroups = where ? buildHubspotFilter(where) : [];

    const sorts: Array<{ propertyName: string; direction: 'ASCENDING' | 'DESCENDING' }> = [];
    const orderBy = opts.orderBy as { column: string; ascending?: boolean };

    if (orderBy) {
      sorts.push({
        propertyName: orderBy.column,
        direction: orderBy.ascending !== false ? 'ASCENDING' : 'DESCENDING',
      });
    }

    const recordType = (await getHubspotRecordType(ctx, tableName)) as IQoreTypeObjectNonList;
    const properties = recordType?.fields ? Object.keys(recordType.fields) : [];

    let after: string | undefined;

    const get_records: TQoreSearchRecordsIterator = (_ctx, blockSize) => {
      return (async () => {
        try {
          const requestBody: Record<string, any> = {
            limit: Math.min(blockSize, 100),
          };

          if (filterGroups.length > 0) {
            requestBody.filterGroups = filterGroups;
          }

          if (sorts.length > 0) {
            requestBody.sorts = sorts;
          }

          if (after) {
            requestBody.after = after;
          }

          if (properties.length > 0) {
            requestBody.properties = properties.filter((prop) => prop !== 'id');
          }

          const response = await QorusRequest.post<THubspotSearchResponse>(
            {
              path: `/crm/v3/objects/${objectId}/search`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
              data: requestBody,
            },
            {
              endpointId: HUBSPOT_APP_NAME,
              url: 'https://api.hubapi.com',
            }
          );

          const results = response?.data?.results;

          if (!results || results.length === 0) {
            return null;
          }

          after = response.data.paging?.next?.after;

          const mappedData = results.map((record) => ({
            id: record.id,
            ...record.properties,
          }));

          return mapObjectToColumnFormat(mappedData);
        } catch (error) {
          if (error instanceof HubspotError) {
            throw error;
          }
          throw new HubspotError(`Failed to search records: ${error.message || error}`);
        }
      })();
    };

    return get_records;
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }
    throw new HubspotError(
      `Failed to initialize search for table ${tableName}: ${error.message || error}`
    );
  }
};
