import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { FIRESTORE_APP_NAME } from '../constants';
import axios from 'axios';

export const FIRESTORE_ALLOWED_VALUES_TIMEOUT = 60_000;
export const FIRESTORE_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TFirestoreRequestOptions = {
  token: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

export type TFirestoreDocument = {
  name: string;
  fields: Record<string, any>;
  createTime: string;
  updateTime: string;
};

type TFirestoreListResponse = {
  documents?: TFirestoreDocument[];
  nextPageToken?: string;
};

type TFirestorePaginatedOptions = TFirestoreRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TFirestoreAllowedValuesOptions<ItemType = unknown> = TFirestorePaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const formatPath = (path: string): string => {
  let clean = path.replace(/^\/+|\/+$/g, '');

  if (!clean.startsWith('v1/')) {
    clean = `v1/${clean}`;
  }

  return `/${clean}`;
};

const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com';

export const firestoreApiClient = async <ResponseType = unknown>(
  options: TFirestoreRequestOptions
): Promise<ResponseType> => {
  const { token, path, method = 'GET', body, params } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: FIRESTORE_BASE_URL,
    endpointId: FIRESTORE_APP_NAME,
  };

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers && { ...options.headers }),
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

      case 'PATCH': {
        const responseData = await axios.patch<QorusResponse<ResponseType>>(
          `${endpointData.url}${requestConfig.path}`,
          requestConfig.data,
          {
            headers: requestConfig.headers,
            params: requestConfig.params,
          }
        );

        response = { data: responseData.data as ResponseType };

        break;
      }
      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from Firestore API for ${path}`);
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Firestore API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchFirestorePaginatedDocuments = async <ItemType = TFirestoreDocument>(
  options: TFirestorePaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    path,
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = FIRESTORE_ALLOWED_VALUES_FETCH_DELAY,
    timeout = FIRESTORE_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  let nextPageToken: string | undefined = undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Firestore documents for ${path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response: TFirestoreListResponse = await firestoreApiClient<TFirestoreListResponse>({
        token,
        path,
        method,
        params: {
          ...options.params,
          pageSize: String(Math.min(300, maxResults - items.length)),
          ...(nextPageToken && { pageToken: nextPageToken }),
        },
        body,
      });

      const documents = response.documents || [];

      if (!documents.length) {
        break;
      }

      items.push(...(documents as unknown as ItemType[]));

      nextPageToken = response.nextPageToken;

      if (nextPageToken) {
        await delay(fetchDelay);
      }
    } while (nextPageToken && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Firestore documents`, error);
    return items;
  }

  return items;
};

export const fetchFirestoreAllowedValues = async <ItemType = unknown>(
  options: TFirestoreAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchFirestorePaginatedDocuments<ItemType>(options);
  return items.map(options.mapItemToAllowedValue);
};

export const firestoreValueToJs = (value: any): any => {
  if (!value) return null;

  if (value.nullValue !== undefined) return null;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.bytesValue !== undefined) return value.bytesValue;
  if (value.referenceValue !== undefined) return value.referenceValue;
  if (value.geoPointValue !== undefined) return value.geoPointValue;

  if (value.arrayValue?.values) {
    return value.arrayValue.values.map((v: any) => firestoreValueToJs(v));
  }

  if (value.mapValue?.fields) {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value.mapValue.fields)) {
      result[key] = firestoreValueToJs(val);
    }
    return result;
  }

  return value;
};

export const firestoreDocumentToJs = (doc: TFirestoreDocument): Record<string, any> => {
  const result: Record<string, any> = {};

  if (doc.fields) {
    for (const [key, value] of Object.entries(doc.fields)) {
      result[key] = firestoreValueToJs(value);
    }
  }

  return result;
};

export const jsValueToFirestore = (value: any): any => {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }
    return { doubleValue: value };
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return { timestampValue: value };
    }
    return { stringValue: value };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((v) => jsValueToFirestore(v)),
      },
    };
  }

  if (typeof value === 'object') {
    const fields: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      fields[key] = jsValueToFirestore(val);
    }
    return { mapValue: { fields } };
  }

  return { stringValue: String(value) };
};

export const jsObjectToFirestoreFields = (obj: Record<string, any>): Record<string, any> => {
  const fields: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    fields[key] = jsValueToFirestore(value);
  }

  return fields;
};

export const extractDocumentId = (documentName: string): string => {
  const parts = documentName.split('/');
  return parts[parts.length - 1];
};

export const extractCollectionPath = (documentName: string): string => {
  const parts = documentName.split('/documents/');
  if (parts.length < 2) return '';

  const pathParts = parts[1].split('/');
  return pathParts.slice(0, -1).join('/');
};

export const buildDocumentPath = (
  projectId: string,
  collectionPath: string,
  documentId?: string
): string => {
  const basePath = `projects/${projectId}/databases/(default)/documents/${collectionPath}`;
  return documentId ? `${basePath}/${documentId}` : basePath;
};
