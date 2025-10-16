import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BaserowError } from '../constants';
import { fetchBaserowAllowedValues } from './constants';

type BaserowItem = {
  id: number;
  name: string;
  description?: string;
  type: string;
};

const mapBaserowItemToAllowedValue = (item: BaserowItem): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Description: ${item.description || 'N/A'}\nType: ${item.type}`,
  };
};

const mapBaserowItemToNameAllowedValue = (item: BaserowItem): IQoreAllowedValue<string> => {
  return {
    value: item.name,
    display_name: item.name,
    desc: `Description: ${item.description || 'N/A'}\nType: ${item.type}`,
  };
};

export const getBaserowTableFieldsAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { token, url, table } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    optionFields: ['table'],
    ErrorClass: BaserowError,
  });

  return await fetchBaserowAllowedValues<BaserowItem>({
    url,
    token,
    path: `database/fields/table/${table}`,
    mapItemToAllowedValue: mapBaserowItemToAllowedValue,
  });
};

export const getBaserowTableFieldNamesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, url, table } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    optionFields: ['table'],
    ErrorClass: BaserowError,
  });

  return await fetchBaserowAllowedValues<BaserowItem>({
    url,
    token,
    path: `database/fields/table/${table}`,
    mapItemToAllowedValue: mapBaserowItemToNameAllowedValue,
  });
};
