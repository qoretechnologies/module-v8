import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { AirtableError } from '../../constants';
import { buildAirtableFilterFormula } from './apply-where-condition';
import { airtableApiClient, AIRTABLE_MAX_PAGE_SIZE, parseTableIdentifier } from './constants';

type TAirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
};

type TAirtableListRecordsResponse = {
  records: TAirtableRecord[];
  offset?: string;
};

export const searchAirtableRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: AirtableError,
  });

  const tableName = opts?.table;
  const limit = (opts?.limit as number) || AIRTABLE_MAX_PAGE_SIZE;

  if (!tableName) {
    throw new AirtableError('Table name is required in opts.table');
  }

  try {
    const { baseId: resolvedBaseId, tableId } = await parseTableIdentifier({
      token,
      tableName,
    });

    let filterByFormula: string | undefined;
    if (where) {
      filterByFormula = buildAirtableFilterFormula(where);
    }

    const orderBy = opts.orderBy as { column: string; ascending?: boolean } | undefined;
    let sortParam: Array<{ field: string; direction: 'asc' | 'desc' }> | undefined;
    if (orderBy) {
      sortParam = [
        {
          field: orderBy.column,
          direction: orderBy.ascending !== false ? 'asc' : 'desc',
        },
      ];
    }

    let offset: string | undefined;
    let hasMore = true;
    let totalFetched = 0;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore || totalFetched >= limit) {
        return null;
      }

      try {
        const pageSize = Math.min(blockSize, AIRTABLE_MAX_PAGE_SIZE, limit - totalFetched);

        const params: Record<string, string> = {
          pageSize: String(pageSize),
        };

        if (filterByFormula) {
          params.filterByFormula = filterByFormula;
        }

        if (offset) {
          params.offset = offset;
        }

        if (sortParam) {
          params['sort[0][field]'] = sortParam[0].field;
          params['sort[0][direction]'] = sortParam[0].direction;
        }

        const response = await airtableApiClient<TAirtableListRecordsResponse>({
          token,
          path: `/v0/${resolvedBaseId}/${tableId}`,
          params,
        });

        if (!response.records || response.records.length === 0) {
          hasMore = false;
          return null;
        }

        const flattenedRecords = response.records.map((record) => ({
          id: record.id,
          createdTime: record.createdTime,
          ...record.fields,
        }));

        offset = response.offset;
        hasMore = !!response.offset;
        totalFetched += flattenedRecords.length;

        if (flattenedRecords.length < blockSize) {
          hasMore = false;
        }

        return mapObjectToColumnFormat(flattenedRecords);
      } catch (error) {
        if (error instanceof AirtableError) {
          throw error;
        }
        throw new AirtableError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }
    throw new AirtableError(`Failed to initialize search for table ${tableName}: ${error}`);
  }
};
