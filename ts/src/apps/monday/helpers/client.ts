import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';

export type TMondayApiDynamicOptions = { [key: string]: any };

type TCallMondayApiOptions = {
  query: string;
  variables?: TMondayApiDynamicOptions;
  token: string;
};

export const callMondayAPI = async <ResponseType = unknown>(
  options: TCallMondayApiOptions
): Promise<ResponseType> => {
  const { query, token } = options;

  const response = await QorusRequest.post<{ data: ResponseType }>(
    {
      path: '/v2',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        query,
        ...(options.variables && { variables: options.variables }),
      },
    },
    {
      url: 'https://api.monday.com',
      endpointId: MONDAY_APP_NAME,
    }
  );

  const responseData = response?.data;

  if (!responseData) {
    throw new Error(`No data returned from monday.com API for the given query: ${query}`);
  }

  return responseData;
};
