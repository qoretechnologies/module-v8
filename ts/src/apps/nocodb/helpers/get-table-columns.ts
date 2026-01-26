import { TQoreType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { nocodbClient } from '../client';
import { NocoDBError } from '../constants';

type TNocoDBColumn = {
  id: string;
  title: string;
  type: string; // v3 API uses 'type' instead of 'uidt'
  uidt?: string; // Legacy v2 field
  pk?: boolean;
  rqd?: boolean; // Required
  system?: boolean;
  dt?: string; // Data type
  dtxp?: string; // Data type extra params
  options?: any;
  default_value?: string;
};

// Map NocoDB UI Data Types to Qore types
const NocoDBTypeToQoreTypeMap: Record<string, TQoreType> = {
  SingleLineText: 'string',
  LongText: 'string',
  Number: 'number',
  Decimal: 'number',
  Checkbox: 'bool',
  Date: 'date',
  DateTime: 'date',
  Time: 'string',
  URL: 'string',
  Email: 'string',
  PhoneNumber: 'string',
  Rating: 'integer',
  Duration: 'string',
  Currency: 'number',
  Percent: 'number',
  ID: 'string',
  AutoNumber: 'integer',
  SingleSelect: 'softstring',
  MultiSelect: { type: 'list', element_type: 'softstring' },
  Attachment: {
    type: 'list',
    element_type: { type: 'hash', fields: { title: { type: 'string' } } },
  },
  LinkToAnotherRecord: { type: 'list', element_type: 'softstring' },
  Lookup: 'any',
  Rollup: 'any',
  Formula: 'any',
  QrCode: 'string',
  Barcode: 'string',
  JSON: 'any',
  SpecificDBType: 'string',
  CreatedTime: 'date',
  LastModifiedTime: 'date',
  CreatedBy: { type: 'hash', fields: { id: { type: 'string' }, email: { type: 'string' } } },
  LastModifiedBy: { type: 'hash', fields: { id: { type: 'string' }, email: { type: 'string' } } },
  Button: 'string',
  Links: { type: 'list', element_type: 'softstring' },
  User: { type: 'hash', fields: { id: { type: 'string' }, email: { type: 'string' } } },
};

export const getNocoDBTableColumns = async (options: {
  token: string;
  tableId: string;
  url: string;
  baseId: string;
}): Promise<TNocoDBColumn[]> => {
  try {
    const { tableId, token, url, baseId } = options;

    // v3 API endpoint: /api/v3/meta/bases/{baseId}/tables/{tableId}
    // Returns table object with 'fields' array containing column definitions
    const response = await nocodbClient.get<{ fields?: TNocoDBColumn[] }>(
      `meta/bases/${baseId}/tables/${tableId}`,
      {
        token,
        connectionOptions: { url },
      }
    );

    return response?.fields || [];
  } catch (error) {
    throw new NocoDBError(
      `Failed to get table columns: ${error instanceof Error ? error.message : error}`
    );
  }
};

export const getNocoDBTableColumnOptions = async (context: any): Promise<any> => {
  const { token, url, baseId, table } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    optionFields: ['baseId', 'table'],
    ErrorClass: NocoDBError,
  });

  try {
    const columns = await getNocoDBTableColumns({ token, url, baseId, tableId: table });
    const fields: Record<string, TQoreType> = {};

    columns.forEach((column) => {
      // v3 uses 'type', v2 uses 'uidt'
      const columnType = column.type || column.uidt || 'string';
      // Skip system columns and ID type (we use lowercase 'id' from v3 response wrapper)
      if (!column.system && columnType !== 'ID') {
        const qoreType = NocoDBTypeToQoreTypeMap[columnType] || 'string';
        fields[column.title] = qoreType;
      }
    });

    return {
      type: 'hash',
      fields,
    };
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }

    throw new NocoDBError(
      `Failed to get column options: ${error instanceof Error ? error.message : error}`
    );
  }
};

export const getNocoDBTableColumnsResponseType = async (context: any): Promise<any> => {
  const columnOptions = await getNocoDBTableColumnOptions(context);
  // Add lowercase 'id' from v3 response wrapper
  return {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      ...columnOptions.fields,
    },
  };
};
