import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { NocoDBError } from '../constants';
import { getNocoDBTableColumns } from './get-table-columns';
import { getNocoDBTableIdByName } from './record-based/constants';

/**
 * Get allowed values for link fields in a NocoDB table
 * Filters table columns to return only LinkToAnotherRecord and Links type fields
 */
export const getNocoDBLinkFieldAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url, baseId, table } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['baseId', 'table'],
      ErrorClass: NocoDBError,
    });

    if (!token || !url || !baseId || !table) {
      return [];
    }

    // Convert table name to table ID
    const tableId = await getNocoDBTableIdByName({ token, url, baseId, tableName: table });

    const columns = await getNocoDBTableColumns({ token, url, baseId, tableId });

    // Filter to only link type fields (v3 uses 'Links', v2 uses 'LinkToAnotherRecord')
    const linkTypes = new Set(['Links', 'LinkToAnotherRecord']);
    const linkFields = columns.filter((col) => linkTypes.has(col.type) || linkTypes.has(col.uidt || ''));

    return linkFields.map((col): IQoreAllowedValue<string> => ({
      value: col.id,
      display_name: col.title,
    }));
  } catch {
    return [];
  }
};
