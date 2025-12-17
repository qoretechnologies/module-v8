import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { ZendeskError } from '../../constants';
import { zendeskApiClient } from '../constants';
import {
  applyZendeskWhereCondition,
  applyZendeskCustomObjectWhereCondition,
  TZendeskCustomObjectFilter,
} from './apply-where-condition';
import { TZendeskTable } from './get-table-list';
import { formatZendeskRecordsResponse, isCustomZendeskObject } from './constants';
import { getTypeFilter, getRecordsFromResponse } from './shared-utils';
import {
  TZendeskSearchResponse,
  TZendeskListResponse,
  TZendeskCustomObjectSearchResponse,
  ZENDESK_PAGE_SIZE,
} from './types';

export const searchZendeskRecords: TQoreSearchRecordsFunction = async (
  context,
  whereConditions,
  searchOptions
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZendeskError,
  });

  const tableName = searchOptions?.table as TZendeskTable;
  if (!tableName) {
    throw new ZendeskError('Table name is required for search');
  }

  const isCustomObject = isCustomZendeskObject(tableName);
  const orderBy = searchOptions?.orderBy as { column: string; ascending?: boolean } | undefined;
  const limit = searchOptions?.limit as number | undefined;

  let currentPage = 1;
  let hasMoreRecords = true;
  let totalRecordsReturned = 0;
  let afterCursor: string | undefined = undefined;

  const whereClause = isCustomObject ? '' : applyZendeskWhereCondition(whereConditions, tableName);
  const customObjectFilter = isCustomObject
    ? applyZendeskCustomObjectWhereCondition(whereConditions, tableName)
    : undefined;

  const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (!hasMoreRecords) {
      return {};
    }

    if (limit && totalRecordsReturned >= limit) {
      hasMoreRecords = false;
      return {};
    }

    try {
      let records: Array<Record<string, any>> = [];
      const pageSize = Math.min(blockSize || ZENDESK_PAGE_SIZE, ZENDESK_PAGE_SIZE);

      if (isCustomObject) {
        const result = await searchCustomObjectRecords({
          token,
          url,
          tableName,
          filter: customObjectFilter,
          pageSize,
          afterCursor,
          orderBy,
        });

        records = result.records;
        hasMoreRecords = result.hasMore;
        afterCursor = result.afterCursor;
      } else if (whereClause) {
        const searchQuery = buildSearchQuery(tableName, whereClause);

        const response = await zendeskApiClient<TZendeskSearchResponse>({
          path: 'search.json',
          method: 'GET',
          token,
          url,
          params: {
            query: searchQuery,
            per_page: String(pageSize),
            page: String(currentPage),
            ...(orderBy?.column && { sort_by: mapSortField(orderBy.column) }),
            ...(orderBy && { sort_order: orderBy.ascending === false ? 'desc' : 'asc' }),
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
            per_page: String(pageSize),
            page: String(currentPage),
            ...(orderBy?.column && { sort_by: orderBy.column }),
            ...(orderBy && { sort_order: orderBy.ascending === false ? 'desc' : 'asc' }),
          },
        });

        records = getRecordsFromResponse(response, tableName);
        hasMoreRecords = response?.next_page !== null;
      }

      if (records.length === 0) {
        hasMoreRecords = false;
        return {};
      }

      currentPage++;
      totalRecordsReturned += records.length;

      if (limit && totalRecordsReturned > limit) {
        const excess = totalRecordsReturned - limit;
        records = records.slice(0, records.length - excess);
        hasMoreRecords = false;
      }

      const formattedResults = await formatZendeskRecordsResponse({
        records,
        tableName,
        token,
        url,
      });

      return mapObjectToColumnFormat(formattedResults);
    } catch (error) {
      if (error instanceof ZendeskError) {
        throw error;
      }
      throw new ZendeskError(`Failed to search records in table ${tableName}: ${error}`);
    }
  };

  return get_records;
};

const buildSearchQuery = (
  tableName: TZendeskTable,
  whereClause: string
): string => {
  const typeFilter = getTypeFilter(tableName);

  if (whereClause) {
    return `${typeFilter} ${whereClause}`;
  }

  return typeFilter;
};

const mapSortField = (field: string): string => {
  const sortFieldMap: Record<string, string> = {
    created_at: 'created_at',
    updated_at: 'updated_at',
    status: 'status',
    priority: 'priority',
    type: 'ticket_type',
  };

  return sortFieldMap[field] || field;
};

const searchCustomObjectRecords = async (options: {
  token: string;
  url: string;
  tableName: TZendeskTable;
  filter?: TZendeskCustomObjectFilter;
  pageSize: number;
  afterCursor?: string;
  orderBy?: { column: string; ascending?: boolean };
}): Promise<{
  records: Array<Record<string, any>>;
  hasMore: boolean;
  afterCursor?: string;
}> => {
  const { token, url, tableName, filter, pageSize, afterCursor, orderBy } = options;

  const sort = orderBy?.column
    ? orderBy.ascending === false
      ? `-${orderBy.column}`
      : orderBy.column
    : undefined;

  const params: Record<string, string> = {
    'page[size]': String(pageSize),
  };

  if (afterCursor) {
    params['page[after]'] = afterCursor;
  }

  if (sort) {
    params['sort'] = sort;
  }

  const response = await zendeskApiClient<TZendeskCustomObjectSearchResponse>({
    path: `custom_objects/${tableName}/records/search`,
    method: 'POST',
    token,
    url,
    params,
    body: filter ? { filter } : {},
  });

  return {
    records: response?.custom_object_records || [],
    hasMore: response?.meta?.has_more || false,
    afterCursor: response?.meta?.after_cursor,
  };
};
