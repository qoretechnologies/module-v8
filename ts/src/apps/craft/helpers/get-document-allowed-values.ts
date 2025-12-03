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
  isDeleted: boolean;
};

const mapCraftItemToAllowedValue = (item: CraftItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.title,
    desc: `Is Deleted: ${item.isDeleted}`,
  };
};

export const getCraftDocumentAllowedValues: TQoreGetAllowedValuesFunction<
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
      path: 'documents',
      mapItemToAllowedValue: mapCraftItemToAllowedValue,
    });
  } catch (error) {
    if (error instanceof CraftError) {
      throw error;
    }

    throw new CraftError(`Failed to fetch Craft document allowed values: ${error}`);
  }
};
