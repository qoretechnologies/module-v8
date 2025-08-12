import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fetchFigmaAllowedValues } from './constants';

type FigmaItem = {
  key: string;
  name: string;
  thumbnail_url: string;
};

const mapFigmaItemToAllowedValue = (item: FigmaItem): IQoreAllowedValue<string> => {
  return {
    value: item.key,
    display_name: item.name,
    ...(item.thumbnail_url && { image: item.thumbnail_url }),
  };
};

export const getFigmaProjectFilesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, project } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['project'],
  });

  return await fetchFigmaAllowedValues<FigmaItem>({
    token,
    path: `projects/${project}/files`,
    object: 'files',
    mapItemToAllowedValue: mapFigmaItemToAllowedValue,
  });
};
