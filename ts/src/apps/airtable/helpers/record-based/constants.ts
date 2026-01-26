import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { AIRTABLE_APP_NAME, AirtableError } from '../../constants';

export const AIRTABLE_API_URL = 'https://api.airtable.com';
export const AIRTABLE_ALLOWED_VALUES_TIMEOUT = 60_000;
export const AIRTABLE_ALLOWED_VALUES_FETCH_DELAY = 300;
export const AIRTABLE_MAX_PAGE_SIZE = 100;

type QorusResponse<T> = {
  data: T;
};

type TAirtableRequestOptions = {
  token: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, string | string[]>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> =
  | ({
      [key: string]: ItemType[] | any;
    } & {
      offset?: string;
    })
  | ItemType[]
  | any[];

type TAirtablePaginatedOptions = TAirtableRequestOptions & {
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TAirtableAllowedValuesOptions<ItemType = unknown> = TAirtablePaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

export const airtableApiClient = async <ResponseType = unknown>(
  options: TAirtableRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const formattedPath = path.startsWith('/') ? path : `/${path}`;

  const endpointData = {
    url: AIRTABLE_API_URL,
    endpointId: AIRTABLE_APP_NAME,
  };

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
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
      case 'PATCH':
        response = await QorusRequest.patch<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new AirtableError(`No data received from Airtable API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Airtable API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchAirtablePaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TAirtablePaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'records',
    method = 'GET',
    body,
    path,
    maxResults = 500,
    fetchDelay = AIRTABLE_ALLOWED_VALUES_FETCH_DELAY,
    timeout = AIRTABLE_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let offset: string | undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Airtable records for ${options.path}`);
        break;
      }

      const response = await airtableApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          ...(offset && { offset }),
          ...options.params,
        },
        body,
      });

      if (Array.isArray(response)) {
        if (!response.length) break;
        items.push(...response);
        break;
      } else {
        const objectData = get(response, object) as ItemType[] | undefined;
        if (!objectData?.length) break;
        items.push(...objectData);
        offset = response.offset;
        if (items.length < maxResults && offset) {
          await delay(fetchDelay);
        }
      }
    } while (items.length < maxResults && offset);
  } catch (error) {
    Debugger.log(`Error fetching paginated Airtable records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchAirtableAllowedValues = async <ItemType = unknown>(
  options: TAirtableAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchAirtablePaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(
    options
  );

  return items.map(options.mapItemToAllowedValue);
};

type TBase = {
  id: string;
  name: string;
  permissionLevel: string;
};

type TTable = {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    options?: Record<string, any>;
  }>;
};

export const getAirtableBasesMap = async (options: {
  token: string;
}): Promise<Record<string, TBase>> => {
  try {
    const { token } = options;

    const bases = await fetchAirtablePaginatedRecords<{ bases: TBase[]; offset?: string }, TBase>({
      token,
      path: '/v0/meta/bases',
      object: 'bases',
    });

    const map: Record<string, TBase> = {};
    bases.forEach((base) => {
      if (base.name && base.id) {
        map[base.name] = base;
      }
    });

    return map;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }

    throw new AirtableError(`Failed to get bases map: ${error}`);
  }
};

export const getAirtableBaseIdByName = async (options: {
  token: string;
  baseName: string;
}): Promise<string> => {
  try {
    const { token, baseName } = options;

    const basesMap = await getAirtableBasesMap({ token });

    const base = basesMap[baseName];
    if (!base) {
      throw new AirtableError(`Base with name "${baseName}" not found.`);
    }

    return base.id;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }

    throw new AirtableError(`Failed to get base ID by name: ${error}`);
  }
};

export const getAirtableTablesMap = async (options: {
  token: string;
  baseId: string;
}): Promise<Record<string, TTable>> => {
  try {
    const { token, baseId } = options;

    const response = await airtableApiClient<{ tables: TTable[] }>({
      token,
      path: `/v0/meta/bases/${baseId}/tables`,
    });

    const map: Record<string, TTable> = {};
    response.tables.forEach((table) => {
      if (table.name && table.id) {
        map[table.name] = table;
      }
    });

    return map;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }

    throw new AirtableError(`Failed to get tables map: ${error}`);
  }
};

export const getAirtableTableIdByName = async (options: {
  token: string;
  baseId: string;
  tableName: string;
}): Promise<string> => {
  try {
    const { token, baseId, tableName } = options;

    const tablesMap = await getAirtableTablesMap({ token, baseId });

    const table = tablesMap[tableName];
    if (!table) {
      throw new AirtableError(`Table with name "${tableName}" not found in base.`);
    }

    return table.id;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }

    throw new AirtableError(`Failed to get table ID by name: ${error}`);
  }
};

export const getAirtableTableByName = async (options: {
  token: string;
  baseId: string;
  tableName: string;
}): Promise<TTable> => {
  try {
    const { token, baseId, tableName } = options;

    const tablesMap = await getAirtableTablesMap({ token, baseId });

    const table = tablesMap[tableName];
    if (!table) {
      throw new AirtableError(`Table with name "${tableName}" not found in base.`);
    }

    return table;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }

    throw new AirtableError(`Failed to get table by name: ${error}`);
  }
};

export const parseTableIdentifier = async (options: {
  token: string;
  tableName: string;
  baseId?: string;
}): Promise<{ baseId: string; tableId: string }> => {
  const { token, tableName, baseId } = options;

  if (baseId) {
    const tableId = await getAirtableTableIdByName({ token, baseId, tableName });
    return { baseId, tableId };
  }

  if (tableName.includes('/')) {
    const [baseName, actualTableName] = tableName.split('/');
    const resolvedBaseId = await getAirtableBaseIdByName({ token, baseName });
    const tableId = await getAirtableTableIdByName({
      token,
      baseId: resolvedBaseId,
      tableName: actualTableName,
    });
    return { baseId: resolvedBaseId, tableId };
  }

  throw new AirtableError(
    'Base ID is required. Either provide baseId option or use format "baseName/tableName" for table name.'
  );
};

export const resolveTableWithMetadata = async (options: {
  token: string;
  tableName: string;
  baseId?: string;
}): Promise<{ baseId: string; table: TTable }> => {
  const { token, tableName, baseId } = options;

  if (baseId) {
    const table = await getAirtableTableByName({
      token,
      baseId,
      tableName,
    });
    return { baseId, table };
  }

  if (tableName.includes('/')) {
    const [baseName, actualTableName] = tableName.split('/');
    const resolvedBaseId = await getAirtableBaseIdByName({ token, baseName });
    const table = await getAirtableTableByName({
      token,
      baseId: resolvedBaseId,
      tableName: actualTableName,
    });
    return { baseId: resolvedBaseId, table };
  }

  throw new AirtableError(
    'Base ID is required. Either provide baseId option or use format "baseName/tableName" for table name.'
  );
};
