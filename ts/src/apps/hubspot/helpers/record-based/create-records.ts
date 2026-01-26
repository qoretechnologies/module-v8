import { QorusRequest, TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { HUBSPOT_APP_NAME, HubspotError } from '../../constants';
import { getHubspotCustomObjectNameToIdMap } from './constants';
import { Debugger } from '../../../../utils/Debugger';

type THubspotBatchCreateRecordResponse = {
  data: {
    results: Array<{ id: string; createdAt: string; properties: Record<string, any> }>;
  };
};

export const createHubspotRecords: TQoreCreateRecordsFunction = async (context, records, opts) => {
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
    const objectId = tableNameToObjectIdMap[tableName];

    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);
    const data = {
      inputs: recordsArray.map((row) => ({
        properties: row,
      })),
    };

    const batchSize = 100;

    const results: THubspotBatchCreateRecordResponse['data']['results'] = [];

    for (let i = 0; i < data.inputs.length; i += batchSize) {
      try {
        const response = await QorusRequest.post<THubspotBatchCreateRecordResponse>(
          {
            data: { inputs: data.inputs.slice(i, i + batchSize) },
            path: `/crm/v3/objects/${objectId || tableName}/batch/create`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          {
            endpointId: HUBSPOT_APP_NAME,
            url: 'https://api.hubapi.com',
          }
        );

        const batchResults = response?.data?.results;

        if (batchResults && batchResults.length > 0) {
          results.push(...batchResults);
        }
      } catch (batchError) {
        Debugger.log(`Error creating batch: ${batchError.message || batchError}`);
      }
    }

    if (!results?.length) {
      throw new HubspotError(`No record was created in table ${tableName}`);
    }

    const createdRowsProperties = results.map((row) => ({
      id: row.id,
      ...row.properties,
    }));

    return mapObjectToColumnFormat(createdRowsProperties);
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }
    throw new HubspotError(
      `Failed to create records in table ${tableName}: ${error.message || error}`
    );
  }
};
