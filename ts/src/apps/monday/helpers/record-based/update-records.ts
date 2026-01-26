import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { MondayError } from '../../constants';
import { callMondayAPI, formatMondayRecords } from '../constants';
import { fetchMondayRecordIds, getMondayBoardIdByName } from './constants';
import { MondaySearchOptions } from './options';

type TRecordResponse = {
  id: string;
  name?: string;
};

type TBatchUpdateResponse = {
  data: {
    [key: string]: TRecordResponse | null;
  };
  errors:
    | {
        message: string;
        path: string[];
        extensions: {
          error_data: { column_id: string; column_name: string };
        };
      }[]
    | null;
};

export const updateMondayRecords: TQoreUpdateRecordsFunction<typeof MondaySearchOptions> = async (
  context,
  fields,
  where,
  opts
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: MondayError,
  });

  const tableName = opts?.table;
  const groupId = opts?.group_id;

  if (!tableName) {
    throw new MondayError('Table name is required');
  }

  try {
    const boardId = await getMondayBoardIdByName(token, tableName);

    if (!boardId) {
      throw new MondayError(`Board with name "${tableName}" not found`);
    }

    const recordIdsToUpdate = await fetchMondayRecordIds({ token, boardId, where, groupId });

    if (recordIdsToUpdate.length === 0) {
      return 0;
    }

    const formattedFields = await formatMondayRecords({
      records: [fields],
      token,
      boardId,
    });

    const columnValues = JSON.stringify(formattedFields[0]);

    const records = await batchUpdateMondayItems(token, boardId, recordIdsToUpdate, columnValues);

    return records.length;
  } catch (error) {
    if (error instanceof MondayError) {
      throw error;
    }
    throw new MondayError(
      `Failed to update records in table ${tableName}: ${error.message || error}`
    );
  }
};

export const batchUpdateMondayItems = async (
  token: string,
  boardId: string,
  itemIds: string[],
  columnValues: string
): Promise<Array<TRecordResponse>> => {
  const batchSize = 100;
  const errorMessages: string[] = [];
  const batchResults: Array<TRecordResponse> = [];

  for (let i = 0; i < itemIds.length; i += batchSize) {
    const batch = itemIds.slice(i, i + batchSize);

    const mutations = batch
      .map(
        (itemId, index) => `
      mutation_${index}: change_multiple_column_values(
        board_id: ${boardId},
        item_id: ${itemId},
        column_values: ${JSON.stringify(columnValues)}
      ) {
        id
        name
      }
    `
      )
      .join('\n');

    const query = `
      mutation {
        ${mutations}
      }
    `;

    const response = await callMondayAPI<TBatchUpdateResponse>({ token, query });
    if (response.errors && response.errors.length > 0) {
      response.errors.forEach((err) => {
        const columnValue =
          err?.path[0] && err?.extensions?.error_data
            ? `Record: ${err.path[0]} (Column: ${err.extensions.error_data.column_name} - ${err.extensions.error_data.column_id})`
            : '';
        errorMessages.push(`${err.message} ${columnValue}`);
      });
    }

    const records = Object.values(response.data).filter((item) => item !== null);

    batchResults.push(...(records as TRecordResponse[]));
  }

  if (errorMessages.length > 0) {
    if (batchResults.length === 0) {
      throw new MondayError(`Failed to update records: ${errorMessages.join('; ')}`);
    }

    Debugger.log(`Errors were returned during batch update. ${errorMessages.join('; ')}`);
  }

  return batchResults;
};
