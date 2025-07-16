import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ClickUpError } from '../constants';
import { fetchClickUpAllowedValues } from './constants';

type TClickUpItem = {
  id: string;
  name: string;
  status: string;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Status: ${item.status}`,
  };
};

export const getClickUpTaskIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, list } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['list'],
    ErrorClass: ClickUpError,
  });

  return await fetchClickUpAllowedValues<TClickUpItem>({
    token,
    path: `list/${list}/task`,
    object: 'tasks',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
