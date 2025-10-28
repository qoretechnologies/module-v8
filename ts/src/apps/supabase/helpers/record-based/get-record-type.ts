import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getSupabaseTableColumnOptions } from '../get-table-fields';

export const getSupabaseRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const type = await getSupabaseTableColumnOptions({ ...context, opts: { tableName } });

  return type as TQoreTypeObject;
};
