import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { MondayError } from '../../constants';
import { callMondayAPI } from '../constants';
import { fetchMondayRecordIds, getMondayBoardIdByName } from './constants';
import { MondaySearchOptions } from './options';

export const deleteMondayRecords: TQoreDeleteRecordsFunction<typeof MondaySearchOptions> = async (
  context,
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

    const recordIdsToDelete = await fetchMondayRecordIds({
      token,
      boardId,
      where,
      groupId,
    });

    if (recordIdsToDelete.length === 0) {
      return 0;
    }

    await batchDeleteMondayItems(token, recordIdsToDelete);

    return recordIdsToDelete.length;
  } catch (error) {
    if (error instanceof MondayError) {
      throw error;
    }
    throw new MondayError(
      `Failed to delete records in table ${tableName}: ${error.message || error}`
    );
  }
};

const batchDeleteMondayItems = async (token: string, itemIds: string[]): Promise<void> => {
  const batchSize = 100;

  for (let i = 0; i < itemIds.length; i += batchSize) {
    const batch = itemIds.slice(i, i + batchSize);

    const mutations = batch
      .map(
        (itemId, index) => `
      mutation_${index}: delete_item(item_id: ${itemId}) {
        id
      }
    `
      )
      .join('\n');

    const query = `
      mutation {
        ${mutations}
      }
    `;

    await callMondayAPI({ token, query });
  }
};
