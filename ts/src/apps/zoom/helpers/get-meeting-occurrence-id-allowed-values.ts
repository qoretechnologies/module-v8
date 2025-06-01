import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomMeetingOccurrenceTemplate = {
  occurrence_id: string;
  status: string;
  start_time: string;
  duration: number;
};

const mapZoomMeetingOccurrenceTemplateToAllowedValue = (
  item: TZoomMeetingOccurrenceTemplate
): IQoreAllowedValue<string> => {
  return {
    value: item.occurrence_id,
    display_name: `Occurrence: ${item.occurrence_id}`,
    desc: `Status: ${item.status}\nStart Time: ${item.start_time}\nDuration: ${item.duration} minutes`,
  };
};

export const getZoomMeetingOccurrenceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, meetingId } = getQoreContextRequiredValues({
    context,
    optionFields: ['meetingId'],
    connectionFields: ['token'],
    ErrorClass: ZoomError,
  });

  const path = `/meetings/${meetingId}`;

  return await fetchZoomAllowedValues<TZoomMeetingOccurrenceTemplate, 'occurrences'>({
    token,
    path,
    object: 'occurrences',
    mapItemToAllowedValue: mapZoomMeetingOccurrenceTemplateToAllowedValue,
  });
};
