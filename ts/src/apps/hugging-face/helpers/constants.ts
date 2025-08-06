import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { Debugger } from '../../../utils/Debugger';
import { HUGGING_FACE_APP_NAME } from '../constants';

export const HUGGING_FACE_ALLOWED_VALUES_TIMEOUT = 60_000;
export const HUGGING_FACE_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type THuggingFaceRequestOptions = {
  token: string;
  object?: string;
  url?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
};

export const huggingFaceApiClient = async <ResponseType = unknown>(
  options: THuggingFaceRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params, url } = options;

  const endpointData = {
    url: url || 'https://api-inference.huggingface.co',
    endpointId: HUGGING_FACE_APP_NAME,
  };
  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path,
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
      throw new Error(`No data received from Hugging Face API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Hugging Face API for ${path}`, error);
    throw error;
  }
};
