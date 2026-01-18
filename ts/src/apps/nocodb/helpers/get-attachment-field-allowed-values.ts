import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { NocoDBError } from '../constants';
import { getNocoDBTableColumns } from './get-table-columns';

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

    const columns = await getNocoDBTableColumns({ token, url, baseId, tableId: table });

    // Filter to only Attachment type fields (v3 uses 'type', v2 uses 'uidt')
    const attachmentFields = columns.filter(
      (col) => col.type === 'Attachment' || col.uidt === 'Attachment'
    );

    return attachmentFields.map(
      (col): IQoreAllowedValue<string> => ({
        value: col.id,
        display_name: col.title,
      })
    );
  } catch {
    return [];
  }
};
