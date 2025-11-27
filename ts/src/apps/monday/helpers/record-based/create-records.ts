import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { MondayError } from '../../constants';
import {
  batchCreateMondayItems,
  formatMondayRecordResponse,
  formatMondayRecords,
} from '../constants';
import { getMondayBoardIdByName } from './constants';
import { omit } from 'lodash';
import { MondayCreateOptions } from './options';

export const createMondayRecords: TQoreCreateRecordsFunction<typeof MondayCreateOptions> = async (
  context,
  records,
  opts
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: MondayError,
  });

  const table = opts?.table;
  const groupId = opts?.group_id;

  if (!table) {
    throw new MondayError('Table name is required to create Monday records');
  }

  try {
    const boardId = await getMondayBoardIdByName(token, table);

    if (!boardId) {
      throw new MondayError(`Board with name "${table}" not found`);
    }

    const recordsArray = mapColumnFormatToObject(records);

    const formattedRecords = (
      await formatMondayRecords({ records: recordsArray, token, boardId })
    ).map((record) => ({
      board_id: boardId,
      item_name: (record['name'] || 'New Item') as string,
      column_values: omit(record, ['name']),
    }));

    const response = await batchCreateMondayItems(formattedRecords, token, groupId);

    return mapObjectToColumnFormat(formatMondayRecordResponse(response));
  } catch (error) {
    throw new MondayError(`Failed to create Monday records: ${error.message || error}`);
  }
};
