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
  title: string;
};

const mapCraftItemToAllowedValue = (item: CraftItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.title,
  };
};

export const getCraftCollectionItemAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { url, collectionId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['url'],
      optionFields: ['collectionId'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;

    return await fetchCraftAllowedValues({
      url,
      token,
      method: 'GET',
      path: `collections/${collectionId}/items`,
      mapItemToAllowedValue: mapCraftItemToAllowedValue,
    });
  } catch (error) {
    if (error instanceof CraftError) {
      throw error;
    }

    throw new CraftError(`Failed to fetch Craft collection item allowed values: ${error}`);
  }
};
