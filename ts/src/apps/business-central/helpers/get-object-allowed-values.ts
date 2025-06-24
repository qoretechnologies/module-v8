import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BusinessCentralError } from '../constants';
import { fetchBusinessCentralAllowedValues } from './constants';

type TObject = { name: string; kind: string; url: string };

const mapItemToAllowedValue = (item: TObject): IQoreAllowedValue<string> => ({
  value: item.name,
  display_name: item.name,
  desc: `Kind: ${item.kind}\n URL: ${item.url}`,
});

export const getBusinessCentralObjectAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: BusinessCentralError,
  });

  return await fetchBusinessCentralAllowedValues<TObject>({
    token,
    dynamics_env: instance_type,
    object: '',
    mapItemToAllowedValue,
  });
};
