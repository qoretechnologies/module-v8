import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';

interface AttioList {
  id: {
    workspace_id: string;
    list_id: string;
  };
  api_slug: string;
  created_at: string;
  name: string;
  workspace_access: null | string;
  workspace_member_access: Array<{
    level: string;
    workspace_member_id: string;
  }>;
  parent_object: string[];
  created_by_actor: {
    type: string;
    id: string;
  };
}

const mapAttioListToAllowedValue = (item: AttioList): IQoreAllowedValue<string> => {
  return {
    display_name: item.name,
    value: item.api_slug,
    desc:
      `List ID: ${item.id.list_id}\n` +
      `API Slug: ${item.api_slug}\n` +
      `Parent Object: ${item.parent_object.join(', ')}\n` +
      `Created: ${new Date(item.created_at).toLocaleString()}`,
  };
};

export const getAttioListApiSlugAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);

    return await getAttioAllowedValues<AttioList, string>({
      token,
      path: 'lists',
      method: 'GET',
      mapItemToAllowedValue: mapAttioListToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio lists allowed values: ${error}`);
  }
};
