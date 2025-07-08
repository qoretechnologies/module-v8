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
  member_count: number;
};

const mapCalendlyItemToAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  return {
    value: item.uri,
    display_name: item.name,
    desc: `Member Count: ${item.member_count}`,
  };
};

const mapCalendlyItemToIdAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  const uuid = last(item.uri.split('/'));

  return {
    value: uuid || item.uri,
    display_name: item.name,
    desc: `Member Count: ${item.member_count}`,
  };
};

const getCalendlyGroupAllowedValuesBase = async (
  context: Parameters<TQoreGetAllowedValuesFunction<TCustomConnOptions, string>>[0],
  mapFunction: (item: TCalendlyItem) => IQoreAllowedValue<string>
) => {
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
    path: `groups`,
    object: 'collection',
    params: {
      organization: user.current_organization,
    },
    mapItemToAllowedValue: mapFunction,
  });
};

export const getCalendlyGroupAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  return await getCalendlyGroupAllowedValuesBase(context, mapCalendlyItemToAllowedValue);
};

export const getCalendlyGroupIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  return await getCalendlyGroupAllowedValuesBase(context, mapCalendlyItemToIdAllowedValue);
};
