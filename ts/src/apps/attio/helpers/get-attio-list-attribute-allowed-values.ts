import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';
import { TAttioAttribute } from './get-object-properties';

const mapAttioListAttributeToAllowedValue = (item: TAttioAttribute): IQoreAllowedValue<string> => {
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

export const getAttioListAttributesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);
    const list = context?.opts?.list;

    if (!list) {
      throw new AttioError('List is required to get allowed values for attributes');
    }

    return await getAttioAllowedValues<TAttioAttribute, string>({
      token,
      path: `lists/${list}/attributes`,
      method: 'GET',
      mapItemToAllowedValue: mapAttioListAttributeToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio list attributes allowed values: ${error}`);
  }
};
