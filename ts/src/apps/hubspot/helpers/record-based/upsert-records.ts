import { QorusRequest, TQoreUpsertRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { HUBSPOT_APP_NAME, HubspotError } from '../../constants';
import { getHubspotCustomObjectNameToIdMap } from './constants';
import { Debugger } from '../../../../utils/Debugger';

type THubspotBatchUpsertResponse = {
  data: {
    status: string;
    results: Array<{
      new: boolean;
      id: string;
      properties: Record<string, any>;
    }>;
  };
};

export const upsertHubspotRecords: TQoreUpsertRecordsFunction = async (context, records, opts) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: HubspotError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new HubspotError('Table name is required');
  }

  const idProperty = opts?.idProperty as string | undefined;

  if (!idProperty) {
    throw new HubspotError(
      'idProperty is required for upsert operations. Specify which property uniquely identifies records (e.g., "email", "id", or a custom unique property)'
    );
  }

  try {
    const tableNameToObjectIdMap = await getHubspotCustomObjectNameToIdMap(token);
    const objectId = tableNameToObjectIdMap[tableName] || tableName;

    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);

    const results: Array<'inserted' | 'updated' | 'verified' | 'unchanged' | 'deleted'> = [];
    const batchSize = 100;

    for (let i = 0; i < recordsArray.length; i += batchSize) {
      const batchRecords = recordsArray.slice(i, i + batchSize);

      const inputs = batchRecords.map((record) => ({
        idProperty,
        id: String(record[idProperty]),
        properties: record,
      }));

      try {
        const upsertResponse = await QorusRequest.post<THubspotBatchUpsertResponse>(
          {
            path: `/crm/v3/objects/${objectId}/batch/upsert`,
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

        if (upsertResponse?.data?.results) {
          const batchResults = upsertResponse.data.results.map((result) =>
            result.new ? 'inserted' : 'updated'
          );
          results.push(...batchResults);
        }
      } catch (batchError) {
        Debugger.log(`Error upserting batch: ${batchError.message || batchError}`);
        results.push(...Array(batchRecords.length).fill('unchanged'));
      }
    }

    return results;
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }
    throw new HubspotError(
      `Failed to upsert records in table ${tableName}: ${error.message || error}`
    );
  }
};
