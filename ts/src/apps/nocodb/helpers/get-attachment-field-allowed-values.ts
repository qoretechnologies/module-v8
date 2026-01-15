import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { NocoDBError } from '../constants';
import { getNocoDBTableColumns } from './get-table-columns';
import { getNocoDBTableIdByName } from './record-based/constants';

/**
 * Get allowed values for attachment fields in a NocoDB table
 * Filters table columns to return only Attachment type fields
 */
export const getNocoDBAttachmentFieldAllowedValues: TQoreGetAllowedValuesFunction<
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

    // Filter to only Attachment type fields (v3 uses 'type', v2 uses 'uidt')
    const attachmentFields = columns.filter((col) => col.type === 'Attachment' || col.uidt === 'Attachment');

    return attachmentFields.map((col): IQoreAllowedValue<string> => ({
      value: col.id,
      display_name: col.title,
    }));
  } catch {
    return [];
  }
};
