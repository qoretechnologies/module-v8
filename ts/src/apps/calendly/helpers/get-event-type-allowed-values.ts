import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { last } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CalendlyError } from '../constants';
import { fetchCalendlyAllowedValues, fetchCalendlyData } from './constants';

type TCalendlyItem = {
  uri: string;
  name: string;
  kind: string;
};

const mapCalendlyItemToIdAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  const uuid = last(item.uri.split('/'));

  return {
    value: uuid || item.uri,
    display_name: item.name,
    desc: `Kind: ${item.kind}`,
  };
};

const mapCalendlyItemToAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  return {
    value: item.uri,
    display_name: item.name,
    desc: `Kind: ${item.kind}`,
  };
};

export const getCalendlyEventTypeIdAllowedValues: TQoreGetAllowedValuesFunction<
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
    path: `event_types`,
    object: 'collection',
    params: {
      organization: user.current_organization,
    },
    mapItemToAllowedValue: mapCalendlyItemToIdAllowedValue,
  });
};

export const getCalendlyEventTypeAllowedValues: TQoreGetAllowedValuesFunction<
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
    path: `event_types`,
    object: 'collection',
    params: {
      organization: user.current_organization,
    },
    mapItemToAllowedValue: mapCalendlyItemToAllowedValue,
  });
};
