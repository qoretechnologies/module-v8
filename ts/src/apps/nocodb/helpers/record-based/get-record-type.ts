import { IQoreTypeObjectNonList, TQoreGetRecordTypeFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { NocoDBError } from '../../constants';
import { getNocoDBTableColumnOptions } from '../get-table-columns';
import { getNocoDBTableIdByPath } from './get-table-list';

export const getNocoDBRecordType: TQoreGetRecordTypeFunction = async (context, tablePath) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: NocoDBError,
  });

  // Parse hierarchical table path (workspace/base/table) to get baseId and tableId
  const { baseId, tableId } = await getNocoDBTableIdByPath({ token, url, tablePath });

  const recordType = (await getNocoDBTableColumnOptions({
    ...context,
    opts: { ...context.opts, table: tableId, baseId },
  })) as IQoreTypeObjectNonList;

  return {
    type: 'hash',
    fields: { ...recordType.fields, id: { type: 'string' } }, // v3 uses lowercase 'id'
  };
};
