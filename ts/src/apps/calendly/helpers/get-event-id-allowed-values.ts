import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { last } from 'lodash';
import { formatDateReadable, getQoreContextRequiredValues } from '../../../global/helpers';
import { CalendlyError } from '../constants';
import { fetchCalendlyAllowedValues, fetchCalendlyData } from './constants';

type TCalendlyItem = {
  uri: string;
  name: string;
  start_time: string;
  event_memberships: Array<{ user_name: string; user_email: string }>;
};

const mapCalendlyItemToAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  const uuid = last(item.uri.split('/'));
  const members = item.event_memberships.map((m) => `- ${m.user_name} <${m.user_email}>`);

  return {
    value: uuid || item.uri,
    display_name: item.name,
    desc: `Start Time: ${formatDateReadable(item.start_time)}\nMembers:\n${members.join('\n')}`,
  };
};

export const getCalendlyEventIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: CalendlyError,
  });

  const user = await fetchCalendlyData<{ current_organization: string }>({
    token,
    object: 'resource',
    path: `users/me`,
  });

  return await fetchCalendlyAllowedValues<TCalendlyItem>({
    token,
    path: `scheduled_events`,
    object: 'collection',
    params: {
      organization: user.current_organization,
    },
    mapItemToAllowedValue: mapCalendlyItemToAllowedValue,
  });
};
