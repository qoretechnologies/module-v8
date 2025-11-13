import {
  TQoreSearchRecordsWhereConditions,
  TQoreUpdateRecordsFunction,
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

type TUpdateRecordResponse = {
  data: Array<{
    code: string;
    details: {
      id: string;
      Modified_Time?: string;
      Created_Time?: string;
    };
    message: string;
    status: string;
  }>;
};

const isSuccess = (status: string): boolean => status.toLowerCase() === 'success';

export const updateZohoCrmRecords: TQoreUpdateRecordsFunction = async (
  context,
  setFields,
  whereConditions,
  updateOptions
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZohoCrmError,
  });

  const tableName = updateOptions?.table;

  if (!tableName) {
    throw new ZohoCrmError('Table name is required');
  }

  if (!setFields || Object.keys(setFields).length === 0) {
    throw new ZohoCrmError('No fields to update');
  }

  try {
    const recordIds = await getRecordIdsToUpdate(token, url, tableName, whereConditions);

    if (recordIds.length === 0) {
      return 0;
    }

    const batchSize = 100;
    let updatedCount = 0;

    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batchIds = recordIds.slice(i, i + batchSize);
      const recordsToUpdate = batchIds.map((id) => ({
        id,
        ...setFields,
      }));

      try {
        const response = await zohoCrmApiClient<TUpdateRecordResponse>({
          path: tableName,
          method: 'PUT',
          token,
          url,
          body: { data: recordsToUpdate },
        });

        const successfulUpdates = response?.data?.filter((recordData) => {
          if (!isSuccess(recordData.status)) {
            Debugger.log(
              `Failed to update record ${recordData.details?.id || 'unknown'} in module ${tableName}: ${recordData.message} (code: ${recordData.code})`
            );
            return false;
          }
          return true;
        });

        updatedCount += successfulUpdates?.length || 0;
      } catch (batchError) {
        throw new ZohoCrmError(
          `Failed to update records in module ${tableName}: ${extractZohoCrmErrorMessage(batchError)}`
        );
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }

    throw new ZohoCrmError(
      `Failed to update records in table ${tableName}: ${extractZohoCrmErrorMessage(error)}`
    );
  }
};

const getRecordIdsToUpdate = async (
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
