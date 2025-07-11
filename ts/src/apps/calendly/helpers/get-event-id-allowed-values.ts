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
};

const mapCalendlyItemToAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  const uuid = last(item.uri.split('/'));

  return {
    value: uuid || item.uri,
    display_name: item.name,
    desc: `Start Time: ${formatDateReadable(item.start_time)}`,
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
