import { zendeskApiClient } from '../constants';
import {
  applyZendeskWhereCondition,
  applyZendeskCustomObjectWhereCondition,
} from './apply-where-condition';
import { isCustomZendeskObject } from './constants';
import { TZendeskTable } from './get-table-list';
import {
  TGetRecordIdsOptions,
  TZendeskCustomObjectSearchResponse,
  TZendeskListResponse,
  TZendeskSearchResponse,
  ZENDESK_PAGE_SIZE,
} from './types';

export const getTypeFilter = (tableName: TZendeskTable): string => {
  const typeFilterMap: Record<string, string> = {
    tickets: 'type:ticket',
    users: 'type:user',
    organizations: 'type:organization',
  };

  return typeFilterMap[tableName] || '';
};

export const getRecordsFromResponse = (
  response: TZendeskListResponse | undefined,
  tableName: TZendeskTable
): Array<Record<string, any>> => {
  if (!response) return [];

  const recordsMap: Record<string, Array<Record<string, any>> | undefined> = {
    tickets: response.tickets,
    users: response.users,
    organizations: response.organizations,
  };

  return recordsMap[tableName] || [];
};

export const getSingularTableName = (tableName: TZendeskTable): string => {
  const singularMap: Record<string, string> = {
    tickets: 'ticket',
    users: 'user',
    organizations: 'organization',
  };

  return singularMap[tableName] || tableName;
};

export const getRecordIds = async (options: TGetRecordIdsOptions): Promise<string[]> => {
  const { token, url, tableName, whereConditions } = options;
  const recordIds: string[] = [];
  const isCustomObject = isCustomZendeskObject(tableName);

  if (isCustomObject) {
    await fetchCustomObjectRecordIds({
      token,
      url,
      tableName,
      whereConditions,
      recordIds,
    });
  } else {
    await fetchStandardTableRecordIds({
      token,
      url,
      tableName,
      whereConditions,
      recordIds,
    });
  }

  return recordIds;
};

const fetchCustomObjectRecordIds = async (options: {
  token: string;
  url: string;
  tableName: TZendeskTable;
  whereConditions?: TGetRecordIdsOptions['whereConditions'];
  recordIds: string[];
}): Promise<void> => {
  const { token, url, tableName, whereConditions, recordIds } = options;

  let hasMoreRecords = true;
  let afterCursor: string | undefined = undefined;
  const customObjectFilter = applyZendeskCustomObjectWhereCondition(whereConditions, tableName);

  while (hasMoreRecords) {
    const params: Record<string, string> = {
      'page[size]': String(ZENDESK_PAGE_SIZE),
    };

    if (afterCursor) {
      params['page[after]'] = afterCursor;
    }

    const response = await zendeskApiClient<TZendeskCustomObjectSearchResponse>({
      path: `custom_objects/${tableName}/records/search`,
      method: 'POST',
      token,
      url,
      params,
      body: customObjectFilter ? { filter: customObjectFilter } : {},
    });

    const records = response?.custom_object_records || [];

    if (records.length === 0) {
      hasMoreRecords = false;
      break;
    }

    recordIds.push(...records.map((record) => record.id));
    hasMoreRecords = response?.meta?.has_more || false;
    afterCursor = response?.meta?.after_cursor;
  }
};

const fetchStandardTableRecordIds = async (options: {
  token: string;
  url: string;
  tableName: TZendeskTable;
  whereConditions?: TGetRecordIdsOptions['whereConditions'];
  recordIds: string[];
}): Promise<void> => {
  const { token, url, tableName, whereConditions, recordIds } = options;

  let currentPage = 1;
  let hasMoreRecords = true;
  const whereClause = applyZendeskWhereCondition(whereConditions, tableName);

  while (hasMoreRecords) {
    let records: Array<Record<string, any>> = [];

    if (whereClause) {
      const typeFilter = getTypeFilter(tableName);
      const searchQuery = `${typeFilter} ${whereClause}`;

      const response = await zendeskApiClient<TZendeskSearchResponse>({
        path: 'search.json',
        method: 'GET',
        token,
        url,
        params: {
          query: searchQuery,
          per_page: String(ZENDESK_PAGE_SIZE),
          page: String(currentPage),
        },
      });

      records = response?.results || [];
      hasMoreRecords = response?.next_page !== null;
    } else {
      const response = await zendeskApiClient<TZendeskListResponse>({
        path: `${tableName}.json`,
        method: 'GET',
        token,
        url,
        params: {
          per_page: String(ZENDESK_PAGE_SIZE),
          page: String(currentPage),
        },
      });

      records = getRecordsFromResponse(response, tableName);
      hasMoreRecords = response?.next_page !== null;
    }

    if (records.length === 0) {
      hasMoreRecords = false;
      break;
    }

    recordIds.push(...records.map((record) => String(record.id)));
    currentPage++;
  }
};
