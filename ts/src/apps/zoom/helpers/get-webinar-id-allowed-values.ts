import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomWebinar = {
  uuid: string;
  agenda: string;
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
};

const mapZoomWebinarToAllowedValue = (item: TZoomWebinar): IQoreAllowedValue<string> => ({
  value: item.uuid,
  display_name: item.topic,
  desc:
    `Start Time: ${item.start_time}\nDuration: ${item.duration} minutes\n` +
    `Timezone: ${item.timezone}\nAgenda: ${item.agenda}`,
});

export const getZoomWebinarIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ZoomError,
  });

  const userId = context?.opts?.userId || 'me';

  const path = `/users/${userId}/webinars`;

  return await fetchZoomAllowedValues<TZoomWebinar, 'webinars'>({
    token,
    path,
    object: 'webinars',
    mapItemToAllowedValue: mapZoomWebinarToAllowedValue,
  });
};
