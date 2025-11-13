import {
  TQoreDeleteRecordsFunction,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { ZohoCrmError } from '../../constants';
import { zohoCrmApiClient } from '../constants';
import { extractZohoCrmErrorMessage } from '../extract-error';
import { applyZohoCrmWhereCondition } from './apply-where-condition';

type TZohoCrmSearchResponse = {
  data: Array<Record<string, any>>;
  info: {
    count: number;
    more_records: boolean;
  };
};

type TDeleteRecordResponse = {
  data: Array<{
    code: string;
    details: {
      id: string;
    };
    message: string;
    status: string;
  }>;
};

const isSuccess = (status: string): boolean => status.toLowerCase() === 'success';

export const deleteZohoCrmRecords: TQoreDeleteRecordsFunction = async (
  context,
  whereConditions,
  deleteOptions
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZohoCrmError,
  });

  const tableName = deleteOptions?.table;

  if (!tableName) {
    throw new ZohoCrmError('Table name is required');
  }

  try {
    const recordIds = await getRecordIdsToDelete(token, url, tableName, whereConditions);

    if (recordIds.length === 0) {
      return 0;
    }

    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batchIds = recordIds.slice(i, i + batchSize);
      const idsParam = batchIds.join(',');

      try {
        const response = await zohoCrmApiClient<TDeleteRecordResponse>({
          path: `${tableName}?ids=${idsParam}`,
          method: 'DELETE',
          token,
          url,
        });

        const successfulDeletes = response?.data?.filter((recordData) => {
          if (!isSuccess(recordData.status)) {
            Debugger.log(
              `Failed to delete record ${recordData.details?.id || 'unknown'} in module ${tableName}: ${recordData.message} (code: ${recordData.code})`
            );
            return false;
          }
          return true;
        });

        deletedCount += successfulDeletes?.length || 0;
      } catch (batchError) {
        throw new ZohoCrmError(
          `Failed to delete records in module ${tableName}: ${extractZohoCrmErrorMessage(batchError)}`
        );
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }

    throw new ZohoCrmError(
      `Failed to delete records in table ${tableName}: ${extractZohoCrmErrorMessage(error)}`
    );
  }
};

const getRecordIdsToDelete = async (
  token: string,
  url: string,
  tableName: string,
  whereConditions?: TQoreSearchRecordsWhereConditions
): Promise<string[]> => {
  const recordIds: string[] = [];
  let currentOffset = 0;
  let hasMoreRecords = true;
  const limit = 200;

  while (hasMoreRecords) {
    let coqlQuery = `select id from ${tableName}`;

    const whereClause = applyZohoCrmWhereCondition(whereConditions);
    if (whereClause) {
      coqlQuery += ` where ${whereClause}`;
    }

    coqlQuery += ` limit ${limit}`;
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
      break;
    }

    recordIds.push(...records.map((record) => record.id));
    currentOffset += recordCount;
  }

  return recordIds;
};
