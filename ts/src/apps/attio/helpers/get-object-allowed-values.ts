import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';

interface AttioObject {
  id: {
    workspace_id: string;
    object_id: string;
  };
  api_slug: string;
  singular_noun: string;
  plural_noun: string;
  created_at: string;
}

const mapAttioObjectToAllowedValue = (item: AttioObject): IQoreAllowedValue<string> => {
  return {
    display_name: item.singular_noun,
    value: item.api_slug,
    desc:
      `Object ID: ${item.id.object_id}\n` +
      `Plural: ${item.plural_noun}\n` +
      `API Slug: ${item.api_slug}\n` +
      `Created: ${new Date(item.created_at).toLocaleString()}`,
  };
};

export const getAttioObjectApiSlugAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);

    return await getAttioAllowedValues<AttioObject, string>({
      token,
      path: 'objects',
      method: 'GET',
      mapItemToAllowedValue: mapAttioObjectToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio objects allowed values: ${error}`);
  }
};
