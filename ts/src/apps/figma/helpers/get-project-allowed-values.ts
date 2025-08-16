import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fetchFigmaAllowedValues } from './constants';

type FigmaItem = {
  id: string;
  name: string;
};

const mapFigmaItemToAllowedValue = (item: FigmaItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
  };
};

export const getFigmaProjectAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, team } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['team'],
  });

  return await fetchFigmaAllowedValues<FigmaItem>({
    token,
    path: `teams/${team}/projects`,
    object: 'projects',
    mapItemToAllowedValue: mapFigmaItemToAllowedValue,
  });
};
