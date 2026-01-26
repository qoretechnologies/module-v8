import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { TAttioAttribute } from './get-object-properties';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fetchAttioAllowedValues } from './client';

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
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });
    const object = context?.opts?.object;

    return await fetchAttioAllowedValues<TAttioAttribute>({
      token,
      path: `objects/${object}/attributes`,
      method: 'GET',
      mapItemToAllowedValue: mapAttioObjectToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio objects allowed values: ${error}`);
  }
};

export const getAttioObjectUniqueAttributesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });
    const object = context?.opts?.object;

    return await fetchAttioAllowedValues<TAttioAttribute>({
      token,
      path: `objects/${object}/attributes`,
      method: 'GET',
      filterItems: (item) => item.is_unique,
      mapItemToAllowedValue: mapAttioObjectToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio objects allowed values: ${error}`);
  }
};
