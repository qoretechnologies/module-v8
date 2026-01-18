import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { seatableClient, SeaTableMetadataResponse } from '../client';
import { SeaTableError } from '../constants';

/**
 * Get allowed values for table selection
 * Returns all tables in the connected base
 */
export const getSeaTableTableAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: SeaTableError,
    });

    const response = await seatableClient.baseGet<SeaTableMetadataResponse>('metadata/', {
      connectionOptions: { url, token },
    });

    const tables = response?.metadata?.tables || [];

    return tables.map((table): IQoreAllowedValue<string> => ({
      value: table.name,
      display_name: table.name,
    }));
  } catch {
    return [];
  }
};
