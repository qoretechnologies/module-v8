import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { MondayError } from '../../constants';
import { getMondayBoardFieldsDynamicOptions } from '../get-board-fields';
import { getMondayBoardIdByName } from './constants';

export const getMondayRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: MondayError,
  });

  const boardId = await getMondayBoardIdByName(token, tableName);

  const recordType = await getMondayBoardFieldsDynamicOptions({
    ...context,
    opts: { board_id: boardId },
  });

  return recordType as TQoreTypeObject;
};
