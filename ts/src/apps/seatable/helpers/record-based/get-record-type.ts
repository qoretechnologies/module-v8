import { IQoreTypeObjectNonList, TQoreGetRecordTypeFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { SeaTableError } from '../../constants';
import { getSeaTableTableColumnOptions } from '../get-table-columns';

export const getSeaTableRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: SeaTableError,
  });

  const recordType = (await getSeaTableTableColumnOptions({
    ...context,
    opts: { ...context.opts, table: tableName },
    conn_opts: { token, url },
  })) as IQoreTypeObjectNonList;

  return {
    type: 'hash',
    fields: {
      ...recordType.fields,
      _id: { type: 'string' }, // SeaTable row ID
      _mtime: { type: 'date' }, // Modification time
      _ctime: { type: 'date' }, // Creation time
    },
  };
};
