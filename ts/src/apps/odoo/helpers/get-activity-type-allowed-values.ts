import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooActivityFields = ['id', 'display_name', 'summary'] as const;

type TOdooActivity = { id: number } & {
  [K in (typeof OdooActivityFields)[number]]: string;
};

const mapOdooActivityToAllowedValue = (activity: TOdooActivity): IQoreAllowedValue<number> => ({
  value: activity.id,
  display_name: activity.display_name,
  short_desc: `Summary: ${activity.summary}`,
});

export const getOdooActivityIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooActivity>({
    subdomain,
    username,
    password,
    model: 'mail.activity.type',
    fields: [...OdooActivityFields],
    mapItemToAllowedValue: mapOdooActivityToAllowedValue,
  });
};
