import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { NocoDBError } from '../constants';
import { getNocoDBTableColumns } from './get-table-columns';
import { getNocoDBTableIdByName } from './record-based/constants';

/**
 * Get allowed values for button fields in a NocoDB table
 * Filters table columns to return only Button type fields
 */
export const getNocoDBButtonFieldAllowedValues: TQoreGetAllowedValuesFunction<
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

    // Filter to only Button type fields (v3 uses 'type', v2 uses 'uidt')
    const buttonFields = columns.filter((col) => col.type === 'Button' || col.uidt === 'Button');

    return buttonFields.map((col): IQoreAllowedValue<string> => ({
      value: col.id,
      display_name: col.title,
    }));
  } catch {
    return [];
  }
};
