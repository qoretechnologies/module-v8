import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';
import { TAttioAttribute } from './get-object-properties';

const mapAttioObjectToAllowedValue = (item: TAttioAttribute): IQoreAllowedValue<string> => {
  return {
    display_name: item.api_slug,
    value: item.api_slug,
    desc:
      `Description: ${item.description}\n` +
      `API Slug: ${item.api_slug}\n` +
      `Type: ${item.type}\n` +
      `Is Unique: ${item.is_unique}\n`,
  };
};

export const getAttioObjectAttributesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);
    const object = context?.opts?.object;

    if (!object) {
      throw new AttioError('Object is required to get allowed values for attributes');
    }

    return await getAttioAllowedValues<TAttioAttribute, string>({
      token,
      path: `objects/${object}/attributes`,
      method: 'GET',
      mapItemToAllowedValue: mapAttioObjectToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio objects allowed values: ${error}`);
  }
};
