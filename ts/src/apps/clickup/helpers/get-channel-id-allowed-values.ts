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
  description: string;
  topic: string;
  visibility: string;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Description: ${item.description}\nTopic: ${item.topic}\nVisibility: ${item.visibility}`,
  };
};

export const getClickUpChannelIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace'],
    ErrorClass: ClickUpError,
  });

  return await fetchClickUpAllowedValues<TClickUpItem>({
    token,
    version: 'v3',
    path: `workspaces/${workspace}/chat/channels`,
    object: 'data',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
