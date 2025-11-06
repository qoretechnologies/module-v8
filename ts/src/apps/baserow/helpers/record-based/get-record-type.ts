import { IQoreTypeObjectNonList, TQoreGetRecordTypeFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { BaserowError } from '../../constants';
import { getBaserowTableColumnOptions } from '../get-table-fields';
import { getBaserowTableIdByName } from './constants';
export const getBaserowRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: BaserowError,
  });

  const tableId = await getBaserowTableIdByName({ token, url, tableName });
  const recordType = (await getBaserowTableColumnOptions({
    ...context,
    opts: { table: tableId },
  })) as IQoreTypeObjectNonList;

  return {
    type: 'hash',
    fields: { ...recordType.fields, id: { type: 'string' } },
  };
};
