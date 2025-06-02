import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZoomError } from '../constants';
import { fetchZoomAllowedValues } from './constants';

type TZoomMeetingTemplate = {
  id: string;
  name: string;
  type: number;
};

const mapZoomMeetingTemplateToAllowedValue = (
  item: TZoomMeetingTemplate
): IQoreAllowedValue<string> => {
  let type = 'Unknown';

  if (item.type === 1) {
    type = 'Meeting Template';
  } else if (item.type === 2) {
    type = 'Admin Meeting Template';
  }

  return {
    value: item.id,
    display_name: item.name,
    desc: `Type: ${type}\nID: ${item.id}`,
  };
};

export const getZoomMeetingTemplateIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ZoomError,
  });

  const path = `/users/me/meeting_templates`;

  return await fetchZoomAllowedValues<TZoomMeetingTemplate, 'templates'>({
    token,
    path,
    object: 'templates',
    mapItemToAllowedValue: mapZoomMeetingTemplateToAllowedValue,
  });
};
