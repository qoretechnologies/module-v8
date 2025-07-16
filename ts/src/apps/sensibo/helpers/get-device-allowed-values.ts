import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fetchSensiboAllowedValues } from './constants';
type SensiboItem = {
  id: string;
  room: { name: string };
  productModel: string;
};

const mapSensiboItemToAllowedValue = (item: SensiboItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: `${item.room.name} (${item.productModel})`,
    desc: `Room: ${item.room.name}\nModel: ${item.productModel}`,
  };
};

export const getSensiboDeviceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
  });

  return await fetchSensiboAllowedValues<SensiboItem>({
    token,
    object: 'result',
    path: 'users/me/pods',
    params: { fields: '*' },
    mapItemToAllowedValue: mapSensiboItemToAllowedValue,
  });
};
