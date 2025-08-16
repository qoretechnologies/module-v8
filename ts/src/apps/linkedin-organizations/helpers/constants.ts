import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { Debugger } from '../../../utils/Debugger';
import {
  LINKED_IN_ORGANIZATIONS_API_VERSION,
  LINKED_IN_ORGANIZATIONS_APP_NAME,
} from '../constants';

export const LINKED_IN_ALLOWED_VALUES_TIMEOUT = 60_000;
export const LINKED_IN_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type THuggingFaceRequestOptions = {
  token: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

const endpointData = {
  url: 'https://api.linkedin.com',
  endpointId: LINKED_IN_ORGANIZATIONS_APP_NAME,
};
export const linkedInOrganizationsApiClient = async <ResponseType = unknown>(
  options: THuggingFaceRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const formattedPath = path.startsWith('/') ? `/rest${path}` : `/rest/${path}`;

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        'LinkedIn-Version': LINKED_IN_ORGANIZATIONS_API_VERSION,
        ...(options.headers && { ...options.headers }),
        Authorization: `Bearer ${token}`,
      },
      path: formattedPath,
      ...(params && { params }),
      ...(body && { data: body }),
    };

    switch (method) {
      case 'GET':
        response = await QorusRequest.get<QorusResponse<ResponseType>>(requestConfig, endpointData);
        break;
      case 'POST':
        response = await QorusRequest.post<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
      case 'PUT':
        response = await QorusRequest.put<QorusResponse<ResponseType>>(requestConfig, endpointData);
        break;
      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from LinkedIn Organizations API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling LinkedIn Organizations API for ${path}`, error);
    throw error;
  }
};
