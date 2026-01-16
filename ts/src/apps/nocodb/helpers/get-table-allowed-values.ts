import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { nocodbClient } from '../client';
import { NocoDBError } from '../constants';

type NocoDBTable = {
  id: string;
  title: string;
};

type NocoDBTablesResponse = {
  list: NocoDBTable[];
};

export const getNocoDBTableAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url, baseId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['baseId'],
      ErrorClass: NocoDBError,
    });

    const response = await nocodbClient.get<NocoDBTablesResponse>(`meta/bases/${baseId}/tables`, {
      token,
      connectionOptions: { url },
    });

    const tables = response?.list || [];

    return tables.map(
      (table): IQoreAllowedValue<string> => ({
        value: table.title,
        display_name: table.title,
      })
    );
  } catch {
    return [];
  }
};

export const getNocoDBTableIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url, baseId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['baseId'],
      ErrorClass: NocoDBError,
    });

    const response = await nocodbClient.get<NocoDBTablesResponse>(`meta/bases/${baseId}/tables`, {
      token,
      connectionOptions: { url },
    });

    const tables = response?.list || [];

    return tables.map(
      (table): IQoreAllowedValue<string> => ({
        value: table.id,
        display_name: table.title,
      })
    );
  } catch {
    return [];
  }
};
