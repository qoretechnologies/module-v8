import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CraftError } from '../constants';
import { fetchCraftAllowedValues } from './constants';

type CraftItem = {
  id: string;
  name: string;
  itemCount: number;
};

const mapCraftItemToAllowedValue = (item: CraftItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Item count: ${item.itemCount}`,
  };
};

export const getCraftCollectionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['url'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;

    return await fetchCraftAllowedValues({
      url,
      token,
      method: 'GET',
      path: 'collections',
      mapItemToAllowedValue: mapCraftItemToAllowedValue,
    });
  } catch (error) {
    if (error instanceof CraftError) {
      throw error;
    }

    throw new CraftError(`Failed to fetch Craft collection allowed values: ${error}`);
  }
};
