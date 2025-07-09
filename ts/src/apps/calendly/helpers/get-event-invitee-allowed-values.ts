import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { last } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CalendlyError } from '../constants';
import { fetchCalendlyAllowedValues } from './constants';

type TCalendlyItem = {
  uri: string;
  name: string;
  email: string;
};

const mapCalendlyItemToAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  const uuid = last(item.uri.split('/'));

  return {
    value: uuid || item.uri,
    display_name: item.name,
    desc: `Email: ${item.email}`,
  };
};

export const getCalendlyEventInviteeIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, event_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['event_id'],
    ErrorClass: CalendlyError,
  });

  return await fetchCalendlyAllowedValues<TCalendlyItem>({
    token,
    path: `scheduled_events/${event_id}/invitees`,
    object: 'collection',
    mapItemToAllowedValue: mapCalendlyItemToAllowedValue,
  });
};
