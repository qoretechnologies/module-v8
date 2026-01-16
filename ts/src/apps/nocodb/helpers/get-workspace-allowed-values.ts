import { IQoreAllowedValue, TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { nocodbClient } from '../client';
import { NocoDBError } from '../constants';

type NocoDBWorkspace = {
  id: string;
  title: string;
};

type NocoDBWorkspacesResponse = {
  list: NocoDBWorkspace[];
};

export const getNocoDBWorkspaceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: NocoDBError,
    });

    const response = await nocodbClient.get<NocoDBWorkspacesResponse>('meta/workspaces', {
      token,
      connectionOptions: { url },
    });

    const workspaces = response?.list || [];

    return workspaces.map((ws): IQoreAllowedValue<string> => ({
      value: ws.id,
      display_name: ws.title,
    }));
  } catch {
    return [];
  }
};
