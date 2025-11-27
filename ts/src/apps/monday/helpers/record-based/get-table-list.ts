import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { MondayError } from '../../constants';
import { getMondayBoardNameToIdMap } from './constants';

export const getMondayTableList: TQoreGetTableListFunction = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: MondayError,
  });

  try {
    const boardNameToIdMap = await getMondayBoardNameToIdMap(token);
    return Object.keys(boardNameToIdMap);
  } catch (error) {
    throw new MondayError(`Failed to fetch Monday boards: ${error.message}`);
  }
};
