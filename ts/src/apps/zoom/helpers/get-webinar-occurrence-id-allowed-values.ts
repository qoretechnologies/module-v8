import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomWebinarOccurrenceTemplate = {
  occurrence_id: string;
  status: string;
  start_time: string;
  duration: number;
};

const mapZoomWebinarOccurrenceTemplateToAllowedValue = (
  item: TZoomWebinarOccurrenceTemplate
): IQoreAllowedValue<string> => {
  return {
    value: item.occurrence_id,
    display_name: `Occurrence: ${item.occurrence_id}`,
    desc: `Status: ${item.status}\nStart Time: ${item.start_time}\nDuration: ${item.duration} minutes`,
  };
};

export const getZoomWebinarOccurrenceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, webinarId } = getQoreContextRequiredValues({
    context,
    optionFields: ['webinarId'],
    connectionFields: ['token'],
    ErrorClass: ZoomError,
  });

  const path = `/webinars/${webinarId}`;

  return await fetchZoomAllowedValues<TZoomWebinarOccurrenceTemplate, 'occurrences'>({
    token,
    path,
    object: 'occurrences',
    mapItemToAllowedValue: mapZoomWebinarOccurrenceTemplateToAllowedValue,
  });
};
