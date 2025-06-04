import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ConfluenceError } from '../constants';
import { fetchConfluenceAllowedValues } from './constants';

type TConfluenceLabel = {
  id: string;
  name: string;
  prefix: string;
};

const mapConfluenceLabelToAllowedValue = (label: TConfluenceLabel): IQoreAllowedValue<string> => {
  return {
    value: label.id,
    display_name: label.name,
    desc: `Prefix: ${label.prefix}\nName: ${label.name}`,
  };
};

export const getConfluenceLabelIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { cloud_id, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['cloud_id', 'token'],
    ErrorClass: ConfluenceError,
  });

  return await fetchConfluenceAllowedValues<TConfluenceLabel>({
    token,
    cloudId: cloud_id,
    path: '/labels',
    mapItemToAllowedValue: mapConfluenceLabelToAllowedValue,
  });
};
