import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fetchCanvaAllowedValues } from './constants';
type CanvaItem = {
  id: string;
  title: string;
  thumbnail: {
    url: string;
  };
};

const mapCanvaItemToAllowedValue = (item: CanvaItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.title,
    ...(item.thumbnail?.url && { image: item.thumbnail.url }),
  };
};

export const getCanvaDesignAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
  });

  return await fetchCanvaAllowedValues<CanvaItem>({
    token,
    path: 'designs',
    object: 'items',
    mapItemToAllowedValue: mapCanvaItemToAllowedValue,
  });
};
