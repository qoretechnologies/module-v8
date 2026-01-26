import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OPEN_ROUTER_CONN_OPTIONS } from '../constants';
import { fetchOpenRouterAllowedValues } from './constants';
type OpenRouterItem = {
  id: string;
  name: string;
  description: string;
};

const mapOpenRouterItemToAllowedValue = (item: OpenRouterItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: item.description,
  };
};

export const getOpenRouterModelAllowedValues: TQoreGetAllowedValuesFunction<
  typeof OPEN_ROUTER_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
  });

  return await fetchOpenRouterAllowedValues<OpenRouterItem>({
    token,
    path: 'models',
    object: 'data',
    mapItemToAllowedValue: mapOpenRouterItemToAllowedValue,
  });
};
