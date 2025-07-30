import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BIG_ML_CONN_OPTIONS } from '../constants';
import { fetchBigMlAllowedValues } from './constants';
type BigMlItem = {
  resource: string;
  name: string;
  description: string;
};

const mapBigMlItemToAllowedValue = (item: BigMlItem): IQoreAllowedValue<string> => {
  return {
    value: item.resource,
    display_name: item.name,
    ...(item.description && { desc: item.description }),
  };
};

export const getBigMlModelAllowedValues: TQoreGetAllowedValuesFunction<
  typeof BIG_ML_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, username } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'username'],
  });

  return await fetchBigMlAllowedValues<BigMlItem>({
    token,
    username,
    path: 'model',
    object: 'objects',
    mapItemToAllowedValue: mapBigMlItemToAllowedValue,
  });
};
