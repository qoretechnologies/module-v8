import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomWebinarTemplate = {
  id: string;
  name: string;
  type: number;
};

const mapZoomWebinarTemplateToAllowedValue = (
  item: TZoomWebinarTemplate
): IQoreAllowedValue<string> => {
  let type = 'Unknown';

  if (item.type === 1) {
    type = 'Webinar Template';
  } else if (item.type === 2) {
    type = 'Admin Webinar Template';
  }

  return {
    value: item.id,
    display_name: item.name,
    desc: `Type: ${type}\nID: ${item.id}`,
  };
};

export const getZoomWebinarTemplateIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ZoomError,
  });

  const path = `/users/me/webinar_templates`;

  return await fetchZoomAllowedValues<TZoomWebinarTemplate, 'templates'>({
    token,
    path,
    object: 'templates',
    mapItemToAllowedValue: mapZoomWebinarTemplateToAllowedValue,
  });
};
