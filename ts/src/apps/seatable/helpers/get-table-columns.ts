import { TQoreType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { seatableClient, SeaTableColumn, SeaTableMetadataResponse } from '../client';
import { SeaTableError } from '../constants';

/**
 * Map SeaTable column types to Qore types
 */
const SeaTableTypeToQoreTypeMap: Record<string, TQoreType> = {
  // Text types
  text: 'string',
  'long-text': 'string',
  url: 'string',
  email: 'string',

  // Number types
  number: 'number',
  duration: 'number',
  rate: 'integer',
  rating: 'integer',
  'auto-number': 'integer',

  // Boolean
  checkbox: 'bool',

  // Date/Time
  date: 'date',
  ctime: 'date', // Creation time
  mtime: 'date', // Modification time

  // Select types
  'single-select': 'softstring',
  'multiple-select': { type: 'list', element_type: 'softstring' },

  // User/Collaborator
  collaborator: { type: 'list', element_type: 'string' },
  creator: 'string',
  'last-modifier': 'string',

  // File types
  image: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        name: { type: 'string' },
        url: { type: 'string' },
      },
    },
  },
  file: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        name: { type: 'string' },
        url: { type: 'string' },
      },
    },
  },

  // Link types
  link: { type: 'list', element_type: 'string' },
  'link-formula': 'any',

  // Formula types
  formula: 'any',

  // Geolocation
  geolocation: {
    type: 'hash',
    fields: {
      lat: { type: 'number' },
      lng: { type: 'number' },
    },
  },

  // Button (not data, but can appear)
  button: 'string',

  // Default fallback
  default: 'string',
};

/**
 * Get table columns from metadata
 */
export const getSeaTableTableColumns = async (options: {
  api_token: string;
  url: string;
  tableName: string;
}): Promise<SeaTableColumn[]> => {
  const { api_token, url, tableName } = options;

  try {
    const response = await seatableClient.baseGet<SeaTableMetadataResponse>('metadata/', {
      connectionOptions: { url, api_token },
    });

    const tables = response?.metadata?.tables || [];
    const table = tables.find((t) => t.name === tableName);

    if (!table) {
      throw new SeaTableError(`Table "${tableName}" not found in base`);
    }

    return table.columns || [];
  } catch (error) {
    if (error instanceof SeaTableError) {
      throw error;
    }
    throw new SeaTableError(`Failed to get table columns: ${error instanceof Error ? error.message : error}`);
  }
};

/**
 * Get column type options for a table (returns Qore type schema)
 */
export const getSeaTableTableColumnOptions = async (context: any): Promise<any> => {
  const { api_token, url, table } = getQoreContextRequiredValues({
    context,
    connectionFields: ['api_token', 'url'],
    optionFields: ['table'],
    ErrorClass: SeaTableError,
  });

  try {
    const columns = await getSeaTableTableColumns({ api_token, url, tableName: table });
    const fields: Record<string, TQoreType> = {};

    columns.forEach((column) => {
      const columnType = column.type || 'text';
      const qoreType = SeaTableTypeToQoreTypeMap[columnType] || 'string';
      fields[column.name] = qoreType;
    });

    return {
      type: 'hash',
      fields,
    };
  } catch (error) {
    if (error instanceof SeaTableError) {
      throw error;
    }

    throw new SeaTableError(`Failed to get column options: ${error instanceof Error ? error.message : error}`);
  }
};

/**
 * Get response type for dynamic typing (same as column options)
 */
export const getSeaTableTableColumnsResponseType = async (context: any): Promise<any> => {
  return getSeaTableTableColumnOptions(context);
};
