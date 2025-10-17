import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fetchBaserowAllowedValues } from './constants';
import { BaserowError } from '../constants';

type BaserowItem = {
  id: number;
  name: string;
};

const mapBaserowItemToAllowedValue = (item: BaserowItem): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
  };
};

export const getBaserowTableAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: BaserowError,
  });

  return await fetchBaserowAllowedValues<BaserowItem>({
    url,
    token,
    path: `database/tables/all-tables`,
    mapItemToAllowedValue: mapBaserowItemToAllowedValue,
  });
};
