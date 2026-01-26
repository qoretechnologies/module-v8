import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { ZohoCrmError } from '../../constants';
import { zohoCrmApiClient } from '../constants';
import { extractZohoCrmErrorMessage } from '../extract-error';
import { applyZohoCrmWhereCondition } from './apply-where-condition';
import { getZohoCrmModuleFieldApiNames } from '../get-module-fields';

type TZohoCrmSearchResponse = {
  data: Array<Record<string, any>>;
  info: {
    count: number;
    more_records: boolean;
  };
};

export const searchZohoCrmRecords: TQoreSearchRecordsFunction = async (
  context,
  whereConditions,
  searchOptions
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZohoCrmError,
  });

  const tableName = searchOptions?.table;
  if (!tableName) {
    throw new ZohoCrmError('Table name is required for search');
  }

  const orderBy = searchOptions?.orderBy as { column: string; ascending?: boolean };

  let currentOffset = 0;
  let hasMoreRecords = true;
  const limit = Math.min(searchOptions?.limit || 200, 200);

  const tableFields = await getZohoCrmModuleFieldApiNames({
    token,
    url,
    moduleApiName: tableName,
  });

  const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (!hasMoreRecords) {
      return {};
    }

    try {
      let coqlQuery = `select ${tableFields.join(', ')} from ${tableName}`;

      const whereClause = applyZohoCrmWhereCondition(whereConditions);
      if (whereClause) {
        coqlQuery += ` where ${whereClause}`;
      }

      if (orderBy?.column) {
        const orderDirection = orderBy.ascending === false ? 'desc' : 'asc';
        coqlQuery += ` order by ${orderBy.column} ${orderDirection}`;
      }

      coqlQuery += ` limit ${Math.min(blockSize, limit)}`;
      if (currentOffset > 0) {
        coqlQuery += ` offset ${currentOffset}`;
      }

      const response = await zohoCrmApiClient<TZohoCrmSearchResponse>({
        path: 'coql',
        method: 'POST',
        token,
        url,
        body: {
          select_query: coqlQuery,
        },
      });

      const records = response?.data || [];
      const recordCount = response?.info?.count || 0;
      hasMoreRecords = response?.info?.more_records || false;

      if (recordCount === 0) {
        hasMoreRecords = false;
        return {};
      }

      currentOffset += recordCount;

      return mapObjectToColumnFormat(records);
    } catch (error) {
      if (error instanceof ZohoCrmError) {
        throw error;
      }
      throw new ZohoCrmError(
        `Failed to search records in table ${tableName}: ${extractZohoCrmErrorMessage(error)}`
      );
    }
  };

  return get_records;
};
