import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { seatableClient, SeaTableMetadataResponse } from '../../client';
import { SeaTableError } from '../../constants';

/**
 * Get all available tables in the connected base
 * Since SeaTable API Token is scoped to a single base, we just return table names
 */
export const getSeaTableTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token, url } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'url'],
    ErrorClass: SeaTableError,
  });

  try {
    // Get base metadata which includes all tables
    const response = await seatableClient.baseGet<SeaTableMetadataResponse>('metadata/', {
      connectionOptions: { url, token },
    });

    const tables = response?.metadata?.tables || [];

    // Return just table names since the API token is already scoped to a base
    return tables.map((table) => table.name);
  } catch (error) {
    if (error instanceof SeaTableError) {
      throw error;
    }

    throw new SeaTableError(`Failed to get table list: ${error}`);
  }
};
