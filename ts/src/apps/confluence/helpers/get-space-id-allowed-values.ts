import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ConfluenceError } from '../constants';
import { fetchConfluenceAllowedValues } from './constants';

type TConfluenceSpace = {
  id: string;
  type: string;
  name: string;
  status: string;
  currentActiveAlias: string;
};

const mapConfluenceSpaceToAllowedValue = (space: TConfluenceSpace): IQoreAllowedValue<string> => {
  const alias = space.currentActiveAlias?.length < 10 ? `[${space.currentActiveAlias}] ` : '';

  return {
    value: space.id,
    display_name: `${alias}${space.name}`,
    desc: `Status: ${space.status}\nCurrent Active Alias: ${space.currentActiveAlias}\nType: ${space.type}`,
  };
};

export const getConfluenceSpaceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { cloud_id, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['cloud_id', 'token'],
    ErrorClass: ConfluenceError,
  });

  return await fetchConfluenceAllowedValues<TConfluenceSpace>({
    token,
    cloudId: cloud_id,
    path: '/spaces',
    mapItemToAllowedValue: mapConfluenceSpaceToAllowedValue,
  });
};
