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
} & {
  [key: string]: any;
};

const mapBaserowItemToAllowedValue = (item: BaserowItem): IQoreAllowedValue<number> => {
  const simpleFields = Object.entries(item).filter(
    ([key, value]) => key !== 'id' && (typeof value === 'string' || typeof value === 'number')
  );

  const description =
    simpleFields.map(([key, value]) => `${key}: ${value}`).join('\n') || 'No details';

  const displayName = item.name || item.title || `Item ${item.id}`;

  return {
    value: item.id,
    display_name: displayName,
    desc: description,
  };
};

export const getBaserowTableRowsAllowedValues: TQoreGetAllowedValuesFunction<
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
    path: `database/rows/table/${table}`,
    method: 'GET',
    params: {
      user_field_names: 'true',
    },
    token,
    url,
    mapItemToAllowedValue: mapBaserowItemToAllowedValue,
  });
};
