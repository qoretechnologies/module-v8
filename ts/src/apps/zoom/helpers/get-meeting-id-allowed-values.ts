import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomMeeting = {
  id: number;
  uuid: string;
  topic: string;
  agenda: string;
  start_time: string;
  duration: number;
  timezone: string;
  join_url: string;
};

const createZoomMeetingToAllowedValueMapFunction = (field: 'uuid' | 'id') => {
  return (item: TZoomMeeting): IQoreAllowedValue<string> => ({
    value: item[field].toString(),
    display_name: item.topic,
    desc:
      `Start Time: ${item.start_time}\nDuration: ${item.duration} minutes\n` +
      `Timezone: ${item.timezone}\nJoin URL: ${item.join_url}\nAgenda: ${item.agenda}`,
  });
};

const createZoomMeetingAllowedValuesFunction = (
  field: 'uuid' | 'id'
): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> => {
  return async (context): Promise<IQoreAllowedValue<string>[]> => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ZoomError,
    });

    const userId = context?.opts?.userId || 'me';

    const path = `/users/${userId}/meetings`;

    return await fetchZoomAllowedValues<TZoomMeeting, 'meetings'>({
      token,
      path,
      object: 'meetings',
      mapItemToAllowedValue: createZoomMeetingToAllowedValueMapFunction(field),
    });
  };
};

export const getZoomMeetingUUIDAllowedValues = createZoomMeetingAllowedValuesFunction('uuid');
export const getZoomMeetingIDAllowedValues = createZoomMeetingAllowedValuesFunction('id');
