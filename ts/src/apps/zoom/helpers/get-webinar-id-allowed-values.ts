import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomWebinar = {
  /** the webinar number: what every `webinarId` path parameter accepts */
  id: number;
  /** the identifier of one instance of the webinar; only some endpoints accept it in place of the id */
  uuid: string;
  agenda: string;
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
};

/**
 * The value is the webinar's integer ID, not its UUID: Update a Webinar, Delete a Webinar, the registrant
 * endpoints and the tracking-source lookup declare `webinarId` as an integer, and the endpoints that
 * accept either accept the ID too.
 */
const mapZoomWebinarToAllowedValue = (item: TZoomWebinar): IQoreAllowedValue<string> => ({
  value: item.id.toString(),
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
