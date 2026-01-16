import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { nocodbClient } from '../client';
import { NocoDBError } from '../constants';

type NocoDBBase = {
  id: string;
  title: string;
};

type NocoDBBasesResponse = {
  list: NocoDBBase[];
};

export const getNocoDBBaseAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url, workspaceId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['workspaceId'],
      ErrorClass: NocoDBError,
    });

    const response = await nocodbClient.get<NocoDBBasesResponse>(`meta/workspaces/${workspaceId}/bases`, {
      token,
      connectionOptions: { url },
    });

    const bases = response?.list || [];

    return bases.map((base): IQoreAllowedValue<string> => ({
      value: base.id,
      display_name: base.title,
    }));
  } catch {
    return [];
  }
};
