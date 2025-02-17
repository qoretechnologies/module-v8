import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { SALESFORCE_API_VERSION } from '../constants';

export type TFetchSalesforceObjectRecord = {
  instanceUrl: string;
  token: string;
  query: string;
};

export const fetchSalesforceObjectRecords = async (options: TFetchSalesforceObjectRecord) => {
  const { instanceUrl, token, query } = options;

  const response = await QorusRequest.get<{ data: { records: unknown[] } }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/data/${SALESFORCE_API_VERSION}/query`,
      params: {
        q: query,
      },
    },
    { url: instanceUrl, endpointId: 'Salesforce' }
  );

  const responseData = response?.data;

  if (!responseData) return null;

  return responseData.records;
};
