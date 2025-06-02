import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomWebinarTrackingSourceTemplate = {
  id: string;
  registration_count: number;
  source_name: string;
  visitor_count: number;
};

const mapZoomWebinarTrackingSourceTemplateToAllowedValue = (
  item: TZoomWebinarTrackingSourceTemplate
): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: `Source: ${item.source_name}`,
    desc: `Registration Count: ${item.registration_count}\nVisitor Count: ${item.visitor_count}\nID: ${item.id}`,
  };
};

export const getZoomWebinarTrackingSourceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, webinarId } = getQoreContextRequiredValues({
    context,
    optionFields: ['webinarId'],
    connectionFields: ['token'],
    ErrorClass: ZoomError,
  });

  const path = `/webinars/${webinarId}/tracking_sources`;

  return await fetchZoomAllowedValues<TZoomWebinarTrackingSourceTemplate, 'tracking_sources'>({
    token,
    path,
    object: 'tracking_sources',
    mapItemToAllowedValue: mapZoomWebinarTrackingSourceTemplateToAllowedValue,
  });
};
